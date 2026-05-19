"""
Compile structured content into static JSON payloads consumable by the React
frontend.

Pipeline
--------
1. Read JSON tables (tech stack, devices).
2. Walk each content/<module>/ directory and parse every ``*.md`` file with
   ``python-frontmatter``.
3. Validate the front-matter (plus a synthetic ``*_md`` body field) against the
   matching Pydantic schema from ``schemas.py``.
4. Render Markdown bodies to HTML server-side so the frontend can ``dangerouslySetInnerHTML``
   without shipping a Markdown runtime to the browser.
5. Emit one JSON file per content type into ``frontend/public/data/``.

This script is intended to run inside a Python 3 venv:

    python -m venv .venv
    source .venv/bin/activate
    pip install -r scripts/requirements.txt
    python scripts/build_content.py

It exits with code 1 (and a non-empty stderr) on the first validation failure
so it can be wired directly into CI.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Iterable

import frontmatter  # type: ignore[import-untyped]
import markdown as md_lib
from pydantic import BaseModel, ValidationError

from schemas import Book, Course, Degree, Device, Job, Photo, Project, TechStackItem


# ---------------------------------------------------------------------------
# Path constants
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT / "content"
OUTPUT_DIR = ROOT / "frontend" / "public" / "data"

# Markdown extensions enabled for body rendering.
MD_EXTENSIONS: list[str] = [
    "extra",
    "sane_lists",
    "smarty",
    "tables",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def render_markdown(text: str) -> str:
    """Render a Markdown string to sanitized HTML.

    Parameters
    ----------
    text : str
        Raw Markdown body content.

    Returns
    -------
    str
        Rendered HTML fragment.
    """
    if not text:
        return ""
    return md_lib.markdown(text, extensions=MD_EXTENSIONS, output_format="html5")


def parse_markdown_file(
    path: Path,
    model: type[BaseModel],
    body_field: str,
) -> dict[str, Any]:
    """Parse a Markdown record and validate it against a Pydantic model.

    The Markdown body is injected into the ``body_field`` slot (e.g.
    ``overview_md``) before validation, then rendered to HTML on output.

    Parameters
    ----------
    path : Path
        Path to the source ``.md`` file.
    model : type[BaseModel]
        Pydantic schema to validate against.
    body_field : str
        Front-matter key receiving the parsed body content.

    Returns
    -------
    dict[str, Any]
        Validated, JSON-serializable record with rendered HTML companion field
        ``<body_field>_html``.
    """
    post = frontmatter.load(path)
    data = dict(post.metadata)
    data[body_field] = post.content.strip()

    try:
        instance = model.model_validate(data)
    except ValidationError as e:
        sys.stderr.write(
            f"\n[validation error] {path.relative_to(ROOT)}\n{e}\n"
        )
        raise SystemExit(1) from e

    record = instance.model_dump(mode="json")
    # Provide pre-rendered HTML alongside the raw markdown so the frontend
    # can choose either path. We render every *_md field present on the record.
    for key in list(record.keys()):
        if key.endswith("_md") and isinstance(record[key], str):
            record[f"{key}_html"] = render_markdown(record[key])
    return record


def parse_json_table(
    path: Path,
    model: type[BaseModel],
) -> list[dict[str, Any]]:
    """Load and validate a JSON list of records (tech stack, devices)."""
    raw = json.loads(path.read_text())
    if not isinstance(raw, list):
        sys.stderr.write(f"[error] expected list in {path}, got {type(raw)}\n")
        raise SystemExit(1)

    records: list[dict[str, Any]] = []
    for entry in raw:
        try:
            records.append(model.model_validate(entry).model_dump(mode="json"))
        except ValidationError as e:
            sys.stderr.write(f"\n[validation error] {path}\n{entry}\n{e}\n")
            raise SystemExit(1) from e
    return records


def collect_markdown_dir(
    directory: Path,
    model: type[BaseModel],
    body_field: str,
) -> list[dict[str, Any]]:
    """Parse and validate every ``.md`` file in ``directory``.

    Files whose stem contains ``placeholder`` (case-insensitive) are
    skipped. This lets superseded scaffolds remain on disk during a
    refactor without breaking the schema validation pass, and they can
    be removed in a follow-up ``git rm`` commit.
    """
    if not directory.exists():
        return []
    records = [
        parse_markdown_file(p, model, body_field)
        for p in sorted(directory.glob("*.md"))
        if "placeholder" not in p.stem.lower()
    ]
    return records


def write_json(name: str, payload: Iterable[Any]) -> None:
    """Write a JSON payload to the output directory."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{name}.json"
    out_path.write_text(json.dumps(list(payload), indent=2, default=str))
    print(f"  wrote {out_path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------


def build() -> None:
    """Execute the full content compilation pipeline."""
    print(f"Building content from {CONTENT_DIR.relative_to(ROOT)}/")

    # Shared tables -------------------------------------------------------
    tech_stack = parse_json_table(
        CONTENT_DIR / "_meta" / "tech_stack.json", TechStackItem
    )
    devices = parse_json_table(CONTENT_DIR / "_meta" / "devices.json", Device)

    # Markdown collections -----------------------------------------------
    degrees = collect_markdown_dir(CONTENT_DIR / "degrees", Degree, "overview_md")
    courses = collect_markdown_dir(
        CONTENT_DIR / "courses", Course, "short_description_md"
    )
    jobs = collect_markdown_dir(CONTENT_DIR / "jobs", Job, "description_md")
    projects = collect_markdown_dir(
        CONTENT_DIR / "projects", Project, "long_description_md"
    )
    books = collect_markdown_dir(CONTENT_DIR / "books", Book, "summary_md")
    photos = collect_markdown_dir(
        CONTENT_DIR / "photos", Photo, "description_md"
    )

    # Referential integrity checks ---------------------------------------
    tech_ids = {t["id"] for t in tech_stack}
    degree_ids = {d["id"] for d in degrees}
    device_ids = {d["id"] for d in devices}

    for course in courses:
        if course["degree_id"] not in degree_ids:
            sys.stderr.write(
                f"[ref error] course {course['id']!r} references unknown "
                f"degree_id {course['degree_id']!r}\n"
            )
            raise SystemExit(1)

    for collection_name, collection in (("jobs", jobs), ("projects", projects)):
        for rec in collection:
            for tid in rec.get("tech_stack", []):
                if tid not in tech_ids:
                    sys.stderr.write(
                        f"[ref error] {collection_name[:-1]} {rec['id']!r} references "
                        f"unknown tech_stack id {tid!r}\n"
                    )
                    raise SystemExit(1)

    for photo in photos:
        if photo["device_id"] not in device_ids:
            sys.stderr.write(
                f"[ref error] photo {photo['id']!r} references unknown "
                f"device_id {photo['device_id']!r}\n"
            )
            raise SystemExit(1)

    # Emit ---------------------------------------------------------------
    write_json("tech_stack", tech_stack)
    write_json("devices", devices)
    write_json("degrees", degrees)
    write_json("courses", courses)
    write_json("jobs", jobs)
    write_json("projects", projects)
    write_json("books", books)
    write_json("photos", photos)

    print(
        f"\nDone. {len(degrees)} degrees, {len(courses)} courses, {len(jobs)} jobs, "
        f"{len(projects)} projects, {len(books)} books, {len(photos)} photos."
    )


if __name__ == "__main__":
    build()

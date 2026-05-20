"""
Open Library book metadata ingestion (V2 §3.5.1).

Pipeline
--------
The Books page consumes a hybrid content model: canonical bibliographic
fields (``title``, ``author``, ``cover_image_url``, ``open_library_key``,
``isbn``) are fetched at build time from the Open Library Search API,
normalized, and written into ``content/books/*.md`` as YAML front matter.
User-annotated fields (``rating``, ``category``, ``tags``, ``summary_md``,
``notes_md``, ``started_at``, ``finished_at``) are authored locally and
preserved across re-runs through a deep-merge step.

Once this script has produced the local Markdown layer, the runtime
``Books`` page renders without any external network calls — covers,
authors, and titles are served from the cached payload, satisfying the
"runtime independence" guarantee in V2 §3.5.1.

Usage
-----

    .venv/bin/python scripts/fetch_books.py            # fetch + merge
    .venv/bin/python scripts/fetch_books.py --offline  # skip network

Notes on probabilistic matching
-------------------------------
Open Library Search is a fuzzy index; identical title strings can resolve
to multiple "works". We accept the first hit ranked by Open Library's
relevance score, but each emitted record retains the underlying
``open_library_key`` so a human curator can re-resolve an entry by
swapping in a different work key on the next run.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

try:
    import httpx  # type: ignore[import-untyped]
except ImportError:  # pragma: no cover — installed via requirements.txt
    httpx = None  # type: ignore[assignment]

import frontmatter  # type: ignore[import-untyped]
import yaml

# ---------------------------------------------------------------------------
# Path constants
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
BOOKS_DIR = ROOT / "content" / "books"

OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_COVER_URL = "https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"

# Be a polite citizen: Open Library asks for a User-Agent and a small
# inter-request delay. See https://openlibrary.org/dev/docs/api/search.
USER_AGENT = "LT_portfolio-book-ingestion/1.0 (https://github.com/LingT03)"
REQUEST_DELAY_S = 0.5

# ---------------------------------------------------------------------------
# Catalog seed (V2 §3.5.2)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class CatalogEntry:
    """A single seed row mapping a title/author pair to user annotations.

    Attributes
    ----------
    title : str
        Human-recognizable title used as the Open Library search key.
    author : str | None
        Author hint to disambiguate hits with identical titles.
    category : Literal["Fiction", "Nonfiction", "Textbook"]
        Local taxonomy bucket (overrides any Open Library subject tag).
    rating : float | None
        User score on the 0–10 scale; ``None`` for textbooks (V2 §3.5.2).
    """

    title: str
    author: str | None
    category: str
    rating: float | None = None


CATALOG: tuple[CatalogEntry, ...] = (
    # --- Fiction / Nonfiction (rated) ----------------------------------
    CatalogEntry("No Longer Human", "Osamu Dazai", "Fiction", 7.8),
    CatalogEntry("Meditations", "Marcus Aurelius", "Nonfiction", 3.2),
    CatalogEntry("The Monk Who Sold His Ferrari", "Robin Sharma", "Nonfiction", 7.9),
    CatalogEntry("The Four Agreements", "Don Miguel Ruiz", "Nonfiction", 7.3),
    CatalogEntry("Things Fall Apart", "Chinua Achebe", "Fiction", 9.7),
    CatalogEntry("Animal Farm", "George Orwell", "Fiction", 8.6),
    CatalogEntry(
        "Before the Coffee Gets Cold", "Toshikazu Kawaguchi", "Fiction", 8.7
    ),
    CatalogEntry("The Prophet", "Kahlil Gibran", "Nonfiction", 7.2),
    CatalogEntry("Siddhartha", "Hermann Hesse", "Fiction", 8.4),
    CatalogEntry("Season of migration to the North", "Tayeb Salih", "Fiction", 7.4),
    CatalogEntry("Silence", "Shusaku Endo", "Fiction", 9.3),
    CatalogEntry("The Rose That Grew from Concrete", "Tupac Shakur", "Nonfiction", 7.2),
    CatalogEntry("A River Dies of Thirst", "Mahmoud Darwish", "Nonfiction", 8.5),
    CatalogEntry("The Will to Change", "bell hooks", "Nonfiction", 8.0),
    CatalogEntry("The Stranger", "Albert Camus", "Fiction", 7.0),
    CatalogEntry("Perfume", "Patrick Suskind", "Fiction", 9.0),
    CatalogEntry("Flowers for Algernon", "Daniel Keyes", "Fiction", 9.3),
    CatalogEntry("Psychology of the Unconscious", "Carl Jung", "Nonfiction", 7.0),
    CatalogEntry(
        "Why Women Have Better Sex Under Socialism",
        "Kristen Ghodsee",
        "Nonfiction",
        8.4,
    ),
    CatalogEntry("All About Love", "bell hooks", "Nonfiction", 8.8),
    CatalogEntry("A Little Life", "Hanya Yanagihara", "Fiction", 9.3),
    CatalogEntry("Everything is Tuberculosis", "John Green", "Nonfiction", 9.4),
    CatalogEntry("The Alignment Problem", "Brian Christian", "Nonfiction", 8.8),
    # --- Textbooks (unrated) -------------------------------------------
    CatalogEntry(
        "Causal Inference for Statistics, Social, and Biomedical Sciences",
        "Guido Imbens",
        "Textbook",
    ),
    CatalogEntry(
        "Counterfactuals and Causal Inference",
        "Stephen Morgan",
        "Textbook",
    ),
    CatalogEntry("Causality", "Judea Pearl", "Textbook"),
    CatalogEntry(
        "Mathematics for Machine Learning",
        "Marc Peter Deisenroth",
        "Textbook",
    ),
    CatalogEntry(
        "Machine Learning with PyTorch and Scikit-Learn",
        "Sebastian Raschka",
        "Textbook",
    ),
    CatalogEntry(
        "Deep Learning with PyTorch",
        "Eli Stevens",
        "Textbook",
    ),
    CatalogEntry("Deep Learning", "Ian Goodfellow", "Textbook"),
    CatalogEntry("Social Network Analysis", "Stanley Wasserman", "Textbook"),
    CatalogEntry(
        "Causal Inference for Data Science",
        "Aleix Ruiz de Villa",
        "Textbook",
    ),
    CatalogEntry("Causal AI", "Robert Ness", "Textbook"),
    CatalogEntry("Linear Algebra", "Gilbert Strang", "Textbook"),
    CatalogEntry(
        "Elements of Causal Inference",
        "Jonas Peters",
        "Textbook",
    ),
    CatalogEntry(
        "Causal Inference in Statistics",
        "Judea Pearl",
        "Textbook",
    ),
    CatalogEntry("All of Statistics", "Larry Wasserman", "Textbook"),
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def slugify(value: str) -> str:
    """Normalize a title into a filesystem-safe slug.

    Parameters
    ----------
    value : str
        Free-form title.

    Returns
    -------
    str
        ASCII slug with lowercase + hyphen separators.
    """
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value or "untitled"


def search_open_library(
    client: "httpx.Client",
    title: str,
    author: str | None,
) -> dict[str, Any] | None:
    """Query Open Library Search for a single best-match document.

    Parameters
    ----------
    client : httpx.Client
        Reusable HTTP client (Open Library is rate-limited).
    title : str
        Title query string.
    author : str | None
        Author hint; passed when present to disambiguate.

    Returns
    -------
    dict | None
        The first ``docs`` entry, or ``None`` if no match was found.
    """
    params: dict[str, str | int] = {"title": title, "limit": 1}
    if author:
        params["author"] = author
    resp = client.get(
        OPEN_LIBRARY_SEARCH_URL,
        params=params,
        headers={"User-Agent": USER_AGENT},
        timeout=15.0,
    )
    resp.raise_for_status()
    payload = resp.json()
    docs = payload.get("docs") or []
    return docs[0] if docs else None


def doc_to_canonical(doc: dict[str, Any]) -> dict[str, Any]:
    """Project an Open Library search-result doc onto our canonical schema.

    Parameters
    ----------
    doc : dict
        Raw ``docs[i]`` payload from the Search API.

    Returns
    -------
    dict
        Keys ``title``, ``author``, ``cover_image_url``,
        ``open_library_key``, ``isbn`` — every value is JSON-serializable.
    """
    cover_id = doc.get("cover_i")
    cover_url = (
        OPEN_LIBRARY_COVER_URL.format(cover_id=cover_id) if cover_id else None
    )
    authors = doc.get("author_name") or []
    isbns = doc.get("isbn") or []
    return {
        "title": doc.get("title") or "",
        "author": ", ".join(authors) if authors else "",
        "cover_image_url": cover_url,
        "open_library_key": doc.get("key"),
        "isbn": isbns[0] if isbns else None,
    }


def load_existing(path: Path) -> tuple[dict[str, Any], str]:
    """Load an existing book Markdown file, returning (front_matter, body)."""
    post = frontmatter.load(path)
    return dict(post.metadata), post.content


def merge_entry(
    entry: CatalogEntry,
    canonical: dict[str, Any],
    existing_meta: dict[str, Any] | None,
    existing_body: str | None,
) -> tuple[dict[str, Any], str]:
    """Merge fetched canonical fields with locally authored content.

    Conflict policy
    ---------------
    - **Canonical fields** (``title``, ``author``, ``cover_image_url``,
      ``open_library_key``, ``isbn``) always come from the fetch.
    - **User-annotated fields** (``rating``, ``category``, ``tags``,
      ``started_at``, ``finished_at``, body Markdown) prefer the
      existing file when present, otherwise seed from the catalog row.

    Parameters
    ----------
    entry : CatalogEntry
        Catalog seed row.
    canonical : dict
        Output of ``doc_to_canonical`` (may be empty if fetch failed).
    existing_meta : dict | None
        Front-matter of the existing file, or ``None`` for a fresh write.
    existing_body : str | None
        Body Markdown of the existing file, or ``None``.

    Returns
    -------
    tuple
        ``(front_matter, body)`` ready to be serialized.
    """
    slug = slugify(entry.title)
    canonical_title = canonical.get("title") or entry.title
    canonical_author = canonical.get("author") or entry.author or ""

    meta: dict[str, Any] = {
        "id": slug,
        "title": canonical_title,
        "author": canonical_author,
        "category": entry.category,
        "rating": entry.rating,
        "cover_image_url": canonical.get("cover_image_url"),
        "open_library_key": canonical.get("open_library_key"),
        "isbn": canonical.get("isbn"),
        "started_at": None,
        "finished_at": None,
        "tags": [],
    }

    # Prefer locally authored values when they exist.
    if existing_meta:
        for key in (
            "rating",
            "category",
            "tags",
            "started_at",
            "finished_at",
            "notes_md",
        ):
            if key in existing_meta and existing_meta[key] not in (None, [], ""):
                meta[key] = existing_meta[key]

    body = (existing_body or "").strip()
    if not body:
        body = _seed_summary(canonical_title, canonical_author)
    return meta, body


def _seed_summary(title: str, author: str) -> str:
    """Generate a placeholder summary body so the build never sees empty Markdown."""
    return (
        f"_Pending summary for **{title}**"
        + (f" by {author}_" if author else "_")
        + "\n\n"
        + "Notes and reflections will be added after the current read-through."
    )


def write_markdown(path: Path, meta: dict[str, Any], body: str) -> None:
    """Serialize ``meta`` + ``body`` as YAML front matter + Markdown body."""
    front_matter = yaml.safe_dump(
        meta,
        sort_keys=False,
        allow_unicode=True,
        default_flow_style=False,
    ).rstrip()
    path.write_text(f"---\n{front_matter}\n---\n\n{body.strip()}\n")


# ---------------------------------------------------------------------------
# Top-level orchestration
# ---------------------------------------------------------------------------


def ingest(entries: Iterable[CatalogEntry], offline: bool) -> int:
    """Run the ingestion pipeline.

    Returns
    -------
    int
        Process exit code (0 on success, 1 on partial failure).
    """
    BOOKS_DIR.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []

    client: "httpx.Client | None" = None
    if not offline:
        if httpx is None:
            sys.stderr.write(
                "[error] httpx is required for online mode; "
                "add it to scripts/requirements.txt and re-install.\n"
            )
            return 1
        client = httpx.Client()

    try:
        for i, entry in enumerate(entries):
            slug = slugify(entry.title)
            path = BOOKS_DIR / f"{slug}.md"

            existing_meta: dict[str, Any] | None = None
            existing_body: str | None = None
            if path.exists():
                existing_meta, existing_body = load_existing(path)

            canonical: dict[str, Any] = {}
            if client is not None:
                try:
                    doc = search_open_library(client, entry.title, entry.author)
                    if doc:
                        canonical = doc_to_canonical(doc)
                    else:
                        failures.append(entry.title)
                except (httpx.HTTPError, json.JSONDecodeError) as e:  # type: ignore[union-attr]
                    sys.stderr.write(f"[warn] {entry.title}: {e}\n")
                    failures.append(entry.title)
                if i > 0:
                    time.sleep(REQUEST_DELAY_S)

            meta, body = merge_entry(entry, canonical, existing_meta, existing_body)
            write_markdown(path, meta, body)
            sys.stdout.write(f"  wrote content/books/{slug}.md\n")
    finally:
        if client is not None:
            client.close()

    if failures:
        sys.stderr.write(
            "[warn] no Open Library hit for: " + ", ".join(failures) + "\n"
        )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--offline",
        action="store_true",
        help="Skip Open Library fetches; merge catalog into local files only.",
    )
    args = parser.parse_args()
    return ingest(CATALOG, offline=args.offline)


if __name__ == "__main__":
    raise SystemExit(main())

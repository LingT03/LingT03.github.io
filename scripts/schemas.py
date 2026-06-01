"""
Pydantic schema definitions mirroring section 3 of the portfolio specification.

Each model corresponds to a content type rendered by the React frontend and is
used by ``build_content.py`` to validate the structural integrity of every
Markdown front-matter and JSON record before emitting the compiled payloads.

Design notes
------------
- Field names follow snake_case to match the specification exactly.
- All identifiers are strings (slug-like) for portability across both Markdown
  and JSON record sources.
- Optional fields use ``None`` defaults so missing front-matter keys do not
  produce false negatives during validation.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ---------------------------------------------------------------------------
# Shared concepts
# ---------------------------------------------------------------------------


class TechStackItem(BaseModel):
    """A single technology entry (language, framework, or tool).

    Attributes
    ----------
    id : str
        Stable slug identifier referenced from jobs, projects, and courses.
    name : str
        Human-readable technology name shown on the badge.
    logo_url : str | None
        Optional asset URL for a logo glyph. Placeholder accepted.
    category : Literal["language", "framework", "tool"] | None
        Optional grouping field used for filter UIs.
    level : int | None
        Optional rendering weight (1-5) for visual emphasis.
    """

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    logo_url: str | None = None
    category: Literal["language", "framework", "tool"] | None = None
    level: int | None = Field(default=None, ge=1, le=5)


# ---------------------------------------------------------------------------
# Academic module
# ---------------------------------------------------------------------------


class Degree(BaseModel):
    """An academic credential block rendered on the Academic page."""

    model_config = ConfigDict(extra="forbid")

    id: str
    institution: str
    degree_type: str
    majors: list[str]
    concentration: str | None = None
    start_date: date
    end_date: date | None = None  # None = in progress
    overview_md: str  # populated from the Markdown body


class Course(BaseModel):
    """A coursework entry tied to a degree via ``degree_id``."""

    model_config = ConfigDict(extra="forbid")

    id: str
    degree_id: str
    name: str
    code: str
    short_description_md: str
    tags: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Publications module
# ---------------------------------------------------------------------------


# Canonical ORCID iD pattern: four hyphen-separated groups of four characters,
# where the final character may be the checksum digit "X" (ISO 7064 mod 11-2).
_ORCID_RE = re.compile(r"^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$")


class Author(BaseModel):
    """A single author on a publication byline.

    Attributes
    ----------
    name : str
        Display name as it should appear in the rendered author list.
    orcid : str | None
        Bare ORCID iD (e.g. ``"0000-0003-3134-8846"``), not the full URL.
        The frontend expands it to ``https://orcid.org/<id>`` for linking.
        Validated against the canonical 16-character ORCID pattern.
    """

    model_config = ConfigDict(extra="forbid")

    name: str
    orcid: str | None = None

    @field_validator("orcid")
    @classmethod
    def _check_orcid(cls, v: str | None) -> str | None:
        """Reject malformed ORCID iDs at build time."""
        if v is not None and not _ORCID_RE.match(v):
            raise ValueError(
                f"invalid ORCID iD {v!r}; expected 0000-0000-0000-000X form"
            )
        return v


class Publication(BaseModel):
    """A research publication or preprint rendered on the Publications page.

    The ordered ``authors`` list preserves byline order (the frontend bolds
    the entry whose ``name`` matches the site owner). ``status`` captures the
    lifecycle stage so the UI can badge preprints distinctly from peer-reviewed
    articles. The Markdown body is injected into ``abstract_md`` and rendered to
    ``abstract_md_html`` at build time, exactly like every other Markdown
    content type in this pipeline.

    Notes
    -----
    ``doi`` is stored as the bare DOI (``10.1101/...``); the frontend resolves
    it to ``https://doi.org/<doi>``. ``url`` is an optional override for a
    canonical landing page that is not derivable from the DOI.
    """

    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    authors: list[Author]
    venue: str
    status: Literal[
        "preprint",
        "published",
        "under_review",
        "in_preparation",
    ] = "preprint"
    doi: str | None = None
    url: str | None = None
    published_date: date | None = None
    links: dict[str, str] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)
    abstract_md: str  # populated from the Markdown body


# ---------------------------------------------------------------------------
# Professional module
# ---------------------------------------------------------------------------


class Job(BaseModel):
    """A professional engagement rendered on the Professional page."""

    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    organization: str
    location: str
    start_date: date
    end_date: date | None = None  # None = present
    description_md: str
    tech_stack: list[str] = Field(default_factory=list)  # references TechStackItem.id


# ---------------------------------------------------------------------------
# Projects module
# ---------------------------------------------------------------------------


class Project(BaseModel):
    """A software / research project entry.

    Extended for V2 §3.4: ``role``, ``timeframe``, and ``tags`` join the
    existing identification fields, and ``status`` accepts the expanded
    lifecycle vocabulary used in the canonical V2 listing.
    """

    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    short_description_md: str
    long_description_md: str
    tech_stack: list[str] = Field(default_factory=list)
    links: dict[str, str] = Field(default_factory=dict)
    status: Literal[
        "in_progress",
        "completed",
        "archived",
        "prototype",
        "active",
    ] = "completed"
    role: str | None = None
    timeframe: str | None = None
    tags: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Books / Readings module
# ---------------------------------------------------------------------------


class Book(BaseModel):
    """A book review record.

    V2 §3.5: ``category`` is reordered/relabeled to
    ``Fiction → Nonfiction → Textbook`` (replacing the legacy "Learning"
    bucket). Ratings are optional for textbooks per the spec, so the
    field type is widened to ``float | None``.

    Notes
    -----
    The Open Library ingestion script (``scripts/fetch_books.py``)
    populates ``cover_image_url`` and ``author`` from canonical
    bibliographic data; user-annotated fields (rating, category, tags,
    summary, notes) are authored locally and preserved across re-runs.
    """

    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    author: str
    category: Literal["Fiction", "Nonfiction", "Textbook"]
    rating: float | None = Field(default=None, ge=0.0, le=10.0)
    cover_image_url: str | None = None
    open_library_key: str | None = None  # e.g. "/works/OL12345W"
    isbn: str | None = None
    started_at: date | None = None
    finished_at: date | None = None
    summary_md: str
    notes_md: str | None = None
    tags: list[str] = Field(default_factory=list)

    @field_validator("rating")
    @classmethod
    def _round_to_two(cls, v: float | None) -> float | None:
        """Enforce two-decimal precision for the rating field."""
        return None if v is None else round(v, 2)


# ---------------------------------------------------------------------------
# Photography module
# ---------------------------------------------------------------------------


class Device(BaseModel):
    """A capture device used in the Photography module."""

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    type: Literal["camera", "phone", "other"]


class Photo(BaseModel):
    """A photograph asset record."""

    model_config = ConfigDict(extra="forbid")

    id: str
    image_url: str
    location: str
    year: int = Field(ge=1900, le=2100)
    device_id: str
    description_md: str | None = None
    tags: list[str] = Field(default_factory=list)

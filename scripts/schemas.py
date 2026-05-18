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
    """A software / research project entry."""

    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    short_description_md: str
    long_description_md: str
    tech_stack: list[str] = Field(default_factory=list)
    links: dict[str, str] = Field(default_factory=dict)
    status: Literal["in_progress", "completed", "archived"] = "completed"


# ---------------------------------------------------------------------------
# Books / Readings module
# ---------------------------------------------------------------------------


class Book(BaseModel):
    """A book review record."""

    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    author: str
    category: Literal["Learning", "Nonfiction", "Fiction"]
    rating: float = Field(ge=0.0, le=10.0)
    cover_image_url: str | None = None
    started_at: date | None = None
    finished_at: date | None = None
    summary_md: str
    notes_md: str | None = None
    tags: list[str] = Field(default_factory=list)

    @field_validator("rating")
    @classmethod
    def _round_to_two(cls, v: float) -> float:
        """Enforce two-decimal precision for the rating field."""
        return round(v, 2)


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

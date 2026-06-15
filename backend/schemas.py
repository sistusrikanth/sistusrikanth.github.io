from datetime import datetime
from pydantic import BaseModel, Field


class ArticleBase(BaseModel):
    title: str
    slug: str | None = None
    summary: str = ""
    content: str = ""
    category: str = "papers"
    tags: str = ""
    read_time_min: int = 5
    featured: bool = False
    published: bool = True


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    content: str | None = None
    category: str | None = None
    tags: str | None = None
    read_time_min: int | None = None
    featured: bool | None = None
    published: bool | None = None


class ArticleOut(ArticleBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PhotoLinkBase(BaseModel):
    title: str = ""
    instagram_url: str
    category: str = "street"
    sort_order: int = 0


class PhotoLinkCreate(PhotoLinkBase):
    pass


class PhotoLinkUpdate(BaseModel):
    title: str | None = None
    instagram_url: str | None = None
    category: str | None = None
    sort_order: int | None = None


class PhotoLinkOut(PhotoLinkBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    url: str
    status: str
    tech_tags: str
    icon_color: str
    sort_order: int

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    title: str
    description: str = ""
    url: str = ""
    status: str = "wip"
    tech_tags: str = ""
    icon_color: str = "#6366f1"
    sort_order: int = 0


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    url: str | None = None
    status: str | None = None
    tech_tags: str | None = None
    icon_color: str | None = None
    sort_order: int | None = None


class StartupIdeaOut(BaseModel):
    id: int
    title: str
    description: str
    contact_url: str
    sort_order: int

    model_config = {"from_attributes": True}


class StartupIdeaCreate(BaseModel):
    title: str
    description: str = ""
    contact_url: str = ""
    sort_order: int = 0


class StartupIdeaUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    contact_url: str | None = None
    sort_order: int | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UploadOut(BaseModel):
    url: str
    filename: str
    kind: str  # image | excalidraw


class LoginRequest(BaseModel):
    password: str


class DayEntryBase(BaseModel):
    entry_date: str
    personal: str = ""
    professional: str = ""


class DayEntryCreate(DayEntryBase):
    pass


class DayEntryOut(DayEntryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WeekDayOut(BaseModel):
    entry_date: str
    personal: str = ""
    professional: str = ""
    has_entry: bool = False


class WeekSummaryOut(BaseModel):
    week_start: str
    week_end: str
    days: list[WeekDayOut]
    filled_count: int
    is_complete: bool
    summary: str = ""


class WeekSummaryUpdate(BaseModel):
    summary: str


class MLComponent(BaseModel):
    name: str
    description: str = ""
    technical_aspects: list[str] = Field(default_factory=list)


class EducationOut(BaseModel):
    id: int
    institution: str
    degree: str
    field: str
    start_year: str
    end_year: str
    description: str
    sort_order: int

    model_config = {"from_attributes": True}


class EducationCreate(BaseModel):
    institution: str
    degree: str = ""
    field: str = ""
    start_year: str = ""
    end_year: str = ""
    description: str = ""
    sort_order: int = 0


class EducationUpdate(BaseModel):
    institution: str | None = None
    degree: str | None = None
    field: str | None = None
    start_year: str | None = None
    end_year: str | None = None
    description: str | None = None
    sort_order: int | None = None


class WorkExperienceOut(BaseModel):
    id: int
    company: str
    role: str
    location: str
    start_date: str
    end_date: str
    description: str
    sort_order: int

    model_config = {"from_attributes": True}


class WorkExperienceCreate(BaseModel):
    company: str
    role: str
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""
    sort_order: int = 0


class WorkExperienceUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None
    sort_order: int | None = None


class ExperienceProjectOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    role_context: str
    sort_order: int

    model_config = {"from_attributes": True}


class ExperienceProjectDetailOut(ExperienceProjectOut):
    ml_components: list[MLComponent]
    technical_detail: str


class ExperienceProjectCreate(BaseModel):
    title: str
    slug: str | None = None
    summary: str = ""
    role_context: str = ""
    ml_components: str = "[]"
    technical_detail: str = ""
    sort_order: int = 0


class ExperienceProjectUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    role_context: str | None = None
    ml_components: str | None = None
    technical_detail: str | None = None
    sort_order: int | None = None


class ExploreCard(BaseModel):
    num: str
    icon: str
    title: str
    desc: str
    to: str


class SiteSettingsOut(BaseModel):
    name: str
    tagline: str
    location: str
    github: str
    twitter: str
    email: str
    now_text: str
    index_eyebrow: str
    index_hero: str
    index_intro: str
    mission_statement: str
    index_explore: list[ExploreCard]


class SiteSettingsUpdate(BaseModel):
    name: str | None = None
    tagline: str | None = None
    location: str | None = None
    github: str | None = None
    twitter: str | None = None
    email: str | None = None
    now_text: str | None = None
    index_eyebrow: str | None = None
    index_hero: str | None = None
    index_intro: str | None = None
    mission_statement: str | None = None
    index_explore: list[ExploreCard] | None = None


class ExperienceOut(BaseModel):
    education: list[EducationOut]
    work: list[WorkExperienceOut]
    projects: list[ExperienceProjectOut]


class IdentityCardBase(BaseModel):
    category: str
    content: str = ""


class IdentityCardUpdate(BaseModel):
    content: str


class IdentityCardOut(IdentityCardBase):
    id: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class InspirationItemBase(BaseModel):
    kind: str = "quote"
    content: str
    source: str = ""
    entry_date: str = ""
    sort_order: int = 0


class InspirationItemCreate(InspirationItemBase):
    pass


class InspirationItemUpdate(BaseModel):
    kind: str | None = None
    content: str | None = None
    source: str | None = None
    entry_date: str | None = None
    sort_order: int | None = None


class InspirationItemOut(InspirationItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InspirationTodayOut(BaseModel):
    daily_quote: InspirationItemOut | None
    moves_me: list[InspirationItemOut]

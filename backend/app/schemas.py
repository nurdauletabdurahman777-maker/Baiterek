from __future__ import annotations
from datetime import date, datetime
from typing import Any, Literal
from pydantic import BaseModel, Field, model_validator

class FieldDef(BaseModel):
    id: str; step_id: str; type: str; label: str
    description: str = ""; placeholder: str = ""; required: bool = False
    options: list[dict[str, str]] = Field(default_factory=list)
    prefill: str | None = None; validation: dict[str, Any] = Field(default_factory=dict)
    hidden: bool = False

class StepDef(BaseModel):
    id: str; title: str; description: str = ""

class Condition(BaseModel):
    field: str; operator: Literal["eq","neq","gt","gte","lt","lte","contains","empty","not_empty"]; value: Any = None

class Action(BaseModel):
    type: Literal["show","hide","require","optional","warning","require_document","skip_step","set"]
    target: str; value: Any = None; message: str = ""

class RuleDef(BaseModel):
    id: str; name: str; conditions: list[Condition]; actions: list[Action]
    logic: Literal["AND","OR"] = "AND"; enabled: bool = True; demo: bool = True

class CalculationDef(BaseModel):
    id: str; label: str; target: str; operation: Literal["multiply","percent","subtract","add"]; inputs: list[str]

class DocumentDef(BaseModel):
    id: str; title: str; description: str = ""; required: bool = False
    accepted_types: list[str] = Field(default_factory=lambda:["application/pdf"]); max_size_mb: int = Field(default=10, ge=1, le=25)

class ServiceDef(BaseModel):
    id: str; slug: str; title: str; short_description: str; category: str; organization: str; support_type: str
    audience: list[str]; processing_time: str; policy_source: str; relevance_date: date
    status: Literal["draft","published","archived"] = "draft"; version: str = "1.0"
    steps: list[StepDef]; fields: list[FieldDef]; rules: list[RuleDef]
    calculations: list[CalculationDef]; documents: list[DocumentDef]
    integrations: list[str] = Field(default_factory=list); editor: str = "Демо-аналитик"
    updated_at: datetime = Field(default_factory=datetime.utcnow); change_summary: str = "Первичная публикация"
    @model_validator(mode="after")
    def unique(self):
        for group in (self.steps,self.fields,self.rules,self.calculations,self.documents):
            ids=[x.id for x in group]
            if len(ids)!=len(set(ids)): raise ValueError("Идентификаторы должны быть уникальны")
        return self

class DraftIn(BaseModel):
    service_id: str; answers: dict[str,Any] = Field(default_factory=dict)
    documents: list[dict[str,Any]] = Field(default_factory=list); consent: bool = False

class PublishIn(BaseModel):
    definition: ServiceDef; change_summary: str = Field(min_length=3,max_length=300)


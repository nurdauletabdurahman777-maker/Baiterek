from copy import deepcopy
from fastapi.testclient import TestClient
from app.data import SERVICES
from app.engine import evaluate, quality_gate, readiness
from app.main import app
from app.models import normalize_database_url

def complete_answers(service):
    values={}
    for f in service.fields:
        if f.type in {"money","number","percentage"}: values[f.id]=20
        elif f.type=="date": values[f.id]="2020-01-01"
        elif f.type in {"radio","select"}: values[f.id]=f.options[0]["value"] if f.options else "yes"
        elif f.type=="multiselect": values[f.id]=[f.options[0]["value"]] if f.options else ["yes"]
        else: values[f.id]="Демонстрационное значение"
    return values

def test_amount_threshold_requires_feasibility_study():
    s=SERVICES["wagon-leasing"]
    assert "feasibility_study" not in evaluate(s,{"requested_amount":500_000_000})["required_documents"]
    result=evaluate(s,{"requested_amount":500_000_001})
    assert "feasibility_study" in result["required_documents"]
    assert "технико-экономическое" in result["warnings"][0]["message"]

def test_provider_database_urls_select_psycopg():
    assert normalize_database_url("postgres://u:p@host/db") == "postgresql+psycopg://u:p@host/db"
    assert normalize_database_url("postgresql://u:p@host/db") == "postgresql+psycopg://u:p@host/db"
    assert normalize_database_url("sqlite:///demo.db") == "sqlite:///demo.db"

def test_calculations_are_deterministic():
    result=evaluate(SERVICES["wagon-leasing"],{"wagon_quantity":10,"unit_cost":25_000_000,"contribution_percentage":20})
    assert result["calculated"]=={"total_wagon_cost":250_000_000.0,"contribution_amount":50_000_000.0,"financing_gap":200_000_000.0}

def test_both_services_share_runtime_and_quality_passes():
    for service in SERVICES.values():
        assert evaluate(service,{})["visible_fields"]
        assert quality_gate(service)["can_publish"]

def test_quality_gate_blocks_broken_reference():
    raw=SERVICES["wagon-leasing"].model_dump(); raw["rules"][0]["conditions"][0]["field"]="missing"
    broken=type(SERVICES["wagon-leasing"]).model_validate(raw)
    assert not quality_gate(broken)["can_publish"]

def test_readiness_blocks_missing_conditional_document():
    s=SERVICES["wagon-leasing"]; answers=complete_answers(s); answers["requested_amount"]=600_000_000
    result=readiness(s,answers,[{"document_id":"registration_doc"}],True)
    assert not result["ready"]
    assert any(x["target"]=="feasibility_study" for x in result["blockers"])

def test_support_route_and_api_health():
    with TestClient(app) as c:
        assert c.get("/health").status_code==200
        route=c.post("/api/support-route",json={"sector":"agro","goal":"лизинг","equipment_transport":True}).json()
        assert len(route["recommendations"])>=3

def test_submission_persists_and_is_idempotent():
    with TestClient(app) as c:
        token={"Authorization":"Bearer demo-entrepreneur"}; s=SERVICES["livestock"]; answers=complete_answers(s); answers.update({"new_business":"existing","planned_herd":100,"infrastructure":["water"]})
        draft=c.post("/api/applications/drafts",headers=token,json={"service_id":"livestock","answers":answers,"documents":[{"document_id":"registration_doc"}],"consent":True}).json()
        check=c.get(f"/api/applications/{draft['id']}/readiness",headers=token).json(); assert check["ready"]
        first=c.post(f"/api/applications/{draft['id']}/submit",headers={**token,"Idempotency-Key":"demo-1"}); assert first.status_code==200
        second=c.post(f"/api/applications/{draft['id']}/submit",headers={**token,"Idempotency-Key":"demo-1"}).json(); assert second["duplicate"]
        assert any(x["id"]==draft["id"] for x in c.get("/api/applications",headers=token).json())

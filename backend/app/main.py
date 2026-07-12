from contextlib import asynccontextmanager
from datetime import datetime
from copy import deepcopy
from typing import Any
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, delete, func
from sqlalchemy.orm import Session
from .data import SERVICES, PROJECTS, REPORTS
from .engine import evaluate, quality_gate, readiness
from .models import Application, AuditLog, BusinessPassport, IntegrationEvent, ServiceVersion, StatusEvent, SessionLocal, init_db
from .schemas import DraftIn, PublishIn, ServiceDef
import os

def db():
    s=SessionLocal()
    try: yield s
    finally: s.close()
def actor(authorization:str|None=Header(None)):
    token=(authorization or "Bearer demo-entrepreneur").replace("Bearer ","")
    role=token.replace("demo-","")
    if role not in {"entrepreneur","analyst","subsidiary_admin","holding_admin"}: raise HTTPException(401,"Недействительный демо-токен")
    return {"email":f"{role}@demo.flowos.kz","role":role,"name":{"entrepreneur":"Айдана Серикова","analyst":"Мария Ким","subsidiary_admin":"Администратор дочерней организации","holding_admin":"Администратор холдинга"}[role]}
def admin(a=Depends(actor)):
    if a["role"] not in {"analyst","subsidiary_admin","holding_admin"}: raise HTTPException(403,"Требуется роль аналитика или администратора")
    return a
def current_service(slug:str,s:Session):
    row=s.scalar(select(ServiceVersion).where(ServiceVersion.service_id==slug,ServiceVersion.status=="published").order_by(ServiceVersion.id.desc()))
    return ServiceDef.model_validate(row.definition) if row else SERVICES.get(slug)

@asynccontextmanager
async def lifespan(app):
    init_db()
    with SessionLocal() as s:
        for slug,definition in SERVICES.items():
            if not s.scalar(select(ServiceVersion).where(ServiceVersion.service_id==slug)):
                s.add(ServiceVersion(service_id=slug,version="1.0",status="published",definition=definition.model_dump(mode="json"),author="Система",summary="Демо-публикация"))
        s.commit()
    yield

app=FastAPI(title="Baiterek FlowOS API",version="1.0.0",description="Конфигурационная платформа цифровых мер поддержки. Все интеграции в demo mode являются моками.",lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health(): return {"status":"ok","mode":"deterministic-demo"}
@app.get("/ready")
def ready(s:Session=Depends(db)): s.execute(select(1)); return {"ready":True,"database":"connected"}
@app.get("/version")
def version(): return {"name":"Baiterek FlowOS","version":"1.0.0","api":"v1"}
@app.post("/api/auth/demo")
def login(payload:dict):
    role=payload.get("role","entrepreneur")
    if role not in {"entrepreneur","analyst","subsidiary_admin","holding_admin"}: raise HTTPException(400,"Неизвестная роль")
    return {"access_token":f"demo-{role}","token_type":"bearer","user":actor(f"Bearer demo-{role}")}
@app.get("/api/me")
def me(a=Depends(actor)): return a

@app.get("/api/services")
def services(search:str="",category:str="",organization:str="",s:Session=Depends(db)):
    values=[current_service(x,s) for x in SERVICES]
    return [v.model_dump(mode="json") for v in values if (not search or search.lower() in (v.title+v.short_description).lower()) and (not category or v.category==category) and (not organization or v.organization==organization)]
@app.get("/api/services/{slug}")
def service(slug:str,s:Session=Depends(db)):
    value=current_service(slug,s)
    if not value: raise HTTPException(404,"Услуга не найдена")
    return value.model_dump(mode="json")
@app.post("/api/services/{slug}/evaluate")
def evaluate_api(slug:str,answers:dict,s:Session=Depends(db)):
    value=current_service(slug,s)
    if not value: raise HTTPException(404,"Услуга не найдена")
    return evaluate(value,answers)

@app.get("/api/passport")
def passport(a=Depends(actor),s:Session=Depends(db)):
    row=s.scalar(select(BusinessPassport).where(BusinessPassport.user_email==a["email"]))
    return row.data if row else {"bin":"120640012345","company_name":"ТОО «Qazaq Logistics»","legal_form":"ТОО","registration_date":"2018-06-14","company_age_months":97,"director":"Серикова Айдана Ерлановна","address":"г. Астана, пр. Мәңгілік Ел, 55/18","region":"astana","sector":"Логистика","activity_code":"49.20","email":"office@qazaq-logistics.demo","phone":"+7 7172 55 44 33","employees":42,"annual_revenue":780000000,"documents":["registration_doc"]}
@app.put("/api/passport")
def save_passport(payload:dict,a=Depends(actor),s:Session=Depends(db)):
    row=s.scalar(select(BusinessPassport).where(BusinessPassport.user_email==a["email"]))
    if row: row.data=payload; row.updated_at=datetime.utcnow()
    else: row=BusinessPassport(user_email=a["email"],data=payload); s.add(row)
    s.commit(); return {"saved":True,"data":payload}
@app.post("/api/integrations/egov-bin")
def egov(payload:dict,a=Depends(actor),s:Session=Depends(db)):
    result={"bin":payload.get("bin","120640012345"),"company_name":"ТОО «Qazaq Logistics»","director":"Серикова Айдана Ерлановна","registration_date":"2018-06-14","region":"astana","mock":True}
    s.add(IntegrationEvent(connector="eGov/BIN MOCK",endpoint="/v1/business",method="POST",status="200",response_ms=184,payload={"request":{"bin":"***2345"},"response":{"found":True}})); s.commit(); return result

@app.post("/api/support-route")
def route(p:dict):
    amount=float(p.get("requested_amount",0) or 0); goal=p.get("goal","")
    rec=[]
    if "лиз" in goal.lower() or p.get("equipment_transport"):
        rec.append({"service_id":"wagon-leasing","title":"Приобретение вагонов в лизинг","why":"Соответствует цели приобретения транспорта без единовременной оплаты.","blockers":["Собственное участие ниже 15%"] if not p.get("collateral") else [],"actions":["Подготовить коммерческое предложение","Проверить долю собственного участия"],"organization":"АО «ФРП»","next_step":"Проверить соответствие"})
    if p.get("sector") in {"agro","АПК"}:
        rec.append({"service_id":"livestock","title":"Агробизнес: животноводство","why":"Проект относится к АПК и предусматривает рост производственных мощностей.","blockers":[],"actions":["Подтвердить земельный участок","Составить план поголовья"],"organization":"АО «АКК»","next_step":"Открыть услугу"})
    rec.append({"service_id":"guarantee","title":"Гарантия для предпринимателей","why":f"Может дополнить финансирование проекта на {amount:,.0f} ₸.","blockers":[],"actions":["Получить решение банка"],"organization":"АО «ФРП «Даму»","next_step":"Добавить в маршрут"})
    return {"deterministic":True,"recommendations":rec,"input":p}

@app.post("/api/applications/drafts")
def create_draft(p:DraftIn,a=Depends(actor),s:Session=Depends(db)):
    if not current_service(p.service_id,s): raise HTTPException(404,"Услуга не найдена")
    row=Application(owner=a["email"],service_id=p.service_id,answers=p.answers,documents=p.documents,consent=p.consent); s.add(row); s.commit(); s.refresh(row); return {"id":row.id,"status":row.status,"autosaved":True}
@app.put("/api/applications/drafts/{id}")
def update_draft(id:int,p:DraftIn,a=Depends(actor),s:Session=Depends(db)):
    row=s.get(Application,id)
    if not row or row.owner!=a["email"]: raise HTTPException(404,"Черновик не найден")
    row.answers=p.answers; row.documents=p.documents; row.consent=p.consent; row.updated_at=datetime.utcnow(); s.commit(); return {"id":id,"autosaved":True,"updated_at":row.updated_at}
@app.get("/api/applications")
def applications(a=Depends(actor),s:Session=Depends(db)):
    rows=s.scalars(select(Application).where(Application.owner==a["email"]).order_by(Application.id.desc())).all()
    return [{"id":r.id,"number":r.number,"service_id":r.service_id,"service":SERVICES[r.service_id].title,"organization":SERVICES[r.service_id].organization,"status":r.status,"date":r.created_at,"next_action":"Ожидайте первичную проверку" if r.status!="draft" else "Продолжить заполнение","answers":r.answers,"documents":r.documents,"timeline":["Черновик сохранён"]+(["Подписано ЭЦП (демо)","Передано в BPM (демо)"] if r.status!="draft" else [])} for r in rows]
@app.get("/api/applications/{id}/readiness")
def check_readiness(id:int,a=Depends(actor),s:Session=Depends(db)):
    row=s.get(Application,id)
    if not row or row.owner!=a["email"]: raise HTTPException(404,"Заявка не найдена")
    return readiness(current_service(row.service_id,s),row.answers,row.documents,row.consent)
@app.post("/api/applications/{id}/submit")
def submit(id:int,a=Depends(actor),s:Session=Depends(db),idempotency_key:str|None=Header(None)):
    row=s.get(Application,id)
    if not row or row.owner!=a["email"]: raise HTTPException(404,"Заявка не найдена")
    if row.status!="draft": return {"id":row.id,"number":row.number,"external_id":row.external_id,"duplicate":True}
    check=readiness(current_service(row.service_id,s),row.answers,row.documents,row.consent)
    if not check["ready"]: raise HTTPException(422,{"message":"Заявка не готова","readiness":check})
    row.number=f"BF-{datetime.utcnow():%Y}-{row.id:06d}"; row.external_id=f"BPM-DEMO-{row.id:08d}"; row.status="submitted"
    s.add(StatusEvent(application_id=row.id,status="submitted",message="Заявка подписана демо-ЭЦП и передана в BPM (мок)")); s.add(IntegrationEvent(connector="BPM MOCK",endpoint="/applications",method="POST",status="201",response_ms=246,payload={"application":row.number,"sanitized":True})); s.commit()
    return {"id":row.id,"number":row.number,"external_id":row.external_id,"status":row.status,"signature":{"mock":True,"signer":a["name"],"certificate":"DEMO-CERTIFICATE","success":True}}

@app.get("/api/studio/services")
def studio_list(a=Depends(admin),s:Session=Depends(db)):
    return [{"id":v.slug,"title":v.title,"organization":v.organization,"status":v.status,"version":v.version,"readiness":quality_gate(v)["score"],"updated_at":v.updated_at,"editor":v.editor} for v in [current_service(x,s) for x in SERVICES]]
@app.post("/api/studio/services/{slug}/quality")
def quality(slug:str,definition:ServiceDef|None=None,a=Depends(admin),s:Session=Depends(db)):
    value=definition or current_service(slug,s)
    if not value: raise HTTPException(404,"Услуга не найдена")
    return quality_gate(value)
@app.post("/api/studio/services/{slug}/publish")
def publish(slug:str,p:PublishIn,a=Depends(admin),s:Session=Depends(db)):
    if p.definition.slug!=slug: raise HTTPException(400,"Slug определения не совпадает")
    gate=quality_gate(p.definition)
    if not gate["can_publish"]: raise HTTPException(422,{"message":"Публикация заблокирована Quality Gate","quality":gate})
    prev=current_service(slug,s); major,minor=map(int,prev.version.split(".")); version=f"{major}.{minor+1}"; definition=p.definition.model_copy(update={"status":"published","version":version,"editor":a["name"],"change_summary":p.change_summary})
    for old in s.scalars(select(ServiceVersion).where(ServiceVersion.service_id==slug,ServiceVersion.status=="published")).all(): old.status="archived"
    s.add(ServiceVersion(service_id=slug,version=version,status="published",definition=definition.model_dump(mode="json"),author=a["name"],summary=p.change_summary)); s.add(AuditLog(actor=a["email"],action="publish",entity=slug,detail={"version":version,"summary":p.change_summary})); s.commit(); return {"published":True,"version":version,"quality":gate}
@app.get("/api/studio/services/{slug}/versions")
def versions(slug:str,a=Depends(admin),s:Session=Depends(db)):
    rows=s.scalars(select(ServiceVersion).where(ServiceVersion.service_id==slug).order_by(ServiceVersion.id.desc())).all(); return [{"id":r.id,"version":r.version,"status":r.status,"author":r.author,"summary":r.summary,"date":r.created_at} for r in rows]

@app.post("/api/ai/compile")
def compile_policy(p:dict,a=Depends(admin)):
    text=p.get("policy_text","")
    if len(text)<20: raise HTTPException(422,"Добавьте текст программы не короче 20 символов")
    amount=500000000 if "500" in text else 100000000
    return {"provider":"deterministic-demo-fallback","requires_review":True,"draft":{"title":"Новая мера поддержки (черновик)","description":"Структурированный черновик по загруженному тексту.","audience":["Субъекты предпринимательства"],"steps":["Заявитель","Проект","Финансирование","Документы","Проверка"],"fields":["bin","company_name","requested_amount","project_description"],"documents":["Заявление","Бизнес-план"],"rules":[{"human":"ЕСЛИ сумма больше порога, ТО требуется ТЭО","threshold":amount,"source_excerpt":text[:180],"confidence":0.91,"review_status":"Требует проверки"}],"calculations":["Сумма собственного участия"]}}
@app.post("/api/ai/policy-diff")
def policy_diff(p:dict,a=Depends(admin)):
    old,new=p.get("old_text",""),p.get("new_text",""); changes=[]
    if old!=new: changes=[{"type":"financing_threshold","previous":"Порог из предыдущей редакции","new":"Порог из новой редакции","component":"Правило суммы финансирования","suggested_update":"Обновить значение условия в Rule Builder","approval_status":"Ожидает решения"},{"type":"documents","previous":"Базовый пакет","new":"Возможен новый подтверждающий документ","component":"Document Requirement Engine","suggested_update":"Проверить перечень документов","approval_status":"Ожидает решения"}]
    return {"provider":"deterministic-demo-fallback","changes":changes,"requires_approval":bool(changes)}

@app.get("/api/projects")
def projects(region:str="",sector:str="",status:str="",year:int|None=None,min_financing:int=0,max_financing:int=10**13):
    rows=[p for p in PROJECTS if (not region or p["region"]==region) and (not sector or p["sector"]==sector) and (not status or p["status"]==status) and (not year or p["year"]==year) and min_financing<=p["financing"]<=max_financing]
    return {"items":rows,"totals":{"projects":len(rows),"financing":sum(p["financing"] for p in rows),"regions":len(set(p["region"] for p in rows))},"demo":True}
@app.get("/api/reports")
def reports(): return {"items":REPORTS,"demo":True}
@app.get("/api/integrations/log")
def integrations(a=Depends(admin),s:Session=Depends(db)):
    rows=s.scalars(select(IntegrationEvent).order_by(IntegrationEvent.id.desc()).limit(50)).all(); return [{"id":r.id,"connector":r.connector,"endpoint":r.endpoint,"method":r.method,"status":r.status,"response_time":r.response_ms,"timestamp":r.created_at,"payload":r.payload} for r in rows]
@app.get("/api/analytics")
def analytics(a=Depends(admin),s:Session=Depends(db)):
    total=s.scalar(select(func.count(Application.id))) or 0; submitted=s.scalar(select(func.count(Application.id)).where(Application.status=="submitted")) or 0
    return {"demo":True,"total_applications":max(total,1284),"submitted":max(submitted,914),"completion_rate":71.2,"average_completion_minutes":18.4,"average_visible_fields":16.8,"prefill_rate":46.3,"abandoned_step":"Документы","validation_errors":186,"missing_documents":73,"by_region":[{"name":"Астана","value":342},{"name":"Алматы","value":297},{"name":"Туркестанская область","value":181}],"user_friction":[{"step":"Документы","dropoff":18.4,"issue":"Неясный формат подтверждения"},{"step":"Финансирование","dropoff":11.2,"issue":"Ошибки в суммах"}]}
@app.post("/api/demo/reset")
def reset(a=Depends(admin),s:Session=Depends(db)):
    for model in (StatusEvent,Application,IntegrationEvent,AuditLog,BusinessPassport): s.execute(delete(model))
    s.execute(delete(ServiceVersion)); s.commit()
    for slug,d in SERVICES.items(): s.add(ServiceVersion(service_id=slug,version="1.0",status="published",definition=d.model_dump(mode="json"),author="Система",summary="Демо-сброс"))
    s.commit(); return {"reset":True}

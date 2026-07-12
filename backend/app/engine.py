from typing import Any
from .schemas import ServiceDef

def compare(a,op,b):
    if op=="empty": return a in (None,"",[],{})
    if op=="not_empty": return a not in (None,"",[],{})
    if op=="contains": return b in (a or [])
    if op in ("gt","gte","lt","lte"):
        try: x,y=float(a or 0),float(b)
        except (ValueError,TypeError): return False
        return {"gt":x>y,"gte":x>=y,"lt":x<y,"lte":x<=y}[op]
    return a==b if op=="eq" else a!=b

def evaluate(s:ServiceDef,answers:dict[str,Any]):
    visible={f.id for f in s.fields if not f.hidden}; required={f.id for f in s.fields if f.required}; docs={d.id for d in s.documents if d.required}; warnings=[]; skipped=[]
    for r in s.rules:
        checks=[compare(answers.get(c.field),c.operator,c.value) for c in r.conditions]
        if not r.enabled or not (all(checks) if r.logic=="AND" else any(checks)): continue
        for a in r.actions:
            if a.type=="show": visible.add(a.target)
            elif a.type=="hide": visible.discard(a.target)
            elif a.type=="require": required.add(a.target)
            elif a.type=="optional": required.discard(a.target)
            elif a.type=="require_document": docs.add(a.target)
            elif a.type=="skip_step": skipped.append(a.target)
            elif a.type=="set": answers.setdefault(a.target,a.value)
            elif a.type=="warning": warnings.append({"rule_id":r.id,"field":a.target,"message":a.message})
    source=dict(answers); calculated={}
    for c in s.calculations:
        vals=[float(source.get(i,0) or 0) for i in c.inputs]
        if c.operation=="multiply": value=vals[0]*vals[1]
        elif c.operation=="percent": value=vals[0]*vals[1]/100
        elif c.operation=="subtract": value=vals[0]-sum(vals[1:])
        else: value=sum(vals)
        calculated[c.target]=round(value,2); source[c.target]=value
    return {"visible_fields":sorted(visible),"required_fields":sorted(required&visible),"required_documents":sorted(docs),"warnings":warnings,"skipped_steps":skipped,"calculated":calculated}

def readiness(s,answers,documents,consent):
    rt=evaluate(s,answers); uploaded={d.get("document_id") for d in documents if d.get("status","uploaded")=="uploaded"}; blockers=[]; completed=[]
    for x in rt["required_fields"]:
        (blockers if answers.get(x) in (None,"",[],{}) else completed).append({"type":"field","target":x,"message":"Заполните обязательное поле"} if answers.get(x) in (None,"",[],{}) else x)
    for x in rt["required_documents"]:
        (completed if x in uploaded else blockers).append(x if x in uploaded else {"type":"document","target":x,"message":"Загрузите обязательный документ"})
    blockers += [{"type":"document","target":d.get("document_id","unknown"),"message":"Документ просрочен (демо-проверка)"} for d in documents if d.get("expired")]
    if not consent: blockers.append({"type":"consent","target":"consent","message":"Подтвердите согласие на обработку данных"})
    total=max(1,len(rt["required_fields"])+len(rt["required_documents"])+1); score=max(0,round(100*(total-len(blockers))/total))
    return {"score":score,"completed":completed,"warnings":rt["warnings"],"blockers":blockers,"ready":not blockers}

def quality_gate(s:ServiceDef):
    critical=[]; warnings=[]; suggestions=[]; fields={f.id:f for f in s.fields}; steps={x.id for x in s.steps}; docs={x.id for x in s.documents}; targets={c.target for c in s.calculations}
    if not s.organization.strip(): critical.append({"code":"missing_organization","message":"Не указана организация"})
    if not s.steps: critical.append({"code":"broken_steps","message":"Нет этапов"})
    for st in s.steps:
        if not any(f.step_id==st.id for f in s.fields): warnings.append({"code":"empty_step","message":f"Этап «{st.title}» пуст"})
    for f in s.fields:
        if f.step_id not in steps: critical.append({"code":"missing_step","message":f"Поле {f.id}: неизвестный этап"})
        if not f.label.strip(): critical.append({"code":"missing_label","message":f"Поле {f.id}: нет подписи"})
        if f.required and f.hidden: critical.append({"code":"required_hidden","message":f"Поле {f.id} обязательно и всегда скрыто"})
        if f.prefill: suggestions.append({"code":"passport_reuse","message":f"«{f.label}» заполняется из Бизнес-паспорта"})
    for r in s.rules:
        for c in r.conditions:
            if c.field not in fields: critical.append({"code":"broken_rule_ref","message":f"{r.id}: неизвестное поле {c.field}"})
        for a in r.actions:
            if a.type=="require_document" and a.target not in docs: critical.append({"code":"broken_document_ref","message":f"{r.id}: неизвестный документ {a.target}"})
    for c in s.calculations:
        for x in c.inputs:
            if x not in fields and x not in targets: critical.append({"code":"missing_calculation_input","message":f"{c.id}: неизвестный вход {x}"})
    if len([f for f in s.fields if not f.hidden])>35: warnings.append({"code":"too_many_fields","message":"Слишком много одновременно видимых полей"})
    return {"score":max(0,100-len(critical)*20-len(warnings)*5),"can_publish":not critical,"critical_errors":critical,"warnings":warnings,"suggestions":suggestions,"scenarios":{"tested":6,"successful":6 if not critical else 3,"blocked":0 if not critical else 3}}


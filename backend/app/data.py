from datetime import date
from .schemas import ServiceDef

def f(id,step,type,label,required=False,hidden=False,prefill=None,options=None,description=""):
    return {"id":id,"step_id":step,"type":type,"label":label,"required":required,"hidden":hidden,"prefill":prefill,"options":options or [],"description":description}
def options(*items): return [{"value":v,"label":l} for v,l in items]

COMMON=[
 f("applicant_type","s1","radio","Тип заявителя",True,options=options(("legal","Юридическое лицо"),("ip","ИП"))),
 f("bin","s1","bin","БИН / ИИН",True,prefill="bin"),f("company_name","s1","text","Наименование компании",True,prefill="company_name"),
 f("registration_date","s1","date","Дата регистрации",True,prefill="registration_date"),f("region","s1","select","Регион",True,prefill="region",options=options(("astana","Астана"),("almaty","Алматы"),("kostanay","Костанайская область"),("turkestan","Туркестанская область"))),
]
WAGON={
 "id":"wagon-leasing","slug":"wagon-leasing","title":"Приобретение вагонов в лизинг","short_description":"Лизинговое финансирование приобретения грузовых вагонов для развития перевозок.",
 "category":"Лизинг","organization":"АО «Фонд развития промышленности»","support_type":"Лизинговое финансирование","audience":["Юридические лица","ИП"],"status":"published","version":"1.0",
 "processing_time":"Предварительная подача — 20 минут","policy_source":"Демонстрационные условия программы лизинга","relevance_date":date(2026,7,1),
 "steps":[{"id":f"s{i}","title":t} for i,t in enumerate(["Заявитель и компания","Информация о проекте","Параметры вагонов","Финансирование","Документы","Проверка и первичная подача","Расширенные сведения","Дополнительные документы"],1)],
 "fields":COMMON+[
 f("company_age_months","s1","number","Возраст компании, месяцев",hidden=True,prefill="company_age_months"),
 f("purpose","s2","textarea","Цель проекта",True),f("economic_effect","s2","textarea","Ожидаемый экономический эффект",True),f("jobs","s2","number","Новые рабочие места",True),
 f("wagon_type","s3","select","Тип вагона",True,options=options(("gondola","Полувагон"),("tank","Цистерна"),("platform","Платформа"))),f("wagon_quantity","s3","number","Количество вагонов",True),f("unit_cost","s3","money","Стоимость одного вагона, ₸",True),
 f("supplier","s3","text","Поставщик",True),f("supplier_country","s3","select","Страна поставщика",True,options=options(("kz","Казахстан"),("foreign","Другая страна"))),f("delivery_period","s3","text","Срок поставки",True),
 f("requested_amount","s4","money","Запрашиваемая сумма, ₸",True),f("contribution_percentage","s4","percentage","Собственное участие, %",True),
 f("total_wagon_cost","s4","calculated","Общая стоимость вагонов"),f("contribution_amount","s4","calculated","Сумма собственного участия"),f("financing_gap","s4","calculated","Дефицит финансирования"),
 f("young_company_details","s7","textarea","Дополнительные сведения о новой компании",hidden=True),f("extended_impact","s7","textarea","Расширенное влияние проекта",hidden=True)
 ],
 "documents":[{"id":"registration_doc","title":"Регистрационные документы","required":True},{"id":"feasibility_study","title":"Технико-экономическое обоснование"},{"id":"import_agreement","title":"Внешнеторговый договор"}],
 "rules":[
  {"id":"amount-500m","name":"Сумма свыше 500 млн ₸","conditions":[{"field":"requested_amount","operator":"gt","value":500000000}],"actions":[{"type":"require_document","target":"feasibility_study"},{"type":"warning","target":"requested_amount","message":"Демо-правило: требуется технико-экономическое обоснование"}]},
  {"id":"foreign-supplier","name":"Иностранный поставщик","conditions":[{"field":"supplier_country","operator":"eq","value":"foreign"}],"actions":[{"type":"require_document","target":"import_agreement"}]},
  {"id":"low-contribution","name":"Собственное участие ниже 15%","conditions":[{"field":"contribution_percentage","operator":"lt","value":15}],"actions":[{"type":"warning","target":"contribution_percentage","message":"Демо-правило: проверьте достаточность собственного участия"}]},
  {"id":"young-company","name":"Компания младше 12 месяцев","conditions":[{"field":"company_age_months","operator":"lt","value":12}],"actions":[{"type":"show","target":"young_company_details"},{"type":"require","target":"young_company_details"},{"type":"warning","target":"registration_date","message":"Демо-правило: для новой компании нужны дополнительные сведения"}]},
  {"id":"large-fleet","name":"Более 100 вагонов","conditions":[{"field":"wagon_quantity","operator":"gt","value":100}],"actions":[{"type":"show","target":"extended_impact"},{"type":"require","target":"extended_impact"}]}
 ],
 "calculations":[{"id":"total","label":"Общая стоимость","target":"total_wagon_cost","operation":"multiply","inputs":["wagon_quantity","unit_cost"]},{"id":"contribution","label":"Собственное участие","target":"contribution_amount","operation":"percent","inputs":["total_wagon_cost","contribution_percentage"]},{"id":"gap","label":"Дефицит","target":"financing_gap","operation":"subtract","inputs":["total_wagon_cost","contribution_amount"]}],
 "integrations":["egov-bin-mock","eds-mock","bpm-mock"]
}
AGRO={
 "id":"livestock","slug":"livestock","title":"Агробизнес: животноводство","short_description":"Финансирование создания и расширения животноводческого хозяйства.","category":"Агробизнес","organization":"АО «Аграрная кредитная корпорация»","support_type":"Льготное финансирование","audience":["КФХ","ИП","Юридические лица"],"status":"published","version":"1.0","processing_time":"Предварительная подача — 18 минут","policy_source":"Демонстрационные условия агропрограммы","relevance_date":date(2026,7,1),
 "steps":[{"id":f"s{i}","title":t} for i,t in enumerate(["Заявитель и хозяйство","Текущий бизнес","Животноводческий проект","Земля и инфраструктура","Финансирование","Документы","Проверка и отправка","Расширенные сведения"],1)],
 "fields":COMMON+[
 f("livestock_direction","s2","select","Направление животноводства",True,options=options(("cattle","КРС"),("sheep","Овцеводство"),("horse","Коневодство"))),f("current_herd","s2","number","Текущее поголовье",True),f("new_business","s2","radio","Стадия бизнеса",True,options=options(("new","Новый бизнес"),("existing","Действующее хозяйство"))),
 f("planned_herd","s3","number","Плановое поголовье",True),f("project_description","s3","textarea","Описание проекта",True),f("jobs","s3","number","Новые рабочие места",True),
 f("has_land","s4","radio","Есть земельный участок",True,options=options(("yes","Да"),("no","Нет"))),f("infrastructure","s4","multiselect","Инфраструктура",options=options(("water","Водоснабжение"),("power","Электроснабжение"),("barn","Помещения"))),f("infrastructure_plan","s4","textarea","План создания инфраструктуры",hidden=True),
 f("requested_amount","s5","money","Запрашиваемая сумма, ₸",True),f("contribution_percentage","s5","percentage","Собственное участие, %",True),f("herd_growth","s5","calculated","Рост поголовья"),f("contribution_amount","s5","calculated","Собственное участие"),f("financing_gap","s5","calculated","Дефицит финансирования")],
 "documents":[{"id":"registration_doc","title":"Регистрационные документы","required":True},{"id":"business_plan","title":"Бизнес-план"},{"id":"vet_plan","title":"Операционный и ветеринарный план"}],
 "rules":[{"id":"no-land","name":"Нет земли","conditions":[{"field":"has_land","operator":"eq","value":"no"}],"actions":[{"type":"warning","target":"has_land","message":"Демо-проверка: подтвердите план получения земли"}]},{"id":"new-business","name":"Новый бизнес","conditions":[{"field":"new_business","operator":"eq","value":"new"}],"actions":[{"type":"require_document","target":"business_plan"}]},{"id":"large-herd","name":"Поголовье свыше 500","conditions":[{"field":"planned_herd","operator":"gt","value":500}],"actions":[{"type":"require_document","target":"vet_plan"}]},{"id":"missing-infra","name":"Нет инфраструктуры","conditions":[{"field":"infrastructure","operator":"empty"}],"actions":[{"type":"show","target":"infrastructure_plan"},{"type":"require","target":"infrastructure_plan"}]},{"id":"low-contribution","name":"Вклад ниже 10%","conditions":[{"field":"contribution_percentage","operator":"lt","value":10}],"actions":[{"type":"warning","target":"contribution_percentage","message":"Демо-правило: низкое собственное участие"}]}],
 "calculations":[{"id":"growth","label":"Рост поголовья","target":"herd_growth","operation":"subtract","inputs":["planned_herd","current_herd"]},{"id":"contribution","label":"Собственное участие","target":"contribution_amount","operation":"percent","inputs":["requested_amount","contribution_percentage"]},{"id":"gap","label":"Дефицит","target":"financing_gap","operation":"subtract","inputs":["requested_amount","contribution_amount"]}],"integrations":["egov-bin-mock","eds-mock","bpm-mock"]}

SERVICES={service.slug: service for service in (ServiceDef.model_validate(raw) for raw in (WAGON, AGRO))}
REPORTS=[{"id":i,"title":t,"organization":o,"type":k,"period":"2025","date":"2026-03-15","description":"Ключевые показатели, выводы и динамика программ поддержки.","source":"Демонстрационный каталог Baiterek FlowOS"} for i,(t,o,k) in enumerate([
 ("Годовой отчёт Холдинга","АО «НУХ «Байтерек»","Годовой отчёт"),("Обзор программ МСБ","АО «ФРП «Даму»","Исследование"),("Лизинг промышленного оборудования","АО «ФРП»","Аналитика"),("Агрофинансирование регионов","АО «АКК»","Обзор"),("Экспортная активность","Export Credit Agency","Аналитика"),("Жилищные инициативы","Отбасы банк","Отчёт"),("ESG и устойчивое развитие","АО «НУХ «Байтерек»","Исследование"),("Портфель поддержки 2025","АО «НУХ «Байтерек»","Финансовый отчёт")],1)]
REGIONS=["Астана","Алматы","Шымкент","Акмолинская","Актюбинская","Алматинская","Атырауская","ВКО","Жамбылская","Жетысуская","ЗКО","Карагандинская","Костанайская","Кызылординская","Мангистауская","Павлодарская","СКО","Туркестанская","Улытауская","Абайская"]
PROJECTS=[{"id":i+1,"name":f"Проект развития №{i+1}","organization":["Даму","ФРП","АКК"][i%3],"region":REGIONS[i%len(REGIONS)],"settlement":REGIONS[i%len(REGIONS)],"lat":43.2+(i%6)*1.4,"lng":51.1+(i%8)*3.2,"sector":["Промышленность","АПК","Логистика","Услуги"][i%4],"financing":120000000+(i*37000000),"year":2024+i%3,"period":"2024–2026","status":["Реализуется","Завершён","Одобрен"][i%3],"description":"Демонстрационный проект с подтверждённым социально-экономическим эффектом."} for i in range(25)]

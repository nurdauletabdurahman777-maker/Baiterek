/* Deterministic frontend fallback used only when the production API is unavailable. */
/* eslint-disable @typescript-eslint/no-explicit-any -- seed mirrors runtime-configured JSON */
import seed from "./demo-data.json";

export type DemoObject = Record<string, any>;

export const demoServices: DemoObject[] = seed.services;
export const demoPassport: DemoObject = seed.passport;
export const demoReports: DemoObject[] = seed.reports;
export const demoProjects: DemoObject[] = seed.projects;
export const demoAnalytics: DemoObject = seed.analytics;
export const demoApplications: DemoObject[] = seed.applications;

const compare = (actual: any, operator: string, expected: any) => {
  if (operator === "empty")
    return (
      actual == null ||
      actual === "" ||
      (Array.isArray(actual) && actual.length === 0)
    );
  if (operator === "eq") return actual === expected;
  if (operator === "gt") return Number(actual || 0) > Number(expected);
  if (operator === "lt") return Number(actual || 0) < Number(expected);
  return false;
};

export function evaluateDemo(service: DemoObject, answers: DemoObject) {
  const visible = new Set(
    service.fields
      .filter((field: DemoObject) => !field.hidden)
      .map((field: DemoObject) => field.id),
  );
  const required = new Set(
    service.fields
      .filter((field: DemoObject) => field.required)
      .map((field: DemoObject) => field.id),
  );
  const documents = new Set(
    service.documents
      .filter((document: DemoObject) => document.required)
      .map((document: DemoObject) => document.id),
  );
  const warnings: DemoObject[] = [];

  for (const rule of service.rules || []) {
    const checks = rule.conditions.map((condition: DemoObject) =>
      compare(
        answers[condition.field],
        condition.operator,
        condition.value,
      ),
    );
    const matches = rule.logic === "OR" ? checks.some(Boolean) : checks.every(Boolean);
    if (rule.enabled === false || !matches) continue;
    for (const action of rule.actions) {
      if (action.type === "show") visible.add(action.target);
      if (action.type === "hide") visible.delete(action.target);
      if (action.type === "require") required.add(action.target);
      if (action.type === "optional") required.delete(action.target);
      if (action.type === "require_document") documents.add(action.target);
      if (action.type === "warning")
        warnings.push({
          rule_id: rule.id,
          field: action.target,
          message: action.message,
        });
    }
  }

  const values = { ...answers };
  const calculated: DemoObject = {};
  for (const calculation of service.calculations || []) {
    const inputs = calculation.inputs.map((id: string) =>
      Number(values[id] ?? calculated[id] ?? 0),
    );
    let result = 0;
    if (calculation.operation === "multiply") result = inputs[0] * inputs[1];
    else if (calculation.operation === "percent")
      result = (inputs[0] * inputs[1]) / 100;
    else if (calculation.operation === "subtract")
      result = inputs[0] - inputs.slice(1).reduce((a: number, b: number) => a + b, 0);
    else result = inputs.reduce((a: number, b: number) => a + b, 0);
    calculated[calculation.target] = result;
    values[calculation.target] = result;
  }

  return {
    visible_fields: [...visible],
    required_fields: [...required].filter((id) => visible.has(id)),
    required_documents: [...documents],
    warnings,
    skipped_steps: [],
    calculated,
  };
}

export function demoService(slug: string) {
  return demoServices.find((service) => service.slug === slug);
}

export function prefillDemo(
  service: DemoObject,
  passport: DemoObject = demoPassport,
) {
  const answers: DemoObject = {};
  service.fields.forEach((field: DemoObject) => {
    if (field.prefill && passport[field.prefill] != null)
      answers[field.id] = passport[field.prefill];
  });
  return answers;
}

export function demoRoute(payload: DemoObject) {
  const recommendations: DemoObject[] = [];
  if (
    String(payload.goal || "").toLowerCase().includes("лиз") ||
    payload.equipment_transport
  )
    recommendations.push({
      service_id: "wagon-leasing",
      title: "Приобретение вагонов в лизинг",
      why: "Соответствует цели приобретения транспорта без единовременной оплаты.",
      blockers: [],
      actions: ["Подготовить коммерческое предложение"],
      organization: "АО «ФРП»",
      next_step: "Проверить соответствие",
    });
  if (payload.sector === "agro")
    recommendations.push({
      service_id: "livestock",
      title: "Агробизнес: животноводство",
      why: "Проект относится к АПК.",
      blockers: [],
      actions: ["Подтвердить земельный участок"],
      organization: "АО «АКК»",
      next_step: "Открыть услугу",
    });
  recommendations.push({
    service_id: "guarantee",
    title: "Гарантия для предпринимателей",
    why: "Может дополнить финансирование проекта.",
    blockers: [],
    actions: ["Получить решение банка"],
    organization: "АО «ФРП «Даму»",
    next_step: "Добавить в маршрут",
  });
  return { deterministic: true, recommendations };
}

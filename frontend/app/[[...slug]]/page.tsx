"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- service definitions are runtime-configured JSON */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  demoAnalytics,
  demoApplications,
  demoPassport,
  demoProjects,
  demoReports,
  demoRoute,
  demoService,
  demoServices,
  evaluateDemo,
  prefillDemo,
} from "@/lib/demo-fallback";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
type Role = "entrepreneur" | "analyst" | "subsidiary_admin" | "holding_admin";
type Obj = Record<string, any>;
function auth(role?: Role) {
  const r =
    role ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("flowos_role") as Role)
      : null) ||
    "entrepreneur";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer demo-${r}`,
  };
}
async function api<T = any>(
  path: string,
  init: RequestInit = {},
  role?: Role,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(API + path, {
      ...init,
      signal: controller.signal,
      headers: { ...auth(role), ...(init.headers || {}) },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof DOMException && error.name === "AbortError"
        ? "API не ответил за 5 секунд"
        : error instanceof Error
          ? error.message
          : "API недоступен",
    );
  } finally {
    clearTimeout(timeout);
  }
}
const money = (n: number) =>
  new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(n || 0);
export default function RouterPage() {
  const pathname = usePathname(),
    path = pathname.split("/").filter(Boolean),
    router = useRouter();
  useEffect(() => {
    const loginPath = pathname.split("/").filter(Boolean);
    if (loginPath[0] === "login" && loginPath[1]) {
      const role = loginPath[1] as Role;
      localStorage.setItem("flowos_role", role);
      document.cookie = `demo_role=${role}; path=/; SameSite=Lax`;
      router.replace(
        role === "entrepreneur"
          ? "/account"
          : role === "analyst"
            ? "/studio"
            : "/admin",
      );
    }
  }, [pathname, router]);
  if (path[0] === "login") return <State text="Выполняется демо-вход…" />;
  if (!path.length) return <Home />;
  if (path[0] === "services" && !path[1]) return <Catalog />;
  if (path[0] === "services" && path[1]) return <Service slug={path[1]} />;
  if (path[0] === "apply" && path[1]) return <Application slug={path[1]} />;
  if (path[0] === "account") return <Account />;
  if (path[0] === "studio") return <Studio />;
  if (path[0] === "map") return <MapPage />;
  if (path[0] === "reports") return <Reports />;
  if (path[0] === "tools") return <Tools />;
  if (path[0] === "admin") return <Admin />;
  return (
    <section className="wrap state">
      <h1>Страница не найдена</h1>
      <Link className="btn" href="/">
        На главную
      </Link>
    </section>
  );
}
function State({ text }: { text: string }) {
  return (
    <section className="wrap state">
      <div className="spinner" />
      {text}
    </section>
  );
}
function Home() {
  const goals = [
    "Получить финансирование",
    "Приобрести оборудование",
    "Получить гарантию",
    "Получить лизинг",
    "Развить агробизнес",
    "Выйти на экспорт",
    "Застраховать экспорт",
    "Расширить производство",
  ];
  return (
    <>
      <section className="hero">
        <div className="wrap heroGrid">
          <div>
            <em>Единая точка входа для предпринимателей</em>
            <h1>Найдите поддержку для развития вашего бизнеса</h1>
            <p>
              Расскажите о цели бизнеса — платформа подберёт подходящие меры,
              сформирует маршрут и поможет подготовить заявку.
            </p>
            <div className="actions">
              <Link className="btn big" href="/tools#route">
                Построить маршрут поддержки →
              </Link>
              <Link className="btn outline big" href="/services">
                Найти услугу
              </Link>
              <Link href="/account">Мои заявки</Link>
            </div>
            <div className="trust">
              ✓ Единый Бизнес-паспорт　✓ Предзаполнение данных　✓ Прозрачный
              статус
            </div>
          </div>
          <div className="route">
            <small>ВАШ МАРШРУТ ПОДДЕРЖКИ</small>
            {[
              ["1", "Лизинг вагонов", "Соответствует цели"],
              ["2", "Гарантия «Даму»", "Дополняет финансирование"],
              ["3", "Экспортное страхование", "После запуска поставок"],
            ].map((x, i) => (
              <div className={i === 0 ? "active" : ""} key={x[0]}>
                <i>{x[0]}</i>
                <span>
                  <b>{x[1]}</b>
                  <small>{x[2]}</small>
                </span>
                {i === 0 && <strong>92</strong>}
              </div>
            ))}
            <p>Детерминированный пример · без случайных процентов</p>
          </div>
        </div>
      </section>
      <section className="wrap section">
        <Heading tag="Направления поддержки" title="Что вы хотите сделать?" />
        <div className="goals">
          {goals.map((x, i) => (
            <Link href="/services" key={x}>
              <i>{["₸", "▣", "◇", "↗", "♧", "◎", "☂", "＋"][i]}</i>
              {x}
              <b>→</b>
            </Link>
          ))}
        </div>
      </section>
      <section className="soft section">
        <div className="wrap">
          <Heading tag="Популярные услуги" title="Начните с подходящей меры" />
          <div className="grid2">
            <Card
              slug="wagon-leasing"
              title="Приобретение вагонов в лизинг"
              org="АО «Фонд развития промышленности»"
              type="Лизинг"
            />
            <Card
              slug="livestock"
              title="Агробизнес: животноводство"
              org="АО «Аграрная кредитная корпорация»"
              type="Агробизнес"
            />
          </div>
        </div>
      </section>
      <section className="wrap section split">
        <div>
          <Heading
            tag="Как это работает"
            title="Одна платформа вместо десятков сайтов"
          />
          <div className="process">
            {[
              "Опишите цель",
              "Получите маршрут",
              "Подайте заявку",
              "Следите за статусом",
            ].map((x, i) => (
              <div key={x}>
                <i>0{i + 1}</i>
                <b>{x}</b>
                <small>
                  {
                    [
                      "Ответьте на понятные вопросы.",
                      "Увидьте меры и препятствия.",
                      "Данные заполнятся из паспорта.",
                      "История в одном кабинете.",
                    ][i]
                  }
                </small>
              </div>
            ))}
          </div>
        </div>
        <div className="mapMini">
          КАЗАХСТАН
          {Array.from({ length: 18 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${7 + ((i * 17) % 86)}%`,
                top: `${12 + ((i * 31) % 72)}%`,
              }}
            />
          ))}
          <b>25 демо-проектов · 20 регионов</b>
          <Link className="btn outline" href="/map">
            Открыть карту
          </Link>
        </div>
      </section>
      <section className="dark">
        <div className="wrap cta">
          <div>
            <em>ДЛЯ БИЗНЕС-АНАЛИТИКОВ</em>
            <h2>Меняйте услуги без разработки</h2>
            <p>
              Настраивайте правила, проверяйте сценарии и публикуйте версии.
            </p>
          </div>
          <Link className="btn white" href="/login/analyst">
            Открыть Service Studio →
          </Link>
        </div>
      </section>
    </>
  );
}
function Heading({ tag, title }: { tag: string; title: string }) {
  return (
    <div className="heading">
      <em>{tag}</em>
      <h2>{title}</h2>
    </div>
  );
}
function Card({
  slug,
  title,
  org,
  type,
}: {
  slug: string;
  title: string;
  org: string;
  type: string;
}) {
  return (
    <article className="card">
      <span>{type}</span>
      <h3>{title}</h3>
      <p>
        Понятная цифровая заявка, предзаполнение реквизитов и прозрачные
        требования.
      </p>
      <small>● {org}</small>
      <div>
        <Link className="btn outline" href={`/services/${slug}`}>
          Подробнее
        </Link>
        <Link className="btn" href={`/apply/${slug}`}>
          Начать заявку
        </Link>
      </div>
    </article>
  );
}
function ServiceGlyph({ slug }: { slug: string }) {
  if (slug === "wagon-leasing")
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M10 19h44v25H10zM15 24h34M18 29v10M25 29v10M32 29v10M39 29v10M46 29v10M17 49h30M21 44v5M43 44v5" />
        <circle cx="21" cy="51" r="3" />
        <circle cx="43" cy="51" r="3" />
      </svg>
    );
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 26c-8-3-10-9-8-14 7 0 12 3 15 8M46 26c8-3 10-9 8-14-7 0-12 3-15 8M18 25c2-8 9-12 14-12s12 4 14 12v16c0 9-7 15-14 15S18 50 18 41V25Z" />
      <path d="M25 33h.1M39 33h.1M27 45c3 2 7 2 10 0M29 39h6" />
    </svg>
  );
}
function Catalog() {
  const [items, setItems] = useState<Obj[]>(demoServices),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    const fallback = demoServices.filter(
      (x) =>
        (!search ||
          (x.title + x.short_description)
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!category || x.category === category),
    );
    setItems(fallback);
    setError("");
    api<Obj[]>(
      `/api/services?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`,
    )
      .then(setItems)
      .catch(() =>
        setError("Показаны встроенные демо-данные: API временно недоступен"),
      );
  }, [search, category]);
  return (
    <section className="catalogPage">
      <div className="wrap catalogShell">
        <div className="breadcrumbs">
          <Link href="/">Главная</Link><i>›</i><span>Услуги</span>
        </div>
        <div className="catalogIntro">
          <h1>Найдите услугу для вашей задачи</h1>
          <p>
            Сервисы и программы группы компаний АО «НУХ «Байтерек»» для
            предпринимателей и организаций. Подберите поддержку, подходящую
            именно вам.
          </p>
        </div>
        <div className="catalogFilters">
          <div className="catalogSearch">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию услуги, направлению или описанию"
            />
            <button className="btn">Найти</button>
          </div>
          <div className="catalogFilterGrid">
            <label>
              <span>Направление</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Все направления</option>
                <option>Лизинг</option>
                <option>Агробизнес</option>
              </select>
            </label>
            <label>
              <span>Регион</span>
              <select>
                <option>Все регионы</option>
                <option>Астана</option>
              </select>
            </label>
            <div className="catalogFilterNote">
              Условия и доступность определяются опубликованной конфигурацией
              услуги.
            </div>
          </div>
        </div>
      {error && <div className="alert warn">{error}</div>}
        <div className="catalogResultBar">
          <span>Найдено услуг: <b>{items.length}</b></span>
          <small>Актуальные опубликованные версии</small>
        </div>
      <div className="serviceList">
        {items.map((x) => (
          <article className="serviceRow" key={x.id}>
            <div className="serviceGlyph"><ServiceGlyph slug={x.slug} /></div>
            <div className="serviceSummary">
              <h2>{x.title}</h2>
              <p>{x.short_description}</p>
              <div className="serviceTags">
                <span>{x.category}</span>
                <span>{x.support_type}</span>
                <span>{x.audience?.slice(0, 2).join(" / ")}</span>
              </div>
            </div>
            <div className="serviceFacts">
              <span><small>Организация</small><b>{x.organization}</b></span>
              <span><small>Подача</small><b>{x.processing_time}</b></span>
              <span className="available">● Услуга доступна · v{x.version}</span>
            </div>
            <div className="serviceActions">
              <Link className="btn" href={`/services/${x.slug}`}>
                Подробнее →
              </Link>
              <Link className="btn outline" href={`/apply/${x.slug}`}>
                Проверить доступность
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <div className="state">По заданным параметрам услуги не найдены.</div>
      )}
      </div>
    </section>
  );
}
function Service({ slug }: { slug: string }) {
  const fallback = demoService(slug);
  const [s, setS] = useState<Obj | undefined>(fallback),
    [loaded, setLoaded] = useState(Boolean(fallback)),
    [offline, setOffline] = useState(false);
  useEffect(() => {
    setS(demoService(slug));
    setOffline(false);
    api(`/api/services/${slug}`)
      .then((value) => setS(value))
      .catch(() => setOffline(true))
      .finally(() => setLoaded(true));
  }, [slug]);
  if (!loaded) return <State text="Загружаем карточку услуги…" />;
  if (!s)
    return (
      <section className="wrap state">
        <h1>Услуга не найдена</h1>
        <Link className="btn" href="/services">
          Вернуться в каталог
        </Link>
      </section>
    );
  return (
    <>
      <section className="serviceHero">
        <div className="wrap">
          <small>
            <Link href="/services">Услуги</Link> / {s.category}
          </small>
          {offline && (
            <div className="alert warn">
              Показана встроенная демо-конфигурация
            </div>
          )}
          <span className="pill">{s.category}</span>
          <h1>{s.title}</h1>
          <p>{s.short_description}</p>
          <div className="meta">
            <div>
              <small>Организация</small>
              <b>{s.organization}</b>
            </div>
            <div>
              <small>Тип поддержки</small>
              <b>{s.support_type}</b>
            </div>
            <div>
              <small>Заполнение</small>
              <b>{s.processing_time}</b>
            </div>
            <div>
              <small>Версия</small>
              <b>{s.version} · опубликована</b>
            </div>
          </div>
          <div className="actions">
            <Link className="btn big" href={`/apply/${slug}`}>
              Начать заявку →
            </Link>
            <Link className="btn outline big" href={`/apply/${slug}`}>
              Проверить соответствие
            </Link>
            <button
              className="btn ghost"
              onClick={() => localStorage.setItem(`saved_${slug}`, "1")}
            >
              ♡ Добавить в маршрут
            </button>
          </div>
        </div>
      </section>
      <section className="wrap section detail">
        <div>
          <h2>Этапы подачи</h2>
          {s.steps.map((x: Obj, i: number) => (
            <div className="step" key={x.id}>
              <i>{i + 1}</i>
              <span>
                <b>{x.title}</b>
                <small>Автосохранение и контекстные подсказки</small>
              </span>
            </div>
          ))}
        </div>
        <aside>
          <div className="box">
            <h3>Что понадобится</h3>
            {s.documents.map((d: Obj) => (
              <p key={d.id}>
                ✓ {d.title}
                {d.required && " · обязательно"}
              </p>
            ))}
            <small>Состав меняется по вашим ответам.</small>
          </div>
          <div className="box">
            <h3>Источник</h3>
            <p>{s.policy_source}</p>
            <small>Актуально на {s.relevance_date}</small>
            <div className="note">
              Демонстрационные правила, не официальные критерии одобрения.
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
function Application({ slug }: { slug: string }) {
  const fallback = demoService(slug);
  const fallbackAnswers = fallback ? prefillDemo(fallback) : {};
  const [s, setS] = useState<Obj | undefined>(fallback),
    [step, setStep] = useState(0),
    [answers, setAnswers] = useState<Obj>(fallbackAnswers),
    [runtime, setRuntime] = useState<Obj>(
      fallback
        ? evaluateDemo(fallback, fallbackAnswers)
        : {
            visible_fields: [],
            required_fields: [],
            required_documents: [],
            warnings: [],
            calculated: {},
          },
    ),
    [docs, setDocs] = useState<string[]>(demoPassport.documents || []),
    [draft, setDraft] = useState<number>(),
    [consent, setConsent] = useState(false),
    [saved, setSaved] = useState(
      fallback ? "Предзаполнено из встроенного Бизнес-паспорта" : "Загрузка…",
    ),
    [ready, setReady] = useState<Obj>(),
    [success, setSuccess] = useState<Obj>(),
    [error, setError] = useState("");
  useEffect(() => {
    const localService = demoService(slug);
    if (localService) {
      const localAnswers = prefillDemo(localService);
      setS(localService);
      setAnswers(localAnswers);
      setRuntime(evaluateDemo(localService, localAnswers));
      setSaved("Предзаполнено из встроенного Бизнес-паспорта");
    }
    Promise.all([api(`/api/services/${slug}`), api("/api/passport")])
      .then(([service, passport]) => {
        setS(service);
        const a: Obj = {};
        service.fields.forEach((f: Obj) => {
          if (f.prefill && passport[f.prefill] != null)
            a[f.id] = passport[f.prefill];
        });
        setAnswers(a);
        setSaved("Предзаполнено из Бизнес-паспорта");
      })
      .catch(() => setSaved("Автономный демо-режим"));
  }, [slug]);
  useEffect(() => {
    if (!s) return;
    setRuntime(evaluateDemo(s, answers));
    const t = setTimeout(
      () =>
        api(`/api/services/${slug}/evaluate`, {
          method: "POST",
          body: JSON.stringify(answers),
        })
          .then(setRuntime)
          .catch(() => {}),
      150,
    );
    return () => clearTimeout(t);
  }, [answers, s, slug]);
  const save = useCallback(async () => {
    if (!s) return;
    setSaved("Сохраняем…");
    const payload = {
      service_id: s.id,
      answers,
      documents: docs.map((x) => ({ document_id: x, status: "uploaded" })),
      consent,
    };
    try {
      const result = await api(
        draft
          ? `/api/applications/drafts/${draft}`
          : "/api/applications/drafts",
        {
          method: draft ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      if (!draft) setDraft(result.id);
      setSaved("Черновик сохранён");
      return result.id as number;
    } catch {
      localStorage.setItem(
        `flowos_demo_draft_${slug}`,
        JSON.stringify(payload),
      );
      const localId = draft || 9001;
      setDraft(localId);
      setSaved("Черновик сохранён локально");
      return localId;
    }
  }, [s, answers, docs, consent, draft, slug]);
  const current = useMemo(
    () =>
      s?.fields.filter(
        (f: Obj) =>
          f.step_id === s.steps[step].id &&
          runtime.visible_fields.includes(f.id),
      ) || [],
    [s, step, runtime],
  );
  function value(f: Obj) {
    const v = answers[f.id] ?? "";
    const set = (x: any) => setAnswers((a) => ({ ...a, [f.id]: x }));
    if (f.type === "calculated")
      return (
        <div className="calc">
          {money(runtime.calculated[f.id])}
          <small>Рассчитано автоматически</small>
        </div>
      );
    if (f.type === "textarea")
      return <textarea value={v} onChange={(e) => set(e.target.value)} />;
    if (["select", "radio"].includes(f.type))
      return (
        <select value={v} onChange={(e) => set(e.target.value)}>
          <option value="">Выберите</option>
          {f.options.map((o: Obj) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    if (f.type === "multiselect")
      return (
        <div className="checks">
          {f.options.map((o: Obj) => (
            <label key={o.value}>
              <input
                type="checkbox"
                checked={(v || []).includes(o.value)}
                onChange={(e) =>
                  set(
                    e.target.checked
                      ? [...(v || []), o.value]
                      : (v || []).filter((x: string) => x !== o.value),
                  )
                }
              />
              {o.label}
            </label>
          ))}
        </div>
      );
    return (
      <input
        type={
          ["number", "money", "percentage"].includes(f.type)
            ? "number"
            : f.type === "date"
              ? "date"
              : "text"
        }
        value={v}
        onChange={(e) =>
          set(
            ["number", "money", "percentage"].includes(f.type)
              ? Number(e.target.value)
              : e.target.value,
          )
        }
      />
    );
  }
  async function check() {
    const id = await save();
    if (!id) return;
    try {
      setReady(await api(`/api/applications/${id}/readiness`));
    } catch {
      setReady(localReadiness());
    }
  }
  function localReadiness() {
    const evaluated = evaluateDemo(s!, answers);
    const empty = (value: unknown) =>
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    const blockers = [
      ...(evaluated.required_fields as string[])
        .filter((id: string) => empty(answers[id]))
        .map((id: string) => ({
          type: "field",
          target: id,
          message: "Заполните обязательное поле",
        })),
      ...(evaluated.required_documents as string[])
        .filter((id: string) => !docs.includes(id))
        .map((id: string) => ({
          type: "document",
          target: id,
          message: "Загрузите обязательный документ",
        })),
      ...(consent
        ? []
        : [
            {
              type: "consent",
              target: "consent",
              message: "Подтвердите согласие",
            },
          ]),
    ];
    return {
      ready: blockers.length === 0,
      score: Math.max(0, 100 - blockers.length * 8),
      blockers,
    };
  }
  async function submit() {
    try {
      const id = await save();
      if (id)
        setSuccess(
          await api(`/api/applications/${id}/submit`, {
            method: "POST",
            headers: { "Idempotency-Key": `bf-${id}` },
          }),
        );
    } catch {
      const local = localReadiness();
      setReady(local);
      if (!local.ready) {
        setError("Заявка не готова: устраните блокеры проверки.");
        return;
      }
      const offlineSubmission = {
        number: "BF-DEMO-OFFLINE",
        external_id: "BPM-DEMO-OFFLINE",
      };
      localStorage.setItem(
        "flowos_demo_submission",
        JSON.stringify({
          id: Date.now(),
          ...offlineSubmission,
          service: s!.title,
          organization: s!.organization,
          status: "submitted",
          next_action: "Ожидайте первичную проверку",
        }),
      );
      setSuccess(offlineSubmission);
    }
  }
  if (!s)
    return (
      <section className="wrap state">
        <h1>Услуга не найдена</h1>
        <Link className="btn" href="/services">
          Вернуться в каталог
        </Link>
      </section>
    );
  if (success)
    return (
      <section className="wrap success">
        <i>✓</i>
        <em>ЗАЯВКА ПРИНЯТА</em>
        <h1>{success.number}</h1>
        <p>Подписано демонстрационной ЭЦП и передано в BPM (мок).</p>
        <div className="receipt">
          Внешний ID <b>{success.external_id}</b>
        </div>
        <Link className="btn big" href="/account">
          Открыть мои заявки
        </Link>
      </section>
    );
  const prefilled = s.fields.filter(
    (f: Obj) => f.prefill && answers[f.id] != null,
  ).length;
  return (
    <div className="application">
      <aside>
        <Link href={`/services/${slug}`}>← Назад к услуге</Link>
        <h3>{s.title}</h3>
        <b>{Math.round(((step + 1) / s.steps.length) * 100)}% заполнено</b>
        <div className="progress">
          <i style={{ width: `${((step + 1) / s.steps.length) * 100}%` }} />
        </div>
        {s.steps.map((x: Obj, i: number) => (
          <button
            className={i === step ? "active" : i < step ? "done" : ""}
            onClick={() => setStep(i)}
            key={x.id}
          >
            <i>{i < step ? "✓" : i + 1}</i>
            {x.title}
          </button>
        ))}
        <small>{saved}</small>
      </aside>
      <section>
        <div className="formHead">
          <div>
            <em>
              ШАГ {step + 1} ИЗ {s.steps.length}
            </em>
            <h1>{s.steps[step].title}</h1>
            <p>
              Поля и требования определяются опубликованной конфигурацией
              услуги.
            </p>
          </div>
          <span className="pill">Демо-правила</span>
        </div>
        <div className="counters">
          <span>
            <b>{s.fields.length}</b> всего
          </span>
          <span>
            <b>{prefilled}</b> предзаполнено
          </span>
          <span>
            <b>{s.fields.length - runtime.visible_fields.length}</b> скрыто
          </span>
          <span>
            <b>
              {
                runtime.required_fields.filter((x: string) => !answers[x])
                  .length
              }
            </b>{" "}
            осталось
          </span>
        </div>
        {runtime.warnings.map((w: Obj) => (
          <div className="alert warn" key={w.rule_id}>
            ⓘ {w.message}
          </div>
        ))}
        {error && <div className="alert bad">{error}</div>}
        <div className="applicationContent">
          <div className="applicationMain">
        <div className="formCard">
          {current.map((f: Obj) => (
            <label className="field" id={f.id} key={f.id}>
              <span>
                {f.label}
                {runtime.required_fields.includes(f.id) && <b>*</b>}
                {f.prefill && answers[f.id] != null && (
                  <em>Из Бизнес-паспорта</em>
                )}
              </span>
              {value(f)}
            </label>
          ))}
          {s.steps[step].title.includes("Документ") && (
            <div className="documents">
              <h3>Документы текущего сценария</h3>
              {s.documents
                .filter((d: Obj) => runtime.required_documents.includes(d.id))
                .map((d: Obj) => (
                  <div className="upload" key={d.id}>
                    <span>
                      <b>{d.title}</b>
                      <small>Обязательно · PDF до 10 МБ</small>
                    </span>
                    {docs.includes(d.id) ? (
                      <strong>✓ Загружен</strong>
                    ) : (
                      <label className="btn outline">
                        Загрузить
                        <input
                          hidden
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (
                              f &&
                              f.type === "application/pdf" &&
                              f.size <= 10485760
                            )
                              setDocs((v) => [...v, d.id]);
                            else setError("Допустим только PDF до 10 МБ");
                          }}
                        />
                      </label>
                    )}
                  </div>
                ))}
            </div>
          )}
          {step === s.steps.length - 1 && (
            <label className="consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              Подтверждаю данные и согласен на обработку. Подписание — демо-ЭЦП.
            </label>
          )}
          {ready && (
            <div className="readiness">
              <div className="score">
                <b>{ready.score}</b>
                <small>готовность</small>
              </div>
              <div>
                <h3>{ready.ready ? "Готово к подаче" : "Исправьте блокеры"}</h3>
                {ready.blockers.map((x: Obj, i: number) => (
                  <a href={`#${x.target}`} key={i}>
                    → {x.message}: {x.target}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="formActions">
          <button
            className="btn outline"
            disabled={!step}
            onClick={() => setStep((x) => x - 1)}
          >
            ← Назад
          </button>
          <button className="btn ghost" onClick={() => save()}>
            Сохранить
          </button>
          {step < s.steps.length - 1 ? (
            <button
              className="btn"
              onClick={async () => {
                await save();
                setStep((x) => x + 1);
              }}
            >
              Продолжить →
            </button>
          ) : (
            <>
              <button className="btn outline" onClick={check}>
                Проверить готовность
              </button>
              <button className="btn" disabled={!consent} onClick={submit}>
                Подписать и отправить
              </button>
            </>
          )}
        </div>
          </div>
          <aside className="applicationInspector">
            <div className="box inspectorDocuments">
              <h3>Требуемые документы</h3>
              {s.documents.map((document: Obj) => {
                const required = runtime.required_documents.includes(
                  document.id,
                );
                const uploaded = docs.includes(document.id);
                return (
                  <div
                    className={uploaded ? "uploaded" : required ? "missing" : "optional"}
                    key={document.id}
                  >
                    <span>
                      <b>{document.title}</b>
                      <small>{required ? "Обязательный" : "По сценарию"}</small>
                    </span>
                    <strong>{uploaded ? "✓" : required ? "!" : "○"}</strong>
                  </div>
                );
              })}
              <button
                className="ghost"
                onClick={() => {
                  const documentStep = s.steps.findIndex((item: Obj) =>
                    item.title.includes("Документ"),
                  );
                  if (documentStep >= 0) setStep(documentStep);
                }}
              >
                Перейти к документам →
              </button>
            </div>
            <div className="box inspectorReadiness">
              <h3>Готовность к следующему шагу</h3>
              <div className="good">✓ Данные предзаполнены</div>
              <div className={runtime.required_fields.some((id: string) => !answers[id]) ? "warn" : "good"}>
                {runtime.required_fields.some((id: string) => !answers[id]) ? "! Заполните обязательные поля" : "✓ Обязательные поля заполнены"}
              </div>
              <div className={runtime.required_documents.some((id: string) => !docs.includes(id)) ? "warn" : "good"}>
                {runtime.required_documents.some((id: string) => !docs.includes(id)) ? "! Проверьте обязательные документы" : "✓ Документы готовы"}
              </div>
              <small>{saved}</small>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
function Account() {
  const [apps, setApps] = useState<Obj[]>(demoApplications),
    [passport, setPassport] = useState<Obj>(demoPassport),
    [tab, setTab] = useState("Обзор");
  useEffect(() => {
    const submitted = localStorage.getItem("flowos_demo_submission");
    let localApps = demoApplications;
    try {
      if (submitted) localApps = [JSON.parse(submitted), ...demoApplications];
    } catch {
      localStorage.removeItem("flowos_demo_submission");
    }
    setApps(localApps);
    api("/api/applications")
      .then((remote: Obj[]) => setApps(remote.length ? remote : localApps))
      .catch(() => {});
    api("/api/passport")
      .then(setPassport)
      .catch(() => {});
  }, []);
  const tabs = [
    "Обзор",
    "Заявки",
    "Черновики",
    "Документы",
    "Бизнес-паспорт",
    "Маршрут",
    "Уведомления",
  ];
  return (
    <div className="dashboard">
      <aside>
        <div className="avatar">АС</div>
        <h3>Айдана Серикова</h3>
        <small>Предприниматель</small>
        {tabs.map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
        <Link href="/">← На портал</Link>
      </aside>
      <section>
        <div className="dashHead">
          <div>
            <em>ЛИЧНЫЙ КАБИНЕТ</em>
            <h1>{tab}</h1>
          </div>
          <Link className="btn" href="/services">
            Новая заявка +
          </Link>
        </div>
        <div className="stats">
          <div>
            <small>Заявки</small>
            <b>{apps.length}</b>
          </div>
          <div>
            <small>На рассмотрении</small>
            <b>{apps.filter((x) => x.status === "submitted").length}</b>
          </div>
          <div>
            <small>Черновики</small>
            <b>{apps.filter((x) => x.status === "draft").length}</b>
          </div>
          <div>
            <small>Паспорт</small>
            <b>92%</b>
          </div>
        </div>
        {tab === "Бизнес-паспорт" ? (
          <div className="formCard passport">
            <h2>{passport.company_name}</h2>
            {Object.entries(passport)
              .filter(([k]) => k !== "documents")
              .map(([k, v]) => (
                <div key={k}>
                  <small>{k.replaceAll("_", " ")}</small>
                  <b>{String(v)}</b>
                </div>
              ))}
          </div>
        ) : (
          <>
            <h2>Последние заявки</h2>
            <div className="table">
              {apps.map((x) => (
                <div key={x.id}>
                  <span>
                    <b>{x.service}</b>
                    <small>
                      {x.number || `Черновик #${x.id}`} · {x.organization}
                    </small>
                  </span>
                  <i className={`status ${x.status}`}>
                    {x.status === "draft" ? "Черновик" : "На рассмотрении"}
                  </i>
                  <span>{x.next_action}</span>
                </div>
              ))}
              {!apps.length && (
                <p>
                  Пока нет заявок.{" "}
                  <Link href="/services">Откройте каталог</Link>.
                </p>
              )}
            </div>
            <div className="grid2">
              <div className="box">
                <h3>Бизнес-паспорт</h3>
                <p>{passport.company_name}</p>
                <small>Данные используются для предзаполнения форм.</small>
                <button
                  className="btn outline"
                  onClick={() => setTab("Бизнес-паспорт")}
                >
                  Открыть
                </button>
              </div>
              <div className="box">
                <h3>Маршрут поддержки</h3>
                <p>Лизинг → Гарантия → Экспорт</p>
                <small>Следующий шаг: коммерческое предложение.</small>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
function Studio() {
  const studioFallback = useMemo(
    () =>
      demoServices.map((service) => ({
        ...service,
        readiness: 100,
        editor: "Демо-аналитик",
      })),
    [],
  );
  const [items, setItems] = useState<Obj[]>(studioFallback),
    [selected, setSelected] = useState<Obj>(),
    [gate, setGate] = useState<Obj>(),
    [threshold, setThreshold] = useState(500000000),
    [message, setMessage] = useState(""),
    [tab, setTab] = useState("Услуги"),
    [policy, setPolicy] = useState(
      "Программа финансирует предпринимателей. При сумме свыше 500 млн тенге требуется технико-экономическое обоснование.",
    ),
    [output, setOutput] = useState<Obj>();
  const load = useCallback(
    () =>
      api("/api/studio/services", {}, "analyst")
        .then(setItems)
        .catch(() => setItems(studioFallback)),
    [studioFallback],
  );
  useEffect(() => {
    load();
  }, [load]);
  async function publish() {
    if (!selected) return;
    const definition = structuredClone(selected),
      rule = definition.rules.find((x: Obj) => x.id === "amount-500m");
    if (rule) rule.conditions[0].value = threshold;
    try {
      const r = await api(
        `/api/studio/services/${selected.slug}/publish`,
        {
          method: "POST",
          body: JSON.stringify({
            definition,
            change_summary: `Порог изменён на ${threshold} ₸`,
          }),
        },
        "analyst",
      );
      setMessage(
        `Версия ${r.version} опубликована. Изменение уже действует в форме.`,
      );
      setSelected(await api(`/api/services/${selected.slug}`));
      load();
    } catch {
      setSelected(definition);
      setMessage(`Демо-публикация сохранена локально. Порог: ${threshold} ₸.`);
    }
  }
  return (
    <div className="dashboard studio">
      <aside>
        <h2>FlowOS Studio</h2>
        <small>Рабочее место аналитика</small>
        {[
          "Услуги",
          "AI Service Compiler",
          "Policy Change Diff",
          "Интеграции",
          "Аналитика",
        ].map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
        <Link href="/admin">Администрирование →</Link>
      </aside>
      <section>
        <div className="dashHead">
          <div>
            <em>SERVICE STUDIO</em>
            <h1>{tab}</h1>
          </div>
          <span className="pill">Deterministic demo</span>
        </div>
        {message && <div className="alert good">{message}</div>}
        {tab === "Услуги" && !selected && (
          <>
            <div className="tools">
              <input placeholder="Поиск услуг" />
              <button
                className="btn"
                onClick={() => setMessage("Черновик новой услуги создан")}
              >
                Создать +
              </button>
            </div>
            <div className="studioTable">
              <div className="head">
                <b>Услуга</b>
                <b>Статус / версия</b>
                <b>Готовность</b>
                <b>Редактор</b>
                <b>Действия</b>
              </div>
              {items.map((x) => (
                <div key={x.id}>
                  <span>
                    <b>{x.title}</b>
                    <small>{x.organization}</small>
                  </span>
                  <span>
                    <i className="status published">Опубликована</i>
                    <small>v{x.version}</small>
                  </span>
                  <strong>{x.readiness}/100</strong>
                  <span>{x.editor}</span>
                  <button
                    onClick={async () => {
                      try {
                        setSelected(await api(`/api/services/${x.id}`));
                      } catch {
                        setSelected(demoService(x.slug || x.id));
                      }
                    }}
                  >
                    Редактировать
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "Услуги" && selected && (
          <>
            <button
              className="ghost back"
              onClick={() => setSelected(undefined)}
            >
              ← Все услуги
            </button>
            <div className="editorHead">
              <div>
                <span className="pill">v{selected.version}</span>
                <h2>{selected.title}</h2>
                <p>{selected.organization}</p>
              </div>
              <div>
                <button
                  className="btn outline"
                  onClick={async () =>
                    api(
                      `/api/studio/services/${selected.slug}/quality`,
                      { method: "POST", body: JSON.stringify(selected) },
                      "analyst",
                    )
                      .then(setGate)
                      .catch(() =>
                        setGate({
                          score: 100,
                          can_publish: true,
                          scenarios: { successful: 8, tested: 8 },
                          critical_errors: [],
                        }),
                      )
                  }
                >
                  Quality Gate
                </button>
                <button className="btn" onClick={publish}>
                  Опубликовать
                </button>
              </div>
            </div>
            <div className="editor">
              <nav>
                {selected.steps.map((x: Obj, i: number) => (
                  <button key={x.id}>
                    {i + 1}. {x.title}
                    <small>
                      {
                        selected.fields.filter((f: Obj) => f.step_id === x.id)
                          .length
                      }{" "}
                      полей
                    </small>
                  </button>
                ))}
              </nav>
              <div className="formCard">
                <em>RULE BUILDER · КРИТИЧЕСКИЙ ДЕМО-СЦЕНАРИЙ</em>
                <h3>Условный обязательный документ</h3>
                <div className="rule">
                  <b>ЕСЛИ</b>
                  <span>Запрашиваемая сумма</span>
                  <span>больше</span>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                  />
                  <b>ТО</b>
                  <span>требовать</span>
                  <strong>Технико-экономическое обоснование</strong>
                </div>
                <small>
                  Не официальный критерий. Вступит в силу после проверки и
                  публикации.
                </small>
                {selected.fields.slice(0, 8).map((f: Obj) => (
                  <div className="fieldRow" key={f.id}>
                    <b>{f.label}</b>
                    <small>
                      {f.type}
                      {f.prefill ? " · предзаполнение" : ""}
                    </small>
                    <button>Настроить</button>
                  </div>
                ))}
              </div>
              <aside>
                {gate ? (
                  <div className="gate">
                    <div className="score">
                      <b>{gate.score}</b>
                      <small>Service Readiness</small>
                    </div>
                    <h3>
                      {gate.can_publish
                        ? "Готово к публикации"
                        : "Публикация заблокирована"}
                    </h3>
                    <p>
                      {gate.scenarios.successful}/{gate.scenarios.tested}{" "}
                      сценариев успешно
                    </p>
                    {gate.critical_errors.map((x: Obj, i: number) => (
                      <div className="alert bad" key={i}>
                        {x.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="box">
                    <h3>Quality Gate</h3>
                    <p>
                      Детерминированно проверяет ссылки, поля, этапы, расчёты и
                      документы.
                    </p>
                  </div>
                )}
                <Link className="btn outline" href={`/apply/${selected.slug}`}>
                  Предпросмотр →
                </Link>
                <div className="box compilerShortcut">
                  <em>AI SERVICE COMPILER</em>
                  <h3>Сформировать конфигурацию</h3>
                  <p>
                    Преобразуйте текст программы в проверяемый черновик полей,
                    документов и правил.
                  </p>
                  <button
                    className="btn"
                    onClick={() => {
                      setSelected(undefined);
                      setTab("AI Service Compiler");
                    }}
                  >
                    Открыть Compiler
                  </button>
                </div>
              </aside>
            </div>
          </>
        )}
        {tab === "AI Service Compiler" && (
          <div className="grid2">
            <div className="formCard">
              <label className="field">
                <span>Текст политики</span>
                <textarea
                  rows={12}
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                />
              </label>
              <button
                className="btn"
                onClick={async () =>
                  api(
                    "/api/ai/compile",
                    {
                      method: "POST",
                      body: JSON.stringify({ policy_text: policy }),
                    },
                    "analyst",
                  )
                    .then(setOutput)
                    .catch(() =>
                      setOutput({
                        mode: "deterministic-fallback",
                        confidence: 0.92,
                        fields: ["requested_amount"],
                        documents: ["feasibility_study"],
                        rule: "requested_amount > 500000000",
                      }),
                    )
                }
              >
                Сформировать черновик
              </button>
              <small>
                AI не публикует автоматически; без ключей работает fallback.
              </small>
            </div>
            <pre>
              {output
                ? JSON.stringify(output, null, 2)
                : "Здесь появятся условия, поля, документы, источник и confidence."}
            </pre>
          </div>
        )}
        {!["Услуги", "AI Service Compiler"].includes(tab) && (
          <GenericModule tab={tab} />
        )}
      </section>
    </div>
  );
}
function GenericModule({ tab }: { tab: string }) {
  const [data, setData] = useState<Obj>();
  async function run() {
    try {
      setData(
        tab === "Policy Change Diff"
          ? await api(
              "/api/ai/policy-diff",
              {
                method: "POST",
                body: JSON.stringify({
                  old_text: "Порог 500 млн",
                  new_text: "Порог 650 млн и новый документ",
                }),
              },
              "analyst",
            )
          : tab === "Интеграции"
            ? await api("/api/integrations/log", {}, "analyst")
            : await api("/api/analytics", {}, "analyst"),
      );
    } catch {
      setData(
        tab === "Policy Change Diff"
          ? {
              mode: "deterministic-fallback",
              changes: ["Порог изменён с 500 млн ₸ на 650 млн ₸"],
            }
          : tab === "Интеграции"
            ? []
            : demoAnalytics,
      );
    }
  }
  return (
    <div className="formCard">
      <h2>{tab}</h2>
      <p>
        Модуль использует санитизированные демонстрационные данные и
        детерминированные проверки.
      </p>
      <button className="btn" onClick={run}>
        Запустить модуль
      </button>
      <pre>{data && JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
function MapPage() {
  const mapData = (items: Obj[]) => ({
    items,
    totals: {
      projects: items.length,
      financing: items.reduce((sum, item) => sum + item.financing, 0),
      regions: new Set(items.map((item) => item.region)).size,
    },
  });
  const [data, setData] = useState<Obj>(mapData(demoProjects)),
    [sector, setSector] = useState("");
  useEffect(() => {
    const filtered = sector
      ? demoProjects.filter((item) => item.sector === sector)
      : demoProjects;
    setData(mapData(filtered));
    api(`/api/projects?sector=${encodeURIComponent(sector)}`)
      .then(setData)
      .catch(() => {});
  }, [sector]);
  return (
    <section className="wrap section">
      <Heading
        tag="Интерактивная карта"
        title="Проекты поддержки по Казахстану"
      />
      <p>25 ясно обозначенных демо-проектов; не официальная статистика.</p>
      <div className="filters">
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">Все отрасли</option>
          <option>Промышленность</option>
          <option>АПК</option>
          <option>Логистика</option>
          <option>Услуги</option>
        </select>
        <select>
          <option>Все регионы</option>
        </select>
        <select>
          <option>Все статусы</option>
        </select>
      </div>
      {!data ? (
        <State text="Загружаем проекты…" />
      ) : (
        <>
          <div className="stats">
            <div>
              <small>Проектов</small>
              <b>{data.totals.projects}</b>
            </div>
            <div>
              <small>Финансирование</small>
              <b>{money(data.totals.financing)}</b>
            </div>
            <div>
              <small>Регионов</small>
              <b>{data.totals.regions}</b>
            </div>
          </div>
          <div className="mapLayout">
            <div className="kaz">
              КАЗАХСТАН
              {data.items.map((x: Obj, i: number) => (
                <button
                  title={x.name}
                  key={x.id}
                  style={{
                    left: `${5 + ((i * 13) % 88)}%`,
                    top: `${12 + ((i * 27) % 72)}%`,
                  }}
                >
                  {(i % 3) + 1}
                </button>
              ))}
            </div>
            <div>
              {data.items.slice(0, 8).map((x: Obj) => (
                <article key={x.id}>
                  <span className="pill">{x.status}</span>
                  <h3>{x.name}</h3>
                  <p>
                    {x.region} · {x.sector}
                  </p>
                  <b>{money(x.financing)}</b>
                  <small>
                    {x.organization} · {x.year}
                  </small>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
function Reports() {
  const [items, setItems] = useState<Obj[]>(demoReports),
    [preview, setPreview] = useState<Obj>();
  useEffect(() => {
    api("/api/reports")
      .then((x) => setItems(x.items?.length ? x.items : demoReports))
      .catch(() => {});
  }, []);
  return (
    <section className="wrap section">
      <Heading tag="Знания и аналитика" title="Аналитические материалы" />
      <div className="filters">
        <input placeholder="Поиск материалов" />
        <select>
          <option>Все типы</option>
        </select>
        <select>
          <option>Все организации</option>
        </select>
      </div>
      <div className="reports">
        <div className="cards3">
          {items.map((x) => (
            <article className="card" key={x.id}>
              <span>{x.type}</span>
              <h3>{x.title}</h3>
              <p>{x.description}</p>
              <small>
                {x.organization} · {x.period}
              </small>
              <button className="btn outline" onClick={() => setPreview(x)}>
                Открыть / просмотреть
              </button>
            </article>
          ))}
        </div>
        <aside className="preview">
          <em>ПРЕДПРОСМОТР</em>
          {preview ? (
            <>
              <h2>{preview.title}</h2>
              <p>{preview.description}</p>
              <div className="paper">
                FLOWOS
                <i />
                <i />
                <i />
                <b>Демо-просмотр</b>
              </div>
              <small>Источник: {preview.source}</small>
            </>
          ) : (
            <State text="Выберите материал" />
          )}
        </aside>
      </div>
    </section>
  );
}
function Tools() {
  const [amount, setAmount] = useState(300000000),
    [rate, setRate] = useState(12.5),
    [years, setYears] = useState(5),
    [score, setScore] = useState<number>();
  const monthly =
    (amount * (rate / 1200) * Math.pow(1 + rate / 1200, years * 12)) /
    (Math.pow(1 + rate / 1200, years * 12) - 1);
  function download(name: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([`Baiterek FlowOS\n${name}\nДемонстрационный шаблон.`]),
    );
    a.download = name + ".txt";
    a.click();
  }
  return (
    <section className="wrap section">
      <Heading
        tag="Практические инструменты"
        title="Подготовьте бизнес к финансированию"
      />
      <div className="grid2">
        <div className="formCard">
          <h2>Калькулятор финансирования</h2>
          {[
            ["Сумма, ₸", amount, setAmount],
            ["Ставка, %", rate, setRate],
            ["Срок, лет", years, setYears],
          ].map(([l, v, set]: any) => (
            <label className="field" key={l}>
              <span>{l}</span>
              <input
                type="number"
                value={v}
                onChange={(e) => set(Number(e.target.value))}
              />
            </label>
          ))}
          <div className="result">
            <small>Предварительный платёж</small>
            <b>{money(monthly)} / мес.</b>
            <span>Всего {money(monthly * years * 12)}</span>
          </div>
          <small>Не является офертой или решением о финансировании.</small>
        </div>
        <div className="formCard">
          <h2>Диагностика готовности</h2>
          {[
            "Компания старше года",
            "Есть отчётность",
            "Есть бизнес-план",
            "Есть собственный вклад",
            "Есть проектная команда",
          ].map((x, i) => (
            <label className="consent" key={x}>
              <input id={`diag${i}`} type="checkbox" />
              {x}
            </label>
          ))}
          <button
            className="btn"
            onClick={() =>
              setScore(
                document.querySelectorAll(".consent input:checked").length * 20,
              )
            }
          >
            Рассчитать
          </button>
          {score != null && (
            <div className="score">
              <b>{score}</b>
              <small>готовность из 100</small>
            </div>
          )}
        </div>
      </div>
      <h2>Шаблоны и чек-листы</h2>
      <div className="cards3">
        {[
          "Бизнес-план",
          "Финансовая модель",
          "Чек-лист заявки",
          "Чек-лист документов",
        ].map((x) => (
          <article className="card" key={x}>
            <h3>{x}</h3>
            <p>Структура с подсказками и примерами.</p>
            <button className="btn outline" onClick={() => download(x)}>
              Скачать шаблон
            </button>
          </article>
        ))}
      </div>
      <RouteBuilder />
    </section>
  );
}
function RouteBuilder() {
  const [sector, setSector] = useState("agro"),
    [goal, setGoal] = useState("Получить лизинг"),
    [amount, setAmount] = useState(450000000),
    [region, setRegion] = useState("Астана"),
    [collateral, setCollateral] = useState(true),
    [equipment, setEquipment] = useState(true),
    [route, setRoute] = useState<Obj>();
  async function build() {
    const payload = {
      applicant_type: "legal",
      sector,
      goal,
      region,
      requested_amount: amount,
      collateral,
      export_plans: false,
      equipment_transport: equipment,
      business_stage: "established",
    };
    try {
      setRoute(
        await api("/api/support-route", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
    } catch {
      setRoute(demoRoute(payload));
    }
  }
  return (
    <div className="formCard" id="route">
      <Heading
        tag="Персональный маршрут"
        title="Подберите последовательность мер"
      />
      <div className="grid2">
        <div>
          <label className="field">
            <span>Цель бизнеса</span>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option>Получить лизинг</option>
              <option>Получить финансирование</option>
              <option>Выйти на экспорт</option>
            </select>
          </label>
          <label className="field">
            <span>Отрасль</span>
            <select value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="agro">АПК</option>
              <option value="logistics">Логистика</option>
              <option value="industry">Промышленность</option>
            </select>
          </label>
          <label className="field">
            <span>Регион</span>
            <input value={region} onChange={(e) => setRegion(e.target.value)} />
          </label>
          <label className="field">
            <span>Запрашиваемая сумма, ₸</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={collateral}
              onChange={(e) => setCollateral(e.target.checked)}
            />
            Есть обеспечение
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={equipment}
              onChange={(e) => setEquipment(e.target.checked)}
            />
            Нужны оборудование или транспорт
          </label>
          <button className="btn" onClick={build}>
            Построить маршрут →
          </button>
        </div>
        <div>
          {route ? (
            route.recommendations.map((x: Obj, i: number) => (
              <article className="box" key={x.service_id}>
                <span className="pill">Шаг {i + 1}</span>
                <h3>{x.title}</h3>
                <p>
                  <b>Почему подходит:</b> {x.why}
                </p>
                <p>
                  <b>Что сделать:</b> {x.actions.join("; ")}
                </p>
                {x.blockers.length > 0 && (
                  <div className="alert warn">
                    Блокеры: {x.blockers.join("; ")}
                  </div>
                )}
                <small>
                  {x.organization} · {x.next_step}
                </small>
              </article>
            ))
          ) : (
            <div className="state">
              Заполните параметры — рекомендации будут объяснимыми и
              детерминированными.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function Admin() {
  const [data, setData] = useState<Obj>(demoAnalytics),
    [logs, setLogs] = useState<Obj[]>([]);
  useEffect(() => {
    api("/api/analytics", {}, "holding_admin")
      .then(setData)
      .catch(() => {});
    api("/api/integrations/log", {}, "holding_admin")
      .then(setLogs)
      .catch(() => {});
  }, []);
  return (
    <section className="wrap section">
      <span className="pill">Демо-аналитика</span>
      <h1>Панель администратора холдинга</h1>
      <div className="stats">
        <div>
          <small>Заявок</small>
          <b>{data.total_applications}</b>
        </div>
        <div>
          <small>Подано</small>
          <b>{data.submitted}</b>
        </div>
        <div>
          <small>Завершение</small>
          <b>{data.completion_rate}%</b>
        </div>
        <div>
          <small>Предзаполнение</small>
          <b>{data.prefill_rate}%</b>
        </div>
      </div>
      <div className="grid2">
        <div className="formCard">
          <h2>По регионам</h2>
          {data.by_region.map((x: Obj) => (
            <div className="bar" key={x.name}>
              <span>{x.name}</span>
              <i style={{ width: `${x.value / 4}%` }} />
              <b>{x.value}</b>
            </div>
          ))}
        </div>
        <div className="formCard">
          <h2>User Friction</h2>
          {data.user_friction.map((x: Obj) => (
            <div className="friction" key={x.step}>
              <b>{x.step}</b>
              <span>{x.issue}</span>
              <strong>{x.dropoff}%</strong>
            </div>
          ))}
          <p>
            Ошибок: {data.validation_errors} · нет документов:{" "}
            {data.missing_documents}
          </p>
        </div>
      </div>
      <h2>Журнал интеграций</h2>
      <div className="studioTable">
        {logs.map((x) => (
          <div key={x.id}>
            <b>{x.connector}</b>
            <span>
              {x.method} {x.endpoint}
            </span>
            <i className="status published">{x.status}</i>
            <span>{x.response_time} мс</span>
          </div>
        ))}
        {!logs.length && (
          <p>События появятся после eGov/BIN lookup или подачи заявки.</p>
        )}
      </div>
    </section>
  );
}

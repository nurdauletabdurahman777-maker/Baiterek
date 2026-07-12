import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Baiterek FlowOS — Единый портал поддержки бизнеса",
  description: "Конфигурационная платформа цифровых мер поддержки",
};

function BrandMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 3 35 14 24 25 13 14 24 3Z" />
      <path d="m13 14-8 8 11 11 8-8M35 14l8 8-11 11-8-8" />
      <path d="m16 33 8 12 8-12M24 11v26M17 18l14 14M31 18 17 32" />
    </svg>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={inter.variable}
    >
      <body className={inter.className}>
        <div className="demo">
          <span>
            <i>✓</i> Вы находитесь в демонстрационном режиме. Данные и действия
            не являются реальными.
          </span>
          <Link href="/tools">Подробнее ↗</Link>
        </div>
        <header>
          <Link href="/" className="brand">
            <BrandMark />
            <span>
              <small>BAITEREK</small>
              <b>FlowOS</b>
            </span>
          </Link>
          <nav aria-label="Основная навигация">
            <Link href="/services">Услуги</Link>
            <Link href="/map">Карта</Link>
            <Link href="/reports">Аналитика</Link>
            <Link href="/tools">Инструменты</Link>
          </nav>
          <div className="logins">
            <Link href="/login/entrepreneur">Предпринимателям</Link>
            <Link href="/login/analyst">Сотрудникам холдинга</Link>
            <Link href="/login/holding_admin">Членам жюри</Link>
            <button>RU / KZ</button>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <div className="footer-brand">
            <Link href="/" className="brand">
              <BrandMark />
              <span>
                <small>BAITEREK</small>
                <b>FlowOS</b>
              </span>
            </Link>
            <p>
              Цифровая платформа продуктов и сервисов группы компаний АО «НУХ
              «Байтерек»».
            </p>
          </div>
          <div>
            <b>О платформе</b>
            <Link href="/">О системе</Link>
            <Link href="/services">Каталог услуг</Link>
            <Link href="/map">Карта проектов</Link>
          </div>
          <div>
            <b>Поддержка</b>
            <Link href="/tools">Инструменты</Link>
            <Link href="/reports">Аналитика</Link>
            <Link href="/account">Личный кабинет</Link>
          </div>
          <div>
            <b>Контакты</b>
            <a href="tel:+77172919191">+7 7172 91 91 91</a>
            <a href="mailto:info@baiterek.gov.kz">info@baiterek.gov.kz</a>
            <p>Республика Казахстан, г. Астана</p>
          </div>
          <small>
            © 2026 АО «НУХ «Байтерек» · Демо-условия не являются официальными
            критериями одобрения.
          </small>
        </footer>
      </body>
    </html>
  );
}

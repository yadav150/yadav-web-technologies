/* ============================================================
   YADAV WEB TECHNOLOGIES – Global Styles
   Primary  : #0F172A (slate/navy)
   Secondary: #4F46E5 (indigo)
   Border   : #E5E7EB
   Radius   : 8px (global)
   ============================================================ */

/* ===== CSS VARIABLES (Light Mode) ===== */
:root {
    --color-primary: #0F172A;
    --color-secondary: #4F46E5;
    --color-secondary-light: #818CF8;
    --color-secondary-dark: #4338CA;

    --color-bg: #F8FAFC;
    --color-bg-alt: #FFFFFF;
    --color-bg-card: #FFFFFF;
    --color-bg-header: rgba(255, 255, 255, 0.8);
    --color-bg-footer: #0F172A;

    --color-text: #0F172A;
    --color-text-muted: #475569;
    --color-text-light: #94A3B8;
    --color-text-inverse: #FFFFFF;

    --color-border: #E5E7EB;
    --color-border-accent: #4F46E5;

    --color-shadow: rgba(15, 23, 42, 0.08);

    --radius: 8px;
    --border: 1px solid var(--color-border);
    --transition: 0.25s ease;
    --max-width: 1200px;
    --header-height: 64px;
}

/* ===== DARK MODE ===== */
html.dark-mode {
    --color-bg: #0B1121;
    --color-bg-alt: #1E293B;
    --color-bg-card: #1E293B;
    --color-bg-header: rgba(11, 17, 33, 0.85);
    --color-bg-footer: #0B1121;

    --color-text: #F1F5F9;
    --color-text-muted: #94A3B8;
    --color-text-light: #64748B;
    --color-text-inverse: #0F172A;

    --color-border: #334155;
    --color-border-accent: #818CF8;

    --color-shadow: rgba(0, 0, 0, 0.3);
}

/* ===== RESET & BASE ===== */
*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    overflow-y: scroll;
}

body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
    line-height: 1.6;
    transition: background var(--transition), color var(--transition);
}

img {
    max-width: 100%;
    height: auto;
    display: block;
}

a {
    color: var(--color-secondary);
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}

ul {
    list-style: none;
}

/* ===== GLOBAL CONTAINER ===== */
.container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 24px;
}
@media (max-width: 639px) {
    .container {
        padding: 0 16px;
    }
}

/* ===== BUTTONS ===== */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 28px;
    background: var(--color-secondary);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
    text-decoration: none;
    position: relative;
    overflow: hidden;
}
.btn:hover {
    background: var(--color-secondary-dark);
    text-decoration: none;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
}
.btn:focus-visible {
    outline: 2px solid var(--color-secondary);
    outline-offset: 2px;
}

.btn-secondary {
    background: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
}
.btn-secondary:hover {
    background: var(--color-bg-alt);
    border-color: var(--color-secondary);
    box-shadow: none;
}

.btn-outline {
    background: transparent;
    color: var(--color-secondary);
    border: 1px solid var(--color-secondary);
}
.btn-outline:hover {
    background: var(--color-secondary);
    color: #fff;
}

/* ===== RIPPLE ===== */
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.35);
    transform: scale(0);
    animation: rippleAnim 0.6s ease-out forwards;
    pointer-events: none;
}
@keyframes rippleAnim {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

/* ===== REVEAL ===== */
.reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
    opacity: 1;
    transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
    .reveal {
        opacity: 1;
        transform: none;
        transition: none;
    }
    .ripple {
        display: none;
    }
}

/* ===== SECTIONS (Full-width background, inner container) ===== */
.section {
    width: 100%;
    padding: 60px 0;
    background: var(--color-bg);
    transition: background var(--transition);
}
.section:nth-child(even) {
    background: var(--color-bg-alt);
}
.section-hero {
    padding: 40px 0 20px;
    background: var(--color-bg-alt);
}

.section-title-bar {
    background: var(--color-primary);
    padding: 12px 24px;
    border-radius: var(--radius) var(--radius) 0 0;
    transition: background var(--transition);
}
.section-title-bar h2 {
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.2px;
}
.section-title-bar .sub {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    font-weight: 400;
    margin-left: 10px;
}

.section-body {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-top: 0;
    border-radius: 0 0 var(--radius) var(--radius);
    padding: 24px 24px;
    transition: background var(--transition), border-color var(--transition);
}
.section-body.accent-border {
    border-color: var(--color-border-accent);
    border-width: 1px 1px 1px 4px;
}
.section-body.accent-border-top {
    border-top: 3px solid var(--color-border-accent);
}

/* ===== HERO ===== */
.hero-container {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 32px 24px;
    transition: background var(--transition), border-color var(--transition);
}
.hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    text-align: center;
}
.hero-text {
    flex: 1;
}
.hero-title {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 6px;
    letter-spacing: -0.5px;
}
.hero-title .highlight {
    color: var(--color-secondary);
}
.hero-tagline {
    font-size: 1.1rem;
    color: var(--color-text-muted);
    margin: 0 0 10px;
    font-weight: 500;
}
.hero-description {
    font-size: 1rem;
    color: var(--color-text-muted);
    max-width: 600px;
    margin: 0 auto 20px;
    line-height: 1.7;
    text-align: justify;
}
.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
}
.hero-image-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
}
.hero-image {
    width: 200px;
    height: 200px;
    object-fit: contain;
    border: none;
    background: transparent;
    border-radius: 0;
    transition: transform 0.3s ease;
}
.hero-image:hover {
    transform: scale(1.03);
}
@media (min-width: 640px) {
    .hero-content {
        flex-direction: row;
        text-align: left;
        gap: 50px;
    }
    .hero-description {
        margin-left: 0;
        margin-right: 0;
    }
    .hero-actions {
        justify-content: flex-start;
    }
    .hero-image {
        width: 240px;
        height: 240px;
    }
    .hero-title {
        font-size: 3rem;
    }
}
@media (min-width: 1024px) {
    .hero-image {
        width: 280px;
        height: 280px;
    }
    .hero-title {
        font-size: 3.4rem;
    }
}

/* ===== CONTENT BOX ===== */
.content-box {
    padding: 4px 0;
}
.content-box p {
    margin: 0 0 1em;
    font-size: 0.95rem;
    line-height: 1.7;
    color: var(--color-text);
    text-align: justify;
}
.content-box p:last-child {
    margin-bottom: 0;
}
.read-more {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

/* ===== GRIDS ===== */
.grid-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
}
.grid-3 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
}
@media (min-width: 640px) {
    .grid-2 {
        grid-template-columns: 1fr 1fr;
    }
    .grid-3 {
        grid-template-columns: 1fr 1fr;
    }
}
@media (min-width: 1024px) {
    .grid-3 {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

/* ===== CARDS ===== */
.card {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 20px 22px;
    transition: border-color var(--transition), background var(--transition), transform var(--transition);
}
.card:hover {
    border-color: var(--color-secondary);
    background: var(--color-bg);
    transform: translateY(-4px);
}
.card .card-title {
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--color-text);
    margin-bottom: 6px;
}
.card .card-desc {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.5;
}
.card .card-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: var(--radius);
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-secondary);
    margin-bottom: 12px;
    transition: background var(--transition), color var(--transition);
}
.card:hover .card-icon {
    background: var(--color-secondary);
    color: #fff;
}
.card .card-meta {
    font-size: 0.8rem;
    color: var(--color-text-light);
    margin-top: 8px;
}
.card .card-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-secondary);
    background: rgba(79, 70, 229, 0.08);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 2px 12px;
    margin-top: 8px;
}

/* ===== HEADER ===== */
.site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    background: var(--color-bg-header);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-border);
    transition: background var(--transition), border-color var(--transition);
}

.header-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: var(--header-height);
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
}
.logo:hover {
    text-decoration: none;
}
.logo svg {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}
.logo .highlight {
    color: var(--color-secondary);
}

.hamburger {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    padding: 6px 4px;
    cursor: pointer;
    border-radius: var(--radius);
    transition: background var(--transition);
}
.hamburger:hover {
    background: var(--color-bg-alt);
}
.hamburger-line {
    display: block;
    width: 26px;
    height: 2.5px;
    background: var(--color-text);
    border-radius: 2px;
    transition: transform 0.25s ease, opacity 0.25s ease;
}
.hamburger[aria-expanded="true"] .hamburger-line:nth-child(1) {
    transform: translateY(6.5px) rotate(45deg);
}
.hamburger[aria-expanded="true"] .hamburger-line:nth-child(2) {
    opacity: 0;
}
.hamburger[aria-expanded="true"] .hamburger-line:nth-child(3) {
    transform: translateY(-6.5px) rotate(-45deg);
}

.theme-toggle {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 6px 10px;
    cursor: pointer;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    transition: background var(--transition), border-color var(--transition);
}
.theme-toggle:hover {
    background: var(--color-bg-alt);
    border-color: var(--color-secondary);
}
.theme-toggle svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.primary-nav {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    background: var(--color-bg-header);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-border);
    width: 100%;
}
.primary-nav.open {
    max-height: 500px;
}

.nav-list {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    padding: 10px 24px 16px;
    gap: 4px;
}
.nav-list a {
    display: block;
    padding: 8px 12px;
    border-radius: var(--radius);
    color: var(--color-text);
    font-weight: 500;
    text-decoration: none;
    transition: background var(--transition), color var(--transition);
}
.nav-list a:hover,
.nav-list a:focus,
.nav-list a[aria-current="page"] {
    background: var(--color-secondary);
    color: #fff;
    text-decoration: none;
}

@media (min-width: 640px) {
    .hamburger {
        display: none;
    }
    .primary-nav {
        max-height: none;
        overflow: visible;
        background: transparent;
        backdrop-filter: none;
        border-bottom: none;
        width: auto;
    }
    .nav-list {
        flex-direction: row;
        padding: 0;
        gap: 8px 20px;
        align-items: center;
    }
    .nav-list a {
        padding: 6px 12px;
    }
    .header-inner {
        padding: 0 24px;
    }
}
@media (min-width: 1024px) {
    .header-inner {
        padding: 0 32px;
    }
    .nav-list {
        gap: 12px 28px;
    }
}

/* ===== FOOTER ===== */
.site-footer {
    width: 100%;
    background: var(--color-bg-footer);
    border-radius: var(--radius) var(--radius) 0 0;
    margin-top: 40px;
    padding: 24px 0 18px;
    color: #E2E8F0;
    transition: background var(--transition);
}
.footer-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 24px;
}
.footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px 24px;
}
.footer-links a {
    color: #CBD5E1;
    font-size: 0.9rem;
    text-decoration: none;
    transition: color var(--transition);
}
.footer-links a:hover {
    color: #fff;
    text-decoration: none;
}
.footer-copy {
    font-size: 0.8rem;
    color: #94A3B8;
    margin: 4px 0 0;
}
@media (min-width: 640px) {
    .footer-inner {
        flex-direction: row;
        justify-content: space-between;
        padding: 0 24px;
    }
}
@media (min-width: 1024px) {
    .footer-inner {
        padding: 0 32px;
    }
}

/* ===== ABOUT PAGE ===== */
.founder-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    text-align: center;
    padding: 28px;
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    transition: border-color var(--transition);
}
.founder-card:hover {
    border-color: var(--color-secondary);
}
.founder-card .founder-image {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    border: 3px solid var(--color-secondary);
    object-fit: cover;
}
.founder-card .founder-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-text);
}
.founder-card .founder-role {
    font-size: 0.95rem;
    color: var(--color-text-muted);
}
.founder-card .founder-bio {
    font-size: 0.95rem;
    color: var(--color-text-muted);
    max-width: 600px;
    line-height: 1.7;
    text-align: justify;
}

.values-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 16px;
}
.values-grid .value-card {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 16px 18px;
    transition: border-color var(--transition), transform var(--transition);
}
.values-grid .value-card:hover {
    border-color: var(--color-secondary);
    transform: translateY(-2px);
}
.values-grid .value-card .value-icon {
    color: var(--color-secondary);
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
}
.values-grid .value-card .value-title {
    font-weight: 600;
    color: var(--color-text);
}
.values-grid .value-card .value-desc {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    margin-top: 4px;
}
@media (min-width: 640px) {
    .values-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.timeline {
    margin-top: 16px;
    position: relative;
    padding-left: 28px;
    border-left: 2px solid var(--color-secondary);
}
.timeline-item {
    margin-bottom: 24px;
    padding-left: 16px;
}
.timeline-item:last-child {
    margin-bottom: 0;
}
.timeline-item .year {
    font-weight: 700;
    color: var(--color-secondary);
    font-size: 1.1rem;
}
.timeline-item .event {
    font-size: 0.95rem;
    color: var(--color-text-muted);
    margin-top: 2px;
    text-align: justify;
}

/* ===== SERVICES PAGE ===== */
.service-category {
    margin-bottom: 32px;
}
.service-category:last-child {
    margin-bottom: 0;
}
.service-category .category-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--color-secondary);
}
.service-category .service-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}
.service-category .service-list .service-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    transition: border-color var(--transition), background var(--transition);
}
.service-category .service-list .service-item:hover {
    border-color: var(--color-secondary);
    background: var(--color-bg);
}
.service-category .service-list .service-item .check {
    flex-shrink: 0;
    margin-top: 1px;
}
.service-category .service-list .service-item .service-name {
    font-size: 0.95rem;
    color: var(--color-text);
}
@media (min-width: 640px) {
    .service-category .service-list {
        grid-template-columns: 1fr 1fr;
    }
}
@media (min-width: 1024px) {
    .service-category .service-list {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

/* ===== HOME PAGE ===== */
.vision-box {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-secondary);
    border-radius: var(--radius);
    padding: 20px 24px;
    margin: 16px 0;
    transition: background var(--transition), border-color var(--transition);
}
.vision-box blockquote {
    font-size: 1.05rem;
    font-style: italic;
    color: var(--color-text);
    margin: 0;
    padding: 0;
    text-align: justify;
}
.vision-box cite {
    display: block;
    margin-top: 8px;
    font-style: normal;
    font-weight: 500;
    color: var(--color-secondary);
}

.stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 20px;
}
.stat-item {
    text-align: center;
    padding: 16px;
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    transition: border-color var(--transition), transform var(--transition);
}
.stat-item:hover {
    border-color: var(--color-secondary);
    transform: translateY(-2px);
}
.stat-item .number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-secondary);
    display: block;
}
.stat-item .label {
    font-size: 0.85rem;
    color: var(--color-text-muted);
}
@media (min-width: 640px) {
    .stats-row {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* ===== PORTFOLIO ===== */
/* Cards already styled, but we add specific portfolio card overrides if needed */
.portfolio-item {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color var(--transition), transform var(--transition);
}
.portfolio-item:hover {
    border-color: var(--color-secondary);
    transform: translateY(-4px);
}
.portfolio-item .thumb {
    height: 150px;
    background: var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--color-border);
    position: relative;
}
.portfolio-item .thumb .thumb-label {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: var(--color-secondary);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 12px;
    border-radius: var(--radius);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.portfolio-item .body {
    padding: 16px 18px;
}
.portfolio-item .body .project-title {
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--color-text);
    margin-bottom: 4px;
}
.portfolio-item .body .project-desc {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.6;
    text-align: justify;
}
.portfolio-item .body .project-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 10px;
    color: var(--color-secondary);
    font-weight: 500;
    font-size: 0.9rem;
}
.portfolio-item .body .project-link:hover {
    text-decoration: underline;
}
.portfolio-item .body .project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
}
.portfolio-item .body .project-tech .tech-tag {
    font-size: 0.7rem;
    padding: 2px 10px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    color: var(--color-text-muted);
}

/* ===== UTILITY ===== */
.text-center {
    text-align: center;
}
.text-muted {
    color: var(--color-text-muted);
}
.text-justify {
    text-align: justify;
}
.mt-8 {
    margin-top: 8px;
}
.mt-16 {
    margin-top: 16px;
}
.mb-8 {
    margin-bottom: 8px;
}
.mb-16 {
    margin-bottom: 16px;
}
.gap-8 {
    gap: 8px;
}
.gap-16 {
    gap: 16px;
}
.flex {
    display: flex;
}
.flex-wrap {
    flex-wrap: wrap;
}
.items-center {
    align-items: center;
}
.justify-between {
    justify-content: space-between;
}
.w-full {
    width: 100%;
}

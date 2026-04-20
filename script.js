const $ = (id) => document.getElementById(id);
const data = window.PORTFOLIO;

function setTheme(nextTheme) {
    const root = document.documentElement;
    root.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    const icon = $("themeToggle")?.querySelector(".icon");
    if (icon) icon.textContent = nextTheme === "light" ? "☀" : "☾";
}

function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return setTheme(saved);

    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    setTheme(prefersLight ? "light" : "dark");
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
}

function initialsFromName(name) {
    return String(name || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .filter(Boolean)
        .join("");
}

function safeLink(label, url) {
    const a = el("a", "", label);
    a.href = url;
    a.target = "_blank";
    a.rel = "noreferrer";
    return a;
}

function renderHero() {
    if (!data) return;

    $("heroName").textContent = data.person.name;
    $("footerName").textContent = data.person.name;
    $("heroTagline").textContent = `${data.person.role} • ${data.person.tagline}`;
    $("heroSummary").textContent = data.person.summary;
    $("aboutLead").textContent = data.about.lead;
    $("aboutBody").textContent = data.about.body;
    $("availability").textContent = data.person.availability;

    const resumeBtn = $("resumeBtn");
    if (resumeBtn) resumeBtn.href = data.files.resumePdf;
    const profileBtn = $("profileBtn");
    if (profileBtn) profileBtn.href = data.files.profilePdf;

    const aboutBullets = $("aboutBullets");
    aboutBullets.innerHTML = "";
    data.about.bullets.forEach((b) => aboutBullets.appendChild(el("li", "", b)));

    const strengths = $("strengths");
    strengths.innerHTML = "";
    data.about.strengths.forEach((s) => strengths.appendChild(el("span", "pill", s)));

    const quickLinks = $("quickLinks");
    quickLinks.innerHTML = "";
    data.links.forEach((l) => quickLinks.appendChild(safeLink(l.label, l.url)));

    const statsGrid = $("statsGrid");
    statsGrid.innerHTML = "";
    data.stats.forEach((s) => {
        const box = el("div", "metric");
        box.appendChild(el("div", "k", s.k));
        box.appendChild(el("div", "l", s.l));
        statsGrid.appendChild(box);
    });

    const heroMeta = $("heroMeta");
    heroMeta.innerHTML = "";
    heroMeta.appendChild(el("div", "", data.person.location));
    heroMeta.appendChild(el("div", "", data.person.email));

    const initials = initialsFromName(data.person.name) || "AN";
    const brandMark = document.querySelector(".brand-mark");
    if (brandMark) brandMark.textContent = initials;
    const avatarInner = document.querySelector(".avatar-inner");
    if (avatarInner) avatarInner.textContent = initials;

    const photo = data.person.photo;
    const img = $("profilePhoto");
    if (img && photo) {
        img.src = photo;
        img.alt = data.person.name;
        img.style.display = "block";
        if (avatarInner) avatarInner.style.display = "none";
    } else if (img) {
        img.style.display = "none";
        if (avatarInner) avatarInner.style.display = "";
    }
}

function renderSkills() {
    const grid = $("skillsGrid");
    grid.innerHTML = "";

    data.skills.forEach((group) => {
        const card = el("div", "card skill-group reveal");
        card.appendChild(el("h3", "", group.group));

        const tags = el("div", "tags");
        group.items.forEach((item) => tags.appendChild(el("span", "tag", item)));
        card.appendChild(tags);

        grid.appendChild(card);
    });
}

function renderProjects() {
    const grid = $("projectsGrid");
    grid.innerHTML = "";

    data.projects.forEach((p) => {
        const card = el("article", "card project reveal");
        card.dataset.category = p.category || "all";

        const head = el("div", "project-head");
        head.appendChild(el("h3", "project-title", p.title));
        head.appendChild(el("p", "project-desc", p.desc));
        card.appendChild(head);

        if (Array.isArray(p.highlights) && p.highlights.length) {
            const ul = el("ul", "list");
            p.highlights.slice(0, 3).forEach((h) => ul.appendChild(el("li", "", h)));
            card.appendChild(ul);
        }

        if (Array.isArray(p.stack) && p.stack.length) {
            const tags = el("div", "tags");
            p.stack.slice(0, 8).forEach((t) => tags.appendChild(el("span", "tag", t)));
            card.appendChild(tags);
        }

        const linksRow = el("div", "project-links");
        if (p.links?.repo) linksRow.appendChild(safeLink("Repo", p.links.repo));
        if (p.links?.demo) linksRow.appendChild(safeLink("Live", p.links.demo));
        if (!p.links?.repo && !p.links?.demo) linksRow.appendChild(el("span", "muted small", "Add repo/demo links in data.js"));
        card.appendChild(linksRow);

        grid.appendChild(card);
    });
}

function renderExperience() {
    const timeline = $("timeline");
    timeline.innerHTML = "";

    data.experience.forEach((e) => {
        const item = el("div", "timeline-item reveal");

        item.appendChild(el("div", "time", e.period));

        const card = el("div", "card timeline-card");
        card.appendChild(el("h3", "", `${e.role} • ${e.org}`));
        card.appendChild(el("p", "", e.desc));

        item.appendChild(card);
        timeline.appendChild(item);
    });
}

function renderEducation() {
    const edu = data.education;

    const card = $("educationCard");
    card.innerHTML = "";
    card.appendChild(el("h3", "card-title", edu.degree));
    card.appendChild(el("p", "muted", edu.institute));
    card.appendChild(el("p", "muted", `${edu.period} • ${edu.score}`));

    const ul = el("ul", "list");
    edu.details.forEach((d) => ul.appendChild(el("li", "", d)));
    card.appendChild(ul);

    const achievements = $("achievements");
    achievements.innerHTML = "";
    data.achievements.forEach((a) => achievements.appendChild(el("li", "", a)));
}

function renderContact() {
    const list = $("contactList");
    list.innerHTML = "";

    const rows = [
        { k: "Email", v: data.person.email, href: `mailto:${data.person.email}` },
        { k: "Phone", v: data.person.phone, href: `tel:${data.person.phone.replace(/[^\d+]/g, "")}` },
        ...data.links.map((l) => ({ k: l.label, v: l.url.replace(/^https?:\/\//, ""), href: l.url })),
    ];

    rows.forEach((r) => {
        const row = el("div", "contact-row");
        row.appendChild(el("div", "k", r.k));
        const v = safeLink(r.v, r.href);
        v.target = r.href.startsWith("mailto:") || r.href.startsWith("tel:") ? "_self" : "_blank";
        list.appendChild(row);
        row.appendChild(v);
    });

    const mailBtn = $("mailBtn");
    mailBtn.href = `mailto:${data.person.email}?subject=${encodeURIComponent("Hello Aditi")}`;
}

function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = $("navLinks");
    if (!toggle || !links) return;

    const close = () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
    };

    toggle.addEventListener("click", () => {
        const open = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    links.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a) return;
        close();
    });

    document.addEventListener("click", (e) => {
        if (links.contains(e.target) || toggle.contains(e.target)) return;
        close();
    });
}

function initActiveNav() {
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sections = navLinks
        .map((a) => document.querySelector(a.getAttribute("href")))
        .filter(Boolean);

    const map = new Map(navLinks.map((a) => [a.getAttribute("href"), a]));

    const observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((e) => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;
            const id = `#${visible.target.id}`;
            map.forEach((a) => a.classList.remove("is-active"));
            map.get(id)?.classList.add("is-active");
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.2, 0.4] }
    );

    sections.forEach((s) => observer.observe(s));
}

function initReveal() {
    const items = Array.from(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.12 }
    );

    items.forEach((n) => observer.observe(n));
}

function initFilters() {
    const chips = Array.from(document.querySelectorAll(".chip[data-filter]"));
    const cards = () => Array.from(document.querySelectorAll(".project"));

    const setActive = (btn) => {
        chips.forEach((c) => c.classList.remove("is-active"));
        btn.classList.add("is-active");
    };

    const applyFilter = (filter) => {
        cards().forEach((card) => {
            const cat = card.dataset.category || "all";
            const show = filter === "all" || cat === filter;
            card.style.display = show ? "" : "none";
        });
    };

    chips.forEach((c) =>
        c.addEventListener("click", () => {
            const filter = c.dataset.filter;
            setActive(c);
            applyFilter(filter);
        })
    );
}

function initContactActions() {
    const toast = $("copyToast");
    const copyBtn = $("copyEmail");

    copyBtn?.addEventListener("click", async () => {
        const email = data.person.email;
        try {
            await navigator.clipboard.writeText(email);
            toast.textContent = "Email copied.";
        } catch {
            window.prompt("Copy email:", email);
            toast.textContent = "";
        }
        setTimeout(() => (toast.textContent = ""), 1800);
    });

    $("contactForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = form.elements.namedItem("name")?.value?.trim() || "Someone";
        const email = form.elements.namedItem("email")?.value?.trim() || "";
        const message = form.elements.namedItem("message")?.value?.trim() || "";

        const subject = `Portfolio contact from ${name}`;
        const bodyLines = [
            `Hi Aditi,`,
            "",
            message,
            "",
            `— ${name}`,
            email ? `(${email})` : "",
        ].filter(Boolean);

        const href = `mailto:${data.person.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
        window.location.href = href;
    });
}

function initFooter() {
    const year = $("year");
    if (year) year.textContent = String(new Date().getFullYear());
}

function initThemeToggle() {
    $("themeToggle")?.addEventListener("click", () => {
        const curr = document.documentElement.getAttribute("data-theme") || "dark";
        setTheme(curr === "dark" ? "light" : "dark");
    });
}

function init() {
    if (!data) return;
    initTheme();
    renderHero();
    renderSkills();
    renderProjects();
    renderExperience();
    renderEducation();
    renderContact();
    initNav();
    initActiveNav();
    initReveal();
    initFilters();
    initContactActions();
    initFooter();
    initThemeToggle();
}

document.addEventListener("DOMContentLoaded", init);

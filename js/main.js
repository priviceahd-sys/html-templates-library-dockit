/* ==========================================================================
   DOCKIT STATIQUE — js/main.js
   --------------------------------------------------------------------------
   Comportements globaux chargés sur TOUTES les pages :
     1. Thème sombre / clair (mémorisé dans localStorage)
     2. En-tête : fond opaque au défilement
     3. Menu mobile (burger + voile de fond)
     4. Menu déroulant « Référence » (au clic sur mobile)
     5. Sélecteur de langue EN ⇄ FR (miroir automatique de l'URL)
     6. Formulaire du pied de page (abonnement newsletter)
     7. Animations d'apparition au défilement (scroll reveal)
     8. Mise en évidence du lien de navigation actif
   ========================================================================== */

"use strict";

/* --------------------------------------------------------------------------
   1. THÈME SOMBRE / CLAIR
   --------------------------------------------------------------------------
   Stratégie :
     - Au chargement, on lit la préférence enregistrée dans localStorage
       (clé « dockit-theme »).
     - Si aucune préférence n'existe, on respecte celle du système
       d'exploitation (prefers-color-scheme).
     - Le thème est appliqué via l'attribut data-theme sur <html> :
       toutes les couleurs du site sont des variables CSS (voir base.css),
       donc un seul attribut suffit à basculer tout le thème.
     - Un petit script anti-scintillement (FOUC) est placé dans le <head>
       des pages HTML pour appliquer le thème AVANT le premier rendu.
   -------------------------------------------------------------------------- */

/** Clé utilisée pour mémoriser le choix de l'utilisateur. */
const THEME_STORAGE_KEY = "dockit-theme";

/**
 * Applique un thème à la page.
 * @param {"dark"|"light"} theme - Le thème à appliquer.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * Bascule entre le thème sombre et le thème clair,
 * puis mémorise le nouveau choix dans localStorage.
 */
function toggleTheme() {
  const current =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  const next = current === "light" ? "dark" : "light";

  applyTheme(next);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch (erreur) {
    /* localStorage peut être indisponible (navigation privée, file://
       sur certains navigateurs) : on ignore silencieusement. */
  }
}

/* Branchement du bouton thème de l'en-tête (icônes soleil/lune). */
const themeToggleBtn = document.getElementById("theme-toggle");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", toggleTheme);
}

/* --------------------------------------------------------------------------
   2. EN-TÊTE : FOND OPAQUE AU DÉFILEMENT
   --------------------------------------------------------------------------
   L'en-tête est transparent en haut de page, puis reçoit la classe
   .scrolled (fond + bordure) dès que l'on dépasse 10px de défilement.
   On utilise requestAnimationFrame pour ne pas saturer le navigateur.
   -------------------------------------------------------------------------- */
const siteHeader = document.getElementById("site-header");

let dernierScrollY = window.scrollY;
let scrollEnCours = false;

/** Met à jour la classe .scrolled de l'en-tête selon la position. */
function majHeaderScroll() {
  if (!siteHeader) return;
  const y = dernierScrollY;
  siteHeader.classList.toggle("scrolled", y > 10);
  scrollEnCours = false;
}

window.addEventListener(
  "scroll",
  () => {
    dernierScrollY = window.scrollY;
    if (!scrollEnCours) {
      scrollEnCours = true;
      window.requestAnimationFrame(majHeaderScroll);
    }
  },
  { passive: true } // Performance : on ne bloque pas le défilement
);

/* État initial (si la page est rechargée plus bas que le haut). */
majHeaderScroll();

/* --------------------------------------------------------------------------
   3. MENU MOBILE (BURGER)
   --------------------------------------------------------------------------
   Sous 1024px, la navigation principale (.main-nav) est un panneau qui
   glisse depuis la droite. Le burger l'ouvre, le voile de fond le ferme.
   La touche Échap le ferme également (accessibilité clavier).
   -------------------------------------------------------------------------- */
const menuToggleBtn = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");
const navBackdrop = document.getElementById("nav-backdrop");

/**
 * Ouvre ou ferme le menu mobile.
 * @param {boolean} ouvrir - true pour ouvrir, false pour fermer.
 */
function setMobileMenu(ouvrir) {
  if (!mainNav) return;
  mainNav.classList.toggle("open", ouvrir);
  if (navBackdrop) navBackdrop.classList.toggle("open", ouvrir);
  if (menuToggleBtn) {
    menuToggleBtn.setAttribute("aria-expanded", String(ouvrir));
  }
  /* Empêche le défilement de l'arrière-plan quand le menu est ouvert. */
  document.body.style.overflow = ouvrir ? "hidden" : "";
}

if (menuToggleBtn) {
  menuToggleBtn.addEventListener("click", () => {
    setMobileMenu(!mainNav.classList.contains("open"));
  });
}

if (navBackdrop) {
  navBackdrop.addEventListener("click", () => setMobileMenu(false));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMobileMenu(false);
});

/* Ferme le menu mobile quand on clique sur l'un de ses liens
   (expérience fluide après navigation vers une ancre, par exemple). */
if (mainNav) {
  mainNav.querySelectorAll("a").forEach((lien) => {
    lien.addEventListener("click", () => setMobileMenu(false));
  });
}

/* --------------------------------------------------------------------------
   4. MENU DÉROULANT « RÉFÉRENCE »
   --------------------------------------------------------------------------
   Desktop : ouverture au survol (gérée en CSS avec :hover).
   Mobile   : ouverture au clic — on bascule la classe .open sur le
   <li class="has-dropdown">, exactement comme le script du Header.astro
   d'origine.
   -------------------------------------------------------------------------- */
document.querySelectorAll(".has-dropdown > .nav-link").forEach((declencheur) => {
  declencheur.addEventListener("click", (event) => {
    /* Sur desktop le menu s'ouvre au survol : le clic doit naviguer.
       On n'intercepte donc le clic qu'en dessous de 1024px. */
    if (window.innerWidth >= 1024) return;
    event.preventDefault();
    const item = declencheur.closest(".has-dropdown");
    if (item) item.classList.toggle("open");
  });
});

/* --------------------------------------------------------------------------
   5. SÉLECTEUR DE LANGUE EN ⇄ FR
   --------------------------------------------------------------------------
   Principe du « miroir » :
     - Sur une page anglaise (ex. /docs/reference/plugin.html),
       le lien FR pointe vers /fr/docs/reference/plugin.html.
     - Sur une page française (commençant par /fr/), le lien EN
       retire simplement le préfixe /fr/.
   La langue de la page courante est portée par <html lang="…">.
   -------------------------------------------------------------------------- */
function configurerLiensLangue() {
  const langCourante = document.documentElement.lang || "en";
  const chemin = window.location.pathname;

  /* Chemin « miroir » dans l'autre langue. */
  let cheminMiroir;
  const segmentFr = "/fr/";
  if (chemin.includes(segmentFr)) {
    /* Page FR → version EN : on retire le préfixe fr/ */
    cheminMiroir = chemin.replace(segmentFr, "/");
  } else {
    /* Page EN → version FR : on insère le préfixe fr/ */
    const dernierSlash = chemin.lastIndexOf("/");
    cheminMiroir = chemin.slice(0, dernierSlash + 1) + "fr/" + chemin.slice(dernierSlash + 1);
    if (chemin.endsWith("/")) cheminMiroir += "index.html";
  }

  /* Les pages sans équivalent (404…) renvoient vers l'accueil miroir. */
  const liens = document.querySelectorAll("[data-lang-link]");
  liens.forEach((lien) => {
    const cible = lien.getAttribute("data-lang-link");
    if (cible === "fr") {
      lien.href = cheminMiroir;
    } else {
      /* EN : on retire le préfixe fr/ du chemin courant */
      lien.href = chemin.includes(segmentFr)
        ? chemin.replace(segmentFr, "/")
        : chemin;
    }
    /* Marque la langue active dans la pilule EN | FR. */
    lien.classList.toggle("active", cible === langCourante);
  });
}

configurerLiensLangue();

/* --------------------------------------------------------------------------
   6. FORMULAIRE DU PIED DE PAGE (NEWSLETTER)
   --------------------------------------------------------------------------
   Site 100 % statique : pas de serveur pour traiter l'e-mail.
   On intercepte l'envoi, on valide le format, et on affiche un message
   de confirmation (à brancher sur un vrai service — Mailchimp, Formspree,
   etc. — en remplaçant le corps de la fonction).
   -------------------------------------------------------------------------- */
document.querySelectorAll(".mail-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Bloque l'envoi réel (aucun backend ici)

    const input = form.querySelector('input[type="email"]');
    const feedback = form.parentElement?.querySelector(".mail-form-feedback");
    const email = input?.value.trim() ?? "";

    /* Validation simple du format de l'adresse e-mail. */
    const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (feedback) {
      if (emailValide) {
        const estFr = document.documentElement.lang === "fr";
        feedback.textContent = estFr
          ? "Merci ! Votre inscription a bien été enregistrée."
          : "Thank you! Your subscription has been recorded.";
        form.reset();
      } else {
        const estFr = document.documentElement.lang === "fr";
        feedback.textContent = estFr
          ? "Veuillez saisir une adresse e-mail valide."
          : "Please enter a valid email address.";
      }
      /* Le message disparaît après 5 secondes. */
      window.setTimeout(() => (feedback.textContent = ""), 5000);
    }
  });
});

/* --------------------------------------------------------------------------
   7. ANIMATIONS D'APPARITION AU DÉFILEMENT (SCROLL REVEAL)
   --------------------------------------------------------------------------
   Tous les éléments portant la classe .reveal sont observés : dès qu'ils
   entrent dans le viewport, on leur ajoute .visible (fondu + glissement,
   définis dans base.css). Chaque élément n'est animé qu'une seule fois.
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  /* Si le navigateur ne supporte pas IntersectionObserver (très ancien),
     on affiche tout immédiatement. */
  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observateur = new IntersectionObserver(
    (entrees, obs) => {
      entrees.forEach((entree) => {
        if (entree.isIntersecting) {
          entree.target.classList.add("visible");
          obs.unobserve(entree.target); // Une seule animation par élément
        }
      });
    },
    {
      threshold: 0.12,          /* Déclenche quand 12 % de l'élément est visible */
      rootMargin: "0px 0px -40px 0px",
    }
  );

  elements.forEach((el) => observateur.observe(el));
}

initScrollReveal();

/* --------------------------------------------------------------------------
   8. LIEN DE NAVIGATION ACTIF
   --------------------------------------------------------------------------
   Compare l'URL de chaque lien du menu principal avec la page courante
   et ajoute la classe .active au lien correspondant (surbrillance primaire).
   -------------------------------------------------------------------------- */
function initNavActive() {
  const cheminCourant = window.location.pathname
    .replace(/\/index\.html$/, "/")
    .replace(/\.html$/, "");

  document.querySelectorAll(".main-nav .nav-link[href]").forEach((lien) => {
    const href = lien.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    /* Résout le href relativement à la page pour comparer proprement. */
    const urlLien = new URL(href, window.location.href).pathname
      .replace(/\/index\.html$/, "/")
      .replace(/\.html$/, "");

    if (urlLien === cheminCourant) {
      lien.classList.add("active");
    }
  });
}

initNavActive();

/* --------------------------------------------------------------------------
   Exposition publique : js/search.js réutilise applyTheme et le raccourci
   Ctrl+K est initialisé dans search.js. On exporte via window pour rester
   compatible avec des scripts classiques (pas de modules ES ici, afin que
   le site fonctionne aussi en ouverture directe file://).
   -------------------------------------------------------------------------- */
window.DockitTheme = { applyTheme, toggleTheme, THEME_STORAGE_KEY };

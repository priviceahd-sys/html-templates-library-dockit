/* ==========================================================================
   DOCKIT STATIQUE — js/home.js
   --------------------------------------------------------------------------
   Interactions propres à la PAGE D'ACCUEIL (index.html / fr/index.html) :
     1. Onglets « Démarrer en 3 étapes » (section HeroTabs)
     2. FAQ : onglets de catégories + accordéons questions/réponses
     3. Démo visuelle du thème sombre/clair (gros interrupteur)

   Chaque bloc vérifie la présence de ses éléments dans le DOM avant
   d'agir : ce script peut donc être chargé sur toutes les pages sans
   risque d'erreur (il ne fait rien hors de la page d'accueil).
   ========================================================================== */

"use strict";

/* --------------------------------------------------------------------------
   1. ONGLETS « DÉMARRER EN 3 ÉTAPES »
   --------------------------------------------------------------------------
   Structure HTML attendue :
     <div class="steps-nav">   → boutons .step-tab (data-step="1|2|3")
     <div class="steps-content">→ panneaux .step-panel (data-step="1|2|3")

   Au clic sur un bouton :
     - tous les boutons passent à aria-selected="false"
     - le bouton cliqué devient sélectionné (barre de dégradé en CSS)
     - seul le panneau correspondant reste affiché (classe .active)
   Navigation clavier incluse (flèches ← →) pour l'accessibilité.
   -------------------------------------------------------------------------- */
function initStepsTabs() {
  const boutons = document.querySelectorAll(".step-tab");
  const panneaux = document.querySelectorAll(".step-panel");
  if (!boutons.length || !panneaux.length) return;

  /**
   * Active l'onglet dont le numéro est passé en paramètre.
   * @param {string} numero - "1", "2" ou "3" (attribut data-step).
   */
  function activerOnglet(numero) {
    boutons.forEach((btn) => {
      const actif = btn.dataset.step === numero;
      btn.setAttribute("aria-selected", String(actif));
      /* Gestion du tabindex : seul l'onglet actif est atteignable avec
         Tab, les autres se naviguent avec les flèches (pattern WAI-ARIA). */
      btn.tabIndex = actif ? 0 : -1;
    });

    panneaux.forEach((panneau) => {
      panneau.classList.toggle("active", panneau.dataset.step === numero);
    });
  }

  /* Clic sur un onglet. */
  boutons.forEach((btn) => {
    btn.addEventListener("click", () => activerOnglet(btn.dataset.step));
  });

  /* Navigation au clavier : flèches gauche/droite (et haut/bas en colonne). */
  boutons.forEach((btn, index) => {
    btn.addEventListener("keydown", (event) => {
      const touches = {
        ArrowRight: 1,
        ArrowDown: 1,
        ArrowLeft: -1,
        ArrowUp: -1,
      };
      if (!(event.key in touches)) return;
      event.preventDefault();

      /* Calcul circulaire : après le dernier onglet, on revient au premier. */
      const suivant =
        (index + touches[event.key] + boutons.length) % boutons.length;
      boutons[suivant].focus();
      activerOnglet(boutons[suivant].dataset.step);
    });
  });

  /* Premier onglet actif par défaut. */
  activerOnglet("1");
}

/* --------------------------------------------------------------------------
   2. FAQ — ONGLETS DE CATÉGORIES + ACCORDÉONS
   --------------------------------------------------------------------------
   a) Trois catégories (« Premiers pas », « Paramètres », « Aide »).
      Chaque accordéon porte un attribut data-tab qui indique sa catégorie.
      Cliquer sur une catégorie masque les accordéons des autres catégories
      (attribut data-hidden="true" → display: none en CSS).

   b) Chaque accordéon s'ouvre/se ferme au clic sur son en-tête :
      la classe .open anime le corps (grid-template-rows 0fr → 1fr)
      et transforme l'icône « + » en « − ».
      Un seul accordéon ouvert à la fois par catégorie (comportement
      « accordéon » classique), mais le premier reste ouvert par défaut.
   -------------------------------------------------------------------------- */
function initFaq() {
  const onglets = document.querySelectorAll(".faq-tab");
  const accordeons = document.querySelectorAll(".accordion[data-tab]");
  if (!onglets.length || !accordeons.length) return;

  /**
   * Affiche uniquement les accordéons de la catégorie demandée.
   * @param {string} categorie - Valeur de data-tab ("basic", "setting"…).
   */
  function afficherCategorie(categorie) {
    /* 1. Met à jour l'état visuel des onglets de catégorie. */
    onglets.forEach((onglet) => {
      const actif = onglet.dataset.tab === categorie;
      onglet.classList.toggle("active", actif);
      onglet.setAttribute("aria-selected", String(actif));
    });

    /* 2. Filtre les accordéons : cache ceux des autres catégories. */
    let premierVisible = null;
    accordeons.forEach((acc) => {
      const visible = acc.dataset.tab === categorie;
      acc.dataset.hidden = String(!visible);

      if (visible) {
        /* Referme tous les accordéons de la catégorie… */
        acc.classList.remove("open");
        const bouton = acc.querySelector(".accordion-header");
        if (bouton) bouton.setAttribute("aria-expanded", "false");
        if (!premierVisible) premierVisible = acc;
      }
    });

    /* 3. …puis ouvre le premier pour que la section ne paraisse pas vide. */
    if (premierVisible) {
      premierVisible.classList.add("open");
      const bouton = premierVisible.querySelector(".accordion-header");
      if (bouton) bouton.setAttribute("aria-expanded", "true");
    }
  }

  /* Clic sur un onglet de catégorie. */
  onglets.forEach((onglet) => {
    onglet.addEventListener("click", () => afficherCategorie(onglet.dataset.tab));
  });

  /* Clic sur l'en-tête d'un accordéon : ouvre/ferme (et ferme les autres
     de la même catégorie pour garder une lecture aérée). */
  accordeons.forEach((acc) => {
    const entete = acc.querySelector(".accordion-header");
    if (!entete) return;

    entete.addEventListener("click", () => {
      const dejaOuvert = acc.classList.contains("open");

      /* Referme tous les accordéons visibles de la catégorie courante. */
      accordeons.forEach((autre) => {
        if (autre.dataset.hidden === "false") {
          autre.classList.remove("open");
          autre
            .querySelector(".accordion-header")
            ?.setAttribute("aria-expanded", "false");
        }
      });

      /* Si celui-ci était fermé, on l'ouvre. */
      if (!dejaOuvert) {
        acc.classList.add("open");
        entete.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Catégorie affichée au chargement : la première (data-tab="basic"). */
  afficherCategorie(onglets[0].dataset.tab);
}

/* --------------------------------------------------------------------------
   3. DÉMO VISUELLE DU THÈME (gros interrupteur)
   --------------------------------------------------------------------------
   Reproduit ThemeDemo.astro : un interrupteur flottant au-dessus de deux
   captures d'écran (mode sombre / mode clair). Cliquer dessus :
     - fait glisser le bouton de l'interrupteur (classe .active)
     - inverse l'image mise en avant (classe .dimmed à 20 % d'opacité)
   ATTENTION : c'est une pure démonstration visuelle — elle ne change PAS
   le thème réel du site (c'est le rôle du bouton lune/soleil de l'en-tête,
   géré dans main.js).
   -------------------------------------------------------------------------- */
function initThemeDemo() {
  const interrupteur = document.getElementById("theme-demo-toggle");
  const conteneurImages = document.getElementById("theme-demo-images");
  if (!interrupteur || !conteneurImages) return;

  interrupteur.addEventListener("click", () => {
    /* 1. Fait glisser le bouton de l'interrupteur. */
    interrupteur.classList.toggle("active");

    /* 2. Inverse l'opacité des deux captures d'écran. */
    const imageSombre = conteneurImages.querySelector(".dark-image");
    const imageClaire = conteneurImages.querySelector(".light-image");
    imageSombre?.classList.toggle("dimmed");
    imageClaire?.classList.toggle("dimmed");
  });
}

/* --------------------------------------------------------------------------
   Initialisation de toutes les interactions de la page d'accueil.
   Le script est chargé en fin de <body> : le DOM est déjà prêt.
   -------------------------------------------------------------------------- */
initStepsTabs();
initFaq();
initThemeDemo();

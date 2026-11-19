/* ==========================================================================
   DOCKIT STATIQUE — js/docs.js
   --------------------------------------------------------------------------
   Interactions propres aux PAGES DE DOCUMENTATION (docs/*.html) :
     1. Sidebar : groupes/sous-groupes repliables + tiroir mobile
     2. Table des matières : indicateur de lecture (scrollspy)
     3. Blocs de code : bouton « Copier » ajouté dynamiquement
     4. Onglets de code (npm / pnpm / yarn)
   --------------------------------------------------------------------------
   Comme home.js, chaque fonction vérifie la présence des éléments :
   le script est inoffensif sur les pages qui n'en contiennent pas.
   ========================================================================== */

"use strict";

/* --------------------------------------------------------------------------
   1. SIDEBAR DE NAVIGATION
   --------------------------------------------------------------------------
   a) Groupes repliables : cliquer sur un titre de groupe (ou de
      sous-groupe) ajoute/retire la classe .collapsed qui masque la liste
      et fait pivoter la flèche (tout est géré en CSS dans docs.css).

   b) État initial intelligent : tous les groupes sont ouverts, SAUF
      repli automatique des groupes qui ne contiennent pas la page active,
      pour garder une sidebar lisible.

   c) Mobile : la sidebar est un tiroir qui glisse depuis la gauche.
      Le bouton flottant « Sommaire » l'ouvre, le voile de fond le ferme.
   -------------------------------------------------------------------------- */
function initSidebar() {
  const sidebar = document.getElementById("docs-sidebar");
  if (!sidebar) return;

  /* --- a) Titres repliables ------------------------------------------------ */
  sidebar.querySelectorAll(".sidebar-group-title, .sidebar-sub-title").forEach((titre) => {
    titre.addEventListener("click", () => {
      /* Le conteneur à replier : le groupe pour un titre principal,
         le sous-groupe pour un sous-titre. */
      const conteneur =
        titre.closest(".sidebar-subgroup") || titre.closest(".sidebar-group");
      if (!conteneur) return;

      const replie = conteneur.classList.toggle("collapsed");
      titre.setAttribute("aria-expanded", String(!replie));
    });
  });

  /* --- b) Repli automatique des groupes inactifs --------------------------- */
  const lienActif = sidebar.querySelector(".sidebar-link.active");
  if (lienActif) {
    /* Garde ouverts uniquement les groupes menant à la page courante. */
    sidebar.querySelectorAll(".sidebar-group").forEach((groupe) => {
      if (!groupe.contains(lienActif)) {
        groupe.classList.add("collapsed");
        groupe
          .querySelector(".sidebar-group-title")
          ?.setAttribute("aria-expanded", "false");
      }
    });
    /* Fait défiler la sidebar pour que le lien actif soit visible. */
    lienActif.scrollIntoView({ block: "nearest" });
  }

  /* --- c) Tiroir mobile ----------------------------------------------------- */
  const boutonOuvrir = document.getElementById("sidebar-open-btn");
  const voile = document.getElementById("sidebar-backdrop");

  /**
   * Ouvre ou ferme le tiroir de la sidebar sur mobile.
   * @param {boolean} ouvrir
   */
  function setSidebar(ouvrir) {
    sidebar.classList.toggle("open", ouvrir);
    voile?.classList.toggle("open", ouvrir);
    document.body.style.overflow = ouvrir ? "hidden" : "";
    boutonOuvrir?.setAttribute("aria-expanded", String(ouvrir));
  }

  boutonOuvrir?.addEventListener("click", () => setSidebar(true));
  voile?.addEventListener("click", () => setSidebar(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSidebar(false);
  });

  /* Ferme le tiroir dès qu'on choisit une page. */
  sidebar.querySelectorAll("a").forEach((lien) => {
    lien.addEventListener("click", () => setSidebar(false));
  });
}

/* --------------------------------------------------------------------------
   2. TABLE DES MATIÈRES — SCROLLSPY
   --------------------------------------------------------------------------
   Pendant la lecture, le titre de section actuellement visible est
   surligné dans la colonne de droite (« On this page »).

   Technique : un IntersectionObserver surveille tous les titres h2/h3
   du contenu. À chaque changement, on sélectionne le titre le plus proche
   du haut de l'écran parmi ceux qui sont visibles, et on active le lien
   de la table des matières qui pointe vers son id (#…).
   -------------------------------------------------------------------------- */
function initTocScrollspy() {
  const listeToc = document.getElementById("toc-list");
  const contenu = document.querySelector(".docs-content");
  if (!listeToc || !contenu) return;

  const titres = contenu.querySelectorAll("h2[id], h3[id]");
  const liensToc = listeToc.querySelectorAll("a");
  if (!titres.length || !liensToc.length) return;

  /** Ensemble des titres actuellement visibles dans le viewport. */
  const titresVisibles = new Set();

  /** Surligne le lien de la table des matières correspondant à un titre. */
  function activerLien(id) {
    liensToc.forEach((lien) => {
      const actif = lien.getAttribute("href") === `#${id}`;
      lien.classList.toggle("active", actif);
    });
  }

  /** Choisit le titre « courant » : le premier visible dans le DOM. */
  function majTitreCourant() {
    for (const titre of titres) {
      if (titresVisibles.has(titre)) {
        activerLien(titre.id);
        return;
      }
    }
    /* Aucun titre visible : on garde la dernière position connue
       (comportement naturel en fin de page, par exemple). */
  }

  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (entree.isIntersecting) {
          titresVisibles.add(entree.target);
        } else {
          titresVisibles.delete(entree.target);
        }
      });
      majTitreCourant();
    },
    {
      /* Zone de détection : bande horizontale en haut de l'écran, sous
         l'en-tête fixe. Un titre qui la traverse devient « courant ». */
      rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) + 20}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  titres.forEach((titre) => observateur.observe(titre));

  /* Clic sur un lien de la table des matières : activation immédiate
     (le défilement doux, lui, est géré par scroll-behavior en CSS). */
  liensToc.forEach((lien) => {
    lien.addEventListener("click", () => {
      activerLien(linkId(decodeURIComponent(lien.getAttribute("href"))));
    });
  });

  /** Retire le « # » d'un href d'ancre. */
  function linkId(href) {
    return href.replace(/^#/, "");
  }
}

/* --------------------------------------------------------------------------
   3. BOUTONS « COPIER » DES BLOCS DE CODE
   --------------------------------------------------------------------------
   Pour chaque <pre> du contenu, on enveloppe le bloc dans un conteneur
   .code-block-wrap et on ajoute un petit bouton qui copie le texte dans
   le presse-papiers (API navigator.clipboard, avec repli execCommand
   pour les contextes file:// où l'API moderne peut être bloquée).
   -------------------------------------------------------------------------- */
function initCopyButtons() {
  const blocs = document.querySelectorAll(".docs-content pre");
  if (!blocs.length) return;

  const estFr = document.documentElement.lang === "fr";

  blocs.forEach((pre) => {
    /* Ignore les blocs déjà enveloppés (double exécution du script). */
    if (pre.parentElement?.classList.contains("code-block-wrap")) return;

    /* Création du conteneur et déplacement du <pre> à l'intérieur. */
    const wrap = document.createElement("div");
    wrap.className = "code-block-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    /* Création du bouton. */
    const bouton = document.createElement("button");
    bouton.className = "copy-btn";
    bouton.type = "button";
    bouton.setAttribute(
      "aria-label",
      estFr ? "Copier le code" : "Copy code"
    );
    bouton.innerHTML = estFr ? "Copier" : "Copy";
    wrap.appendChild(bouton);

    bouton.addEventListener("click", async () => {
      const texte = pre.innerText;

      try {
        /* Méthode moderne (HTTPS ou localhost). */
        await navigator.clipboard.writeText(texte);
      } catch (erreur) {
        /* Repli pour file:// ou navigateurs sans API clipboard :
           zone de texte temporaire + execCommand("copy"). */
        const zone = document.createElement("textarea");
        zone.value = texte;
        zone.style.position = "fixed";
        zone.style.opacity = "0";
        document.body.appendChild(zone);
        zone.select();
        document.execCommand("copy");
        zone.remove();
      }

      /* Retour visuel : « Copié ! » en vert pendant 2 secondes. */
      bouton.classList.add("copied");
      bouton.textContent = estFr ? "Copié ✓" : "Copied ✓";
      window.setTimeout(() => {
        bouton.classList.remove("copied");
        bouton.textContent = estFr ? "Copier" : "Copy";
      }, 2000);
    });
  });
}

/* --------------------------------------------------------------------------
   4. ONGLETS DE CODE (npm / pnpm / yarn)
   --------------------------------------------------------------------------
   Structure générée par le script Python :
     <div class="code-tabs">
       <div class="code-tabs-nav">
         <button class="code-tab-btn active" data-panel="p1">npm</button>…
       </div>
       <div class="code-tab-panel active" id="p1">…bloc de code…</div>…
     </div>
   Un clic sur un bouton affiche le panneau correspondant (et lui seul).
   -------------------------------------------------------------------------- */
function initCodeTabs() {
  document.querySelectorAll(".code-tabs").forEach((groupe) => {
    const boutons = groupe.querySelectorAll(".code-tab-btn");
    const panneaux = groupe.querySelectorAll(".code-tab-panel");

    boutons.forEach((bouton) => {
      bouton.addEventListener("click", () => {
        /* Désactive tout… */
        boutons.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        panneaux.forEach((p) => p.classList.remove("active"));

        /* …puis active le bouton cliqué et son panneau. */
        bouton.classList.add("active");
        bouton.setAttribute("aria-selected", "true");
        const panneau = groupe.querySelector(`#${bouton.dataset.panel}`);
        panneau?.classList.add("active");
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. ACCORDÉONS AUTONOMES (exemples de la documentation)
   --------------------------------------------------------------------------
   Certaines pages de doc contiennent des accordéons isolés (composant
   <Accordion> converti par le générateur). Sans onglets de catégorie
   (.faq-tab), on leur attache simplement le comportement ouvrir/fermer.
   -------------------------------------------------------------------------- */
function initStandaloneAccordions() {
  /* Ne s'active que si la FAQ de la page d'accueil n'est pas présente
     (sinon c'est js/home.js qui gère tout). */
  if (document.querySelector(".faq-tabs")) return;

  document.querySelectorAll(".accordion .accordion-header").forEach((entete) => {
    entete.addEventListener("click", () => {
      const acc = entete.closest(".accordion");
      const ouvert = acc.classList.toggle("open");
      entete.setAttribute("aria-expanded", String(ouvert));
    });
  });
}

/* --------------------------------------------------------------------------
   Initialisation de toutes les interactions des pages de documentation.
   -------------------------------------------------------------------------- */
initSidebar();
initTocScrollspy();
initCopyButtons();
initCodeTabs();
initStandaloneAccordions();

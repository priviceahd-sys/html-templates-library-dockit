/* ==========================================================================
   DOCKIT STATIQUE — js/search.js
   --------------------------------------------------------------------------
   Moteur de recherche 100 % côté client (aucun serveur nécessaire) :
     1. L'index de recherche est embarqué dans js/search-index.js
        (tableau window.SEARCH_INDEX généré par build/generate_site.py).
     2. Une modale s'ouvre : clic sur un déclencheur [data-search-open],
        raccourci clavier Ctrl+K (ou Cmd+K sur Mac), touche « / ».
     3. Les résultats sont filtrés par langue (page EN → index EN) puis
        classés par pertinence (titre > description > contenu).
     4. Navigation clavier complète : ↑ ↓ pour choisir, Entrée pour
        ouvrir, Échap pour fermer.
   --------------------------------------------------------------------------
   Pourquoi un index embarqué plutôt qu'un fetch('index.json') ?
   Pour que la recherche fonctionne aussi en ouvrant les fichiers
   directement (file://), où fetch est bloqué par les navigateurs.
   ========================================================================== */

"use strict";

/* --------------------------------------------------------------------------
   Récupération des éléments du DOM (la modale est présente sur toutes
   les pages, générée par le gabarit HTML).
   -------------------------------------------------------------------------- */
const modale = document.getElementById("search-modal");
const champ = document.getElementById("search-input");
const listeResultats = document.getElementById("search-results");

/* Index de recherche : défini par js/search-index.js (chargé avant ce fichier). */
const INDEX = window.SEARCH_INDEX || [];

/* Racine du site (déduite de l'URL de search-index.js) : les URL de
   l'index sont relatives à la racine, on les préfixe pour obtenir des
   liens valables quelle que soit la profondeur de la page courante. */
const RACINE = window.SEARCH_ROOT || "";

/* Traductions des libellés selon la langue de la page courante. */
const TEXTES = {
  en: {
    placeholder: "Search documentation…",
    empty: "No results found. Try different keywords.",
    hintNav: "to navigate",
    hintOpen: "to open",
    hintClose: "to close",
    articles: "documentation pages indexed",
  },
  fr: {
    placeholder: "Rechercher dans la documentation…",
    empty: "Aucun résultat. Essayez d'autres mots-clés.",
    hintNav: "pour naviguer",
    hintOpen: "pour ouvrir",
    hintClose: "pour fermer",
    articles: "pages de documentation indexées",
  },
};

const LANGUE = document.documentElement.lang === "fr" ? "fr" : "en";
const T = TEXTES[LANGUE];

/* --------------------------------------------------------------------------
   1. OUVERTURE / FERMETURE DE LA MODALE
   -------------------------------------------------------------------------- */
let resultatSelectionne = -1; // Index du résultat surligné au clavier

/** Ouvre la modale de recherche et place le curseur dans le champ. */
function ouvrirRecherche() {
  if (!modale) return;
  modale.hidden = false;
  document.body.style.overflow = "hidden"; // Bloque le défilement du fond
  champ?.focus();
  /* Affiche l'état initial : compteur de pages indexées. */
  afficherEtatInitial();
}

/** Ferme la modale et réinitialise le champ. */
function fermerRecherche() {
  if (!modale) return;
  modale.hidden = true;
  document.body.style.overflow = "";
  if (champ) champ.value = "";
  resultatSelectionne = -1;
}

/* Tous les déclencheurs : bouton loupe de l'en-tête, barre du héros… */
document.querySelectorAll("[data-search-open]").forEach((el) => {
  el.addEventListener("click", (event) => {
    event.preventDefault();
    ouvrirRecherche();
  });
});

/* Clic sur le voile de fond → fermeture. */
modale?.querySelector(".search-modal-backdrop")?.addEventListener("click", fermerRecherche);

/* Raccourcis clavier globaux :
     - Ctrl+K ou Cmd+K → ouvre la recherche (standard des sites de doc)
     - Échap           → ferme la modale */
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    modale?.hidden ? ouvrirRecherche() : fermerRecherche();
    return;
  }
  if (event.key === "Escape" && modale && !modale.hidden) {
    fermerRecherche();
  }
});

/* --------------------------------------------------------------------------
   2. FILTRAGE ET CLASSEMENT DES RÉSULTATS
   --------------------------------------------------------------------------
   Algorithme simple et lisible (pas de bibliothèque externe) :
     - On découpe la requête en mots (minuscules, sans accents).
     - Une page est retenue si TOUS les mots apparaissent dans son
       titre, sa description ou son extrait de contenu.
     - Score de pertinence :
         +100 par mot trouvé dans le titre
         +30  par mot trouvé dans la description
         +5   par mot trouvé dans le contenu
       (bonus si le titre COMPILE par la requête).
     - Les 8 meilleurs résultats sont affichés.
   -------------------------------------------------------------------------- */

/** Retire les accents et passe en minuscules (comparaisons robustes). */
function normaliser(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Recherche les pages correspondant à une requête, dans la langue courante.
 * @param {string} requete - Texte saisi par l'utilisateur.
 * @returns {Array<{page: object, score: number}>} Résultats triés par score.
 */
function rechercher(requete) {
  const mots = normaliser(requete)
    .split(/\s+/)
    .filter((mot) => mot.length > 0);

  if (!mots.length) return [];

  const resultats = [];

  for (const page of INDEX) {
    /* Filtre par langue : une page EN ne remonte pas sur la version FR. */
    if (page.lang !== LANGUE) continue;

    const titre = normaliser(page.title || "");
    const description = normaliser(page.desc || "");
    const contenu = normaliser(page.body || "");

    let score = 0;
    let tousTrouves = true;

    for (const mot of mots) {
      let trouveIci = false;

      if (titre.includes(mot)) {
        score += 100;
        trouveIci = true;
      }
      if (description.includes(mot)) {
        score += 30;
        trouveIci = true;
      }
      if (contenu.includes(mot)) {
        score += 5;
        trouveIci = true;
      }

      if (!trouveIci) {
        tousTrouves = false;
        break; // Un mot absent → la page ne correspond pas
      }
    }

    /* Bonus : le titre commence exactement par la requête. */
    if (tousTrouves && titre.startsWith(normaliser(requete))) {
      score += 50;
    }

    if (tousTrouves && score > 0) {
      resultats.push({ page, score });
    }
  }

  /* Tri décroissant par score, puis on garde les 8 meilleurs. */
  return resultats.sort((a, b) => b.score - a.score).slice(0, 8);
}

/* --------------------------------------------------------------------------
   3. AFFICHAGE DES RÉSULTATS
   -------------------------------------------------------------------------- */

/** Construit un « chemin » lisible à partir de l'URL (fil d'Ariane). */
function cheminLisible(url) {
  return url
    .replace(/^[./]+/, "")
    .replace(/\.html$/, "")
    .replace(/\//g, " › ");
}

/** Affiche l'écran d'accueil de la modale (avant toute saisie). */
function afficherEtatInitial() {
  if (!listeResultats) return;
  const nbPages = INDEX.filter((p) => p.lang === LANGUE).length;
  listeResultats.innerHTML = `
    <div class="search-empty">
      ${nbPages} ${T.articles}<br>
      <small>Ctrl + K</small>
    </div>`;
}

/**
 * Affiche les résultats d'une requête dans la modale.
 * @param {string} requete - Texte saisi.
 */
function afficherResultats(requete) {
  if (!listeResultats) return;
  resultatSelectionne = -1;

  if (!requete.trim()) {
    afficherEtatInitial();
    return;
  }

  const resultats = rechercher(requete);

  if (!resultats.length) {
    listeResultats.innerHTML = `<div class="search-empty">${T.empty}</div>`;
    return;
  }

  listeResultats.innerHTML = resultats
    .map(
      ({ page }, index) => `
      <a class="search-result" href="${RACINE}${page.url}" data-index="${index}">
        <span class="search-result-title">${page.title}</span>
        <span class="search-result-path">${cheminLisible(page.url)}</span>
        <span class="search-result-snippet">${page.desc || ""}</span>
      </a>`
    )
    .join("");
}

/* Saisie dans le champ → résultats en direct (avec anti-rebond de 120 ms
   pour ne pas recalculer à chaque frappe). */
let minuteur;
champ?.addEventListener("input", () => {
  window.clearTimeout(minuteur);
  minuteur = window.setTimeout(() => afficherResultats(champ.value), 120);
});

/* --------------------------------------------------------------------------
   4. NAVIGATION CLAVIER DANS LES RÉSULTATS
   --------------------------------------------------------------------------
   ↑ / ↓ déplacent la sélection (classe .selected), Entrée ouvre la page
   sélectionnée (ou le premier résultat si rien n'est sélectionné).
   -------------------------------------------------------------------------- */
champ?.addEventListener("keydown", (event) => {
  const liens = listeResultats?.querySelectorAll(".search-result") || [];
  if (!liens.length) return;

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const sens = event.key === "ArrowDown" ? 1 : -1;

    /* Déplacement circulaire dans la liste des résultats. */
    resultatSelectionne =
      (resultatSelectionne + sens + liens.length) % liens.length;

    liens.forEach((lien, i) =>
      lien.classList.toggle("selected", i === resultatSelectionne)
    );
    /* Garde le résultat sélectionné visible dans la liste scrollable. */
    liens[resultatSelectionne].scrollIntoView({ block: "nearest" });
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const cible = liens[resultatSelectionne] || liens[0];
    if (cible) window.location.href = cible.getAttribute("href");
  }
});

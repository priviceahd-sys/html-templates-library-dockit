# DocKit — Version statique HTML / CSS / JS

Portage **100 % statique** du thème de documentation [DocKit Astro](https://themefisher.com/)
(Astro + Starlight + Tailwind CSS) en **HTML, CSS et JavaScript purs**,
sans framework, sans compilation et sans dépendance externe.

Le site est **bilingue** (anglais + français), avec **mode sombre / clair**,
**recherche intégrée** et toute la documentation d'origine convertie.

> ✨ Ouvrez simplement `index.html` dans un navigateur — aucun serveur n'est
> nécessaire (tous les liens sont relatifs). Pour un rendu idéal des polices
> Google Fonts, une connexion Internet est utilisée, avec repli automatique
> sur les polices système hors ligne.

---

## 📁 Organisation du projet

```
dockit-static/
│
├── index.html                     ← Page d'accueil (anglais)
├── 404.html                       ← Page d'erreur (anglais)
├── about.html                     ← Page « À propos »
├── privacy-policy.html            ← Politique de confidentialité
├── terms-conditions.html          ← Conditions d'utilisation
│
├── fr/                            ← MIROIR FRANÇAIS complet
│   ├── index.html                 ← Page d'accueil (français)
│   ├── 404.html, about.html, privacy-policy.html, terms-conditions.html
│   └── docs/…                     ← Toute la documentation traduite
│
├── docs/                          ← Documentation (anglais)
│   ├── getting-started/           ← Démarrage (introduction, réglages, navigation)
│   ├── contents/                  ← Contenu (composants, édition)
│   ├── configurations/            ← Configurations (domaine, GitHub, CSS/JS)
│   └── reference/                 ← Référence (configuration, plugins)
│
├── css/                           ← FEUILLES DE STYLE (commentées en détail)
│   ├── base.css                   ← Variables du thème (couleurs, polices),
│   │                                 reset navigateur, typographie, utilitaires
│   ├── layout.css                 ← En-tête fixe, menu mobile, héros,
│   │                                 sections, CTA, pied de page
│   ├── components.css             ← Boutons, cartes, cartes-listes, onglets,
│   │                                 accordéons FAQ, démo de thème, modale
│   │                                 de recherche, badges
│   └── docs.css                   ← Pages de documentation : sidebar,
│                                     contenu « prose », blocs de code colorés,
│                                     table des matières, pagination
│
├── js/                            ← SCRIPTS (commentés en détail)
│   ├── main.js                    ← Thème sombre/clair (localStorage),
│   │                                 en-tête au défilement, menu mobile,
│   │                                 menu déroulant, sélecteur de langue,
│   │                                 formulaire newsletter, scroll reveal
│   ├── home.js                    ← Page d'accueil : onglets « 3 étapes »,
│   │                                 FAQ (catégories + accordéons),
│   │                                 démo visuelle du thème
│   ├── docs.js                    ← Documentation : sidebar repliable +
│   │                                 tiroir mobile, scrollspy de la table
│   │                                 des matières, boutons « Copier » des
│   │                                 blocs de code, onglets npm/pnpm/yarn
│   ├── search.js                  ← Moteur de recherche client : modale,
│   │                                 raccourci Ctrl+K, filtrage par langue,
│   │                                 score de pertinence, navigation clavier
│   └── search-index.js            ← Index de recherche (GÉNÉRÉ — ne pas
│                                     modifier à la main)
│
├── assets/
│   └── images/                    ← Logos, fonds, captures, icônes SVG
│
└── build/
    └── generate_site.py           ← Script Python qui régénère les pages de
                                      documentation depuis les Markdown du
                                      thème Astro d'origine (facultatif)
```

---

## 🎨 Personnaliser le thème

Tout se passe dans **`css/base.css`** : les couleurs, polices, rayons et
espacements sont des **variables CSS** définies dans `:root` (mode sombre)
et `[data-theme="light"]` (mode clair).

```css
:root {
  --color-primary: #d76d77;   /* ← changez la couleur de marque ici */
  --bg-body: #0d0d0d;         /* ← fond du mode sombre */
  --bg-card: #151515;         /* ← fond des cartes */
  …
}
```

| Je veux…                          | J'ouvre…                              |
|-----------------------------------|----------------------------------------|
| Changer les couleurs / polices    | `css/base.css` (variables)             |
| Modifier l'en-tête ou le pied de page | `css/layout.css` + le HTML de chaque page |
| Modifier les cartes / boutons / FAQ   | `css/components.css`                   |
| Modifier la sidebar ou le style du texte de doc | `css/docs.css`          |
| Changer les menus                 | le `<nav>` et le `<footer>` dans les fichiers `.html` |
| Comprendre le changement de thème | `js/main.js` (section 1)               |
| Adapter la recherche              | `js/search.js` + `js/search-index.js`  |

---

## 🔁 Régénérer la documentation (facultatif)

Les pages `docs/**.html` et `fr/docs/**.html`, ainsi que l'index de
recherche, sont produits par `build/generate_site.py` à partir des fichiers
Markdown du thème Astro d'origine. Pour relancer la génération :

```bash
pip install markdown pyyaml pygments
python3 build/generate_site.py
```

Le script est entièrement commenté : conversion du frontmatter YAML,
protection des blocs de code (coloration Pygments), transformation des
composants MDX (`<Grid>`, `<Card>`, `<Tabs>`, `<LinkButton>`…) en HTML pur,
et réécriture de tous les liens en chemins relatifs.

---

## ⌨️ Raccourcis clavier

| Raccourci        | Action                          |
|------------------|---------------------------------|
| `Ctrl + K` / `⌘K`| Ouvrir la recherche             |
| `↑` `↓`          | Naviguer dans les résultats     |
| `Entrée`         | Ouvrir le résultat sélectionné  |
| `Échap`          | Fermer recherche / menus        |

---

## 📄 Licence

Le thème DocKit d'origine est © [Themefisher](https://themefisher.com) (licence MIT).
Cette version statique en conserve le design et le contenu à des fins de
démonstration et d'apprentissage.

---

<!-- SECTION-PUBLICATION-GITHUB -->

## 🌐 Démo en ligne (GitHub Pages)

1. Poussez ce dépôt sur GitHub (script `publier-sur-github.sh` du kit).
2. **Settings → Pages → Source : Deploy from a branch → `main` / `/ (root)`**.
3. La démo est servie sur `https://priviceahd-sys.github.io/NOM-DU-DEPOT/`.

Le fichier `.nojekyll` à la racine désactive Jekyll : le site est servi
tel quel, **aucun build nécessaire**.

## 📚 La famille de dépôts

| Dépôt | Contenu |
|---|---|
| **html-templates-library-dockit** ← ce dépôt | Conversion complète du thème Astro/Starlight **DocKit** (Themefisher, MIT) en HTML/CSS/JS purs : 42 pages bilingues, recherche côté client, thème clair/sombre, générateur Python inclus. |
| [`html-templates-library-docs`](https://github.com/priviceahd-sys/html-templates-library-docs) | 3 templates de documentation réorganisés : **iDocs** (Bootstrap 4), **Simply-Docs** (CSS sans classes + Markdown), **CleanDocs** (Tailwind). |
| [`html-templates-library-portfolios`](https://github.com/priviceahd-sys/html-templates-library-portfolios) | 6 portfolios au design soigné : **Dimension**, **Astral** et **Multiverse** (HTML5 UP), **Dopefolio**, **WowFolio**, **Portfolio HTML** (CommunityPro). |
| [`html-templates-library-animes`](https://github.com/priviceahd-sys/html-templates-library-animes) | 21 portfolios riches en animations : **AnimFolio** (15 formats × 3 couleurs) + **Sea of Stars** (Three.js/GSAP), **Cyberpunk AI**, **Animated Portfolio**, **Interactive Portfolio**, **Portfolio Swiper**, **WebStudio**. |

> Adaptez `priviceahd-sys` et les noms de dépôts si vous les renommez.
> Chaque dépôt conserve les licences d'origine : voir `LICENSE-NOTICES.md`.

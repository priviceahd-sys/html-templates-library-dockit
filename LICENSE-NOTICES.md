# Notices de licences — DocKit statique

Ce dépôt contient la conversion **statique** (HTML/CSS/JS purs) du thème
**DocKit** (Astro + Starlight) fourni par **Themefisher**, ainsi que des
ajouts réalisés pour cette conversion.

## 1. Template d'origine

| Élément | Détail |
|---|---|
| Nom | **DocKit** v1.0.1 (thème de documentation Astro/Starlight) |
| Auteur | [Themefisher](https://themefisher.com/) |
| Licence | **MIT** (voir [`LICENSE`](LICENSE)) |
| Copyright | © 2023 Astro contributors (Starlight) · © 2025 Themefisher |

La licence MIT autorise l'usage, la modification et la redistribution,
**à condition de conserver l'avis de copyright et la licence** — c'est le
rôle du fichier [`LICENSE`](LICENSE) à la racine de ce dépôt.

## 2. Travaux dérivés présents dans ce dépôt

Cette conversion a été produite en réorganisant le thème d'origine :

- `css/base.css`, `css/layout.css`, `css/components.css`, `css/docs.css` —
  réécriture en CSS vanilla du thème Tailwind 4 d'origine (variables, mise
  en page, composants, pages de documentation)
- `js/main.js`, `js/home.js`, `js/docs.js`, `js/search.js`,
  `js/search-index.js` — comportements (thème clair/sombre, navigation,
  sommaire, onglets de code, recherche côté client) réimplémentés sans
  framework
- `index.html`, `fr/index.html`, `404.html`, `about.html`,
  `privacy-policy.html`, `terms-conditions.html` et les 32 pages
  `docs/` + `fr/docs/` — contenu rendu statiquement depuis les sources
  MDX du thème
- `build/generate_site.py` — générateur du site statique (MDX → HTML)
- `README.md` — guide d'utilisation en français

Ces fichiers sont des **œuvres dérivées** du thème DocKit et sont donc
distribués sous la **même licence MIT**, avec l'attribution ci-dessus.

## 3. Ressources tierces

| Ressource | Usage | Licence |
|---|---|---|
| Police **Inter** | typographie du site | SIL Open Font License 1.1 |
| Icônes SVG (`assets/images/`) | illustrations du thème | fournies par Themefisher (MIT) |

Aucune dépendance JavaScript ou CSS externe n'est chargée depuis un CDN :
le site fonctionne entièrement hors ligne.

## 4. Ce que vous devez conserver en publiant

1. Le fichier [`LICENSE`](LICENSE) à la racine.
2. Ce fichier de notices.
3. L'attribution « DocKit par Themefisher » dans votre README (déjà présente).

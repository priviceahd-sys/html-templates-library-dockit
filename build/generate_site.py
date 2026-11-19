#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
DOCKIT STATIQUE — build/generate_site.py
================================================================================
Générateur du site statique : convertit le contenu Markdown/MDX du thème
Astro « DocKit » (src/content/docs) en pages HTML autonomes.

Ce qu'il produit :
  1. docs/**.html et fr/docs/**.html  → toutes les pages de documentation
     (barre latérale, table des matières, pagination précédent/suivant)
  2. about.html, privacy-policy.html, terms-conditions.html (+ versions fr/)
  3. 404.html                        → page d'erreur
  4. js/search-index.js              → index de recherche embarqué

Fonctionnement :
  - Lecture du frontmatter YAML (titre, description, ordre dans la sidebar)
  - Protection des blocs de code clôturés (```), rendus avec Pygments
  - Conversion des composants MDX utilisés par le thème
    (<Grid>, <Card>, <LinkButton>, <Section>, <Tabs>, <Badge>, <Accordion>)
    en HTML pur équivalent
  - Réécriture de tous les liens internes et images en chemins RELATIFS
    (le site fonctionne en file:// comme sur n'importe quel hébergeur)

Dépendances : pip install markdown pyyaml pygments
Usage       : python3 build/generate_site.py
================================================================================
"""

import json
import os
import posixpath
import re
import sys

import yaml
import markdown as md_lib
from pygments import highlight
from pygments.lexers import get_lexer_by_name, TextLexer
from pygments.formatters import HtmlFormatter

# ---------------------------------------------------------------------------
# Chemins de travail
# ---------------------------------------------------------------------------
SRC = "/home/user/extracted/dockit-astro"          # projet Astro d'origine
DOCS_EN = os.path.join(SRC, "src/content/docs")    # contenu anglais
DOCS_FR = os.path.join(SRC, "src/content/docs/fr") # contenu français
OUT = "/home/user/dockit-static"                   # site statique généré

# Pages « autonomes » (rendues sans sidebar, centrées)
STANDALONE = ["about", "privacy-policy", "terms-conditions"]

# ---------------------------------------------------------------------------
# Structure de la barre latérale (miroir de src/config/sidebar.json)
# type "group" : sous-groupe nommé alimenté par un dossier (autogenerate)
# type "page"  : page unique
# ---------------------------------------------------------------------------
SIDEBAR_SPEC = [
    {
        "label": {"en": "Getting Started", "fr": "Commencer"},
        "items": [
            {"type": "group", "label": {"en": "Introduction", "fr": "Introduction"},
             "dir": "getting-started/introduction"},
            {"type": "group", "label": {"en": "Global Settings", "fr": "Paramètres globaux"},
             "dir": "getting-started/global-settings"},
            {"type": "page", "path": "getting-started/navigation"},
        ],
    },
    {
        "label": {"en": "Content", "fr": "Contenu"},
        "items": [
            {"type": "group", "label": {"en": "Components and Block", "fr": "Composants et blocs"},
             "dir": "contents/components"},
            {"type": "group", "label": {"en": "Editing Content", "fr": "Édition du contenu"},
             "dir": "contents/editing"},
        ],
    },
    {
        "label": {"en": "Reference", "fr": "Référence"},
        "items": [{"type": "group", "label": None, "dir": "reference"}],
    },
    {
        "label": {"en": "Configurations", "fr": "Configurations"},
        "items": [{"type": "group", "label": None, "dir": "configurations"}],
    },
]

# ---------------------------------------------------------------------------
# Textes d'interface (traductions issues de src/content/i18n/*.json)
# ---------------------------------------------------------------------------
UI = {
    "en": {
        "home": "Home", "documentation": "Documentation", "reference": "Reference",
        "configuration": "Configuration", "plugins": "Plugins Reference",
        "get_started": "Get Started", "search": "Search documentation…",
        "on_this_page": "On this page", "prev": "Previous page", "next": "Next page",
        "menu": "Open menu", "toggle_theme": "Toggle dark / light theme",
        "search_label": "Search documentation", "sidebar_btn": "Contents",
        "community": "Join Our Community", "helpful": "Helpful Links",
        "resources": "Resources", "connect": "Connect With Us",
        "email_ph": "Enter your email",
        "copyright": 'Designed and Developed by <a href="https://themefisher.com" target="_blank" rel="noopener">Themefisher</a> Copyright © 2025.',
        "hint_nav": "to navigate", "hint_open": "to open", "hint_close": "to close",
        "404_title": "404",
        "404_text": "Page not found. Check the URL or try using the search bar.",
        "404_home": "Back to home",
        "articles": "documentation pages indexed",
        "empty": "No results found. Try different keywords.",
    },
    "fr": {
        "home": "Accueil", "documentation": "Documentation", "reference": "Référence",
        "configuration": "Configuration", "plugins": "Référence des plugins",
        "get_started": "Commencer", "search": "Rechercher dans la documentation…",
        "on_this_page": "Sur cette page", "prev": "Page précédente", "next": "Page suivante",
        "menu": "Ouvrir le menu", "toggle_theme": "Basculer le thème sombre / clair",
        "search_label": "Rechercher dans la documentation", "sidebar_btn": "Sommaire",
        "community": "Rejoignez notre communauté", "helpful": "Liens utiles",
        "resources": "Ressources", "connect": "Restons en contact",
        "email_ph": "Entrez votre e-mail",
        "copyright": 'Conçu et développé par <a href="https://themefisher.com" target="_blank" rel="noopener">Themefisher</a> Copyright © 2025.',
        "hint_nav": "pour naviguer", "hint_open": "pour ouvrir", "hint_close": "pour fermer",
        "404_title": "404",
        "404_text": "Page introuvable. Vérifiez l'URL ou utilisez la barre de recherche.",
        "404_home": "Retour à l'accueil",
        "articles": "pages de documentation indexées",
        "empty": "Aucun résultat. Essayez d'autres mots-clés.",
    },
}

# Liens du pied de page (miroir de menu.en.json / menu.fr.json)
FOOTER_LINKS = {
    "en": {
        "community": [
            ("GitHub Discussions", "https://github.com/themefisher/dockit/discussions"),
            ("Discord Community", "#"), ("Twitter Updates", "#"), ("Contributing Guide", "#"),
        ],
        "helpful": [
            ("Getting Started", "docs/getting-started/introduction/overview.html"),
            ("Privacy Policy", "privacy-policy.html"), ("Terms and Conditions", "terms-conditions.html"),
            ("About Us", "about.html"), ("Troubleshooting", "404.html"),
        ],
        "resources": [
            ("Documentation Hub", "docs/getting-started/introduction/overview.html"),
            ("Theme Gallery", "#"), ("Best Practices", "#"), ("Performance Tips", "#"),
            ("Migration Guide", "#"),
        ],
    },
    "fr": {
        "community": [
            ("Discussions GitHub", "https://github.com/themefisher/dockit/discussions"),
            ("Communauté Discord", "#"), ("Mises à jour Twitter", "#"), ("Guide de contribution", "#"),
        ],
        "helpful": [
            ("Commencer", "docs/getting-started/introduction/overview.html"),
            ("Politique de confidentialité", "privacy-policy.html"),
            ("Conditions d'utilisation", "terms-conditions.html"),
            ("À propos", "about.html"), ("Dépannage", "../404.html"),
        ],
        "resources": [
            ("Centre de documentation", "docs/getting-started/introduction/overview.html"),
            ("Galerie de thèmes", "#"), ("Bonnes pratiques", "#"),
            ("Conseils de performance", "#"), ("Guide de migration", "#"),
        ],
    },
}

SOCIALS = [
    ("Facebook", "https://www.facebook.com/",
     '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>'),
    ("Slack", "https://slack.com/",
     '<path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.528 2.528 0 0 1-2.52-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.528 2.528 0 0 1-2.523-2.523 2.528 2.528 0 0 1 2.523-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>'),
    ("GitHub", "https://www.github.com/",
     '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>'),
    ("LinkedIn", "https://www.linkedin.com/",
     '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>'),
]

# ---------------------------------------------------------------------------
# Petites icônes SVG (traits) utilisées par les cartes générées
# ---------------------------------------------------------------------------
ICON_SVGS = {
    "rocket": '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    "document": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    "add-document": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/>',
    "seti:json": '<path d="m15 18-6-6 6-6"/>',  # remplacé plus bas (accolades)
    "seti:vite": '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    "seti:code-search": '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M9 9.5 7.5 11 9 12.5"/><path d="m13 9.5 1.5 1.5L13 12.5"/>',
    "seti:config": '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/>',
    "setting": '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    "substack": '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    "pencil": '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    "default": '<circle cx="12" cy="12" r="9"/>',
}
# Icône « accolades » pour seti:json
ICON_SVGS["seti:json"] = '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>'

ARROW_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
             'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
             '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>')

PLUS_SVG = ('<svg width="15" height="15" viewBox="0 0 15 15" fill="none">'
            '<path class="vertical-line" fill-rule="evenodd" clip-rule="evenodd" '
            'd="M8.47821 6.52114V0H6.52169V6.52114H0V8.47766H6.52169V15H8.47821V8.47766H15V6.52114H8.47821Z" fill="currentColor"/>'
            '<path class="horizontal-line" fill-rule="evenodd" clip-rule="evenodd" '
            'd="M0 6.52114V8.47766H15V6.52114H0Z" fill="currentColor"/></svg>')

CHEVRON_SVG = ('<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
               'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
               '<path d="m6 9 6 6 6-6"/></svg>')


def icon_svg(name: str, color: str) -> str:
    """Renvoie une pastille colorée contenant l'icône SVG demandée."""
    paths = ICON_SVGS.get(name, ICON_SVGS["default"])
    return (
        f'<div class="card-icon" style="--icon-color: {color}" aria-hidden="true">'
        f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
        f'stroke-linecap="round" stroke-linejoin="round">{paths}</svg></div>'
    )


# ===========================================================================
# 1. INVENTAIRE DES PAGES
# ===========================================================================

def slugify(text: str) -> str:
    """Transforme un nom de fichier/dossier en segment d'URL propre
    (minuscules, espaces → tirets). Ex. « Child Components » → « child-components »."""
    return re.sub(r"\s+", "-", text.strip().lower())


def split_frontmatter(text: str):
    """Sépare le frontmatter YAML du corps Markdown.
    Renvoie (donnees_dict, corps_str)."""
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?", text, re.DOTALL)
    if not m:
        return {}, text
    try:
        data = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        data = {}
    return data, text[m.end():]


def clean_sidebar_label(label: str) -> str:
    """Retire les jetons d'icônes du type « [seti:html] » des libellés
    de sidebar (syntaxe du thème Astro, sans équivalent ici)."""
    return re.sub(r"\[[^\]]*\]\s*", "", label or "").strip()


class Page:
    """Représente une page de documentation convertie."""

    def __init__(self, src_path, lang, rel_slug):
        self.src_path = src_path                     # chemin absolu du .md/.mdx source
        self.lang = lang                             # "en" ou "fr"
        self.slug = rel_slug                         # ex. "getting-started/introduction/overview"
        with open(src_path, encoding="utf-8") as f:
            raw = f.read()
        self.data, self.body = split_frontmatter(raw)
        sidebar = self.data.get("sidebar") or {}
        if not isinstance(sidebar, dict):
            sidebar = {}
        self.order = sidebar.get("order", 999)       # ordre dans la sidebar (frontmatter)
        label = clean_sidebar_label(str(sidebar.get("label", "")))
        self.title = str(self.data.get("title") or os.path.basename(rel_slug).replace("-", " ").title())
        self.sidebar_label = label or self.title
        self.description = str(self.data.get("description") or "")

        # Chemin de sortie relatif à la racine du site
        if rel_slug in STANDALONE:
            out = f"{rel_slug}.html"
        else:
            out = f"docs/{rel_slug}.html"
        if lang == "fr":
            out = f"fr/{out}"
        self.out_path = out                          # ex. "fr/docs/reference/plugin.html"
        self.plain_text = ""                         # extrait pour l'index de recherche


def inventory():
    """Parcourt les dossiers de contenu et construit la liste des pages.
    Renvoie (pages_par_langue, carte_slug→chemin_par_langue)."""
    pages = {"en": [], "fr": []}
    for lang, root in (("en", DOCS_EN), ("fr", DOCS_FR)):
        for dirpath, dirnames, filenames in os.walk(root):
            # On ignore le sous-dossier fr/ quand on parcourt la racine EN
            if lang == "en" and os.path.abspath(dirpath) == os.path.abspath(DOCS_FR):
                dirnames[:] = []
                continue
            if lang == "en" and os.path.abspath(dirpath).startswith(os.path.abspath(DOCS_FR) + os.sep):
                continue
            for name in sorted(filenames):
                if not name.endswith((".md", ".mdx")):
                    continue
                base = re.sub(r"\.mdx?$", "", name)
                if base in ("index", "404"):        # page d'accueil / 404 : gérées à part
                    continue
                rel_dir = os.path.relpath(dirpath, root).replace(os.sep, "/")
                rel_dir = "" if rel_dir == "." else rel_dir
                slug_parts = [slugify(p) for p in (rel_dir.split("/") if rel_dir else [])]
                slug_parts.append(slugify(base))
                slug = "/".join(slug_parts)
                pages[lang].append(Page(os.path.join(dirpath, name), lang, slug))
    # Carte slug → chemin de sortie (par langue) pour la réécriture des liens
    slug_map = {
        lang: {p.slug: p.out_path for p in plist}
        for lang, plist in pages.items()
    }
    # Ajouts manuels : accueils et 404
    for lang in ("en", "fr"):
        prefix = "fr/" if lang == "fr" else ""
        slug_map[lang]["index"] = f"{prefix}index.html"
        slug_map[lang][""] = f"{prefix}index.html"
    slug_map["en"]["404"] = "404.html"
    slug_map["fr"]["404"] = "404.html"
    return pages, slug_map


# ===========================================================================
# 2. SIDEBAR — construction de l'arborescence et liste linéaire (prev/next)
# ===========================================================================

def dir_entries(pages, dir_slug):
    """Renvoie les pages d'un dossier (et ses sous-dossiers) triées :
    d'abord par `sidebar.order` du frontmatter, puis par titre."""
    direct, subdirs = [], {}
    for p in pages:
        if not (p.slug == dir_slug or p.slug.startswith(dir_slug + "/")):
            continue
        reste = p.slug[len(dir_slug) + 1:] if p.slug != dir_slug else ""
        if "/" in reste:
            sous = reste.split("/")[0]
            subdirs.setdefault(sous, dir_slug + "/" + sous)
        elif reste:
            direct.append(p)
    direct.sort(key=lambda p: (p.order, p.sidebar_label.lower()))
    groupes = []
    for sous_slug in sorted(subdirs.values()):
        nom = sous_slug.split("/")[-1].replace("-", " ").title()
        groupes.append({
            "type": "subgroup",
            "label": nom,
            "entries": dir_entries(pages, sous_slug),
        })
    # Normalisation : chaque page est enveloppée dans un dict {"type": "page"}
    return [{"type": "page", "page": p} for p in direct] + groupes


def build_sidebar(pages, lang):
    """Construit la structure complète de la sidebar pour une langue,
    à partir de SIDEBAR_SPEC et de l'inventaire des pages."""
    par_slug = {p.slug: p for p in pages}
    structure = []
    for groupe in SIDEBAR_SPEC:
        items = []
        for item in groupe["items"]:
            if item["type"] == "page":
                p = par_slug.get(item["path"])
                if p:
                    items.append({"type": "page", "page": p})
            else:  # group alimenté par un dossier
                entrees = dir_entries(pages, item["dir"])
                label = item["label"][lang] if item.get("label") else None
                if label is None and len(entrees):
                    label = groupe["label"][lang]
                if item.get("label") is None:
                    # Groupe « à plat » (Reference, Configurations) :
                    # les entrées remontent directement au niveau du groupe
                    items.extend(entrees)
                else:
                    items.append({"type": "subgroup", "label": label, "entries": entrees})
        structure.append({"label": groupe["label"][lang], "items": items})
    return structure


def linear_pages(sidebar_structure):
    """Aplatit la sidebar en liste linéaire de pages → sert à la
    pagination précédent/suivant."""
    resultat = []

    def walk(entries):
        for e in entries:
            if e["type"] == "page":
                resultat.append(e["page"])
            elif e["type"] == "subgroup":
                walk(e["entries"])

    for groupe in sidebar_structure:
        walk(groupe["items"])
    return resultat


def render_sidebar_html(structure, page_courante, page_dir):
    """Génère le HTML de la sidebar. `page_courante` est la Page active
    (pour la surbrillance) et `page_dir` sert au calcul des liens relatifs."""

    def lien(p):
        href = posixpath.relpath(p.out_path, page_dir)
        actif = ' active' if page_courante and p.out_path == page_courante.out_path else ""
        return f'<a class="sidebar-link{actif}" href="{href}">{p.sidebar_label}</a>'

    def walk(entries):
        html = []
        for e in entries:
            if e["type"] == "page":
                html.append(f"<li>{lien(e['page'])}</li>")
            else:  # subgroup
                html.append(
                    '<li class="sidebar-subgroup">'
                    f'<button class="sidebar-sub-title" aria-expanded="true">{e["label"]}{CHEVRON_SVG}</button>'
                    f"<ul>{''.join(walk(e['entries']))}</ul></li>"
                )
        return html

    sections = []
    for groupe in structure:
        contient_actif = False

        def contient(entries):
            nonlocal contient_actif
            for e in entries:
                if e["type"] == "page" and page_courante and e["page"].out_path == page_courante.out_path:
                    contient_actif = True
                elif e["type"] == "subgroup":
                    contient(e["entries"])

        contient(groupe["items"])
        replie = "" if contient_actif else " collapsed"
        sections.append(
            f'<div class="sidebar-group{replie}">'
            f'<button class="sidebar-group-title" aria-expanded="{str(not replie).lower()}">'
            f'{groupe["label"]}{CHEVRON_SVG}</button>'
            f'<ul class="sidebar-links">{"".join(walk(groupe["items"]))}</ul></div>'
        )
    return f'<nav aria-label="Documentation sidebar">{"".join(sections)}</nav>'


# ===========================================================================
# 3. CONVERSION MARKDOWN / MDX → HTML
# ===========================================================================

def parse_attrs(chaine: str) -> dict:
    """Extrait les attributs d'une balise MDX : gère guillemets simples,
    doubles et accolades JSX (ex. columns={4})."""
    attrs = {}
    for m in re.finditer(r'([\w-]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|\{([^}]*)\})', chaine):
        cle = m.group(1)
        val = next((v for v in (m.group(2), m.group(3), m.group(4)) if v is not None), "")
        attrs[cle] = val
    return attrs


def render_code(code: str, lang: str) -> str:
    """Coloration syntaxique d'un bloc de code avec Pygments.
    Les langages inconnus (astro, mdx…) retombent sur du texte brut."""
    aliases = {"sh": "bash", "shell": "bash", "mdx": "md", "markdown": "md",
               "astro": "jsx", "yml": "yaml", "ts": "typescript", "js": "javascript",
               "jsx": "jsx", "html": "html", "": "text"}
    try:
        lexer = get_lexer_by_name(aliases.get(lang.strip().lower(), lang.strip().lower()))
    except Exception:
        lexer = TextLexer()
    formatter = HtmlFormatter(cssclass="codehilite", nowrap=False, stripnl=True)
    return highlight(code, lexer, formatter)


def protect_code_blocks(texte: str):
    """Remplace les blocs de code clôturés (```) par des jetons uniques,
    pour les protéger des conversions de composants MDX.
    Renvoie (texte_avec_jetons, liste_des_html_de_blocs)."""
    blocs = []
    lignes, resultat = texte.split("\n"), []
    dans_bloc, lang, contenu = False, "", []
    for ligne in lignes:
        if not dans_bloc and re.match(r"^`{3,}", ligne.strip()):
            dans_bloc = True
            lang = re.sub(r"^`{3,}", "", ligne.strip()).strip()
            contenu = []
        elif dans_bloc and re.match(r"^`{3,}", ligne.strip()):
            # Clôture du bloc : rendu Pygments immédiat + jeton placeholder
            blocs.append(render_code("\n".join(contenu), lang))
            resultat.append("")
            resultat.append(f"CODEBLOCKPLACEHOLDER{len(blocs) - 1}END")
            resultat.append("")
            dans_bloc = False
        elif dans_bloc:
            contenu.append(ligne)
        else:
            resultat.append(ligne)
    # Bloc jamais refermé (fichier mal formé) : on le rend quand même
    if dans_bloc:
        blocs.append(render_code("\n".join(contenu), lang))
        resultat.append(f"CODEBLOCKPLACEHOLDER{len(blocs) - 1}END")
    return "\n".join(resultat), blocs


compteur_tabs = 0  # compteur global pour des identifiants d'onglets uniques


def transform_components(texte: str) -> str:
    """Convertit les composants MDX du thème DocKit en HTML équivalent.
    Les blocs de code étant déjà protégés par des jetons, aucun exemple
    de documentation n'est altéré."""
    global compteur_tabs

    # --- Lignes `import …` (inutiles en HTML statique) ----------------------
    texte = "\n".join(
        l for l in texte.split("\n")
        if not re.match(r"^\s*import\s+.*(?:from\s+['\"].*['\"]|['\"].*['\"])\s*;?\s*$", l)
    )

    # --- <Grid columns={N}> → grille CSS ------------------------------------
    texte = re.sub(
        r"<Grid\s+columns=\{?[\"']?(\d+)[\"']?\}?\s*>",
        lambda m: f'<div class="card-grid" style="--columns: {m.group(1)}" markdown="1">',
        texte,
    )
    texte = re.sub(r"<Grid\s*>", '<div class="card-grid" style="--columns: 2" markdown="1">', texte)
    texte = texte.replace("</Grid>", "</div>")

    # --- <Card title icon iconColor size>contenu</Card> ----------------------
    def card_repl(m):
        attrs = parse_attrs(m.group(1))
        contenu = m.group(2)
        taille = attrs.get("size", "").strip("'\" ")
        classe = "card card-sm" if taille == "sm" else "card"
        couleur = attrs.get("iconColor") or "#D76D77"
        icone = icon_svg(attrs.get("icon", ""), couleur) if attrs.get("icon") else ""
        titre = attrs.get("title", "")
        return (
            f'<div class="{classe}" style="--icon-color: {couleur}" markdown="1">\n\n'
            f"{icone}\n\n<h3 class=\"card-title\" data-toc-skip>{titre}</h3>\n\n"
            f'<div class="card-body" markdown="1">\n\n{contenu}\n\n</div>\n\n</div>'
        )

    texte = re.sub(r"<Card\s+((?:[^>\"']|\"[^\"]*\"|'[^']*')*?)>(.*?)</Card>",
                   card_repl, texte, flags=re.DOTALL)

    # <NewCard> est un alias du composant Card dans certains exemples
    texte = texte.replace("<NewCard", "<Card").replace("</NewCard>", "</Card>")
    texte = re.sub(r"<Card\s+((?:[^>\"']|\"[^\"]*\"|'[^']*')*?)>(.*?)</Card>",
                   card_repl, texte, flags=re.DOTALL)

    # --- <LinkButton href variant>label</LinkButton> -------------------------
    def linkbtn_repl(m):
        attrs = parse_attrs(m.group(1))
        label = m.group(2).strip()
        href = attrs.get("href", "#")
        return f'<a class="btn-text" href="{href}">{label} {ARROW_SVG}</a>'

    texte = re.sub(r"<LinkButton\s+((?:[^>\"']|\"[^\"]*\"|'[^']*')*?)>(.*?)</LinkButton>",
                   linkbtn_repl, texte, flags=re.DOTALL)

    # --- <Section title description>…</Section> ------------------------------
    def section_repl(m):
        attrs = parse_attrs(m.group(1))
        titre = attrs.get("title", "")
        desc = attrs.get("description", "")
        return (
            '<section class="section" markdown="1">\n\n'
            '<div class="section-head text-center" markdown="1">\n\n'
            f'<h2 class="section-title">{titre}</h2>\n\n'
            f'<p class="section-description">{desc}</p>\n\n</div>\n'
        )

    texte = re.sub(r"<Section\s+((?:[^>\"']|\"[^\"]*\"|'[^']*')*?)>", section_repl, texte, flags=re.DOTALL)
    texte = texte.replace("</Section>", "</section>")

    # --- <Tabs><TabItem label>…</TabItem></Tabs> → onglets de code -----------
    def tabs_repl(m):
        global compteur_tabs
        items = re.findall(r"<TabItem\s+label=[\"']([^\"']*)[\"'][^>]*>(.*?)</TabItem>",
                           m.group(1), re.DOTALL)
        if not items:
            return m.group(0)
        compteur_tabs += 1
        base = f"tabs-{compteur_tabs}"
        nav, panneaux = [], []
        for i, (label, contenu) in enumerate(items):
            actif = " active" if i == 0 else ""
            nav.append(f'<button class="code-tab-btn{actif}" data-panel="{base}-{i}" '
                       f'aria-selected="{str(i == 0).lower()}">{label}</button>')
            # markdown="1" : le contenu du panneau (blocs protégés, paragraphes)
            # est interprété par python-markdown via l'extension md_in_html
            panneaux.append(f'<div class="code-tab-panel{actif}" id="{base}-{i}" markdown="1">\n\n'
                            f"{contenu}\n\n</div>")
        # L'enveloppe porte markdown="1" (bloc analysé) et la barre d'onglets
        # markdown="0" (HTML brut conservé tel quel, attribut retiré).
        # Les panneaux sont séparés par une ligne vide : indispensable pour
        # que l'extension md_in_html analyse chaque panneau indépendamment.
        panneaux_html = "\n\n".join(panneaux)
        return ('<div class="code-tabs" markdown="1">\n\n'
                f'<div class="code-tabs-nav" markdown="0">{"".join(nav)}</div>\n\n'
                f'{panneaux_html}\n\n</div>')

    texte = re.sub(r"<Tabs[^>]*>(.*?)</Tabs>", tabs_repl, texte, flags=re.DOTALL)

    # --- <Badge text variant /> → étiquette -----------------------------------
    texte = re.sub(
        r"<Badge\s+((?:[^>\"']|\"[^\"]*\"|'[^']*')*?)/?>",
        lambda m: '<span class="tag tag-{v}">{t}</span>'.format(
            v=parse_attrs(m.group(1)).get("variant", "default"),
            t=parse_attrs(m.group(1)).get("text", ""),
        ),
        texte,
    )

    # --- <Accordion question answer /> (auto-fermant) ---------------------------
    def accordion_repl(m):
        attrs = parse_attrs(m.group(1))
        return (
            '<div class="accordion" data-tab="" data-hidden="false">\n'
            '<button class="accordion-header" aria-expanded="false">'
            f'<h4>{attrs.get("question", "")}</h4>'
            f'<span class="accordion-icon" aria-hidden="true">{PLUS_SVG}</span></button>\n'
            f'<div class="accordion-body"><div><p>{attrs.get("answer", "")}</p></div></div>\n</div>'
        )

    texte = re.sub(r"<Accordion\s+((?:[^>\"']|\"[^\"]*\"|'[^']*')*?)/>", accordion_repl, texte)

    # --- <Aside>…</Aside> → encart ---------------------------------------------
    texte = re.sub(r"<Aside[^>]*>(.*?)</Aside>",
                   lambda m: f'<aside class="aside" markdown="1">\n\n{m.group(1)}\n\n</aside>',
                   texte, flags=re.DOTALL)

    # --- <Code code={`…`} lang title /> → bloc de code ---------------------------
    def code_repl(m):
        attrs_raw = m.group(1)
        code = re.search(r"code=\{?`([^`]*)`\}?", attrs_raw)
        lang = re.search(r'lang=["\']([\w-]+)["\']', attrs_raw)
        if not code:
            return ""
        return "\n" + render_code(code.group(1), lang.group(1) if lang else "text") + "\n"

    texte = re.sub(r"<Code\s+((?:[^>\"']|\"[^\"]*\"|'[^']*'|\{[^}]*\})*?)/>", code_repl, texte)

    return texte


def restore_code_blocks(html: str, blocs: list) -> str:
    """Remplace les jetons placeholder par le HTML des blocs de code
    (en retirant le <p> éventuel qui les enveloppe)."""
    for i, bloc_html in enumerate(blocs):
        jeton = f"CODEBLOCKPLACEHOLDER{i}END"
        html = html.replace(f"<p>{jeton}</p>", bloc_html)
        html = html.replace(jeton, bloc_html)
    return html


def slugify_heading_url(url: str) -> str:
    """Normalise un slug d'URL à la manière du site statique."""
    return "/".join(slugify(part) for part in url.split("/") if part)


class LinkResolver:
    """Réécrit les URL internes d'une page en chemins relatifs.

    - liens absolus du site  (/getting-started/introduction/overview/)
      → chemin relatif vers la page générée correspondante
    - images  (@/assets/x.png, /src/assets/x.png) → assets/images/x.png
    - liens relatifs Markdown (../components/) résolus depuis le slug source
    - tout le reste (http, #, mailto…) est conservé tel quel
    """

    def __init__(self, page: Page, slug_map, pages_par_langue):
        self.page = page
        self.slug_map = slug_map
        self.pages = pages_par_langue
        self.page_dir = posixpath.dirname(page.out_path) or "."

    def chemin(self, cible_racine: str) -> str:
        """Convertit un chemin depuis la racine du site en chemin relatif."""
        return posixpath.relpath(cible_racine, self.page_dir)

    def resoudre(self, url: str) -> str:
        url = url.strip()
        if not url or re.match(r"^(https?:|mailto:|tel:|data:)", url) or url.startswith("#"):
            return url

        # 1. Images du dossier assets du thème Astro
        m = re.match(r"^(?:@|~)?/?src/assets/(.+)$", url) or re.match(r"^@/assets/(.+)$", url)
        if m:
            return self.chemin("assets/images/" + posixpath.basename(m.group(1)))

        # 2. Liens absolus (commencent par /)
        if url.startswith("/"):
            slug = url.strip("/")
            slug = slugify_heading_url(slug)
            # Préfixe /fr/ explicite
            lang_cible = self.page.lang
            if slug.startswith("fr/") or slug == "fr":
                lang_cible = "fr"
                slug = slug[3:]
            # Alias particuliers
            if slug in ("docs", "getting-started", "contents", "reference", "configurations"):
                slug = "getting-started/introduction/overview"
            for lang in (lang_cible, "en" if lang_cible == "fr" else "fr"):
                if slug in self.slug_map[lang]:
                    return self.chemin(self.slug_map[lang][slug])
            return "#"  # cible inexistante : lien neutralisé

        # 3. Liens relatifs (ex. ../components/) → résolus depuis le slug source
        base = posixpath.dirname(self.page.slug)
        normalise = posixpath.normpath(posixpath.join(base, url.split("#")[0]))
        normalise = "" if normalise == "." else normalise
        ancre = "#" + url.split("#")[1] if "#" in url else ""
        for lang in (self.page.lang, "en" if self.page.lang == "fr" else "fr"):
            if normalise in self.slug_map[lang]:
                return self.chemin(self.slug_map[lang][normalise]) + ancre
        return "#" + ancre if ancre else "#"

    def appliquer(self, html: str) -> str:
        """Applique la résolution à tous les attributs href/src du HTML."""
        def repl(m):
            attr, quote, url = m.group(1), m.group(2), m.group(3)
            return f"{attr}={quote}{self.resoudre(url)}{quote}"
        return re.sub(r"(src|href)=(['\"])(.*?)\2", repl, html)


def convert_markdown(page: Page, slug_map, pages_par_langue):
    """Pipeline complet de conversion d'une page.
    Renvoie (html_contenu, jetons_toc, texte_brut_pour_index)."""
    corps = page.body

    # 1. Protéger les blocs de code (rendus Pygments)
    corps, blocs = protect_code_blocks(corps)

    # 2. Convertir les composants MDX en HTML
    corps = transform_components(corps)

    # 3. Conversion Markdown → HTML
    md = md_lib.Markdown(
        extensions=["tables", "md_in_html", "toc", "attr_list", "sane_lists"],
        extension_configs={"toc": {"toc_depth": "2-3", "permalink": False}},
    )
    html = md.convert(corps)
    jetons_toc = getattr(md, "toc_tokens", [])

    # 4. Réinjecter les blocs de code colorés
    html = restore_code_blocks(html, blocs)

    # 5. Réécrire les liens et images en chemins relatifs
    resolveur = LinkResolver(page, slug_map, pages_par_langue)
    html = resolveur.appliquer(html)

    # 6. Texte brut pour l'index de recherche (sans balises ni code)
    texte = re.sub(r"<[^>]+>", " ", html)
    texte = re.sub(r"\s+", " ", texte).strip()
    page.plain_text = texte[:1200]

    return html, jetons_toc


def toc_html(jetons, exclure=frozenset()) -> str:
    """Construit la liste « Sur cette page » (niveaux h2/h3) à partir
    des jetons générés par l'extension toc de python-markdown.

    `exclure` : ensemble d'identifiants à ignorer (les titres de cartes
    générés par la conversion MDX, qui ne sont pas de vraies sections)."""
    items = []

    def walk(ts):
        for t in ts:
            niveau = t.get("level", 2)
            if niveau in (2, 3) and t["id"] not in exclure:
                cls = "toc-h2" if niveau == 2 else "toc-h3"
                items.append(f'<a class="{cls}" href="#{t["id"]}">{t["name"]}</a>')
            walk(t.get("children", []))

    walk(jetons)
    return "".join(items)


# ===========================================================================
# 4. GABARIT HTML DES PAGES GÉNÉRÉES
# ===========================================================================

def render_shell(page_dir: str, lang: str, titre: str, description: str,
                 body_class: str, contenu_principal: str, avec_sidebar: bool,
                 avec_docs_js: bool, commentaire: str) -> str:
    """Assemble une page HTML complète (en-tête, contenu, pied de page,
    modale de recherche, scripts). Tous les chemins sont rendus RELATIFS
    au dossier `page_dir` (chemin du dossier de la page depuis la racine)."""
    t = UI[lang]
    rel = lambda cible: posixpath.relpath(cible, page_dir)  # noqa: E731
    prefixe = "fr/" if lang == "fr" else ""

    accueil = rel(f"{prefixe}index.html")
    overview = rel(f"{prefixe}docs/getting-started/introduction/overview.html")
    ref_config = rel(f"{prefixe}docs/reference/configuration.html")
    ref_plugin = rel(f"{prefixe}docs/reference/plugin.html")
    css = lambda f: rel(f"css/{f}")  # noqa: E731
    js = lambda f: rel(f"js/{f}")   # noqa: E731
    img = lambda f: rel(f"assets/images/{f}")  # noqa: E731

    # --- Pied de page ---------------------------------------------------------
    f_links = FOOTER_LINKS[lang]

    def colonne_footer(titre_col, liens):
        items = "".join(
            f'<li><a href="{l[1] if l[1].startswith("http") or l[1] == "#" else rel(prefixe + l[1])}"'
            f'{" target=\"_blank\" rel=\"noopener\"" if l[1].startswith("http") else ""}>{l[0]}</a></li>'
            for l in liens
        )
        return f'<div class="footer-col"><h4>{titre_col}</h4><ul>{items}</ul></div>'

    socials_html = "".join(
        f'<a href="{href}" target="_blank" rel="noopener" aria-label="{nom}">'
        f'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{path}</svg></a>'
        for nom, href, path in SOCIALS
    )

    # --- Bouton flottant + voile de la sidebar mobile --------------------------
    sidebar_mobile = ""
    if avec_sidebar:
        sidebar_mobile = f'''
  <!-- Bouton flottant (mobile) : ouvre le tiroir de la sidebar -->
  <button class="sidebar-open-btn" id="sidebar-open-btn" aria-expanded="false">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h16"/></svg>
    {t["sidebar_btn"]}
  </button>
  <div class="nav-backdrop" id="sidebar-backdrop"></div>'''

    return f'''<!DOCTYPE html>
<html lang="{lang}" data-theme="dark">
<head>
  <!-- {commentaire} -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{titre} | DocKit</title>
  <meta name="description" content="{description}">
  <link rel="icon" type="image/svg+xml" href="{img("favicon.svg")}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{css("base.css")}">
  <link rel="stylesheet" href="{css("layout.css")}">
  <link rel="stylesheet" href="{css("components.css")}">
  <link rel="stylesheet" href="{css("docs.css")}">
  <script>
    /* Anti-scintillement : applique le thème mémorisé avant le premier rendu */
    (function () {{
      try {{
        var theme = localStorage.getItem("dockit-theme");
        if (!theme) theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", theme);
      }} catch (e) {{ document.documentElement.setAttribute("data-theme", "dark"); }}
    }})();
  </script>
</head>

<body class="{body_class}">

  <!-- ==================== EN-TÊTE ==================== -->
  <header class="site-header" id="site-header">
    <div class="container header-inner">
      <a class="brand" href="{accueil}" aria-label="DocKit">
        <img class="logo-dark" src="{img("logo-dark.svg")}" alt="DocKit" width="127" height="32">
        <img class="logo-light" src="{img("logo-light.svg")}" alt="DocKit" width="127" height="32">
      </a>

      <nav class="main-nav" id="main-nav" aria-label="{t["documentation"]}">
        <ul class="nav-list">
          <li><a class="nav-link" href="{accueil}">{t["home"]}</a></li>
          <li><a class="nav-link" href="{overview}">{t["documentation"]}</a></li>
          <li class="has-dropdown">
            <button class="nav-link" aria-haspopup="true" aria-expanded="false">
              {t["reference"]}
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <ul class="dropdown-menu">
              <li><a href="{ref_config}">{t["configuration"]}</a></li>
              <li><a href="{ref_plugin}">{t["plugins"]}</a></li>
            </ul>
          </li>
          <li class="nav-cta-mobile"><a class="btn btn-primary" href="{overview}">{t["get_started"]}</a></li>
        </ul>
      </nav>

      <div class="header-actions">
        <button class="icon-btn" data-search-open aria-label="{t["search_label"]}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button class="icon-btn theme-toggle" id="theme-toggle" aria-label="{t["toggle_theme"]}">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </button>
        <div class="lang-switch" aria-label="Langue">
          <a href="#" data-lang-link="en">EN</a>
          <a href="#" data-lang-link="fr">FR</a>
        </div>
        <a class="btn btn-outline header-cta" href="{overview}">{t["get_started"]}</a>
        <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="{t["menu"]}" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>
        </button>
      </div>
    </div>
  </header>
  <div class="nav-backdrop" id="nav-backdrop"></div>

  <!-- ==================== CONTENU ==================== -->
{contenu_principal}
{sidebar_mobile}

  <!-- ==================== PIED DE PAGE ==================== -->
  <footer class="site-footer">
    <div class="container footer-grid">
      {colonne_footer(t["community"], f_links["community"])}
      {colonne_footer(t["helpful"], f_links["helpful"])}
      {colonne_footer(t["resources"], f_links["resources"])}
      <div class="footer-col">
        <h4>{t["connect"]}</h4>
        <form class="mail-form" action="#" aria-label="Newsletter">
          <input type="email" placeholder="{t["email_ph"]}" required aria-label="Email">
          <button type="submit" aria-label="OK">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.0477 3.05293C18.8697 0.707361 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" stroke-width="1.5"/><path d="M11.5 12.5L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </form>
        <p class="mail-form-feedback" role="status" aria-live="polite"></p>
      </div>
    </div>
    <div class="container footer-bottom">
      <p class="copyright">{t["copyright"]}</p>
      <div class="socials">{socials_html}</div>
    </div>
  </footer>

  <!-- ==================== MODALE DE RECHERCHE ==================== -->
  <div class="search-modal" id="search-modal" hidden>
    <div class="search-modal-backdrop" data-search-close></div>
    <div class="search-modal-panel" role="dialog" aria-modal="true" aria-label="{t["search_label"]}">
      <form class="search-form" role="search" onsubmit="return false;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-input" type="text" placeholder="{t["search"]}" autocomplete="off" aria-label="{t["search_label"]}">
        <kbd>Esc</kbd>
      </form>
      <div class="search-results" id="search-results"></div>
      <div class="search-hint">
        <span><kbd>↑</kbd><kbd>↓</kbd> {t["hint_nav"]}</span>
        <span><kbd>↵</kbd> {t["hint_open"]}</span>
        <span><kbd>Esc</kbd> {t["hint_close"]}</span>
      </div>
    </div>
  </div>

  <!-- Scripts : l'index doit être chargé avant search.js -->
  <script src="{js("search-index.js")}"></script>
  <script src="{js("main.js")}"></script>
  <script src="{js("search.js")}"></script>
  {('<script src="' + js("docs.js") + '"></script>') if avec_docs_js else ""}
</body>
</html>
'''


def render_docs_main(page: Page, sidebar_html: str, contenu_html: str,
                     toc: str, lang: str, prev_page, next_page, page_dir: str) -> str:
    """Génère le bloc principal d'une page de documentation :
    mise en page à 3 colonnes (sidebar | article | table des matières)
    + pagination précédent/suivant."""
    t = UI[lang]
    desc = f'<p class="docs-description">{page.description}</p>' if page.description else ""

    pagination = ""
    if prev_page or next_page:
        cellules = []
        if prev_page:
            href = posixpath.relpath(prev_page.out_path, page_dir)
            cellules.append(
                f'<a class="page-link prev" href="{href}"><small>← {t["prev"]}</small>'
                f"<span>{prev_page.sidebar_label}</span></a>"
            )
        else:
            cellules.append("<span></span>")
        if next_page:
            href = posixpath.relpath(next_page.out_path, page_dir)
            cellules.append(
                f'<a class="page-link next" href="{href}"><small>{t["next"]} →</small>'
                f"<span>{next_page.sidebar_label}</span></a>"
            )
        pagination = f'<nav class="docs-pagination" aria-label="Pagination">{"".join(cellules)}</nav>'

    toc_col = ""
    if toc:
        toc_col = f'''
    <!-- Troisième colonne : table des matières + scrollspy (js/docs.js) -->
    <aside class="docs-toc">
      <h2 class="toc-title">{t["on_this_page"]}</h2>
      <nav class="toc-list" id="toc-list">{toc}</nav>
    </aside>'''

    return f'''  <main>
    <div class="container docs-layout">

      <!-- Première colonne : sidebar de navigation (générée à partir
           de la structure sidebar.json du thème Astro) -->
      <aside class="docs-sidebar" id="docs-sidebar">
        {sidebar_html}
      </aside>

      <!-- Deuxième colonne : l'article lui-même -->
      <div class="docs-main">
        <article class="docs-content prose">
          <h1>{page.title}</h1>
          {desc}
{contenu_html}
        </article>
        {pagination}
      </div>
{toc_col}
    </div>
  </main>'''


# ===========================================================================
# 5. GÉNÉRATION DES FICHIERS
# ===========================================================================

def ecrire(chemin_racine: str, contenu: str):
    """Écrit un fichier (créé les dossiers intermédiaires si besoin)."""
    complet = os.path.join(OUT, chemin_racine)
    os.makedirs(os.path.dirname(complet), exist_ok=True)
    with open(complet, "w", encoding="utf-8") as f:
        f.write(contenu)
    return complet


def generer_404(slug_map):
    """Page 404 bilingue : la version EN vit à la racine (404.html),
    la version FR dans fr/404.html. Les liens du contenu central sont
    calculés relativement au dossier de chaque page."""
    for lang in ("en", "fr"):
        t = UI[lang]
        page_dir = "fr" if lang == "fr" else "."
        # Liens calculés depuis le dossier de la page (relatifs)
        accueil = posixpath.relpath(("fr/" if lang == "fr" else "") + "index.html", page_dir)
        autre_langue = posixpath.relpath(("index.html" if lang == "fr" else "fr/index.html"), page_dir)
        contenu = f'''  <main>
    <div class="container" style="min-height: 60vh; display: flex; align-items: center; justify-content: center; text-align: center; padding-block: 4rem;">
      <div>
        <!-- « 404 » géant peint avec le dégradé signature du thème -->
        <h1 style="font-size: clamp(6rem, 18vw, 11rem); line-height: 1; letter-spacing: -6px; background: var(--gradient-primary); -webkit-background-clip: text; background-clip: text; color: transparent;">{t["404_title"]}</h1>
        <p class="section-description" style="margin-bottom: 2.5rem;">{t["404_text"]}</p>
        <div class="cta-buttons" style="margin-top: 0;">
          <a class="btn btn-primary" href="{accueil}">{t["404_home"]}</a>
          <button class="btn btn-outline" data-search-open>{t["search_label"]}</button>
          <a class="btn btn-text" href="{autre_langue}">{"English home" if lang == "fr" else "Accueil en français"}</a>
        </div>
      </div>
    </div>
  </main>'''
        html = render_shell(page_dir, lang, t["404_title"], t["404_text"], "page-404",
                            contenu, avec_sidebar=False, avec_docs_js=False,
                            commentaire="Page 404 — générée par build/generate_site.py")
        ecrire(f"{('fr/' if lang == 'fr' else '')}404.html", html)


def generer_index_recherche(pages_par_langue):
    """Construit js/search-index.js : tableau d'entrées
    {lang, title, url, desc, body} + détection de la racine du site.

    La racine est déduite de l'URL du script lui-même
    (document.currentScript) : les résultats de recherche restent donc
    corrects quelle que soit la profondeur de la page consultée,
    y compris en ouverture locale file://."""
    entrees = []

    # Pages d'accueil
    entrees.append({"lang": "en", "title": "Home — DocKit documentation theme",
                    "url": "index.html",
                    "desc": "Great docs developers love. Features, quick start, FAQ.",
                    "body": "powerful features well organized lightning fast powerful search very customized get started quickly three steps feature topics ui components content writing page layouts code syntax version history dark light mode faq questions help support"})
    entrees.append({"lang": "fr", "title": "Accueil — Thème de documentation DocKit",
                    "url": "fr/index.html",
                    "desc": "Excellente doc aimée des développeurs. Fonctionnalités, démarrage, FAQ.",
                    "body": "fonctionnalités puissantes bien organisée ultra rapide recherche puissante très personnalisable démarrer rapidement trois étapes sujets phares composants ui rédaction contenu mises en page syntaxe code historique versions mode sombre clair faq questions aide support"})

    # Pages de documentation + autonomes
    for lang, pages in pages_par_langue.items():
        for p in pages:
            entrees.append({
                "lang": lang,
                "title": p.title,
                "url": p.out_path,
                "desc": p.description[:200],
                "body": p.plain_text[:900],
            })

    index_json = json.dumps(entrees, ensure_ascii=False, indent=0)
    contenu = f'''/* ==========================================================================
   DOCKIT STATIQUE — js/search-index.js
   --------------------------------------------------------------------------
   Index de recherche GÉNÉRÉ AUTOMATIQUEMENT par build/generate_site.py.
   Ne pas modifier à la main : relancez le script après chaque ajout
   de page de documentation.

   Chaque entrée contient :
     lang  → langue de la page ("en" ou "fr") : la recherche ne retourne
             que les pages dans la langue du site consulté
     title → titre affiché dans les résultats
     url   → chemin de la page DEPUIS LA RACINE du site
     desc  → description (frontmatter) — utilisée comme extrait
     body  → début du texte brut de la page (correspondances de mots)
   ========================================================================== */

/* Racine du site, déduite de l'emplacement de CE script
   (…/js/search-index.js) : permet à search.js de construire des liens
   absolus corrects depuis n'importe quelle profondeur de page. */
window.SEARCH_ROOT = (function () {{
  var script = document.currentScript;
  if (script && script.src) {{
    return script.src.replace(/js\\/search-index\\.js.*$/, "");
  }}
  return "";
}})();

/* L'index lui-même (tableau consulté par js/search.js). */
window.SEARCH_INDEX = {index_json};
'''
    ecrire("js/search-index.js", contenu)
    return len(entrees)


def main():
    print("→ Inventaire des pages…")
    pages_par_langue, slug_map = inventory()
    print(f"   EN : {len(pages_par_langue['en'])} pages | FR : {len(pages_par_langue['fr'])} pages")

    # --- Conversion de toutes les pages -----------------------------------
    for lang in ("en", "fr"):
        pages = pages_par_langue[lang]
        sidebar_structure = build_sidebar(pages, lang)
        lineaire = linear_pages(sidebar_structure)
        ordre = {p.out_path: i for i, p in enumerate(lineaire)}

        for p in pages:
            page_dir = posixpath.dirname(p.out_path) or "."
            contenu_html, jetons = convert_markdown(p, slug_map, pages_par_langue)
            sidebar_html = render_sidebar_html(sidebar_structure, p, page_dir)
            # Les titres de cartes (<h3 class="card-title">) reçoivent un id
            # de la part de l'extension toc : on les exclut de la table des
            # matières, ce ne sont pas de véritables sections de la page.
            ids_cartes = set(re.findall(
                r'<h3[^>]*class="card-title"[^>]*\sid="([^"]+)"', contenu_html))
            toc = toc_html(jetons, exclure=ids_cartes)

            i = ordre.get(p.out_path, -1)
            prev_p = lineaire[i - 1] if i > 0 else None
            next_p = lineaire[i + 1] if 0 <= i < len(lineaire) - 1 else None

            est_standalone = p.slug in STANDALONE
            if est_standalone:
                # Pages autonomes (about, privacy…) : contenu centré, pas de sidebar
                principal = f'''  <main>
    <div class="container standalone-wrap">
      <article class="docs-content prose">
        <h1>{p.title}</h1>
{contenu_html}
      </article>
    </div>
  </main>'''
            else:
                principal = render_docs_main(p, sidebar_html, contenu_html, toc,
                                             lang, prev_p, next_p, page_dir)

            html = render_shell(
                page_dir, lang, p.title, p.description or p.title,
                "page-docs", principal,
                avec_sidebar=not est_standalone,
                avec_docs_js=True,
                commentaire=f"Page générée depuis {os.path.relpath(p.src_path, SRC)}",
            )
            ecrire(p.out_path, html)

        print(f"   [{lang}] {len(pages)} pages générées.")

    # --- Page 404 -------------------------------------------------------------
    generer_404(slug_map)
    print("   404.html (EN + FR) générée.")

    # --- Index de recherche -----------------------------------------------------
    n = generer_index_recherche(pages_par_langue)
    print(f"   js/search-index.js généré ({n} entrées).")
    print("✔ Génération terminée.")


if __name__ == "__main__":
    main()

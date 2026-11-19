/* ==========================================================================
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
window.SEARCH_ROOT = (function () {
  var script = document.currentScript;
  if (script && script.src) {
    return script.src.replace(/js\/search-index\.js.*$/, "");
  }
  return "";
})();

/* L'index lui-même (tableau consulté par js/search.js). */
window.SEARCH_INDEX = [
{
"lang": "en",
"title": "Home — DocKit documentation theme",
"url": "index.html",
"desc": "Great docs developers love. Features, quick start, FAQ.",
"body": "powerful features well organized lightning fast powerful search very customized get started quickly three steps feature topics ui components content writing page layouts code syntax version history dark light mode faq questions help support"
},
{
"lang": "fr",
"title": "Accueil — Thème de documentation DocKit",
"url": "fr/index.html",
"desc": "Excellente doc aimée des développeurs. Fonctionnalités, démarrage, FAQ.",
"body": "fonctionnalités puissantes bien organisée ultra rapide recherche puissante très personnalisable démarrer rapidement trois étapes sujets phares composants ui rédaction contenu mises en page syntaxe code historique versions mode sombre clair faq questions aide support"
},
{
"lang": "en",
"title": "About",
"url": "about.html",
"desc": "",
"body": "Introduction At DocKit, we are committed to protecting your privacy and ensuring the security of your personal information. This About explains how we collect, use, disclose, and safeguard your information when you visit our documentation site and use our services. By using DocKit, you consent to the data practices described in this policy. Information We Collect Information You Provide to Us We may collect information that you voluntarily provide to us when you: Create an account or register for our services Subscribe to our newsletter or updates Participate in community discussions or forums Submit bug reports or feature requests Contact us for support or inquiries Contribute to our open-source projects This information may include: Name and email address Username and profile information Communication preferences Any other information you choose to provide Information Automatically Col"
},
{
"lang": "en",
"title": "Privacy Policy",
"url": "privacy-policy.html",
"desc": "",
"body": "Introduction At DocKit, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our documentation site and use our services. By using DocKit, you consent to the data practices described in this policy. Information We Collect Information You Provide to Us We may collect information that you voluntarily provide to us when you: Create an account or register for our services Subscribe to our newsletter or updates Participate in community discussions or forums Submit bug reports or feature requests Contact us for support or inquiries Contribute to our open-source projects This information may include: Name and email address Username and profile information Communication preferences Any other information you choose to provide Information Automati"
},
{
"lang": "en",
"title": "Terms & Conditions",
"url": "terms-conditions.html",
"desc": "",
"body": "Introduction At DocKit, we are committed to protecting your privacy and ensuring the security of your personal information. This Terms &amp; Conditions explains how we collect, use, disclose, and safeguard your information when you visit our documentation site and use our services. By using DocKit, you consent to the data practices described in this policy. Information We Collect Information You Provide to Us We may collect information that you voluntarily provide to us when you: Create an account or register for our services Subscribe to our newsletter or updates Participate in community discussions or forums Submit bug reports or feature requests Contact us for support or inquiries Contribute to our open-source projects This information may include: Name and email address Username and profile information Communication preferences Any other information you choose to provide Information "
},
{
"lang": "en",
"title": "Configuration Reference",
"url": "docs/reference/configuration.html",
"desc": "An overview of all the configuration options Starlight supports.",
"body": "Configure the starlight integration Starlight is an integration built on top the Astro web framework. You can configure your project inside the astro.config.mjs configuration file: // astro.config.mjs import { defineConfig } from \"astro/config\" ; import starlight from \"@astrojs/starlight\" ; export default defineConfig ({ integrations : [ starlight ({ title : \"My delightful docs site\" , }), ], }); You can pass the following options to the starlight integration. title (required) type: string | Record&lt;string, string&gt; Set the title for your website. Will be used in metadata and in the browser tab title. The value can be a string, or for multilingual sites, an object with values for each different locale. When using the object form, the keys must be BCP-47 tags (e.g. en , ar , or zh-CN ): starlight ({ title : { en : \"My delightful docs site\" , de : \"Meine bezaubernde Dokumentationsseite"
},
{
"lang": "en",
"title": "Plugins Reference",
"url": "docs/reference/plugin.html",
"desc": "An overview of the Starlight plugin API.",
"body": "Starlight plugins can customize Starlight configuration, UI, and behavior, while also being easy to share and reuse. This reference page documents the API that plugins have access to. Learn more about using a Starlight plugin in the Configuration Reference or visit the plugins showcase to see a list of available plugins. Quick API Reference A Starlight plugin has the following shape. See below for details of the different properties and hook parameters. interface StarlightPlugin { name : string ; hooks : { 'i18n:setup' ?: ( options : { injectTranslations : ( translations : Record &lt; string , Record &lt; string , string &gt;&gt; ) =&gt; void ; }) =&gt; void | Promise &lt; void &gt; ; 'config:setup' : ( options : { config : StarlightUserConfig ; updateConfig : ( newConfig : StarlightUserConfig ) =&gt; void ; addIntegration : ( integration : AstroIntegration ) =&gt; void ; addRouteMiddlew"
},
{
"lang": "en",
"title": "Introduction to DocKit",
"url": "docs/getting-started/navigation.html",
"desc": "Welcome to DocKit - A modern documentation theme built with Astro and Starlight for creating beautiful, fast, and accessible documentation sites.",
"body": "Welcome to DocKit DocKit is a powerful documentation theme that combines the best of modern web technologies to help you create stunning documentation sites. Built on top of Astro and Starlight , DocKit offers everything you need to build professional documentation that developers and users love. What Makes DocKit Special? 🚀 Performance First DocKit leverages Astro's static site generation to deliver lightning-fast loading times. Your documentation loads instantly, providing an excellent user experience across all devices. 📱 Mobile-Responsive Every component is designed with mobile-first principles, ensuring your documentation looks perfect on smartphones, tablets, and desktops. 🌙 Dark Mode Built-in Toggle between light and dark themes seamlessly. DocKit respects user preferences and provides a comfortable reading experience in any lighting condition. 🔍 Powerful Search Full-text search f"
},
{
"lang": "en",
"title": "Quickstart",
"url": "docs/getting-started/introduction/quickstart.html",
"desc": "Configure DocKit's global settings, theme options, and site-wide preferences.",
"body": "DocKit provides flexible global configuration options to customize your documentation site's appearance, behavior, and functionality. This guide covers all the essential settings you can configure. Configuration Files DocKit uses several configuration files located in the src/config/ directory: src/config/ ├── config.json # Main site configuration ├── theme.json # Theme and styling options ├── menu.json # Navigation menu structure ├── social.json # Social media links └── locals.json # Localization settings Main Configuration ( config.json ) The main configuration file controls your site's basic settings: { \"site\" : { \"title\" : \"DocKit Documentation\" , \"description\" : \"Beautiful documentation made simple\" , \"author\" : \"Your Name\" , \"email\" : \"your.email@example.com\" , \"base_url\" : \"https://yourdomain.com\" }, \"metadata\" : { \"meta_author\" : \"DocKit Team\" , \"meta_image\" : \"/images/og-image.p"
},
{
"lang": "en",
"title": "Overview",
"url": "docs/getting-started/introduction/overview.html",
"desc": "An introduction to DocKit and its key features for building beautiful documentation sites.",
"body": "DocKit docs are rendered from MDX files defined as our starter kits. Well organized The transparency of our data will help you make the informed decisions you need to. Other feature The transparency of our data will help you make the informed decisions you need to. Start with an idea DocKit docs are rendered from MDX files and configurations defined as our starter kits. We use GitHub with integrate your docs with your code, and make source control effortless. Onboard through the dashboard or clone our starter kit to get started. Iterate quickly by building product Instead of distributing our components as the npm packages we provide all the source codes directly for your project. This gives you: Complete control over the implementation Ability to customize components to fit your needs No need to wait for package updates or new releases Direct access to modify styles and behavior We are b"
},
{
"lang": "en",
"title": "Global Configuration",
"url": "docs/getting-started/global-settings/configuration.html",
"desc": "Configure DocKit's global settings, theme options, and site-wide preferences.",
"body": "DocKit provides flexible global configuration options to customize your documentation site's appearance, behavior, and functionality. This guide covers all the essential settings you can configure. Configuration Files DocKit uses several configuration files located in the src/config/ directory: src/config/ ├── config.json # Main site configuration ├── theme.json # Theme and styling options ├── menu.json # Navigation menu structure ├── social.json # Social media links └── locals.json # Localization settings Main Configuration ( config.json ) The main configuration file controls your site's basic settings: { \"site\" : { \"title\" : \"DocKit Documentation\" , \"description\" : \"Beautiful documentation made simple\" , \"author\" : \"Your Name\" , \"email\" : \"your.email@example.com\" , \"base_url\" : \"https://yourdomain.com\" }, \"metadata\" : { \"meta_author\" : \"DocKit Team\" , \"meta_image\" : \"/images/og-image.p"
},
{
"lang": "en",
"title": "GitHub Integration",
"url": "docs/configurations/github.html",
"desc": "Configure GitHub integration for your Dockit documentation site",
"body": "Connect your Dockit documentation site with GitHub to enable collaborative editing and version control features. Quick Setup Repository Connection : Link your documentation repository to enable GitHub features Authentication : Set up GitHub authentication for contributors Branch Management : Configure which branches to use for documentation Features Edit on GitHub Enable \"Edit this page\" links that direct users to edit documentation directly on GitHub. Version Control Track changes to your documentation with full Git history and commit tracking. Collaborative Editing Allow team members to contribute to documentation through GitHub pull requests. Automatic Deployments Set up automatic deployments when changes are pushed to your main branch. Configuration Basic Setup { \"github\" : { \"repository\" : \"your-username/your-docs-repo\" , \"branch\" : \"main\" , \"editLinks\" : true } } Authentication Con"
},
{
"lang": "en",
"title": "Custom CSS & JavaScript",
"url": "docs/configurations/custom-css-js.html",
"desc": "Learn how to add custom CSS styles and JavaScript functionality to your Dockit documentation site.",
"body": "Dockit allows you to easily add custom CSS styles and JavaScript functionality to enhance your documentation site's appearance and behavior. This guide covers various methods for implementing custom code. Custom CSS Adding Global Styles You can add global CSS styles that will apply to all pages of your documentation site. Method 1: Using the Theme Configuration Add your custom CSS to the theme configuration file: // src/config/theme.json { \"customCSS\" : [ \"src/styles/custom.css\" , \"src/styles/components.css\" ] } Method 2: Direct CSS Injection Create a CSS file in your src/styles/ directory: /* src/styles/custom.css */ /* Custom color scheme */ : root { --custom-primary : #6366f1 ; --custom-secondary : #8b5cf6 ; --custom-accent : #06b6d4 ; } /* Custom component styling */ . custom-card { background : linear-gradient ( 135 deg , var ( --custom-primary ), var ( --custom-secondary )); border"
},
{
"lang": "en",
"title": "Custom Domain Setup",
"url": "docs/configurations/custom-domain.html",
"desc": "Learn how to configure a custom domain for your Dockit documentation site with detailed setup instructions for various hosting platforms.",
"body": "Setting up a custom domain for your Dockit documentation site helps establish your brand identity and provides a professional appearance. This guide covers the complete process of configuring custom domains across different hosting platforms. Overview A custom domain allows you to serve your documentation from your own branded URL instead of the default hosting provider subdomain. For example: Default : your-docs.netlify.app or your-docs.vercel.app Custom : docs.yourcompany.com or help.yourcompany.com Prerequisites Before setting up a custom domain, ensure you have: Domain ownership : You own or control the domain you want to use DNS access : Ability to modify DNS records for your domain Deployed site : Your Dockit site is already deployed and working SSL certificate : HTTPS support (usually provided automatically) Domain Configuration Options Subdomain Setup (Recommended) Using a subdom"
},
{
"lang": "en",
"title": "Adding Document",
"url": "docs/contents/editing/add-new-doc.html",
"desc": "Learn how to create and organize new documentation pages in your Dockit site.",
"body": "Adding New Documentation Pages This guide will walk you through the process of adding new documentation pages to your Dockit site, organizing them properly, and ensuring they appear in the navigation. File Structure All documentation files are located in the src/content/docs/ directory. The structure looks like this: src/content/docs/ ├── index.mdx # Homepage ├── getting-started/ # Getting started section │ ├── introduction/ │ ├── global-settings/ │ └── navigation.md ├── guides/ # Guides section │ └── example.md ├── reference/ # Reference section │ ├── configuration.mdx │ └── example.mdx ├── resources/ # Resources section │ ├── community-content.mdx │ ├── plugins.mdx │ ├── showcase.mdx │ └── themes.mdx └── contents/ # Additional content ├── components/ └── editing/ Creating a New Page Step 1: Create the File Create a new .md or .mdx file in the appropriate directory: For Markdown (.md): "
},
{
"lang": "en",
"title": "Accordion Component",
"url": "docs/contents/components/accordion.html",
"desc": "A collapsible content component for organizing information in expandable sections.",
"body": "The Accordion component creates collapsible content sections that help organize information in a space-efficient way. Users can click on the header to expand or collapse the content. Props Prop Type Required Description type string No Data attribute for styling or JavaScript targeting question string Yes The header text displayed in the accordion answer string/HTML Yes The content displayed when accordion is expanded Features Interactive Toggle - Click to expand/collapse content Icon Animation - Plus icon rotates when toggled Responsive Design - Works on all screen sizes Custom Styling - Supports theme customization Accessible - Keyboard navigation support Usage Examples Basic Accordion import Accordion from \"../../../../components/user-components/Accordion.astro\"; &lt;Accordion question=\"What is Dockit?\" answer=\"Dockit is a modern documentation theme built with Astro and Starlight.\" /&g"
},
{
"lang": "en",
"title": "Grid Component",
"url": "docs/contents/components/grid.html",
"desc": "A flexible grid layout system for organizing content in responsive columns.",
"body": "The Grid component provides a responsive grid layout system that automatically adapts to different screen sizes, making it perfect for organizing cards, content blocks, or any other elements. Props Prop Type Required Default Description columns number No 2 Number of columns to display on larger screens Features Responsive Design - Automatically adjusts from multi-column to single column on mobile Flexible Columns - Supports 1-6 columns on larger screens Automatic Spacing - Consistent gaps between grid items Slot Content - Accepts any content as children Mobile-First - Single column on small screens, customizable on larger screens Usage Examples Two Column Grid (Default) import Grid from \"../../../../components/user-components/Grid.astro\"; import { Card } from '@astrojs/starlight/components'; &lt;Grid&gt; &lt;Card title=\"Feature One\"&gt; Description of the first feature &lt;/Card&gt; &lt;"
},
{
"lang": "en",
"title": "ListCard Component",
"url": "docs/contents/components/list-card.html",
"desc": "A card component for displaying categorized content lists with icons and article counts.",
"body": "The ListCard component creates attractive cards that display content categories with icons, titles, article counts, and optional featured images. Perfect for organizing documentation sections or feature lists. Props Prop Type Required Description title string Yes The main title displayed in the card header imageIcon string Yes Path to the icon image (40x40px recommended) number number Yes Number of articles or items in this category image string No Optional featured image for wide card layout Features Icon Display - Shows category icons with proper alt text Article Counter - Displays the number of items in each category Two Layout Modes - Compact and wide layouts based on image presence Responsive Design - Adapts to different screen sizes Slot Content - Accepts custom content in the card body Image Integration - Uses ImageMod component for optimized images Usage Examples Basic ListCard i"
},
{
"lang": "en",
"title": "Using Components",
"url": "docs/contents/components/using-components.html",
"desc": "Learn how to use and customize components in your documentation.",
"body": "Dockit provides multiple component options for building rich, interactive documentation. You have access to both Astro Starlight's built-in components and a collection of custom premade components. Astro Starlight Components You can use all the powerful components that come with Astro Starlight framework. These include cards, badges, code blocks, tabs, and many other useful documentation elements. For complete documentation and usage examples of all available Starlight components, visit: https://starlight.astro.build/components/using-components/ Dockit Premade Components In addition to Starlight components, Dockit includes a collection of custom-built components designed specifically for documentation needs. All these components are located in the user-components folder. Available Custom Components The following premade components are available for use in your documentation: Accordion - "
},
{
"lang": "en",
"title": "NewCard Component",
"url": "docs/contents/components/child-components/new-card.html",
"desc": "A modern card component with icons, hover effects, and gradient borders for showcasing content.",
"body": "The NewCard component is a versatile, modern card element perfect for showcasing features, services, or content blocks. It includes beautiful styling, icon support, and interactive hover effects. Props Prop Type Required Default Description icon string No - Starlight icon name to display title string Yes - The card title (supports HTML) iconColor string No - Custom color for the icon size string No \"large\" Card size variant (\"large\" or \"sm\") Features Icon Integration - Uses Starlight's icon system Two Size Variants - Large (default) and small options Hover Animation - Arrow icon with rotation effect Gradient Styling - Modern gradient borders and backgrounds HTML Support - Title prop supports HTML content Responsive Design - Adapts to different screen sizes Slot Content - Accepts custom content in the card body Usage Examples Basic NewCard import NewCard from \"../../../../components/user-"
},
{
"lang": "en",
"title": "Button Component",
"url": "docs/contents/components/child-components/more-child/button.html",
"desc": "A simple, customizable button component with multiple style variants.",
"body": "The Button component provides a clean, accessible button element that can be styled with different variants to match your design needs. Props Prop Type Required Description label string Yes The text displayed on the button link string Yes The URL the button should link to variant string No Style variant (primary, secondary, outline, etc.) Features Multiple Variants - Different visual styles for various use cases Accessible Links - Properly structured anchor elements Responsive Design - Adapts to different screen sizes Custom Styling - Easy to extend with additional CSS classes Semantic HTML - Uses proper link elements for navigation Usage Examples Primary Button import Button from \"../../../../components/user-components/Button.astro\"; &lt;Button label=\"Get Started\" link=\"/getting-started\" variant=\"primary\" /&gt; Secondary Button import Button from \"../../../../components/user-components/"
},
{
"lang": "fr",
"title": "À propos",
"url": "fr/about.html",
"desc": "",
"body": "Introduction Chez DocKit, nous nous engageons à protéger votre vie privée et à assurer la sécurité de vos informations personnelles. Cette page À propos explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site de documentation et utilisez nos services. En utilisant DocKit, vous consentez aux pratiques de données décrites dans cette politique. Informations que nous collectons Informations que vous nous fournissez Nous pouvons collecter des informations que vous nous fournissez volontairement lorsque vous : Créez un compte ou vous inscrivez à nos services Vous abonnez à notre newsletter ou aux mises à jour Participez aux discussions ou forums de la communauté Soumettez des rapports de bugs ou des demandes de fonctionnalités Nous contactez pour obtenir de l'aide ou des renseignements Contribuez à nos projets open-source Ces infor"
},
{
"lang": "fr",
"title": "Politique de Confidentialité",
"url": "fr/privacy-policy.html",
"desc": "",
"body": "Introduction Chez DocKit, nous nous engageons à protéger votre vie privée et à assurer la sécurité de vos informations personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site de documentation et utilisez nos services. En utilisant DocKit, vous consentez aux pratiques de données décrites dans cette politique. Informations que nous collectons Informations que vous nous fournissez Nous pouvons collecter des informations que vous nous fournissez volontairement lorsque vous : Créez un compte ou vous inscrivez à nos services Vous abonnez à notre newsletter ou aux mises à jour Participez aux discussions ou forums de la communauté Soumettez des rapports de bugs ou des demandes de fonctionnalités Nous contactez pour obtenir de l'aide ou des renseignements Contribuez à nos projets open-s"
},
{
"lang": "fr",
"title": "Conditions Générales",
"url": "fr/terms-conditions.html",
"desc": "",
"body": "Introduction Chez DocKit, nous nous engageons à protéger votre vie privée et à assurer la sécurité de vos informations personnelles. Ces Conditions Générales expliquent comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site de documentation et utilisez nos services. En utilisant DocKit, vous consentez aux pratiques de données décrites dans cette politique. Informations que nous collectons Informations que vous nous fournissez Nous pouvons collecter des informations que vous nous fournissez volontairement lorsque vous : Créez un compte ou vous inscrivez à nos services Vous abonnez à notre newsletter ou aux mises à jour Participez aux discussions ou forums de la communauté Soumettez des rapports de bugs ou des demandes de fonctionnalités Nous contactez pour obtenir de l'aide ou des renseignements Contribuez à nos projets open-source Ce"
},
{
"lang": "fr",
"title": "Référence de Configuration",
"url": "fr/docs/reference/configuration.html",
"desc": "Un aperçu de toutes les options de configuration prises en charge par Starlight.",
"body": "Configurer l'intégration starlight Starlight est une intégration construite sur le framework web Astro . Vous pouvez configurer votre projet dans le fichier de configuration astro.config.mjs : // astro.config.mjs import { defineConfig } from 'astro/config' ; import starlight from '@astrojs/starlight' ; export default defineConfig ({ integrations : [ starlight ({ title : 'Mon super site de documentation' , }), ], }); Vous pouvez passer les options suivantes à l'intégration starlight . title (requis) type: string | Record&lt;string, string&gt; Définissez le titre de votre site web. Utilisé dans les métadonnées et dans le titre de l'onglet du navigateur. La valeur peut être une chaîne, ou pour les sites multilingues, un objet avec des valeurs pour chaque locale différente. Lors de l'utilisation de la forme objet, les clés doivent être des balises BCP-47 (par ex. en , ar , ou zh-CN ): starli"
},
{
"lang": "fr",
"title": "Référence des Plugins",
"url": "fr/docs/reference/plugin.html",
"desc": "Un aperçu de l'API des plugins Starlight.",
"body": "Les plugins Starlight peuvent personnaliser la configuration, l'interface utilisateur et le comportement de Starlight, tout en étant faciles à partager et à réutiliser. Cette page de référence documente l'API à laquelle les plugins ont accès. Pour en savoir plus sur l'utilisation d'un plugin Starlight, consultez la Référence de Configuration ou visitez la vitrine des plugins pour voir une liste des plugins disponibles. Référence API rapide Un plugin Starlight a la forme suivante. Voir ci-dessous pour plus de détails sur les différentes propriétés et paramètres de hook. interface StarlightPlugin { name : string ; hooks : { 'i18n:setup' ?: ( options : { injectTranslations : ( translations : Record &lt; string , Record &lt; string , string &gt;&gt; ) =&gt; void ; }) =&gt; void | Promise &lt; void &gt; ; 'config:setup' : ( options : { config : StarlightUserConfig ; updateConfig : ( newConfig"
},
{
"lang": "fr",
"title": "Introduction à DocKit",
"url": "fr/docs/getting-started/navigation.html",
"desc": "Bienvenue sur DocKit - Un thème de documentation moderne construit avec Astro et Starlight pour créer des sites de documentation beaux, rapides et accessibles.",
"body": "Bienvenue sur DocKit DocKit est un thème de documentation puissant qui combine le meilleur des technologies web modernes pour vous aider à créer des sites de documentation époustouflants. Construit sur Astro et Starlight , DocKit offre tout ce dont vous avez besoin pour créer une documentation professionnelle que les développeurs et les utilisateurs adorent. Qu'est-ce qui rend DocKit spécial? 🚀 Performance d'abord DocKit utilise la génération de site statique d'Astro pour fournir des temps de chargement ultra-rapides. Votre documentation se charge instantanément et offre une excellente expérience utilisateur sur tous les appareils. 📱 Responsive mobile Chaque composant est conçu avec des principes mobile-first, garantissant que votre documentation s'affiche parfaitement sur smartphones, tablettes et ordinateurs de bureau. 🌙 Mode sombre intégré Basculez facilement entre les thèmes clair et"
},
{
"lang": "fr",
"title": "Démarrage rapide",
"url": "fr/docs/getting-started/introduction/quickstart.html",
"desc": "Configurez les paramètres globaux de DocKit, les options de thème et les préférences à l'échelle du site.",
"body": "DocKit offre des options de configuration globale flexibles pour personnaliser l'apparence, le comportement et les fonctionnalités de votre site de documentation. Ce guide couvre tous les paramètres essentiels que vous pouvez configurer. Fichiers de configuration DocKit utilise plusieurs fichiers de configuration situés dans le répertoire src/config/ : src/config/ ├── config.json # Configuration principale du site ├── theme.json # Options de thème et de style ├── menu.json # Structure du menu de navigation ├── social.json # Liens de réseaux sociaux └── locals.json # Paramètres de localisation Configuration principale ( config.json ) Le fichier de configuration principal contrôle les paramètres de base de votre site: { \"site\" : { \"title\" : \"Documentation DocKit\" , \"description\" : \"Belle documentation rendue facile\" , \"author\" : \"Votre nom\" , \"email\" : \"votre.email@exemple.com\" , \"base_url"
},
{
"lang": "fr",
"title": "Aperçu",
"url": "fr/docs/getting-started/introduction/overview.html",
"desc": "Une introduction à DocKit et ses principales fonctionnalités pour créer de beaux sites de documentation.",
"body": "La documentation DocKit est rendue à partir de fichiers MDX définis comme nos kits de démarrage. Bien organisé La transparence de nos données vous aide à prendre les décisions éclairées dont vous avez besoin. Autre fonctionnalité La transparence de nos données vous aide à prendre les décisions éclairées dont vous avez besoin. Commencez avec une idée La documentation DocKit est rendue à partir de fichiers MDX et de configurations définies comme nos kits de démarrage. Nous utilisons GitHub pour intégrer vos docs à votre code et rendre le contrôle de version sans effort. Montez à bord via le tableau de bord ou clonez notre kit de démarrage pour commencer. Itérez rapidement en construisant le produit Au lieu de distribuer nos composants sous forme de packages npm, nous fournissons tout le code source directement pour votre projet. Cela vous donne: Contrôle total sur l'implémentation Possibil"
},
{
"lang": "fr",
"title": "Configuration globale",
"url": "fr/docs/getting-started/global-settings/configuration.html",
"desc": "Configurez les paramètres globaux de DocKit, les options de thème et les préférences à l'échelle du site.",
"body": "DocKit offre des options de configuration globale flexibles pour personnaliser l'apparence, le comportement et les fonctionnalités de votre site de documentation. Ce guide couvre tous les paramètres essentiels que vous pouvez configurer. Fichiers de configuration DocKit utilise plusieurs fichiers de configuration situés dans le répertoire src/config/ : src/config/ ├── config.json # Configuration principale du site ├── theme.json # Options de thème et de style ├── menu.json # Structure du menu de navigation ├── social.json # Liens de réseaux sociaux └── locals.json # Paramètres de localisation Configuration principale ( config.json ) Le fichier de configuration principal contrôle les paramètres de base de votre site: { \"site\" : { \"title\" : \"Documentation DocKit\" , \"description\" : \"Belle documentation rendue facile\" , \"author\" : \"Votre nom\" , \"email\" : \"votre.email@exemple.com\" , \"base_url"
},
{
"lang": "fr",
"title": "CSS & JavaScript personnalisés",
"url": "fr/docs/configurations/custom-css-js.html",
"desc": "Apprenez à ajouter des styles CSS personnalisés et des fonctionnalités JavaScript à votre site de documentation Dockit.",
"body": "Dockit vous permet d'ajouter facilement des styles CSS personnalisés et des fonctionnalités JavaScript pour améliorer l'apparence et le comportement de votre site de documentation. Ce guide couvre différentes méthodes pour implémenter du code personnalisé. CSS personnalisé Ajouter des styles globaux Vous pouvez ajouter des styles CSS globaux qui s'appliquent à toutes les pages de votre site de documentation. Méthode 1: Utilisation de la configuration du thème Ajoutez votre CSS personnalisé au fichier de configuration du thème: // src/config/theme.json { \"customCSS\" : [ \"src/styles/custom.css\" , \"src/styles/components.css\" ] } Méthode 2: Injection CSS directe Créez un fichier CSS dans votre répertoire src/styles/ : /* src/styles/custom.css */ /* Palette de couleurs personnalisée */ : root { --custom-primary : #6366f1 ; --custom-secondary : #8b5cf6 ; --custom-accent : #06b6d4 ; } /* Style "
},
{
"lang": "fr",
"title": "Configurer un domaine personnalisé",
"url": "fr/docs/configurations/custom-domain.html",
"desc": "Apprenez à configurer un domaine personnalisé pour votre site de documentation Dockit avec des instructions détaillées pour différentes plateformes d'hébergement.",
"body": "La configuration d'un domaine personnalisé pour votre site de documentation Dockit aide à établir votre identité de marque et assure une apparence professionnelle. Ce guide couvre le processus complet de configuration de domaines personnalisés sur différentes plateformes d'hébergement. Aperçu Un domaine personnalisé vous permet de servir votre documentation depuis votre propre URL de marque au lieu du sous-domaine par défaut du fournisseur d'hébergement. Par exemple: Par défaut : your-docs.netlify.app ou your-docs.vercel.app Personnalisé : docs.votreentreprise.com ou help.votreentreprise.com Prérequis Avant de configurer un domaine personnalisé, assurez-vous d'avoir: Propriété du domaine : Vous possédez ou gérez le domaine que vous souhaitez utiliser Accès DNS : Possibilité de modifier les enregistrements DNS pour votre domaine Site déployé : Votre site Dockit est déjà déployé et fonctio"
},
{
"lang": "fr",
"title": "Intégration GitHub",
"url": "fr/docs/configurations/github.html",
"desc": "Configurez l'intégration GitHub pour votre site de documentation Dockit",
"body": "Connectez votre site de documentation Dockit avec GitHub pour activer les fonctionnalités d'édition collaborative et de contrôle de version. Installation rapide Connexion au dépôt : Connectez votre dépôt de documentation pour activer les fonctionnalités GitHub Authentification : Configurez l'authentification GitHub pour les contributeurs Gestion des branches : Configurez les branches à utiliser pour la documentation Fonctionnalités Éditer sur GitHub Activez les liens \"Modifier cette page\" qui redirigent les utilisateurs vers l'édition directe de la documentation sur GitHub. Contrôle de version Suivez les modifications de votre documentation avec l'historique Git complet et le suivi des commits. Édition collaborative Permettez aux membres de l'équipe de contribuer à la documentation via des pull requests GitHub. Déploiements automatiques Configurez des déploiements automatiques lorsque de"
},
{
"lang": "fr",
"title": "Ajouter un document",
"url": "fr/docs/contents/editing/add-new-doc.html",
"desc": "Apprenez à créer et organiser de nouvelles pages de documentation dans votre site Dockit.",
"body": "Ajouter de nouvelles pages de documentation Ce guide vous accompagne dans le processus d'ajout de nouvelles pages de documentation à votre site Dockit, leur organisation correcte et la garantie qu'elles apparaissent dans la navigation. Structure des fichiers Tous les fichiers de documentation se trouvent dans le répertoire src/content/docs/ . La structure ressemble à ceci: src/content/docs/ ├── index.mdx # Page d'accueil ├── getting-started/ # Section pour commencer │ ├── introduction/ │ ├── global-settings/ │ └── navigation.md ├── guides/ # Section guides │ └── example.md ├── reference/ # Section référence │ ├── configuration.mdx │ └── example.mdx ├── resources/ # Section ressources │ ├── community-content.mdx │ ├── plugins.mdx │ ├── showcase.mdx │ └── themes.mdx └── contents/ # Contenu supplémentaire ├── components/ └── editing/ Créer une nouvelle page Étape 1: Créer le fichier Créez u"
},
{
"lang": "fr",
"title": "Composant Accordion",
"url": "fr/docs/contents/components/accordion.html",
"desc": "Un composant de contenu pliable pour organiser les informations dans des sections extensibles.",
"body": "Le composant Accordion crée des sections de contenu pliables qui aident à organiser les informations de manière efficace en termes d'espace. Les utilisateurs peuvent cliquer sur l'en-tête pour développer ou réduire le contenu. Props Prop Type Requis Description type string Non Attribut de données pour le style ou le ciblage JavaScript question string Oui Le texte de l'en-tête affiché dans l'accordéon answer string/HTML Oui Le contenu affiché lorsque l'accordéon est développé Fonctionnalités Basculement interactif - Cliquez pour développer/réduire le contenu Animation d'icône - L'icône plus tourne lors du basculement Design responsive - Fonctionne sur toutes les tailles d'écran Style personnalisé - Prend en charge la personnalisation du thème Accessible - Support de la navigation au clavier Exemples d'utilisation Accordion de base import Accordion from \"../../../../components/user-compone"
},
{
"lang": "fr",
"title": "Composant Grid",
"url": "fr/docs/contents/components/grid.html",
"desc": "Un système de mise en page en grille flexible pour organiser le contenu en colonnes responsives.",
"body": "Le composant Grid offre un système de mise en page en grille responsive qui s'adapte automatiquement aux différentes tailles d'écran, ce qui le rend parfait pour organiser des cartes, des blocs de contenu ou d'autres éléments. Props Prop Type Requis Défaut Description columns number Non 2 Nombre de colonnes à afficher sur les grands écrans Fonctionnalités Design responsive - S'adapte automatiquement de plusieurs colonnes à une seule colonne sur mobile Colonnes flexibles - Prend en charge 1 à 6 colonnes sur les grands écrans Espacement automatique - Espaces cohérents entre les éléments de la grille Contenu slot - Accepte tout contenu comme enfants Mobile-first - Colonne unique sur petits écrans, adaptable sur grands écrans Exemples d'utilisation Grille deux colonnes (Par défaut) import Grid from \"../../../../components/user-components/Grid.astro\"; import { Card } from '@astrojs/starlight/"
},
{
"lang": "fr",
"title": "Composant ListCard",
"url": "fr/docs/contents/components/list-card.html",
"desc": "Un composant de carte pour afficher des listes de contenu catégorisées avec des icônes et des compteurs d'articles.",
"body": "Le composant ListCard crée des cartes attrayantes qui affichent des catégories de contenu avec des icônes, des titres, des compteurs d'articles et des images en vedette optionnelles. Parfait pour organiser des sections de documentation ou des listes de fonctionnalités. Props Prop Type Requis Description title string Oui Le titre principal affiché dans l'en-tête de la carte imageIcon string Oui Chemin vers l'image d'icône (40x40px recommandé) number number Oui Nombre d'articles ou d'éléments dans cette catégorie image string Non Image en vedette optionnelle pour une mise en page de carte large Fonctionnalités Affichage d'icône - Affiche les icônes de catégorie avec le texte alt approprié Compteur d'articles - Affiche le nombre d'éléments dans chaque catégorie Deux modes de mise en page - Mises en page compactes et larges basées sur la présence d'image Design responsive - S'adapte aux diff"
},
{
"lang": "fr",
"title": "Utiliser les composants",
"url": "fr/docs/contents/components/using-components.html",
"desc": "Apprenez à utiliser et personnaliser les composants dans votre documentation.",
"body": "Dockit offre plusieurs options de composants pour créer une documentation riche et interactive. Vous avez accès aux composants intégrés d'Astro Starlight ainsi qu'à une collection de composants personnalisés pré-construits. Composants Astro Starlight Vous pouvez utiliser tous les composants puissants fournis avec le framework Astro Starlight. Ceux-ci incluent des cartes, des badges, des blocs de code, des onglets et de nombreux autres éléments de documentation utiles. Pour une documentation complète et des exemples d'utilisation de tous les composants Starlight disponibles, visitez: https://starlight.astro.build/components/using-components/ Composants pré-construits Dockit En plus des composants Starlight, Dockit contient une collection de composants spécialement conçus pour les besoins de documentation. Tous ces composants se trouvent dans le dossier user-components . Composants personn"
},
{
"lang": "fr",
"title": "Composant NewCard",
"url": "fr/docs/contents/components/child-components/new-card.html",
"desc": "Un composant de carte moderne avec icônes, effets de survol et bordures en dégradé pour afficher le contenu.",
"body": "Le composant NewCard est un élément de carte polyvalent et moderne parfait pour présenter des fonctionnalités, des services ou des blocs de contenu. Il comprend un beau style, un support d'icône et des effets de survol interactifs. Props Prop Type Requis Défaut Description icon string Non - Nom de l'icône Starlight à afficher title string Oui - Le titre de la carte (prend en charge HTML) iconColor string Non - Couleur personnalisée pour l'icône size string Non \"large\" Variante de taille de carte (\"large\" ou \"sm\") Fonctionnalités Intégration d'icône - Utilise le système d'icônes de Starlight Deux variantes de taille - Options grande (par défaut) et petite Animation au survol - Icône de flèche avec effet de rotation Style en dégradé - Bordures et arrière-plans en dégradé modernes Support HTML - La prop titre prend en charge le contenu HTML Design responsive - S'adapte aux différentes taill"
},
{
"lang": "fr",
"title": "Composant Button",
"url": "fr/docs/contents/components/child-components/more-child/button.html",
"desc": "Un composant de bouton simple et personnalisable avec plusieurs variantes de style.",
"body": "Le composant Button offre un élément de bouton propre et accessible qui peut être stylisé avec différentes variantes pour correspondre à vos besoins de conception. Props Prop Type Requis Description label string Oui Le texte affiché sur le bouton link string Oui L'URL vers laquelle le bouton doit pointer variant string Non Variante de style (primary, secondary, outline, etc.) Fonctionnalités Plusieurs variantes - Différents styles visuels pour différents cas d'utilisation Liens accessibles - Éléments d'ancrage correctement structurés Design responsive - S'adapte aux différentes tailles d'écran Style personnalisé - Facile à étendre avec des classes CSS supplémentaires HTML sémantique - Utilise les bons éléments de lien pour la navigation Exemples d'utilisation Bouton primaire import Button from \"../../../../components/user-components/Button.astro\"; &lt;Button label=\"Commencer\" link=\"/gett"
}
];

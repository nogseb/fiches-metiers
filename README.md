# Guide des Métiers TBS Education — POC

Section statique de fiches métiers (React / Vite compilé), publiée en prévisualisation sous
[nogues.app/fiches-metiers](https://nogues.app/fiches-metiers/).

## Structure

```
site/                    ← Site à publier (contenu de www/fiches-metiers)
  index.html
  .htaccess              ← Réécriture Apache pour les URLs /fiche/{slug} (mod_rewrite requis)
  assets/                ← JS et CSS compilés
  images/hero/           ← Visuels des fiches ({slug}.webp)
  images/thumb/          ← Vignettes des cards ({slug}_thumb.webp)
  images/logo-tbs-*.svg  ← Logos TBS Education
data/
  metiers.json           ← 95 fiches métiers FR (export Airtable)
  formations.json        ← Formations TBS Education avec URLs
scripts/
  sync-airtable.mjs      ← Synchronisation Airtable → JSON (jeton : variable AIRTABLE_TOKEN)
gabarits/                ← Gabarits archive / single, labels FR/EN/ES, documentation expert IA
.github/workflows/       ← Publication SFTP vers OVHcloud
```

## Publication

Chaque push sur `main` qui modifie `site/` publie le site via GitHub Actions
(secrets `OVH_SFTP_HOST`, `OVH_SFTP_USER`, `OVH_SFTP_PASSWORD`). Lancement manuel possible
depuis l'onglet Actions.

## Adaptations apportées au build Manus

Le build livré par Manus visait la racine d'un domaine et dépendait de l'hébergement Manus.
Il a été adapté directement dans les fichiers compilés :

- chemins des JS, CSS, liens internes et routeur ramenés sous `/fiches-metiers/` ;
- visuels des fiches et logos servis depuis `site/images/` au lieu de `/manus-storage/` ;
- vignettes `_thumb` utilisées pour les cards et les métiers similaires ;
- retrait des scripts Manus (runtime d'édition, collecteur de débogage, statistiques Umami) ;
- liens EN / ES masqués (versions non publiées) ;
- balise `noindex, nofollow` : prévisualisation, à ne pas indexer sous ce domaine.

Ces adaptations seront perdues à chaque nouveau build Manus : à reporter dans les sources
(`base: '/fiches-metiers/'` dans Vite, base du routeur, chemins d'images) ou à réappliquer.

## Resynchronisation Airtable

```bash
AIRTABLE_TOKEN=pat... node scripts/sync-airtable.mjs
```

Le script écrit les données ; le site compilé embarque les siennes et doit être reconstruit pour
les afficher.

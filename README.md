# Guide des Métiers TBS Education — Livrable POC

## Structure du livrable

```
site/          ← Build statique (déployer via sFTP sur Apache)
  index.html
  assets/
  .htaccess    ← Règle de réécriture Apache (obligatoire)
data/
  metiers.json     ← 95 fiches métiers FR
  formations.json  ← 29 formations TBS avec URLs
scripts/
  sync-airtable.mjs  ← Script de synchronisation Airtable → JSON
assets/
  hero/          ← Images hero nommées par slug ({slug}.webp)
  thumb/         ← Vignettes nommées par slug ({slug}_thumb.webp)
gabarits/
  GABARIT_ARCHIVE.json      ← Gabarit page listing
  GABARIT_SINGLE.json       ← Gabarit page fiche complète
  i18n-labels.json          ← Labels UI FR/EN/ES
  DOCUMENTATION_EXPERT_IA.md  ← Documentation complète
  DOCUMENTATION_EXPERT_IA.pdf ← Version PDF
```

## Déploiement Apache

1. Uploader le contenu de `site/` sur le serveur Apache via sFTP
2. S'assurer que le module `mod_rewrite` est activé
3. Le fichier `.htaccess` gère le routing SPA automatiquement

## Resynchronisation Airtable

```bash
node scripts/sync-airtable.mjs
```

Puis redéployer le fichier `data/metiers.json` mis à jour.

## Versions EN / ES

Dupliquer `data/metiers.json`, traduire les champs textuels selon `gabarits/i18n-labels.json`, 
déployer dans les répertoires `/careers/` (EN) et `/carreras/` (ES).

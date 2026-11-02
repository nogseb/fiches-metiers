# Documentation Expert IA — Génération des Fiches Métiers TBS Education

## 1. Contexte et objectif

TBS Education déploie un **Guide des Métiers** en ligne, accessible en trois langues (FR, EN, ES). Ce guide recense les débouchés professionnels des diplômés de TBS Education : salaires, missions, compétences, formations associées.

L'objectif de cette documentation est de permettre à un agent IA de **générer automatiquement les fichiers de données JSON** qui alimentent ce guide, à partir d'informations glanées sur des sources publiques (APEC, France Travail, Hellowork, Onisep, etc.) ou fournies par TBS Education.

Le site consomme un unique fichier par langue :

| Fichier | Langue | URL cible |
|---------|--------|-----------|
| `metiers-fr.json` | Français | tbs-education.fr/carrieres/ |
| `metiers-en.json` | Anglais | tbs-education.com/careers/ |
| `metiers-es.json` | Espagnol | tbs-education.es/carreras/ |

---

## 2. Architecture des données

Chaque fichier JSON est un **tableau d'objets**, un objet par fiche métier. Chaque objet contient l'ensemble des champs nécessaires à l'affichage sur la page listing (archive) **et** sur la page détail (single) — il n'y a pas deux fichiers séparés.

```
metiers-fr.json
└── [ ]  ← tableau
    ├── { }  ← fiche 1 : Directeur marketing
    ├── { }  ← fiche 2 : Directeur de la communication
    ├── { }  ← fiche 3 : Consultant en stratégie
    └── ...  ← 95 fiches au total (cible : 99)
```

### 2.1 Deux niveaux de complétude

Toutes les fiches n'ont pas le même niveau de complétude. Le site gère les deux cas :

| Niveau | Champs requis | Affichage |
|--------|--------------|-----------|
| **Minimal** (fiche Airtable) | slug, title, domaine_activite, secteur_id, formations_tbs | Card listing sans salaire ni badge |
| **Complet** (fiche validée) | Tous les champs | Card + modal + page single avec contenu riche |

Pour une fiche minimale, les champs non renseignés doivent être : `""` pour les chaînes, `0` pour les entiers, `[]` pour les tableaux.

---

## 3. Description de chaque champ

### 3.1 Champs d'identification (INVARIANTS entre les langues)

| Champ | Type | Contrainte | Exemple |
|-------|------|-----------|---------|
| `slug` | string | Unique, minuscules, sans accents, tirets. Sert d'URL (`/fiche/directeur-marketing`). **Identique dans les 3 langues.** | `"directeur-marketing"` |
| `secteur_id` | enum | Voir référentiel §4.1. | `"marketing"` |
| `remuneration_min` | integer | k€ brut annuel. `0` si inconnu. | `48` |
| `remuneration_max` | integer | k€ brut annuel. `0` si inconnu. | `113` |
| `formations_tbs` | string[] | Labels **exacts** du référentiel §4.2. | `["PGE", "MSc Digital Marketing and e-Commerce"]` |
| `metiers_lies` | string[] | Slugs d'autres fiches du même fichier. | `["directeur-de-la-communication"]` |
| `image` | string | URL absolue d'une image (paysage, min 800×500px). `""` si aucune. | `""` |
| `source_apec_url` | string | URL de la fiche APEC correspondante. `""` si inexistante. | `"https://www.apec.fr/..."` |
| `source_france_travail_url` | string | URL France Travail. Optionnel. | `""` |

### 3.2 Champs à traduire (VARIENT selon la langue)

| Champ | Type | Contrainte | Exemple FR |
|-------|------|-----------|------------|
| `title` | string | Intitulé du métier en casse normale (pas tout en majuscules). | `"Directeur marketing"` |
| `descriptif_court` | string | Accroche, **max 160 caractères**, sans HTML. Utilisé comme meta description SEO. | `"Pilotez la stratégie marketing..."` |
| `descriptif_general` | HTML | Description complète. **Minimum 2 paragraphes `<p>`**. Le 1er est affiché par défaut dans le modal ; les suivants apparaissent au clic sur "En savoir plus". Longueur : 150–300 mots. | `"<p>Le Directeur...</p><p>Il supervise...</p>"` |
| `missions_principales` | string[] | 3 à 7 missions. Texte brut, 1 phrase par item. | `["Définir la stratégie...", "Superviser..."]` |
| `competences_hard_skills` | string[] | 3 à 7 compétences techniques. Texte brut. | `["Maîtrise CRM", "Expertise SEO/SEA"]` |
| `competences_soft_skills` | string[] | 3 à 7 compétences comportementales. Texte brut. | `["Leadership", "Vision stratégique"]` |
| `competences_tags` | string[] | 2 à 4 badges courts (2–3 mots max) affichés sur la card. | `["Stratégie marketing", "Digital"]` |
| `domaine_activite` | string | Libellé du secteur. Voir référentiel §4.1. En FR : libellé exact. En EN/ES : traduire le libellé. | `"Marketing – Communication – Marque – Digital"` |
| `employabilite` | enum | Valeurs autorisées : `"Très recherché"`, `"Favorable"`, `"Modérée"`, `"Difficile"`, `""`. Ne renseigner que pour les fiches validées. | `"Très recherché"` |
| `niveau_etudes` | string | FR : `"Bac +5"` / EN : `"Master's degree (Bac+5)"` / ES : `"Máster (Bac+5)"` | `"Bac +5"` |
| `appetences` | string[] | Centres d'intérêt. Ex : `"Digital"`, `"Business"`, `"Art"`, `"Entrepreneuriat"`. | `["Business", "Digital"]` |
| `meta_title` | string | Titre SEO, **max 60 caractères**. | `"Directeur marketing – Fiche métier TBS Education"` |
| `meta_description` | string | Description SEO, **max 160 caractères**. Peut être identique à `descriptif_court`. | `"Pilotez la stratégie marketing..."` |
| `parcours_evolution` | string | Parcours d'évolution typique. Texte brut ou HTML simple. Optionnel (`""`). | `""` |

---

## 4. Référentiels obligatoires

### 4.1 Secteurs d'activité

Le champ `secteur_id` doit être l'une des 9 valeurs suivantes. Le champ `domaine_activite` doit correspondre au libellé associé (en FR).

| secteur_id | domaine_activite (FR) |
|-----------|----------------------|
| `strategie` | Management – Stratégie – Conseil – Innovation |
| `finance` | Finance – Audit – Contrôle – Banque – Risk |
| `business` | Commerce – Business – Entrepreneuriat |
| `supply` | Supply Chain – Achats – Logistique – Opérations |
| `data` | Data – IT – Produit – Transformation digitale |
| `marketing` | Marketing – Communication – Marque – Digital |
| `rh` | Ressources humaines – Management – Organisation |
| `rse` | RSE – Qualité – Développement durable |
| `specifiques` | Secteurs spécifiques (aéronautique, sport, luxe, tourisme, culture) |

### 4.2 Formations TBS Education (29 labels exacts)

Ces labels sont issus de la table Airtable "Formation TBS (instance FR)". Utiliser **exclusivement** ces libellés dans le champ `formations_tbs`. Tout label non reconnu n'affichera pas de bouton cliquable sur le site.

```
Bachelor
PGE
MSc Digital Transformation & Business Innovation
MSc Cultural Management: Music, Screen and Video Games
MSc Digital Marketing and e-Commerce
MSc Aerospace Management
MSc International Luxury Industries Management
MSc Entrepreneurship
MSc Marketing & Management in Sport Organizations
MSc Fashion and Luxury Marketing
MSc Finance
MSc Relations et Ressources Humaines
MSc Brand Management and Creativity
MSc Digital Marketing & Analytics
MS Expert en Audit Interne et Contrôle de Gestion
MSc Marketing Management & Communication
MS Expert en Banque et Ingénierie Financière
MS Juriste Manager des Affaires
MS Manager Achats & Supply Chain
MS Manager de l'Innovation Technologique
MS Manager de Structures Sanitaires & Sociales
MS Manager Marketing & Commercial dans les Industries de Santé
MS Manager des Ressources Humaines
Executive Global MBA
MSc Banking International Finance
MSc Communication & Brand Content
MSc Data Science & AI
MSc International Business
MSc Purchasing & Supply Chain Manager
```

---

## 5. Workflow de génération recommandé

### Étape 1 — Glaner les informations sources

Pour chaque métier, consulter dans cet ordre de priorité :
1. Fiche APEC (source principale, données salariales fiables)
2. France Travail / Pôle Emploi
3. Hellowork, Onisep, L'Étudiant (compléments)
4. Offres d'emploi actives (pour les compétences réelles du marché)

### Étape 2 — Générer la version FR

Produire un objet JSON complet pour chaque fiche en FR. Vérifier :
- Le `slug` est unique et conforme (minuscules, tirets, sans accents)
- Le `secteur_id` est dans le référentiel §4.1
- Les `formations_tbs` sont dans le référentiel §4.2
- Le `descriptif_general` contient au moins 2 paragraphes `<p>`
- Le `descriptif_court` ne dépasse pas 160 caractères
- Les salaires sont des entiers (pas de décimales, pas de `"k€"`)

### Étape 3 — Générer les versions EN et ES

Pour chaque fiche FR, créer les versions EN et ES en :
1. Copiant les champs INVARIANTS tels quels (slug, secteur_id, remuneration_min/max, formations_tbs, metiers_lies, image, source_apec_url)
2. Traduisant les champs TRADUIRE (title, descriptif_court, descriptif_general, missions, compétences, tags, niveau_etudes, meta_title, meta_description)
3. Adaptant `domaine_activite` dans la langue cible (ex EN : "Marketing – Communication – Brand – Digital")

### Étape 4 — Valider le JSON

Avant livraison, valider chaque fichier :
```bash
python3 -m json.tool metiers-fr.json > /dev/null && echo "JSON valide"
```

### Étape 5 — Livrer les fichiers

Livrer 3 fichiers :
- `metiers-fr.json`
- `metiers-en.json`
- `metiers-es.json`

Ces fichiers remplacent directement `client/src/data/metiers.json` dans le projet (ou les 3 variantes linguistiques selon la configuration multi-langue).

---

## 6. Prompt système recommandé pour l'IA de génération

Le prompt suivant peut être utilisé comme instruction système pour un agent IA dédié à la génération des fiches :

---

> Tu es un expert en rédaction de fiches métiers pour l'enseignement supérieur. Ta mission est de générer des fiches métiers structurées au format JSON pour le Guide des Métiers de TBS Education, une école de management française.
>
> Pour chaque métier demandé, tu dois :
> 1. Rechercher les informations sur les sources publiques (APEC en priorité, puis France Travail, Hellowork, Onisep).
> 2. Produire un objet JSON strictement conforme au gabarit fourni (GABARIT_SINGLE.json).
> 3. Respecter les référentiels obligatoires : secteurs_id (9 valeurs) et formations_tbs (29 labels exacts).
> 4. Rédiger le descriptif_general en minimum 2 paragraphes HTML `<p>`. Le premier paragraphe doit être une accroche synthétique (5–8 lignes). Les suivants développent le contexte et les spécificités du poste.
> 5. Ne jamais inventer de données salariales. Utiliser uniquement les fourchettes publiées par l'APEC ou France Travail. Si indisponibles, mettre 0.
> 6. Adapter le ton au public cible : étudiants en fin de cursus grande école (Bac+5), entre 22 et 28 ans, cherchant à se projeter dans un métier.
> 7. Produire le JSON sans commentaires, sans balises de métalangage, directement exploitable.
>
> Format de sortie : un objet JSON valide, sans markdown autour, sans explication. Uniquement le JSON.

---

## 7. Exemple de fiche complète générée

Voir le fichier `GABARIT_SINGLE.json` → section `_EXEMPLE_REEL` pour un exemple basé sur la fiche Directeur marketing (données validées par TBS Education).

---

## 8. Points de vigilance

| Risque | Prévention |
|--------|-----------|
| Label de formation non reconnu | Toujours vérifier dans le référentiel §4.2 avant d'inclure une formation |
| Slug en doublon | Vérifier l'unicité des slugs dans le fichier avant livraison |
| Salaires inventés | Utiliser uniquement les données APEC ou France Travail. Mettre `0` si inconnu |
| HTML malformé dans descriptif_general | Utiliser uniquement `<p>`, `<strong>`, `<em>`, `<ul>`, `<li>`. Pas de `<div>`, `<br>` isolé, `<h1>`–`<h6>` |
| Descriptif_court trop long | Vérifier la longueur (max 160 caractères) avant livraison |
| Champs INVARIANT traduits par erreur | Le slug, secteur_id, formations_tbs, salaires et URLs sont identiques dans les 3 langues |

---

*Document produit par TBS Education — Pôle Digital & Innovation Marketing. Version 2.0 — Août 2026.*

---

## 9. Nommage des images

Chaque fiche doit référencer deux images nommées d'après son slug :

| Usage | Nom de fichier | Dimensions recommandées |
|-------|---------------|------------------------|
| Hero (single + modal popin) | `{slug}.webp` | 900 × 400 px minimum |
| Vignette (card archive) | `{slug}_thumb.webp` | 600 × 300 px minimum |

**Exemple pour le slug `directeur-marketing` :**
- Hero : `directeur-marketing.webp`
- Vignette : `directeur-marketing_thumb.webp`

En l'absence d'image spécifique, le site utilise une image de remplacement par secteur (configurée dans `sync-airtable.mjs`). Les images de remplacement actuelles sont des photos professionnelles issues du design Figma, réparties par secteur d'activité.

---

## 10. Script de synchronisation Airtable — Extension en écriture

### 10.1 Mode actuel (lecture seule)

Le script `scripts/sync-airtable.mjs` récupère les fiches depuis Airtable et génère `client/src/data/metiers.json`.

```bash
# Exécution manuelle
node scripts/sync-airtable.mjs

# Avec token personnalisé
AIRTABLE_TOKEN=patXXX node scripts/sync-airtable.mjs
```

### 10.2 Extension recommandée : mode écriture (pour automatisation cron)

Pour permettre à l'expert IA de **mettre à jour Airtable directement** (et non seulement de le lire), il est possible d'étendre le script avec des appels `PATCH`/`POST` à l'API Airtable. Cela permet un workflow entièrement automatisé via tâche planifiée (cron).

**Prérequis :** Le Personal Access Token doit avoir le scope `data.records:write` en plus de `data.records:read`. Générer un nouveau token sur https://airtable.com/create/tokens.

**Exemple d'extension du script :**

```javascript
// Mise à jour d'un enregistrement existant
async function updateRecord(recordId, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
}

// Création d'un nouvel enregistrement
async function createRecord(fields) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields }] }),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return res.json();
}
```

**Workflow cron recommandé :**

```bash
# Crontab — exécution toutes les nuits à 2h00
0 2 * * * cd /var/www/carrieres && node scripts/sync-airtable.mjs >> logs/sync.log 2>&1
```

Ce workflow permet à l'expert IA de :
1. Glaner les informations depuis les sources (APEC, France Travail, etc.)
2. Écrire les données enrichies directement dans Airtable via l'API
3. Le cron déclenche automatiquement la synchronisation vers le JSON statique
4. Le site se met à jour sans intervention humaine ni redéploiement

---

## 11. Internationalisation (EN / ES)

Le fichier `i18n-labels.json` regroupe tous les labels de l'interface UI dans les 3 langues. Pour créer une version EN ou ES :

1. Dupliquer le fichier `metiers.json` FR
2. Traduire les champs textuels : `title`, `descriptif_court`, `descriptif_general`, `missions_principales`, `competences_hard_skills`, `competences_soft_skills`
3. Traduire les valeurs de `domaine_activite` selon la section `secteurs` du fichier `i18n-labels.json`
4. Traduire les valeurs de `appetences` selon la section `appetences` du fichier `i18n-labels.json`
5. Adapter `niveau_etudes` : `"Master's degree"` (EN) / `"Máster (Bac+5)"` (ES)
6. Conserver les champs invariants : `slug`, `secteur_id`, `remuneration_min/max`, `formations_tbs`, `image`, `source_apec_url`

**Champs à NE PAS traduire :** `slug`, `secteur_id`, `remuneration_min`, `remuneration_max`, `image`, `source_apec_url` et toutes les URLs sources.

---

## 12. Conformité EU AI Act

Les fiches métiers générées par IA sont soumises à l'Article 50 du Règlement UE 2024/1689 (applicable depuis le 2 août 2025). Une mention de transparence est intégrée dans le footer du site :

> *"Fiches élaborées par IA (données APEC) et validées par des humains — parce qu'on ne confie pas encore les diplômes aux robots."*

Cette mention couvre l'obligation de transparence pour du contenu éditorial assisté par IA, validé par un humain avant publication. Aucun marquage supplémentaire n'est requis sur chaque fiche individuelle, dans la mesure où les fiches sont relues et validées par l'équipe TBS Education avant mise en ligne.

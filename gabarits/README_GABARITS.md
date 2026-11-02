# Gabarits Fiches Métiers TBS Education — Guide d'utilisation

## Contexte

Ces gabarits définissent la structure JSON attendue pour alimenter le site "Guide des Métiers TBS Education". Le site consomme un fichier `metiers-{lang}.json` par langue (FR, EN, ES) contenant un tableau de fiches métiers.

## Fichiers fournis

| Fichier | Rôle |
|---------|------|
| `GABARIT_ARCHIVE.json` | Champs minimaux pour afficher une fiche dans la page listing (card + filtres) |
| `GABARIT_SINGLE.json` | Champs complets pour la page détail d'une fiche métier |
| `README_GABARITS.md` | Ce guide |

## Format de livraison attendu

Un seul fichier JSON par langue, contenant un tableau d'objets. Chaque objet inclut **tous les champs** des deux gabarits (Archive + Single fusionnés).

```json
[
  { ...fiche_metier_1... },
  { ...fiche_metier_2... },
  ...
]
```

**Nommage des fichiers :**
- `metiers-fr.json` — version française
- `metiers-en.json` — version anglaise
- `metiers-es.json` — version espagnole

## Syntaxe des placeholders

Chaque valeur de gabarit suit le format :

```
{{NOM_CHAMP | type | description et contraintes | TRADUIRE ou INVARIANT}}
```

- **TRADUIRE** : le contenu doit être rédigé dans la langue cible du fichier
- **INVARIANT** : le contenu est identique dans les 3 langues (slugs, salaires, secteur_id, formations_tbs, URLs)

## Règles critiques

**Slugs :** identifiant URL unique, minuscules, sans accents, tirets. Le slug doit être identique dans les 3 fichiers de langue. Exemple : `directeur-marketing`.

**Secteur_id :** valeur parmi `strategie`, `finance`, `business`, `supply`, `data`, `marketing`, `rh`, `rse`, `specifiques`. Toute valeur hors liste sera ignorée.

**Formations TBS :** utiliser **exclusivement** les labels exacts de la table Airtable "Formation TBS (instance FR)". La liste complète des 29 labels est dans `GABARIT_ARCHIVE.json` → `_REFERENTIELS.formations_tbs`. Un label non reconnu n'affichera pas de bouton cliquable.

**Descriptif général :** minimum 2 paragraphes `<p>`. Le premier paragraphe est affiché par défaut dans le modal popin ; les suivants sont masqués derrière "En savoir plus". Longueur recommandée : 150 à 300 mots.

**Salaires :** entiers en k€ brut annuel (ex : `48` pour 48 000 €). Mettre `0` si inconnu — la valeur `0` masque l'affichage du salaire sur le site.

**Employabilité :** ne renseigner que pour les fiches complètes et validées. Valeurs autorisées : `Très recherché`, `Favorable`, `Modérée`, `Difficile`. Laisser `""` sinon.

## Workflow recommandé pour la génération multilingue

1. Générer la version FR en priorité (source de vérité).
2. Identifier les champs INVARIANT (slug, secteur_id, salaires, formations_tbs, URLs) — les copier tels quels dans EN et ES.
3. Traduire les champs TRADUIRE (title, descriptif_court, descriptif_general, missions, compétences, tags, meta).
4. Vérifier que les slugs sont identiques dans les 3 fichiers.
5. Valider le JSON avec un linter (ex: `python3 -m json.tool metiers-fr.json`) avant livraison.

## Exemple minimal valide (un objet du tableau)

```json
{
  "slug": "directeur-marketing",
  "title": "Directeur marketing",
  "descriptif_court": "Pilotez la stratégie marketing et l'expérience client.",
  "descriptif_general": "<p>Le Directeur marketing définit la stratégie marketing globale.</p><p>Il supervise les campagnes et pilote les KPIs de croissance.</p>",
  "missions_principales": [
    "Définir la stratégie marketing globale",
    "Superviser les campagnes de communication",
    "Analyser les performances et piloter les KPIs"
  ],
  "competences_hard_skills": ["Maîtrise CRM", "Expertise SEO/SEA", "Data analytics"],
  "competences_soft_skills": ["Leadership", "Vision stratégique", "Créativité"],
  "parcours_evolution": "",
  "remuneration_min": 48,
  "remuneration_max": 113,
  "niveau_etudes": "Bac +5",
  "domaine_activite": "Marketing – Communication – Marque – Digital",
  "secteur_id": "marketing",
  "employabilite": "Très recherché",
  "competences_tags": ["Stratégie marketing", "Digital", "Innovation"],
  "formations_tbs": ["PGE", "MSc Digital Marketing and e-Commerce"],
  "appetences": ["Business", "Digital"],
  "metiers_lies": ["directeur-de-la-communication"],
  "image": "",
  "source_apec_url": "https://www.apec.fr/tous-nos-metiers/commercial-marketing/directeur-marketing.html",
  "source_france_travail_url": "",
  "meta_title": "Directeur marketing – Fiche métier TBS Education",
  "meta_description": "Pilotez la stratégie marketing et l'expérience client."
}
```

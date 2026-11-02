/**
 * Script de synchronisation Airtable → metiers.json
 * 
 * Usage : node scripts/sync-airtable.mjs
 * 
 * Récupère les 95 fiches métiers depuis la base Airtable "Fiches métiers TBS Education"
 * et génère le fichier client/src/data/metiers.json consommé par le site.
 *
 * Variables d'environnement (ou valeurs par défaut) :
 *   AIRTABLE_TOKEN - Personal Access Token Airtable
 *   AIRTABLE_BASE_ID - ID de la base (appS1MQQ9YnVhC5KH)
 *   AIRTABLE_TABLE_ID - ID de la table (tbl398SbBX0W9b3Xr)
 *   AIRTABLE_VIEW_ID - ID de la vue (viwsZONQtTYvxwJv5)
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TOKEN = process.env.AIRTABLE_TOKEN;
if (!TOKEN) {
  console.error('AIRTABLE_TOKEN manquant : définir la variable d\'environnement (voir gabarits/DOCUMENTATION_EXPERT_IA.md).');
  process.exit(1);
}
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appS1MQQ9YnVhC5KH';
const TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'tbl398SbBX0W9b3Xr';
const VIEW_ID = process.env.AIRTABLE_VIEW_ID || 'viwsZONQtTYvxwJv5';

const OUTPUT_PATH = resolve(__dirname, '../client/src/data/metiers.json');

// Mapping secteur → secteur_id pour les couleurs
const SECTEUR_MAP = {
  'Management – Stratégie – Conseil – Innovation': 'strategie',
  'Finance – Audit – Contrôle – Banque – Risk': 'finance',
  'Commerce – Business – Entrepreneuriat': 'business',
  'Supply Chain – Achats – Logistique – Opérations': 'supply',
  'Data – IT – Produit – Transformation digitale': 'data',
  'Marketing – Communication – Marque – Digital': 'marketing',
  'Ressources humaines – Management – Organisation': 'rh',
  'RSE – Qualité – Développement durable': 'rse',
  'Secteurs spécifiques (aéronautique, sport, luxe, tourisme, culture)': 'specifiques',
};

// Images placeholder par secteur (réutilise les images existantes)
const IMAGES_BY_SECTOR = {
  strategie: '/manus-storage/I18-1170;18-1533_f744f520.webp',
  finance: '/manus-storage/I18-1203;18-1533_0c68ca25.webp',
  business: '/manus-storage/I18-1236;18-1533_30ccc169.webp',
  data: '/manus-storage/I18-1269;18-1533_3cac35e9.webp',
  marketing: '/manus-storage/I18-1500;18-1533_957fa8e6.webp',
  supply: '/manus-storage/I18-1302;18-1533_74879686.webp',
  rh: '/manus-storage/I18-1368;18-1533_b99df890.webp',
  rse: '/manus-storage/I18-1335;18-1533_65540623.webp',
  specifiques: '/manus-storage/I18-1434;18-1533_315abfad.webp',
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchAllRecords() {
  let allRecords = [];
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set('view', VIEW_ID);
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (!res.ok) {
      throw new Error(`Airtable API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset || null;
  } while (offset);

  return allRecords;
}

function transformRecord(record) {
  const f = record.fields;
  const metier = f['Metier'] || '';
  const secteur = f["Secteur d'activité"] || '';
  const secteurId = SECTEUR_MAP[secteur] || 'strategie';

  return {
    slug: slugify(metier),
    title: metier,
    descriptif_court: (f['Description'] || '').substring(0, 160),
    descriptif_general: f['Description'] ? `<p>${f['Description'].replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>` : '',
    missions_principales: [],
    competences_hard_skills: [],
    competences_soft_skills: [],
    parcours_evolution: '',
    remuneration_min: 0,
    remuneration_max: 0,
    niveau_etudes: 'Bac +5',
    employabilite: '',
    domaine_activite: secteur,
    secteur_id: secteurId,
    competences_tags: [],
    formations_tbs: f['Formations associées'] || [],
    appetences: [],
    image: IMAGES_BY_SECTOR[secteurId] || IMAGES_BY_SECTOR.strategie,
    metiers_lies: [],
    source_apec_url: f['Lien APEC'] || '',
    source_france_travail_url: f['Lien France Travail'] || '',
    source_hellowork_url: f['Lien Hellowork'] || '',
    source_onisep_url: f['Lien Onisep'] || '',
  };
}

async function main() {
  console.log('🔄 Synchronisation Airtable → metiers.json...');
  console.log(`   Base: ${BASE_ID}`);
  console.log(`   Table: ${TABLE_ID}`);
  console.log(`   Vue: ${VIEW_ID}`);

  const records = await fetchAllRecords();
  console.log(`   ${records.length} fiches récupérées.`);

  const metiers = records
    .filter(r => r.fields['Metier']) // Skip empty rows
    .map(transformRecord);

  writeFileSync(OUTPUT_PATH, JSON.stringify(metiers, null, 2), 'utf-8');
  console.log(`✅ Fichier généré : ${OUTPUT_PATH}`);
  console.log(`   ${metiers.length} fiches métiers écrites.`);
}

main().catch((err) => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});

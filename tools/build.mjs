#!/usr/bin/env node
// ============================================================================
//  build.mjs — chiffre les textes et génère docs/assets/data.js
//
//  Usage :  node tools/build.mjs
//
//  Chaque poème est chiffré en AES-256-GCM avec une clé dérivée (PBKDF2,
//  210 000 itérations) de la réponse à sa devinette. Sans la bonne réponse,
//  le texte est mathématiquement illisible — même en lisant le code source
//  de la page.
// ============================================================================

import { pbkdf2Sync, randomBytes, createCipheriv } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { settings, chapters } from "../content/config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "assets", "data.js");
const ITERATIONS = 210000;

// Normalisation tolérante : minuscules, sans accents, sans espaces/ponctuation.
// ⚠️ Doit rester identique à la fonction `normalize` de docs/assets/app.js
const DIACRITICS = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
function normalize(s) {
  return s
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function encrypt(plaintext, answer) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(normalize(answer), salt, ITERATIONS, 32, "sha256");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const data = Buffer.concat([ct, cipher.getAuthTag()]); // tag ajouté à la fin (format WebCrypto)
  return {
    s: salt.toString("base64"),
    i: iv.toString("base64"),
    d: data.toString("base64"),
  };
}

let hasPlaceholders = false;

const payload = chapters.map((ch, idx) => {
  if (!ch.answers || ch.answers.length === 0) {
    throw new Error(`Chapitre ${idx + 1} ("${ch.title}") : aucune réponse définie.`);
  }
  for (const a of ch.answers) {
    if (normalize(a).length === 0) {
      throw new Error(`Chapitre ${idx + 1} ("${ch.title}") : la réponse "${a}" est vide après normalisation.`);
    }
    if (/exemple/i.test(a)) hasPlaceholders = true;
  }
  return {
    n: idx + 1,
    title: ch.title,
    stage: ch.stage || "Étape " + (idx + 1),
    mapNote: ch.mapNote || "",
    riddle: ch.riddle,
    hint: ch.hint || "",
    locks: ch.answers.map((a) => encrypt(ch.text, a)),
  };
});

const out =
  "// Fichier généré par tools/build.mjs — ne pas éditer à la main.\n" +
  "// Les textes sont chiffrés : ils ne sont lisibles qu'avec les bonnes réponses.\n" +
  "window.PSAUMES = " +
  JSON.stringify(
    {
      title: settings.siteTitle,
      beloved: settings.beloved || "",
      dedication: settings.dedication,
      sequential: !!settings.sequential,
      opensAt: settings.opensAt || null,
      dailyFrom: settings.dailyFrom || null,
      sky: settings.sky || null,
      iterations: ITERATIONS,
      chapters: payload,
    },
    null,
    1
  ) +
  ";\n";

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out);

console.log(`✓ ${payload.length} chapitres chiffrés → docs/assets/data.js\n`);
console.log("Récapitulatif des devinettes :");
for (const ch of chapters) {
  console.log(`  ${String(chapters.indexOf(ch) + 1).padStart(2)}. ${ch.riddle}`);
  console.log(`      → réponse(s) : ${ch.answers.join("  |  ")}`);
}
if (hasPlaceholders) {
  console.log(
    "\n⚠️  ATTENTION : certaines réponses sont encore des EXEMPLES." +
      "\n   Édite content/config.mjs puis relance : node tools/build.mjs"
  );
}

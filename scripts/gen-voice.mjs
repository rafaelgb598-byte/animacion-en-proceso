// Copiado de shorts-remotion/scripts/gen-voice.mjs (mismos ajustes, caché y manifiesto), con parámetros de ruta y presupuesto.
// Generates the narration with ElevenLabs (text-to-speech/with-timestamps).
// Pure Node + fetch. Never prints or stores the API key.
//
// Usage:
//   node --env-file=.env scripts/gen-voice.mjs                 # generate missing / changed scenes
//   node --env-file=.env scripts/gen-voice.mjs --force s3      # regenerate one scene
//   node --env-file=.env scripts/gen-voice.mjs --speed s4=1.06 # per-scene speed override
//   node --env-file=.env scripts/gen-voice.mjs --dry-run       # count characters only
/* global fetch */
import process from "node:process";
import console from "node:console";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
// Parámetros (por defecto, los del episodio 1): --lines <json> --out <carpeta> --budget <n>
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const VO_DIR = join(ROOT, opt("out", join("public", "vo")));
const MANIFEST = join(VO_DIR, "manifest.json");
const LINES = JSON.parse(readFileSync(join(ROOT, opt("lines", join("src", "decoy", "voice-lines.json"))), "utf8"));

const MODEL = "eleven_multilingual_v2";
const BASE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0.25,
  use_speaker_boost: true,
};
const BUDGET = Number(opt("budget", 6000));
const MAX_ATTEMPTS_PER_SCENE = 3; // first try + 2 retries
const MAX_INNER_GAP_S = 0.8;

// Variable de entorno con el ID de la voz (por defecto la de GiroDato; Ciberseguridad pasa ELEVENLABS_VOICE_ID_CIBER)
const VOICE_ENV = opt("voice-env", "ELEVENLABS_VOICE_ID");

// ── args ────────────────────────────────────────────────────────
const CON_VALOR = ["--lines", "--out", "--budget", "--voice-env"];
const args = process.argv.slice(2).filter((a, i, all) => !CON_VALOR.includes(a) && !CON_VALOR.includes(all[i - 1]));
const force = new Set();
const speeds = {};
let dryRun = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--force") force.add(args[++i]);
  else if (args[i] === "--speed") {
    const [id, v] = args[++i].split("=");
    speeds[id] = Number(v);
  } else if (args[i] === "--dry-run") dryRun = true;
}

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env[VOICE_ENV];
if (!apiKey || !voiceId) {
  console.error(`Missing ELEVENLABS_API_KEY or ${VOICE_ENV} (values not shown).`);
  process.exit(1);
}

mkdirSync(VO_DIR, { recursive: true });
const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : { budget: BUDGET, charactersBilledTotal: 0, scenes: {} };

const saveManifest = () => writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

const settingsFor = (id) =>
  speeds[id] ? { ...BASE_SETTINGS, speed: speeds[id] } : { ...BASE_SETTINGS };

const hashOf = (text, settings) =>
  createHash("sha256")
    .update(JSON.stringify({ text, voiceId, model: MODEL, settings }))
    .digest("hex")
    .slice(0, 16);

/** Normalise for comparison: lower-case letters/digits only. */
const squash = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

const checkAlignment = (text, alignment) => {
  const problems = [];
  const spokenChars = alignment.characters.join("");
  if (squash(spokenChars) !== squash(text)) {
    problems.push("alignment text differs from sent text");
  }
  // Inner silences: gaps between consecutive non-space characters.
  const { characters: c, character_start_times_seconds: st, character_end_times_seconds: en } =
    alignment;
  let lastEnd = null;
  for (let i = 0; i < c.length; i++) {
    if (c[i].trim() === "") continue;
    if (lastEnd !== null && st[i] - lastEnd > MAX_INNER_GAP_S) {
      problems.push(`gap ${(st[i] - lastEnd).toFixed(2)} s before char ${i} ("${c[i]}")`);
    }
    lastEnd = en[i];
  }
  return problems;
};

const fail = (msg, code = 2) => {
  saveManifest();
  console.error(msg);
  process.exit(code);
};

let plannedChars = 0;
for (let i = 0; i < LINES.length; i++) {
  const line = LINES[i];
  const settings = settingsFor(line.id);
  const hash = hashOf(line.spoken, settings);
  const prev = manifest.scenes[line.id];
  const mp3 = join(VO_DIR, `${line.id}.raw.mp3`);
  const alignPath = join(VO_DIR, `${line.id}.align.json`);
  const upToDate =
    prev && prev.hash === hash && existsSync(mp3) && existsSync(alignPath) && !force.has(line.id);
  if (upToDate) {
    console.log(`${line.id}: cached (${prev.characters} chars)`);
    continue;
  }

  const chars = line.spoken.length;
  plannedChars += chars;
  if (dryRun) {
    console.log(`${line.id}: would send ${chars} chars`);
    continue;
  }
  if (manifest.charactersBilledTotal + chars > BUDGET) {
    fail(
      `Budget stop: ${manifest.charactersBilledTotal} + ${chars} > ${BUDGET} characters. Not sending ${line.id}.`,
    );
  }
  const attempts = (prev?.attempts ?? 0) + 1;
  if (attempts > MAX_ATTEMPTS_PER_SCENE) {
    fail(`${line.id}: reached ${MAX_ATTEMPTS_PER_SCENE} attempts. Stopping.`);
  }

  const body = {
    text: line.spoken,
    model_id: MODEL,
    voice_settings: settings,
    previous_text: i > 0 ? LINES[i - 1].spoken : undefined,
    next_text: i < LINES.length - 1 ? LINES[i + 1].spoken : undefined,
  };

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    fail(`${line.id}: network error ${e instanceof Error ? e.message : String(e)}`);
  }
  // Characters are billed when the request is accepted.
  if ([401, 402, 403, 429].includes(res.status)) {
    const detail = await res.text();
    fail(`${line.id}: HTTP ${res.status}. Stopping without retry. ${detail.slice(0, 300)}`);
  }
  if (!res.ok) {
    const detail = await res.text();
    fail(`${line.id}: HTTP ${res.status}. ${detail.slice(0, 300)}`);
  }
  const json = await res.json();
  manifest.charactersBilledTotal += chars;

  writeFileSync(mp3, Buffer.from(json.audio_base64, "base64"));
  writeFileSync(
    alignPath,
    JSON.stringify(
      { alignment: json.alignment, normalized_alignment: json.normalized_alignment },
      null,
      2,
    ),
  );
  const alignment = json.alignment ?? json.normalized_alignment;
  const problems = alignment ? checkAlignment(line.spoken, alignment) : ["no alignment returned"];
  const end = alignment ? alignment.character_end_times_seconds.at(-1) : null;

  manifest.scenes[line.id] = {
    hash,
    voiceId,
    model: MODEL,
    settings,
    characters: chars,
    attempts,
    speechEndSeconds: end,
    problems,
    generatedAt: new Date().toISOString(),
  };
  saveManifest();
  console.log(
    `${line.id}: generated · ${chars} chars · speech ends ${end?.toFixed(2)} s · attempt ${attempts}` +
      (problems.length ? ` · PROBLEMS: ${problems.join("; ")}` : " · alignment OK"),
  );
}

saveManifest();
console.log(
  dryRun
    ? `Dry run: ${plannedChars} chars would be sent. Billed so far: ${manifest.charactersBilledTotal}/${BUDGET}.`
    : `Done. Characters billed in total: ${manifest.charactersBilledTotal}/${BUDGET}.`,
);

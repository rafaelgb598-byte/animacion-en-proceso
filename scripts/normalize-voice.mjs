// Copiado de shorts-remotion/scripts/normalize-voice.mjs (mismo mastering del episodio 1), con --dir.
// Voice mastering: public/vo/sN.raw.mp3 → sN.mp3.
//   1. peak-normalise to -3 dBFS (spec §9);
//   2. +4.5 dB drive into a look-ahead peak limiter with a -3 dBFS ceiling
//      (2 ms look-ahead, 60 ms release), so the mix reaches ≈ -14 LUFS while
//      peaks stay at -3 dBFS and true peak under -1 dBTP.
// The bundled ffmpeg has no dynamics filters, so the limiter is done here
// in Node. No trimming: the ElevenLabs alignment times stay valid.
import process from "node:process";
import console from "node:console";
import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const oi = argv.indexOf("--dir");
const VO = join(ROOT, oi >= 0 ? argv[oi + 1] : join("public", "vo"));
const TARGET_DB = -3;
const di = argv.indexOf("--drive");
const LIMIT = { driveDb: di >= 0 ? Number(argv[di + 1]) : 4.5, ceilingDb: TARGET_DB, lookaheadMs: 2, releaseMs: 60 };
const SR = 44100;
const manifestPath = join(VO, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const isWin = process.platform === "win32";

const ffmpeg = (args) =>
  execFileSync(isWin ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", ...args], {
    maxBuffer: 1 << 28,
    shell: isWin,
  });

/** Returns the PCM payload of a 16-bit WAV (walks the chunks). */
const wavData = (buf) => {
  let pos = 12;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4);
    const size = buf.readUInt32LE(pos + 4);
    if (id === "data") return buf.subarray(pos + 8, pos + 8 + size);
    pos += 8 + size + (size % 2);
  }
  throw new Error("No data chunk");
};

const writeWav = (path, samples) => {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(b.length - 8, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  writeFileSync(path, b);
};

const peakOf = (x) => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

const limit = (x) => {
  const L = Math.round((LIMIT.lookaheadMs / 1000) * SR);
  const r = Math.exp(-1 / ((LIMIT.releaseMs / 1000) * SR));
  const ceiling = 10 ** (LIMIT.ceilingDb / 20);
  const drive = 10 ** (LIMIT.driveDb / 20);
  const n = x.length;
  const needed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = Math.abs(x[i] * drive);
    needed[i] = v > ceiling ? ceiling / v : 1;
  }
  // Min over [i-L, i+L], then a causal box average over L+1 samples:
  // guarantees gain[i] <= needed[i] with no step changes.
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 1;
    for (let j = Math.max(0, i - L); j <= Math.min(n - 1, i + L); j++) if (needed[j] < v) v = needed[j];
    m[i] = v;
  }
  const out = new Float32Array(n);
  let sum = 0;
  let g = 1;
  let maxGr = 0;
  for (let i = 0; i < n; i++) {
    sum += m[i];
    if (i > L) sum -= m[i - L - 1];
    const s = sum / Math.min(i + 1, L + 1);
    g = s < g ? s : g + (s - g) * (1 - r);
    maxGr = Math.max(maxGr, -20 * Math.log10(g));
    out[i] = x[i] * drive * g;
  }
  return { out, maxGr };
};

for (const id of Object.keys(manifest.scenes).sort()) {
  const raw = join(VO, `${id}.raw.mp3`);
  const tmp = mkdtempSync(join(tmpdir(), "vo-"));
  try {
    const decoded = join(tmp, "decoded.wav");
    ffmpeg(["-y", "-i", raw, "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", decoded]);
    const pcm = wavData(readFileSync(decoded));
    const x = new Float32Array(pcm.length / 2);
    for (let i = 0; i < x.length; i++) x[i] = pcm.readInt16LE(i * 2) / 32768;

    const rawPeakDb = 20 * Math.log10(peakOf(x));
    // Pre-normalise to -1 dBFS so the threshold means the same for every scene.
    const pre = 10 ** (TARGET_DB / 20) / peakOf(x);
    for (let i = 0; i < x.length; i++) x[i] *= pre;
    const { out, maxGr } = limit(x);

    const master = join(tmp, "master.wav");
    writeWav(master, out);
    ffmpeg(["-y", "-i", master, "-c:a", "libmp3lame", "-b:a", "192k", join(VO, `${id}.mp3`)]);

    const seconds = x.length / SR;
    manifest.scenes[id].rawPeakDb = Number(rawPeakDb.toFixed(2));
    manifest.scenes[id].mastering = { ...LIMIT, maxGainReductionDb: Number(maxGr.toFixed(1)), peakDb: TARGET_DB };
    delete manifest.scenes[id].gainDb;
    manifest.scenes[id].durationSeconds = Number(seconds.toFixed(3));
    console.log(`${id}: ${seconds.toFixed(2)} s · raw peak ${rawPeakDb.toFixed(1)} dBFS · drive +${LIMIT.driveDb} dB · max GR ${maxGr.toFixed(1)} dB · peak ${(20 * Math.log10(peakOf(out))).toFixed(2)} dBFS`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

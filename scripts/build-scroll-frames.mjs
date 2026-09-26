// Turns the source media in media/scroll/ into WebP assets for the story and the formation.
// Usage: FFMPEG_PATH=/path/to/ffmpeg npm run frames [story|formation]
//        (falls back to `ffmpeg` on PATH; with no argument every job runs)
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const SRC = 'media/scroll';
const only = process.argv[2];

const ffmpeg = (args) => execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const webp = (quality) => ['-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6', '-preset', 'photo'];
const freshDir = (dir) => {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
};

function buildStory() {
  const FPS = 12;
  const OUT = 'public/assets/scroll';
  // clip-1 dims the robot's eyes at ~6.45s and then dissolves back to a wide shot, so it is cut before both.
  const CLIPS = [
    { file: 'clip-1.mp4', end: 6.4 },
    { file: 'clip-2.mp4' },
    { file: 'clip-3.mp4' },
    { file: 'clip-4.mp4' }
  ];
  // Mobile keeps the centre 64% of the frame; ScrollStory pans right inside it when the robot dog walks in.
  const VARIANTS = [
    { name: 'desktop', filter: `fps=${FPS},scale=1920:1080`, quality: 68, width: 1920, height: 1080 },
    { name: 'mobile', filter: `fps=${FPS},crop=iw*0.64:ih:iw*0.18:0,scale=912:800`, quality: 66, width: 912, height: 800 }
  ];

  const manifest = { fps: FPS, clips: [], total: 0 };
  for (const variant of VARIANTS) {
    const dir = join(OUT, variant.name);
    freshDir(dir);
    let offset = 0;
    CLIPS.forEach((clip, i) => {
      const input = ['-i', join(SRC, clip.file)];
      if (clip.end) input.push('-t', String(clip.end));
      ffmpeg([...input, '-vf', variant.filter, ...webp(variant.quality), '-start_number', String(offset + 1), join(dir, 'f-%04d.webp')]);
      const count = readdirSync(dir).length - offset;
      if (variant.name === 'desktop') manifest.clips.push({ start: offset, count });
      else if (manifest.clips[i].count !== count) throw new Error(`Frame count mismatch in ${clip.file}`);
      offset += count;
    });
    manifest.total = offset;
    manifest[variant.name] = { width: variant.width, height: variant.height };
  }
  writeFileSync('src/data/scrollFrames.json', `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Story: ${manifest.total} frames per variant`);
}

function buildFormation() {
  mkdirSync('public/assets', { recursive: true });
  ffmpeg(['-i', join(SRC, 'formasi.jpg'), ...webp(84), 'public/assets/formasi.webp']);
  console.log('Formation: public/assets/formasi.webp');
}

const jobs = { story: buildStory, formation: buildFormation };
for (const [name, job] of Object.entries(jobs)) {
  if (!only || only === name) job();
}

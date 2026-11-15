"use client";

import { useEffect, useState } from "react";

type Board = {
  title: string;
  vibe: string;
  palette: string[];
  prompts: string[];
  playlists: string[];
  tags: string[];
};

const DEFAULT_PROMPT = "cozy cyberpunk";
const STORAGE_KEY = "vibeboard-history";

const presets: Record<string, Omit<Board, "vibe">> = {
  "cozy cyberpunk": {
    title: "Cozy Cyberpunk",
    palette: ["#b56be8", "#e75da8", "#f6d36d", "#56b9d1", "#332b3d"],
    prompts: [
      "Moonlit alleyways with warm neon signs and old vinyl records",
      "A tiny apartment filled with plants, synthwave lights, and soft blankets",
      "Rainy city skyline, reflective puddles, and a feeling of safe chaos"
    ],
    playlists: ["Lo-fi synthwave", "Night drive beats", "Warm ambient electronica"],
    tags: ["neon", "cozy", "urban", "late-night", "dreamy"]
  },
  "sunset productivity": {
    title: "Sunset Productivity",
    palette: ["#f17c55", "#f2b768", "#e9d99b", "#83b9cc", "#282c38"],
    prompts: [
      "Golden-hour desk setup with clean surfaces and soft sunlight",
      "Creative workspace featuring warm textures and a minimal laptop scene",
      "A calm horizon with a focused work ritual and breathable design"
    ],
    playlists: ["Chill indie", "Creative flow", "Coffeehouse ambient"],
    tags: ["bright", "calm", "focused", "sunlit", "clean"]
  },
  "minimal beach sunset": {
    title: "Minimal Beach Sunset",
    palette: ["#ed916c", "#df8dab", "#f0d596", "#82c4d2", "#242b3a"],
    prompts: [
      "Soft ocean horizon with a clean, minimal shoreline aesthetic",
      "Pastel sunset sky reflected on a quiet sea at dusk",
      "A minimal beach scene with sculptural sand forms and airy light"
    ],
    playlists: ["Drift lounge", "Golden-hour chill", "Soft acoustic"],
    tags: ["minimal", "coastal", "soft", "serene", "light"]
  }
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (value.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  return Math.abs(hash);
}

function buildBoard(input: string): Board {
  const vibe = input.trim() || DEFAULT_PROMPT;
  const normalized = vibe.toLowerCase();
  const matchingPreset = Object.keys(presets).find((key) => normalized.includes(key));

  if (matchingPreset) return { ...presets[matchingPreset], vibe };

  const words = normalized.split(/\s+/).filter(Boolean);
  const hue = hashString(normalized) % 360;
  const title = words.map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
  const color = (offset: number, saturation: number, lightness: number) =>
    `hsl(${(hue + offset) % 360} ${saturation}% ${lightness}%)`;

  return {
    title: title || "Custom Mood",
    vibe,
    palette: [color(0, 72, 64), color(42, 76, 68), color(128, 78, 64), color(205, 70, 60), color(210, 26, 18)],
    prompts: [
      `${vibe} atmosphere with layered textures and cinematic light`,
      `${vibe} scene in a premium editorial style, rich composition and depth`,
      `${vibe} environment rendered as a modern concept board with tactile surfaces`
    ],
    playlists: [`${vibe} chill`, `${vibe} focus`, `${vibe} night drive`],
    tags: [...new Set([...words.slice(0, 3), "cinematic", "warm", "immersive"])].slice(0, 6)
  };
}

export default function Home() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [board, setBoard] = useState(() => buildBoard(DEFAULT_PROMPT));
  const [history, setHistory] = useState<Board[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed as Board[]);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  function generateBoard() {
    setBoard(buildBoard(prompt));
  }

  function saveBoard() {
    setHistory((previous) => [board, ...previous.filter((item) => item.vibe !== board.vibe)].slice(0, 6));
  }

  async function copyPalette() {
    await navigator.clipboard.writeText(board.palette.join(" "));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen px-5 py-8 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">A little inspiration, on demand</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] sm:text-7xl">Vibe<span className="text-cyan-300">Board</span></h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">Turn a feeling into a full creative direction board. Start with a vibe; we’ll find the colors, scenes, and sounds.</p>
          </div>
          <form className="flex w-full max-w-xl gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-2 shadow-2xl shadow-cyan-950/30" onSubmit={(event) => { event.preventDefault(); generateBoard(); }}>
            <label className="sr-only" htmlFor="vibe-prompt">Describe your vibe</label>
            <input id="vibe-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Try: rainy Tokyo jazz bar" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <button type="submit" className="rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110">Generate <span aria-hidden="true">↗</span></button>
          </form>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
          <article className="glass-panel p-5 sm:p-7">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div><p className="eyebrow">Your current direction</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{board.title}</h2><p className="mt-2 text-sm text-slate-400">Inspired by “{board.vibe}”</p></div>
              <button onClick={saveBoard} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium transition hover:bg-white/10">＋ Save board</button>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-3" aria-label="Color palette">
              {board.palette.map((color, index) => <button key={`${color}-${index}`} onClick={() => navigator.clipboard.writeText(color)} title={`Copy ${color}`} className="group text-left"><span className="block h-20 rounded-xl border border-white/10 shadow-lg transition group-hover:-translate-y-1 sm:h-28" style={{ background: color }} /><span className="mt-2 block truncate text-center text-[10px] text-slate-400 sm:text-xs">COLOR 0{index + 1}</span></button>)}
            </div>
            <button onClick={copyPalette} className="mt-3 text-xs text-cyan-200 transition hover:text-white">{copied ? "Palette copied!" : "Copy palette"}</button>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <section className="sub-panel p-4"><h3 className="eyebrow mb-3">✳ Image prompts</h3><ul className="space-y-2">{board.prompts.map((line) => <li key={line} className="rounded-xl border border-white/[0.05] bg-white/[0.035] p-3 text-sm leading-5 text-slate-300">{line}</li>)}</ul></section>
              <section className="sub-panel p-4"><h3 className="eyebrow mb-3">♫ Soundtrack energy</h3><ul className="space-y-2">{board.playlists.map((item) => <li key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.035] p-3 text-sm text-slate-300"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300/20 to-violet-400/20 text-cyan-200">♫</span>{item}</li>)}</ul></section>
            </div>
          </article>

          <aside className="space-y-6">
            <section className="glass-panel p-5"><h2 className="eyebrow">Mood descriptors</h2><div className="mt-4 flex flex-wrap gap-2">{board.tags.map((tag) => <span key={tag} className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-medium text-cyan-100">#{tag}</span>)}</div></section>
            <section className="glass-panel p-5"><div className="flex items-center justify-between"><h2 className="eyebrow">Saved boards</h2><span className="text-xs text-slate-500">{history.length} / 6</span></div><div className="mt-4 space-y-3">{history.length === 0 ? <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">Your saved ideas will show up here.</p> : history.map((item) => <button key={item.vibe} onClick={() => { setBoard(item); setPrompt(item.vibe); }} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:border-cyan-300/20 hover:bg-white/[0.07]"><span className="mb-2 flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{item.title}</span><span className="text-[10px] text-slate-500">↗</span></span><span className="flex gap-1.5">{item.palette.map((swatch, index) => <span key={`${swatch}-${index}`} className="h-5 flex-1 rounded-md" style={{ background: swatch }} />)}</span></button>)}</div></section>
            <section className="rounded-2xl border border-violet-300/10 bg-gradient-to-br from-violet-400/[0.09] to-cyan-300/[0.04] p-5"><p className="text-sm font-semibold">Make it yours</p><p className="mt-2 text-xs leading-5 text-slate-400">Click a color to copy its value. Your saved boards stay in this browser.</p></section>
          </aside>
        </section>
        <footer className="mt-8 text-center text-xs text-slate-600">Made for the ideas you haven’t had yet ✦</footer>
      </div>
    </main>
  );
}

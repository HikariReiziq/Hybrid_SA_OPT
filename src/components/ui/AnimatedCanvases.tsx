import { useEffect, useRef } from 'react';
import { type CityNode } from '../../lib/algorithms/tsp2Opt';
import { usePresentationStore } from '../../store/presentationStore';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function getThemeColors(theme: 'dark' | 'light') {
  if (theme === 'light') {
    return {
      bg: '#EDF3FA',
      grid: 'rgba(15, 23, 42, 0.06)',
      ink: '#0F172A',
      muted: '#475569',
      heat: '#B8380A',
      cyan: '#0369A1',
      mint: '#047857',
      gold: '#92400E',
      panel: '#FFFFFF',
      pipe: '#CBD5E1',
    };
  }
  return {
    bg: '#0B1224',
    grid: 'rgba(148, 163, 184, 0.08)',
    ink: '#F3F6FC',
    muted: '#94A3B8',
    heat: '#FF7A3D',
    cyan: '#38BDF8',
    mint: '#34D399',
    gold: '#FBBF24',
    panel: '#162038',
    pipe: '#253559',
  };
}

/**
 * 1. CloudFactoryCanvas (Adegan 01 Beat 0):
 * Film animasi 60fps memperlihatkan paket task meluncur di pipa cloud menuju
 * Router Hybrid (SA + 2-Opt) lalu mengalir rata ke 3 menara server DC Jakarta & Surabaya.
 */
export function CloudFactoryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = usePresentationStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 520;
    const H = 260;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();
    const vmY = [64, 132, 200];
    const vmColors = [c.cyan, '#A78BFA', c.mint];
    const vmLabels = ['VM 1 · Jakarta', 'VM 2 · Surabaya', 'VM 3 · Jakarta'];
    const vmSpeeds = ['500 MIPS', '1000 MIPS', '1600 MIPS'];

    const packets = Array.from({ length: 9 }, (_, i) => ({
      offset: i / 9,
      targetVm: i % 3,
      size: 10 + (i % 3) * 3,
    }));

    let rafId = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = reduced ? 1.8 : (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Latar panggung teater
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      // Pipa masuk (Gateway -> Router)
      ctx.strokeStyle = c.pipe;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(64, 132);
      ctx.lineTo(222, 132);
      ctx.stroke();

      // Pipa bercabang ke 3 VM
      vmY.forEach((y, idx) => {
        ctx.strokeStyle = c.pipe;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(246, 132);
        ctx.bezierCurveTo(300, 132, 310, y, 368, y);
        ctx.stroke();

        // Garis warna tipis aktif di tengah pipa
        ctx.strokeStyle = vmColors[idx];
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(246, 132);
        ctx.bezierCurveTo(300, 132, 310, y, 368, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Animasi paket task bergerak sepanjang pipa
      packets.forEach((pk) => {
        const t = (elapsed * 0.28 + pk.offset) % 1;
        let px = 64;
        let py = 132;
        let color = c.heat;

        if (t < 0.45) {
          const u = t / 0.45;
          px = 68 + u * 150;
          py = 132;
          color = c.heat;
        } else {
          const u = (t - 0.45) / 0.55;
          const yEnd = vmY[pk.targetVm];
          const inv = 1 - u;
          px =
            inv * inv * inv * 246 +
            3 * inv * inv * u * 300 +
            3 * inv * u * u * 310 +
            u * u * u * 368;
          py =
            inv * inv * inv * 132 +
            3 * inv * inv * u * 132 +
            3 * inv * u * u * yEnd +
            u * u * u * yEnd;
          color = vmColors[pk.targetVm];
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(px - pk.size / 2, py - pk.size / 2, pk.size, pk.size, 3);
        ctx.fill();
      });

      // Gateway Task Cloud (kiri)
      ctx.fillStyle = c.panel;
      ctx.strokeStyle = c.heat;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(18, 96, 66, 72, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.ink;
      ctx.font = '700 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TASK', 51, 128);
      ctx.fillStyle = c.heat;
      ctx.font = '700 10px "IBM Plex Mono", monospace';
      ctx.fillText('MASUK', 51, 144);

      // Core Hybrid Scheduler (tengah: cincin SA + 2-Opt berputar)
      const angle = elapsed * 1.4;
      ctx.save();
      ctx.translate(228, 132);
      ctx.fillStyle = c.panel;
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.fill();

      // Busur SA (oranye) & 2-Opt (cyan) berputar
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = c.heat;
      ctx.beginPath();
      ctx.arc(0, 0, 38, angle, angle + Math.PI * 0.85);
      ctx.stroke();

      ctx.strokeStyle = c.cyan;
      ctx.beginPath();
      ctx.arc(0, 0, 38, angle + Math.PI, angle + Math.PI * 1.85);
      ctx.stroke();

      ctx.fillStyle = c.ink;
      ctx.font = '800 11px "Bricolage Grotesque", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SA + 2-OPT', 0, -2);
      ctx.fillStyle = c.gold;
      ctx.font = '700 9.5px "IBM Plex Mono", monospace';
      ctx.fillText('HYBRID', 0, 12);
      ctx.restore();

      // 3 Menara Server VM (kanan) dengan bar beban berdenyut halus
      vmY.forEach((y, idx) => {
        const pulse = 0.62 + Math.sin(elapsed * 2.2 + idx * 1.8) * 0.14;
        ctx.fillStyle = c.panel;
        ctx.strokeStyle = vmColors[idx];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(368, y - 24, 136, 48, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = c.ink;
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(vmLabels[idx], 378, y - 6);

        ctx.fillStyle = c.muted;
        ctx.font = '600 9.5px "IBM Plex Mono", monospace';
        ctx.fillText(vmSpeeds[idx], 378, y + 7);

        // Bar beban rata
        ctx.fillStyle = c.pipe;
        ctx.beginPath();
        ctx.roundRect(378, y + 12, 114, 6, 3);
        ctx.fill();

        ctx.fillStyle = vmColors[idx];
        ctx.beginPath();
        ctx.roundRect(378, y + 12, 114 * pulse, 6, 3);
        ctx.fill();
      });

      if (!reduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto w-full rounded-2xl border border-[var(--border-line)]"
      role="img"
      aria-label="Animasi paket task mengalir melewati scheduler Hybrid SA + 2-Opt ke tiga server VM secara seimbang"
    />
  );
}

/**
 * 2. SaMountainPhysicsCanvas (Adegan 02 Beat 0):
 * Animasi fisika 60fps: Bola Greedy (abu-abu) terjebak di lembah dangkal kiri,
 * sedangkan Bola Panas SA (oranye -> emerald) melompati bukit menuju Global Optimum!
 */
export function SaMountainPhysicsCanvas({
  coolingMode,
  replayKey,
}: {
  coolingMode: 'gradual' | 'fast';
  replayKey: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = usePresentationStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 520;
    const H = 230;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();

    // Fungsi ketinggian bukit (y lebih besar = lembah lebih rendah / cost lebih kecil)
    const terrainY = (xNorm: number) => {
      const localDip = 54 * Math.exp(-(((xNorm - 0.28) / 0.13) ** 2));
      const peak = -42 * Math.exp(-(((xNorm - 0.52) / 0.12) ** 2));
      const globalDip = 90 * Math.exp(-(((xNorm - 0.78) / 0.14) ** 2));
      return 106 + localDip + peak + globalDip;
    };

    let rafId = 0;
    const start = performance.now();
    const cycleSec = 6.2;

    const draw = (now: number) => {
      const tCycle = reduced ? 5.2 : ((now - start) / 1000) % cycleSec;
      const p = tCycle / cycleSec; // 0..1

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      // Isi siluet gunung
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) {
        ctx.lineTo(x, terrainY(x / W));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = theme === 'dark' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(3, 105, 161, 0.08)';
      ctx.fill();

      // Garis kontur gunung
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = terrainY(x / W);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label lembah
      ctx.font = '700 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = c.muted;
      ctx.fillText('Local Optimum', 0.28 * W, 184);
      ctx.fillStyle = c.mint;
      ctx.fillText('Global Optimum', 0.78 * W, 218);

      // Posisi bola Greedy (selalu turun dari x=0.14 lalu mentok di x=0.28)
      const gXNorm = p < 0.22 ? 0.14 + (p / 0.22) * 0.14 : 0.28 + Math.sin(p * 30) * 0.006;
      const gX = gXNorm * W;
      const gY = terrainY(gXNorm) - 9;

      ctx.fillStyle = c.muted;
      ctx.beginPath();
      ctx.arc(gX, gY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = c.muted;
      ctx.fillText(p > 0.25 ? 'Greedy: Terjebak' : 'Greedy', gX, gY - 14);

      // Posisi bola SA:
      // - Mode gradual: turun ke 0.28, lalu pada p=0.28..0.64 MELOMPAT melewati bukit 0.52 ke 0.78!
      // - Mode fast: suhu cepat dingin, gagal melompati bukit 0.52 dan balik ke 0.28!
      let saXNorm = 0.14;
      let jumpLift = 0;
      let saColor = c.heat;
      let tempLabel = 'T Panas · Eksplorasi';

      if (coolingMode === 'gradual') {
        if (p < 0.22) {
          saXNorm = 0.14 + (p / 0.22) * 0.14;
        } else if (p < 0.62) {
          const u = (p - 0.22) / 0.4;
          saXNorm = 0.28 + u * 0.5;
          jumpLift = Math.sin(u * Math.PI) * 18;
          tempLabel = 'T Panas · Terima ΔE > 0 (Lompat!)';
        } else {
          const u = Math.min(1, (p - 0.62) / 0.2);
          saXNorm = 0.78 + Math.sin(u * Math.PI * 2) * (1 - u) * 0.025;
          saColor = c.mint;
          tempLabel = 'T Dingin · Mengunci Global Optimum';
        }
      } else {
        if (p < 0.22) {
          saXNorm = 0.14 + (p / 0.22) * 0.14;
        } else if (p < 0.45) {
          const u = (p - 0.22) / 0.23;
          saXNorm = 0.28 + Math.sin(u * Math.PI) * 0.14;
          tempLabel = 'T Terlalu Cepat Dingin!';
        } else {
          saXNorm = 0.28;
          saColor = c.cyan;
          tempLabel = 'Beku Dini · Ikut Terjebak Lokal';
        }
      }

      const saX = saXNorm * W;
      const saY = terrainY(saXNorm) - 10 - jumpLift;

      // Jejak lengkung lompatan SA (visual jelas walau sedang diam)
      if (coolingMode === 'gradual' && p > 0.24) {
        ctx.strokeStyle = c.heat;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0.28 * W, terrainY(0.28) - 10);
        ctx.quadraticCurveTo(0.52 * W, 32, 0.78 * W, terrainY(0.78) - 10);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Halo panas di sekitar bola SA (1 elemen fokus glow yang bermakna!)
      ctx.fillStyle =
        saColor === c.mint ? 'rgba(52, 211, 153, 0.24)' : 'rgba(255, 122, 61, 0.28)';
      ctx.beginPath();
      ctx.arc(saX, saY, 17, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = saColor;
      ctx.beginPath();
      ctx.arc(saX, saY, 9.5, 0, Math.PI * 2);
      ctx.fill();

      // Badge status di atas layar canvas
      ctx.fillStyle = c.panel;
      ctx.strokeStyle = saColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(14, 10, 268, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = saColor;
      ctx.font = '700 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(tempLabel, 24, 27);

      if (!reduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme, coolingMode, replayKey]);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto w-full rounded-2xl border border-[var(--border-line)]"
      role="img"
      aria-label="Animasi fisika bola panas Simulated Annealing melompati bukit menuju lembah global sementara bola greedy terjebak di lembah dangkal"
    />
  );
}

/**
 * 3. TwoOptMorphCanvas (Adegan 03 Beat 0):
 * Animasi 60fps memperlihatkan titik energi berjalan di jalur, lalu saat 2-Opt dipicu,
 * dua kabel yang bersilangan X berayun mulus menjadi dua jalur paralel hijau!
 */
export function TwoOptMorphCanvas({
  cities,
  tour,
  highlightEdgeIndices,
  isOptimal,
  onCanvasClick,
}: {
  cities: readonly CityNode[];
  tour: readonly number[];
  highlightEdgeIndices: readonly [number, number] | null;
  isOptimal: boolean;
  onCanvasClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = usePresentationStore((s) => s.theme);
  const prevTourRef = useRef<readonly number[]>(tour);
  const morphStartRef = useRef<number>(0);

  useEffect(() => {
    if (prevTourRef.current.join(',') !== tour.join(',')) {
      morphStartRef.current = performance.now();
    }
  }, [tour]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 400;
    const H = 260;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();
    let rafId = 0;

    const draw = (now: number) => {
      const tSec = reduced ? 0.4 : now / 1000;
      const morphElapsed = now - morphStartRef.current;
      const morphProgress = reduced ? 1 : Math.min(1, morphElapsed / 520);
      const ease = 1 - (1 - morphProgress) ** 3;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 14);
      ctx.fill();

      // Gambar setiap sisi tour + animasi denyut cahaya bergerak di sepanjang jalur
      const n = tour.length;
      for (let idx = 0; idx < n; idx++) {
        const from = cities[tour[idx]];
        const to = cities[tour[(idx + 1) % n]];
        const isTarget =
          highlightEdgeIndices !== null &&
          (idx === highlightEdgeIndices[0] || idx === highlightEdgeIndices[1]);

        ctx.strokeStyle = isTarget ? c.heat : isOptimal ? c.mint : c.cyan;
        ctx.lineWidth = isTarget ? 6 : 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Saat baru berubah (morph < 1), beri efek busur melentur halus
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 + (1 - ease) * (idx % 2 === 0 ? -24 : 24);
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);
        ctx.stroke();

        // Titik paket cahaya meluncur sepanjang sisi
        if (!reduced) {
          const u = (tSec * 0.55 + idx * 0.23) % 1;
          const inv = 1 - u;
          const px = inv * inv * from.x + 2 * inv * u * midX + u * u * to.x;
          const py = inv * inv * from.y + 2 * inv * u * midY + u * u * to.y;
          ctx.fillStyle = isTarget ? c.gold : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 3.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Penanda X di tengah bila masih ada persilangan pada kasus 4 simpul
      if (!isOptimal && cities.length === 4) {
        ctx.fillStyle = c.heat;
        ctx.beginPath();
        ctx.arc(200, 130, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 13px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕', 200, 131);
        ctx.textBaseline = 'alphabetic';
      }

      // Gambar simpul kota/node
      cities.forEach((node) => {
        ctx.fillStyle = c.panel;
        ctx.strokeStyle = isOptimal ? c.mint : c.ink;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = c.ink;
        ctx.font = '800 13px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y + 1);
        ctx.textBaseline = 'alphabetic';
      });

      if (morphProgress >= 1) {
        prevTourRef.current = tour;
      }

      if (!reduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [cities, tour, highlightEdgeIndices, isOptimal, theme]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onCanvasClick}
      className={`h-auto w-full rounded-2xl border border-[var(--border-line)] ${
        isOptimal ? 'cursor-default' : 'cursor-pointer'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCanvasClick();
        }
      }}
      aria-label={
        isOptimal
          ? 'Peta 2-Opt sudah lurus tanpa silangan'
          : 'Klik untuk memutus jalur bersilangan dengan 2-Opt'
      }
    />
  );
}

/**
 * 4. LrhOrbitCanvas (Adegan 04 Beat 0):
 * Animasi bola data bergerak mengelilingi 4 stasiun siklus LRH (SA -> 2-Opt -> Metropolis -> Cooling).
 */
export function LrhOrbitCanvas({
  activeStep,
  onStepSelect,
}: {
  activeStep: number;
  onStepSelect: (step: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = usePresentationStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 680;
    const H = 128;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();
    const xs = [90, 258, 426, 594];
    const labels = ['1. SA Perturb', '2. 2-Opt Poles', '3. Metropolis', '4. Cooling T'];
    const colors = [c.heat, c.cyan, c.mint, c.gold];

    let rafId = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = reduced ? 1.5 : (now - start) / 1000;
      const cyclePos = (elapsed * 0.42) % 1;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 14);
      ctx.fill();

      // Rel utama lurus kiri ke kanan
      ctx.strokeStyle = c.pipe;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(xs[0], 56);
      ctx.lineTo(xs[3], 56);
      ctx.stroke();

      // Rel balik bawah (loop kembali dari Cooling -> SA Perturb)
      ctx.strokeStyle = c.pipe;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(xs[3], 76);
      ctx.quadraticCurveTo(342, 122, xs[0], 76);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bola paket bergerak sepanjang siklus
      let bx = xs[0];
      let by = 56;
      let bColor = c.gold;
      if (cyclePos < 0.72) {
        const u = cyclePos / 0.72;
        bx = xs[0] + u * (xs[3] - xs[0]);
        by = 56;
        bColor = u < 0.33 ? c.heat : u < 0.66 ? c.cyan : c.mint;
      } else {
        const u = (cyclePos - 0.72) / 0.28;
        const inv = 1 - u;
        bx = inv * inv * xs[3] + 2 * inv * u * 342 + u * u * xs[0];
        by = inv * inv * 76 + 2 * inv * u * 122 + u * u * 76;
        bColor = c.gold;
      }

      // 4 Stasiun
      xs.forEach((x, idx) => {
        const isSelected = activeStep === idx;
        ctx.fillStyle = c.panel;
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.beginPath();
        ctx.roundRect(x - 66, 32, 132, 48, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? colors[idx] : c.ink;
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[idx], x, 60);
      });

      // Bola cahaya bergerak di depan stasiun
      ctx.fillStyle = bColor;
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [activeStep, theme]);

  return (
    <canvas
      ref={canvasRef}
      onClick={() => onStepSelect((activeStep + 1) % 4)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onStepSelect((activeStep + 1) % 4);
        }
      }}
      tabIndex={0}
      className="h-auto w-full cursor-pointer rounded-2xl border border-[var(--border-line)]"
      role="button"
      aria-label="Animasi siklus 4 tahap Hybrid SA + 2-Opt berputar terus-menerus, klik untuk memindahkan sorotan tahap"
    />
  );
}

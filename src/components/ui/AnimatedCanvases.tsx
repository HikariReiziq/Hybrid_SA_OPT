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
      heatSoft: '#FFF1EB',
      cyan: '#0369A1',
      cyanSoft: '#E8F5FE',
      mint: '#047857',
      mintSoft: '#E6F8F1',
      violet: '#6D28D9',
      gold: '#92400E',
      goldFill: '#F5B700',
      goldInk: '#0F172A',
      panel: '#FFFFFF',
      pipe: '#CBD5E1',
      blockInk: '#FFFFFF',
    };
  }
  return {
    bg: '#0B1224',
    grid: 'rgba(148, 163, 184, 0.08)',
    ink: '#F3F6FC',
    muted: '#94A3B8',
    heat: '#FF7A3D',
    heatSoft: '#361C15',
    cyan: '#38BDF8',
    cyanSoft: '#102B42',
    mint: '#34D399',
    mintSoft: '#0F2E26',
    violet: '#A78BFA',
    gold: '#FBBF24',
    goldFill: '#FBBF24',
    goldInk: '#0F172A',
    panel: '#162038',
    pipe: '#253559',
    blockInk: '#08101C',
  };
}

/**
 * 1. CloudFactoryCanvas (Episode 1 · Bagian 1):
 * Animasi 60fps yang membandingkan langsung "Bagi Asal (Macet 14 dtk)" vs
 * "Bagi Cerdas SA + 2-Opt (Rata 9 dtk)" agar audiens awam langsung paham arti Makespan!
 */
export function CloudFactoryCanvas({ mode }: { mode: 'naive' | 'smart' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = usePresentationStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 520;
    const H = 270;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();
    const vmY = [78, 146, 214];
    const vmColors = [c.cyan, c.violet, c.mint];
    const vmLabels = ['VM 1 · Jakarta', 'VM 2 · Surabaya', 'VM 3 · Jakarta'];
    const vmSpeeds = ['500 MIPS', '1000 MIPS', '1600 MIPS'];

    const naiveLoads = [5, 14, 4];
    const smartLoads = [7, 9, 9];
    const loads = mode === 'naive' ? naiveLoads : smartLoads;

    const packets = Array.from({ length: 9 }, (_, i) => ({
      offset: i / 9,
      // Saat mode 'naive', 6 dari 9 paket numpuk di VM 2!
      targetVm: mode === 'naive' ? (i % 3 === 0 ? (i === 0 ? 0 : 2) : 1) : i % 3,
      size: 10 + (i % 3) * 2.5,
    }));

    let rafId = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = reduced ? 1.8 : (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      // Banner Status Makespan di atas
      const isBad = mode === 'naive';
      const bannerColor = isBad ? c.heat : c.mint;
      ctx.fillStyle = c.panel;
      ctx.strokeStyle = bannerColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(16, 12, W - 32, 30, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = bannerColor;
      ctx.font = '700 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        isBad
          ? 'BAGI ASAL: VM 2 MACET! Makespan = 14 dtk (semua menunggu VM 2)'
          : 'BAGI CERDAS (SA + 2-Opt): Rata! Makespan = 9 dtk (-36% lebih cepat)',
        W / 2,
        31,
      );

      // Pipa masuk
      ctx.strokeStyle = c.pipe;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(64, 146);
      ctx.lineTo(212, 146);
      ctx.stroke();

      // Pipa bercabang ke 3 VM
      vmY.forEach((y, idx) => {
        const hotPipe = isBad && idx === 1;
        ctx.strokeStyle = c.pipe;
        ctx.lineWidth = hotPipe ? 11 : 8;
        ctx.beginPath();
        ctx.moveTo(238, 146);
        ctx.bezierCurveTo(292, 146, 302, y, 356, y);
        ctx.stroke();

        ctx.strokeStyle = hotPipe ? c.heat : vmColors[idx];
        ctx.lineWidth = hotPipe ? 3 : 2;
        ctx.globalAlpha = hotPipe ? 0.85 : 0.55;
        ctx.beginPath();
        ctx.moveTo(238, 146);
        ctx.bezierCurveTo(292, 146, 302, y, 356, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Animasi paket bergerak sepanjang pipa
      packets.forEach((pk) => {
        const t = (elapsed * 0.3 + pk.offset) % 1;
        let px = 64;
        let py = 146;
        let color = c.heat;

        if (t < 0.44) {
          const u = t / 0.44;
          px = 68 + u * 140;
          py = 146;
          color = isBad ? c.heat : c.gold;
        } else {
          const u = (t - 0.44) / 0.56;
          const yEnd = vmY[pk.targetVm];
          const inv = 1 - u;
          px =
            inv * inv * inv * 238 +
            3 * inv * inv * u * 292 +
            3 * inv * u * u * 302 +
            u * u * u * 356;
          py =
            inv * inv * inv * 146 +
            3 * inv * inv * u * 146 +
            3 * inv * u * u * yEnd +
            u * u * u * yEnd;
          color = isBad && pk.targetVm === 1 ? c.heat : vmColors[pk.targetVm];
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(px - pk.size / 2, py - pk.size / 2, pk.size, pk.size, 3);
        ctx.fill();
      });

      // Gateway Task Masuk
      ctx.fillStyle = c.panel;
      ctx.strokeStyle = isBad ? c.heat : c.cyan;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(18, 112, 62, 68, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.ink;
      ctx.font = '700 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TASK', 49, 143);
      ctx.fillStyle = isBad ? c.heat : c.cyan;
      ctx.font = '700 9.5px "IBM Plex Mono", monospace';
      ctx.fillText('MASUK', 49, 158);

      // Core Scheduler Tengah
      const angle = elapsed * (isBad ? 0.6 : 1.7);
      ctx.save();
      ctx.translate(222, 146);
      ctx.fillStyle = c.panel;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 4.5;
      if (isBad) {
        ctx.strokeStyle = c.heat;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 36, angle, angle + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = c.heat;
        ctx.font = '800 10.5px "Bricolage Grotesque", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ACAK', 0, -2);
        ctx.fillStyle = c.muted;
        ctx.font = '700 9px "IBM Plex Mono", monospace';
        ctx.fillText('ASAL', 0, 11);
      } else {
        ctx.strokeStyle = c.heat;
        ctx.beginPath();
        ctx.arc(0, 0, 36, angle, angle + Math.PI * 0.85);
        ctx.stroke();
        ctx.strokeStyle = c.cyan;
        ctx.beginPath();
        ctx.arc(0, 0, 36, angle + Math.PI, angle + Math.PI * 1.85);
        ctx.stroke();
        ctx.fillStyle = c.ink;
        ctx.font = '800 10.5px "Bricolage Grotesque", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SA+2-OPT', 0, -2);
        ctx.fillStyle = c.mint;
        ctx.font = '700 9px "IBM Plex Mono", monospace';
        ctx.fillText('CERDAS', 0, 11);
      }
      ctx.restore();

      // 3 Menara Server VM (kanan)
      vmY.forEach((y, idx) => {
        const isHot = isBad && idx === 1;
        const fillRatio = loads[idx] / 15;
        const pulse = isHot ? Math.sin(elapsed * 6) * 0.03 : Math.sin(elapsed * 2 + idx) * 0.02;

        ctx.fillStyle = isHot ? c.heatSoft : c.panel;
        ctx.strokeStyle = isHot ? c.heat : isBad ? vmColors[idx] : c.mint;
        ctx.lineWidth = isHot ? 2.5 : 1.8;
        ctx.beginPath();
        ctx.roundRect(356, y - 24, 148, 48, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = c.ink;
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(vmLabels[idx], 366, y - 6);

        ctx.fillStyle = isHot ? c.heat : c.ink;
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${loads[idx]} dtk`, 495, y - 6);

        ctx.fillStyle = isHot ? c.heat : c.muted;
        ctx.font = '600 9.5px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(isHot ? 'MACET · Bottleneck!' : vmSpeeds[idx], 366, y + 7);

        ctx.fillStyle = c.pipe;
        ctx.beginPath();
        ctx.roundRect(366, y + 12, 128, 6, 3);
        ctx.fill();

        ctx.fillStyle = isHot ? c.heat : vmColors[idx];
        ctx.beginPath();
        ctx.roundRect(366, y + 12, Math.min(128, 128 * (fillRatio + pulse)), 6, 3);
        ctx.fill();
      });

      if (!reduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto w-full rounded-2xl border border-[var(--border-line)]"
      role="img"
      aria-label={
        mode === 'naive'
          ? 'Animasi pembagian asal menyebabkan paket menumpuk di VM 2 hingga 14 detik'
          : 'Animasi pembagian cerdas Hybrid SA + 2-Opt membagi paket merata selesai 9 detik'
      }
    />
  );
}

/**
 * 2. SaMountainPhysicsCanvas (Episode 2 · Bagian 1):
 * Animasi fisika 60fps: Bola Greedy terjebak di lembah dangkal (14 dtk),
 * sedangkan Bola Panas SA melompati bukit menuju Global Optimum (9 dtk) sambil termometer Suhu T turun live!
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
    const H = 240;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();

    const terrainY = (xNorm: number) => {
      const localDip = 52 * Math.exp(-(((xNorm - 0.27) / 0.13) ** 2));
      const peak = -40 * Math.exp(-(((xNorm - 0.52) / 0.12) ** 2));
      const globalDip = 90 * Math.exp(-(((xNorm - 0.78) / 0.14) ** 2));
      return 110 + localDip + peak + globalDip;
    };

    let rafId = 0;
    const start = performance.now();
    const cycleSec = 6.6;

    const draw = (now: number) => {
      const tCycle = reduced ? 5.2 : ((now - start) / 1000) % cycleSec;
      const p = tCycle / cycleSec;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      // Isi gunung
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) {
        ctx.lineTo(x, terrainY(x / W));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = theme === 'dark' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(3, 105, 161, 0.08)';
      ctx.fill();

      // Kontur gunung
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = terrainY(x / W);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label awam lembah + sumbu vertikal makna tinggi-rendah
      ctx.font = '700 10.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = c.muted;
      ctx.fillText('Lembah Sempit (14 dtk)', 0.27 * W, 186);
      ctx.fillText('Local Optimum', 0.27 * W, 200);

      ctx.fillStyle = c.mint;
      ctx.fillText('Lembah Terdalam (9 dtk)', 0.78 * W, 218);
      ctx.fillText('Global Optimum', 0.78 * W, 231);

      // Bola Greedy (selalu mentok di 0.27)
      const gXNorm = p < 0.22 ? 0.12 + (p / 0.22) * 0.15 : 0.27 + Math.sin(p * 28) * 0.005;
      const gX = gXNorm * W;
      const gY = terrainY(gXNorm) - 9;
      ctx.fillStyle = c.muted;
      ctx.beginPath();
      ctx.arc(gX, gY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = c.muted;
      ctx.fillText(p > 0.25 ? 'Greedy: Macet!' : 'Greedy', gX, gY - 13);

      // Suhu T simulasi sesuai mode pendinginan
      const liveTemp =
        coolingMode === 'gradual'
          ? Math.max(8, Math.round(100 * (1 - p * 0.88)))
          : Math.max(2, Math.round(100 * Math.pow(0.08, p * 2.2)));

      let saXNorm = 0.12;
      let jumpLift = 0;
      let saColor = c.heat;
      let tempLabel = 'Suhu Panas · Siap Eksplorasi';

      if (coolingMode === 'gradual') {
        if (p < 0.22) {
          saXNorm = 0.12 + (p / 0.22) * 0.15;
        } else if (p < 0.62) {
          const u = (p - 0.22) / 0.4;
          saXNorm = 0.27 + u * 0.51;
          jumpLift = Math.sin(u * Math.PI) * 18;
          tempLabel = 'Suhu Panas · Berani Lompat Naik!';
        } else {
          const u = Math.min(1, (p - 0.62) / 0.2);
          saXNorm = 0.78 + Math.sin(u * Math.PI * 2) * (1 - u) * 0.02;
          saColor = c.mint;
          tempLabel = 'Suhu Dingin · Kunci Global Optimum!';
        }
      } else {
        if (p < 0.22) {
          saXNorm = 0.12 + (p / 0.22) * 0.15;
        } else if (p < 0.46) {
          const u = (p - 0.22) / 0.24;
          saXNorm = 0.27 + Math.sin(u * Math.PI) * 0.14;
          tempLabel = 'Suhu Anjlok Terlalu Cepat!';
        } else {
          saXNorm = 0.27;
          saColor = c.cyan;
          tempLabel = 'Beku Dini · Ikut Macet di 14 dtk';
        }
      }

      const saX = saXNorm * W;
      const saY = terrainY(saXNorm) - 10 - jumpLift;

      // Jejak lengkung lompatan SA
      if (coolingMode === 'gradual' && p > 0.24) {
        ctx.strokeStyle = c.heat;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0.27 * W, terrainY(0.27) - 10);
        ctx.quadraticCurveTo(0.52 * W, 38, 0.78 * W, terrainY(0.78) - 10);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle =
        saColor === c.mint ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 122, 61, 0.28)';
      ctx.beginPath();
      ctx.arc(saX, saY, 17, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = saColor;
      ctx.beginPath();
      ctx.arc(saX, saY, 9.5, 0, Math.PI * 2);
      ctx.fill();

      // Badge status kiri atas
      ctx.fillStyle = c.panel;
      ctx.strokeStyle = saColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(14, 10, 272, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = saColor;
      ctx.font = '700 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(tempLabel, 24, 27);

      // Termometer Live Suhu T (kanan atas)
      ctx.fillStyle = c.panel;
      ctx.strokeStyle = c.pipe;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W - 156, 10, 142, 26, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = c.ink;
      ctx.font = '700 10.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Suhu T: ${liveTemp}`, W - 146, 27);

      // Bar kecil termometer
      ctx.fillStyle = c.pipe;
      ctx.beginPath();
      ctx.roundRect(W - 68, 19, 46, 8, 4);
      ctx.fill();
      ctx.fillStyle = liveTemp > 35 ? c.heat : c.cyan;
      ctx.beginPath();
      ctx.roundRect(W - 68, 19, Math.max(4, (liveTemp / 100) * 46), 8, 4);
      ctx.fill();

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
      aria-label="Animasi bola panas Simulated Annealing melompati bukit menuju lembah terdalam 9 detik sambil suhu T menurun"
    />
  );
}

/**
 * 3. MetropolisDecisionCanvas (Episode 2 · Bagian 2 - BARU!):
 * Eksperimen visual 60fps yang menerjemahkan rumus P = exp(-ΔE/T) menjadi
 * Meteran Zona TERIMA (Hijau) vs TOLAK (Merah) dengan jarum acak animasi dan skenario jadwal 14s -> 18s!
 */
export function MetropolisDecisionCanvas({
  temperature,
  deltaE,
  prob,
  rollValue,
  rollSeq,
}: {
  temperature: number;
  deltaE: number;
  prob: number;
  rollValue: number | null;
  rollSeq: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = usePresentationStore((s) => s.theme);
  const rollStartRef = useRef<number>(0);

  useEffect(() => {
    if (rollSeq > 0) {
      rollStartRef.current = performance.now();
    }
  }, [rollSeq]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 520;
    const H = 220;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();
    let rafId = 0;

    const draw = (now: number) => {
      const elapsedMs = now - rollStartRef.current;
      const animT = reduced ? 1 : Math.min(1, elapsedMs / 580);
      const easeOut = 1 - Math.pow(1 - animT, 3);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      // Baris 1: Cerita Nyata Server (14 dtk -> 14 + ΔE dtk)
      const oldMs = 14;
      const newMs = oldMs + deltaE;

      ctx.fillStyle = c.panel;
      ctx.strokeStyle = c.pipe;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(16, 12, 168, 44, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = c.muted;
      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Jadwal Sekarang', 26, 29);
      ctx.fillStyle = c.ink;
      ctx.font = '800 14px "IBM Plex Mono", monospace';
      ctx.fillText(`${oldMs} detik`, 26, 47);

      // Panah perbandingan tengah
      ctx.fillStyle = c.heat;
      ctx.font = '800 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`+${deltaE.toFixed(1).replace('.', ',')} dtk`, 240, 31);
      ctx.fillStyle = c.muted;
      ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('lebih lambat (ΔE)', 240, 46);

      ctx.fillStyle = c.heatSoft;
      ctx.strokeStyle = c.heat;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(298, 12, 206, 44, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = c.heat;
      ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Ide Acak Baru SA (Lebih Buruk!)', 308, 29);
      ctx.fillStyle = c.ink;
      ctx.font = '800 14px "IBM Plex Mono", monospace';
      ctx.fillText(`${newMs.toFixed(1).replace('.', ',')} detik`, 308, 47);

      // Baris 2: Meteran Peluang 0%..100% (Zona Hijau TERIMA vs Zona Merah TOLAK)
      const barX = 24;
      const barY = 92;
      const barW = W - 48;
      const barH = 42;
      const splitW = Math.max(4, Math.min(barW - 4, barW * prob));
      const pctStr = `${(prob * 100).toFixed(1).replace('.', ',')}%`;
      const rejStr = `${((1 - prob) * 100).toFixed(1).replace('.', ',')}%`;

      ctx.fillStyle = c.ink;
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Meteran Peluang pada Suhu T = ${temperature.toFixed(1).replace('.', ',')}:`, barX, barY - 12);

      // Zona Hijau (TERIMA)
      ctx.fillStyle = c.mint;
      ctx.beginPath();
      ctx.roundRect(barX, barY, splitW, barH, [10, 0, 0, 10]);
      ctx.fill();

      // Zona Merah/Oranye (TOLAK)
      ctx.fillStyle = c.heat;
      ctx.beginPath();
      ctx.roundRect(barX + splitW, barY, barW - splitW, barH, [0, 10, 10, 0]);
      ctx.fill();

      // Label di dalam zona (hanya jika cukup lebar)
      ctx.font = '800 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      if (splitW > 88) {
        ctx.fillStyle = c.blockInk;
        ctx.fillText(`TERIMA ${pctStr}`, barX + splitW / 2, barY + 25);
      }
      if (barW - splitW > 88) {
        ctx.fillStyle = c.blockInk;
        ctx.fillText(`TOLAK ${rejStr}`, barX + splitW + (barW - splitW) / 2, barY + 25);
      }

      // Garis batas P
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(barX + splitW, barY - 5);
      ctx.lineTo(barX + splitW, barY + barH + 5);
      ctx.stroke();

      // Skala 0% dan 100%
      ctx.fillStyle = c.muted;
      ctx.font = '600 9.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('0% (Pasti Terima)', barX, barY + barH + 16);
      ctx.textAlign = 'right';
      ctx.fillText('100% (Pasti Tolak)', barX + barW, barY + barH + 16);

      // Jarum acak animasi saat user klik Uji Keputusan SA
      if (rollValue !== null) {
        // Sapuan awal sebelum mendarat di rollValue
        const visualPos =
          animT < 1
            ? Math.max(0.02, Math.min(0.98, rollValue * easeOut + Math.sin(animT * Math.PI * 3) * (1 - animT) * 0.25))
            : rollValue;
        const needleX = barX + visualPos * barW;
        const isAccepted = rollValue < prob;

        // Segitiga jarum emas di atas meteran
        ctx.fillStyle = c.goldFill;
        ctx.beginPath();
        ctx.moveTo(needleX, barY - 2);
        ctx.lineTo(needleX - 9, barY - 16);
        ctx.lineTo(needleX + 9, barY - 16);
        ctx.closePath();
        ctx.fill();

        // Garis jarum menembus batang
        ctx.strokeStyle = c.goldFill;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(needleX, barY - 2);
        ctx.lineTo(needleX, barY + barH + 2);
        ctx.stroke();

        // Panel keputusan hasil di bagian bawah
        const resColor = isAccepted ? c.mint : c.heat;
        ctx.fillStyle = isAccepted ? c.mintSoft : c.heatSoft;
        ctx.strokeStyle = resColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(16, 162, W - 32, 46, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = resColor;
        ctx.font = '800 11.5px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          isAccepted
            ? `✓ DITERIMA! Angka acak ${(rollValue * 100).toFixed(0)}% jatuh di ZONA HIJAU (< ${pctStr})`
            : `✕ DITOLAK! Angka acak ${(rollValue * 100).toFixed(0)}% jatuh di ZONA MERAH (≥ ${pctStr})`,
          28,
          181,
        );
        ctx.fillStyle = c.ink;
        ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(
          isAccepted
            ? 'SA berani ambil jalur mundur ini sementara agar bisa melompat keluar dari jebakan lokal.'
            : 'SA menolak jadwal lebih lambat ini dan tetap mempertahankan jadwal 14 detik yang lebih cepat.',
          28,
          198,
        );
      } else {
        ctx.fillStyle = c.panel;
        ctx.strokeStyle = c.pipe;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(16, 162, W - 32, 46, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = c.muted;
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          'Klik tombol "Uji Keputusan SA" untuk melempar jarum acak ke Zona Hijau atau Merah!',
          W / 2,
          189,
        );
      }

      if (!reduced && rollSeq > 0 && animT < 1) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme, temperature, deltaE, prob, rollValue, rollSeq]);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto w-full rounded-2xl border border-[var(--border-line)]"
      role="img"
      aria-label="Animasi meteran keputusan Simulated Annealing dengan zona terima hijau dan zona tolak merah"
    />
  );
}

/**
 * 4. TwoOptMorphCanvas (Episode 3 · Bagian 1):
 * Animasi 60fps memperlihatkan titik energi berjalan di jalur, lalu saat 2-Opt dipicu,
 * dua kabel yang bersilangan X berayun mulus menjadi dua jalur sejajar hijau!
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
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 + (1 - ease) * (idx % 2 === 0 ? -24 : 24);
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);
        ctx.stroke();

        if (!reduced) {
          const u = (tSec * 0.55 + idx * 0.23) % 1;
          const inv = 1 - u;
          const px = inv * inv * from.x + 2 * inv * u * midX + u * u * to.x;
          const py = inv * inv * from.y + 2 * inv * u * midY + u * u * to.y;
          ctx.fillStyle = isTarget ? c.goldFill : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 3.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!isOptimal && cities.length === 4) {
        ctx.fillStyle = c.heat;
        ctx.beginPath();
        ctx.arc(200, 130, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 13px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕', 200, 131);
        ctx.textBaseline = 'alphabetic';
      }

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
 * 5. CloudSwapAnimCanvas (Episode 3 · Bagian 2 - BARU!):
 * Animasi nyata 60fps: Balok T1 di VM 1 (6 dtk) dan T2 di VM 2 (7 dtk) benar-benar
 * terbang melengkung bertukar rak VM, sehingga Makespan langsung anjlok 15 dtk -> 10 dtk!
 */
export function CloudSwapAnimCanvas({ swapped }: { swapped: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = usePresentationStore((s) => s.theme);
  const prevSwappedRef = useRef(swapped);
  const animStartRef = useRef<number>(0);

  useEffect(() => {
    if (prevSwappedRef.current !== swapped) {
      animStartRef.current = performance.now();
    }
  }, [swapped]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 540;
    const H = 228;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();
    let rafId = 0;

    const trackX = 112;
    const trackW = 350;
    const scaleMax = 16;
    const pxPerSec = trackW / scaleMax;
    const vm1Y = 66;
    const vm2Y = 148;
    const blkH = 34;

    const draw = (now: number) => {
      const elapsed = now - animStartRef.current;
      const rawT = reduced ? 1 : Math.min(1, elapsed / 780);
      const ease = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
      // p = 0 (kondisi awal: belum swap), p = 1 (kondisi sesudah swap)
      const p = swapped
        ? prevSwappedRef.current
          ? 1
          : ease
        : prevSwappedRef.current
          ? 1 - ease
          : 0;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      const vm1Total = 9 * (1 - p) + 5 * p;
      const vm2Total = 15 * (1 - p) + 10 * p;
      const makespan = Math.max(vm1Total, vm2Total);
      const isCool = p > 0.85;

      // Header status
      ctx.fillStyle = c.panel;
      ctx.strokeStyle = isCool ? c.mint : c.heat;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(14, 12, W - 28, 28, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCool ? c.mint : c.heat;
      ctx.font = '700 10.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        isCool
          ? '✓ SESUDAH 2-OPT: T1 & T2 bertukar VM -> Makespan turun 15s ke 10s (-33%)!'
          : 'SEBELUM 2-OPT: T1 (6s) & T2 (7s) salah server -> VM 2 macet 15 dtk!',
        W / 2,
        30,
      );

      // Latar rak VM 1 & VM 2
      [
        { label: 'VM 1', mips: '800 MIPS', y: vm1Y, total: vm1Total, hot: false },
        { label: 'VM 2', mips: '1300 MIPS', y: vm2Y, total: vm2Total, hot: !isCool },
      ].forEach((vm) => {
        ctx.fillStyle = vm.hot ? c.heatSoft : c.panel;
        ctx.strokeStyle = vm.hot ? c.heat : isCool ? c.mint : c.pipe;
        ctx.lineWidth = vm.hot ? 2 : 1.5;
        ctx.beginPath();
        ctx.roundRect(14, vm.y - 12, W - 28, 58, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = c.ink;
        ctx.font = '800 12px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(vm.label, 26, vm.y + 12);
        ctx.fillStyle = c.muted;
        ctx.font = '600 9.5px "IBM Plex Mono", monospace';
        ctx.fillText(vm.mips, 26, vm.y + 27);

        // Rel track
        ctx.fillStyle = c.bg;
        ctx.beginPath();
        ctx.roundRect(trackX, vm.y, trackW, blkH, 8);
        ctx.fill();

        // Total detik kanan
        ctx.fillStyle = vm.hot ? c.heat : isCool ? c.mint : c.ink;
        ctx.font = '800 13px "IBM Plex Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${vm.total.toFixed(0)}s`, W - 24, vm.y + 21);
      });

      // Garis Makespan vertikal putus-putus
      const mkX = trackX + makespan * pxPerSec;
      ctx.strokeStyle = isCool ? c.mint : c.heat;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(mkX, vm1Y - 6);
      ctx.lineTo(mkX, vm2Y + blkH + 14);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = isCool ? c.mint : c.heat;
      ctx.font = '700 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Makespan ${makespan.toFixed(0)}s`, mkX, vm2Y + blkH + 26);

      // Balok tetap: T3 (3s di VM 1) dan T4 (8s di VM 2) bergeser mulus menyesuaikan lebar T1/T2
      const t1Width = (6 * (1 - p) + 2 * p) * pxPerSec;
      const t2Width = (7 * (1 - p) + 2 * p) * pxPerSec;

      const t3X = trackX + (6 * (1 - p) + 2 * p) * pxPerSec + 3;
      ctx.fillStyle = c.cyan;
      ctx.beginPath();
      ctx.roundRect(t3X, vm1Y + 2, 3 * pxPerSec - 4, blkH - 4, 7);
      ctx.fill();
      ctx.fillStyle = c.blockInk;
      ctx.font = '800 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('T3·3s', t3X + (3 * pxPerSec - 4) / 2, vm1Y + 21);

      const t4X = trackX + (7 * (1 - p) + 2 * p) * pxPerSec + 3;
      ctx.fillStyle = c.violet;
      ctx.beginPath();
      ctx.roundRect(t4X, vm2Y + 2, 8 * pxPerSec - 4, blkH - 4, 7);
      ctx.fill();
      ctx.fillStyle = c.blockInk;
      ctx.fillText('T4·8s', t4X + (8 * pxPerSec - 4) / 2, vm2Y + 21);

      // Jejak lengkung swap saat di tengah terbang
      const arcLift = Math.sin(p * Math.PI);
      if (arcLift > 0.04) {
        ctx.strokeStyle = c.cyan;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(trackX + 40, vm1Y + blkH / 2);
        ctx.quadraticCurveTo(trackX + 120, (vm1Y + vm2Y) / 2 + 10, trackX + 35, vm2Y + blkH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Balok T1: terbang dari VM 1 (6s) -> VM 2 (2s)
      const t1X = trackX + arcLift * 46;
      const t1Y = vm1Y + (vm2Y - vm1Y) * p;
      ctx.fillStyle = c.goldFill;
      ctx.beginPath();
      ctx.roundRect(t1X, t1Y + 2, t1Width - 3, blkH - 4, 7);
      ctx.fill();
      ctx.fillStyle = c.goldInk;
      ctx.font = '800 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `T1·${Math.round(6 * (1 - p) + 2 * p)}s`,
        t1X + (t1Width - 3) / 2,
        t1Y + 21,
      );

      // Balok T2: terbang dari VM 2 (7s) -> VM 1 (2s)
      const t2X = trackX - arcLift * 24;
      const t2Y = vm2Y + (vm1Y - vm2Y) * p;
      ctx.fillStyle = c.mint;
      ctx.beginPath();
      ctx.roundRect(t2X, t2Y + 2, t2Width - 3, blkH - 4, 7);
      ctx.fill();
      ctx.fillStyle = c.blockInk;
      ctx.fillText(
        `T2·${Math.round(7 * (1 - p) + 2 * p)}s`,
        t2X + (t2Width - 3) / 2,
        t2Y + 21,
      );

      if (rawT >= 1) {
        prevSwappedRef.current = swapped;
      }

      if (!reduced && rawT < 1) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme, swapped]);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto w-full rounded-2xl border border-[var(--border-line)]"
      role="img"
      aria-label="Animasi 2-Opt menukar balok task T1 dan T2 antar server VM 1 dan VM 2 sehingga Makespan turun dari 15 detik menjadi 10 detik"
    />
  );
}

/**
 * 6. LrhOrbitCanvas (Episode 4 · Bagian 1 - UPGRADED):
 * Animasi 60fps Mesin Hybrid LRH memperlihatkan 1 jadwal nyata menyusut angka Makespan-nya
 * (18s -> 17s -> 11s -> Kunci!) saat bola data mengelilingi 4 stasiun.
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

    const W = 900;
    const H = 142;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();
    const xs = [115, 338, 562, 785];
    const labels = ['1. Acak SA', '2. Poles 2-Opt', '3. Cek Peluang', '4. Turunkan Suhu'];
    const subLabels = ['Jadwal: 18s -> 16s', 'Tukar VM: 16s -> 11s!', '11s < 18s: TERIMA ✓', 'T = T × 0,90'];
    const colors = [c.heat, c.cyan, c.mint, c.gold];

    let rafId = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = reduced ? 1.5 : (now - start) / 1000;
      const cyclePos = (elapsed * 0.36) % 1;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 14);
      ctx.fill();

      // Rel lurus kiri ke kanan
      ctx.strokeStyle = c.pipe;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(xs[0], 54);
      ctx.lineTo(xs[3], 54);
      ctx.stroke();

      // Rel balik bawah (ulang loop sampai suhu dingin)
      ctx.strokeStyle = c.pipe;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(xs[3], 84);
      ctx.quadraticCurveTo(450, 134, xs[0], 84);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = c.muted;
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Ulangi terus sampai suhu T dingin -> dapatkan jadwal terbaik S_opt', 450, 130);

      // Posisi bola paket bergerak
      let bx = xs[0];
      let by = 54;
      let bColor = c.goldFill;
      if (cyclePos < 0.72) {
        const u = cyclePos / 0.72;
        bx = xs[0] + u * (xs[3] - xs[0]);
        by = 54;
        bColor = u < 0.33 ? c.heat : u < 0.66 ? c.cyan : c.mint;
      } else {
        const u = (cyclePos - 0.72) / 0.28;
        const inv = 1 - u;
        bx = inv * inv * xs[3] + 2 * inv * u * 450 + u * u * xs[0];
        by = inv * inv * 84 + 2 * inv * u * 134 + u * u * 84;
        bColor = c.goldFill;
      }

      // 4 Stasiun dengan transformasi angka nyata
      xs.forEach((x, idx) => {
        const isSelected = activeStep === idx;
        ctx.fillStyle = c.panel;
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.beginPath();
        ctx.roundRect(x - 90, 22, 180, 62, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? colors[idx] : c.ink;
        ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[idx], x, 47);

        ctx.fillStyle = colors[idx];
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        ctx.fillText(subLabels[idx], x, 69);
      });

      // Bola cahaya payload
      ctx.fillStyle = bColor;
      ctx.beginPath();
      ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
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
      aria-label="Animasi siklus 4 tahap Hybrid SA + 2-Opt memperlihatkan penurunan Makespan 18s menjadi 11s"
    />
  );
}

/**
 * 7. ParadigmRaceCanvas (Episode 1 · Bagian 3 - BARU!):
 * Animasi 60fps 4 jalur paralel yang langsung memperlihatkan bedanya:
 * 1. Heuristik (Sufferage), 2. Local Search (2-Opt), 3. Metaheuristik (SA Murni), 4. Hybrid (SA + 2-Opt)!
 */
export function ParadigmRaceCanvas({
  highlightIdx,
  replayKey,
}: {
  highlightIdx: number | null;
  replayKey: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = usePresentationStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 900;
    const H = 224;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = getThemeColors(theme);
    const reduced = prefersReducedMotion();

    // 4 kotak mini (2x2 grid) dengan lanskap pencarian yang identik
    const cells = [
      {
        title: '1. Heuristik (Sufferage)',
        subtitle: 'Cepat sekali jalan · Tidak pernah direvisi',
        badge: 'Selesai: 11,5 dtk',
        color: c.muted,
        col: 0,
        row: 0,
      },
      {
        title: '2. Local Search (2-Opt Saja)',
        subtitle: 'Cepat merapikan · Macet di lembah lokal!',
        badge: 'Terjebak: 12,0 dtk',
        color: c.violet,
        col: 1,
        row: 0,
      },
      {
        title: '3. Metaheuristik (SA Murni)',
        subtitle: 'Bisa melompati bukit · Lama merapikan akhir',
        badge: 'Lambat rata: 9,9 dtk',
        color: c.heat,
        col: 0,
        row: 1,
      },
      {
        title: '4. Hybrid (SA + 2-Opt)',
        subtitle: 'SA melompat keluar + 2-Opt langsung poles!',
        badge: 'Tercepat: 9,0 dtk ✓',
        color: c.mint,
        col: 1,
        row: 1,
      },
    ];

    const cellW = 434;
    const cellH = 100;
    const padX = 12;
    const padY = 10;

    // Kurva bukit mini yang sama pada keempat kotak (u = 0..1 -> yOffset)
    const hillY = (u: number) => {
      const localDip = 18 * Math.exp(-(((u - 0.30) / 0.14) ** 2));
      const peak = -16 * Math.exp(-(((u - 0.54) / 0.12) ** 2));
      const globalDip = 28 * Math.exp(-(((u - 0.80) / 0.14) ** 2));
      return 56 + localDip + peak + globalDip;
    };

    let rafId = 0;
    const start = performance.now();
    const cycleSec = 5.6;

    const draw = (now: number) => {
      const tCycle = reduced ? 4.8 : ((now - start) / 1000) % cycleSec;
      const p = tCycle / cycleSec;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      cells.forEach((cell, idx) => {
        const x0 = padX + cell.col * (cellW + 8);
        const y0 = padY + cell.row * (cellH + 6);
        const isHi = highlightIdx === idx || idx === 3;

        ctx.fillStyle = c.panel;
        ctx.strokeStyle = highlightIdx === idx ? c.goldFill : idx === 3 ? c.mint : c.pipe;
        ctx.lineWidth = highlightIdx === idx ? 2.8 : idx === 3 ? 2 : 1.3;
        ctx.beginPath();
        ctx.roundRect(x0, y0, cellW, cellH, 12);
        ctx.fill();
        ctx.stroke();

        // Judul & badge hasil
        ctx.fillStyle = isHi ? cell.color : c.ink;
        ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(cell.title, x0 + 12, y0 + 20);

        ctx.fillStyle = c.muted;
        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(cell.subtitle, x0 + 12, y0 + 34);

        ctx.fillStyle = cell.color;
        ctx.font = '700 10.5px "IBM Plex Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(cell.badge, x0 + cellW - 12, y0 + 20);

        // Gambar kurva lembah di dalam kotak
        const gX = x0 + 16;
        const gW = cellW - 32;
        ctx.strokeStyle = c.pipe;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k <= 44; k++) {
          const u = k / 44;
          const px = gX + u * gW;
          const py = y0 + hillY(u);
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Gerak bola masing-masing paradigma
        let uPos = 0.1;
        let lift = 0;
        let showScan = false;

        if (idx === 0) {
          // Heuristik: langsung loncat cepat sekali jalan lalu diam di u=0.35
          uPos = p < 0.22 ? 0.08 + (p / 0.22) * 0.27 : 0.35;
        } else if (idx === 1) {
          // Local Search 2-Opt: turun cepat ke lembah lokal u=0.30 lalu macet bergetar
          uPos = p < 0.24 ? 0.08 + (p / 0.24) * 0.22 : 0.30 + Math.sin(p * 34) * 0.006;
        } else if (idx === 2) {
          // Metaheuristik SA: lompat bukit lalu zigzag pelan menuju 0.74
          if (p < 0.24) {
            uPos = 0.08 + (p / 0.24) * 0.22;
          } else if (p < 0.62) {
            const u = (p - 0.24) / 0.38;
            uPos = 0.30 + u * 0.36;
            lift = Math.sin(u * Math.PI) * 14;
          } else {
            const u = (p - 0.62) / 0.38;
            uPos = 0.66 + u * 0.09 + Math.sin(u * Math.PI * 5) * 0.02;
          }
        } else {
          // Hybrid SA + 2-Opt: SA lompat bukit lebih cepat lalu 2-Opt langsung kunci di dasar 0.80!
          if (p < 0.18) {
            uPos = 0.08 + (p / 0.18) * 0.22;
          } else if (p < 0.46) {
            const u = (p - 0.18) / 0.28;
            uPos = 0.30 + u * 0.42;
            lift = Math.sin(u * Math.PI) * 15;
          } else if (p < 0.60) {
            const u = (p - 0.46) / 0.14;
            uPos = 0.72 + u * 0.08;
            showScan = true;
          } else {
            uPos = 0.80;
          }
        }

        const bx = gX + uPos * gW;
        const by = y0 + hillY(uPos) - 5 - lift;

        // Sinar polesan cyan 2-Opt di kotak Hybrid
        if (showScan) {
          ctx.strokeStyle = c.cyan;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(bx, by, 13, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = cell.color;
        ctx.beginPath();
        ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme, highlightIdx, replayKey]);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto w-full rounded-2xl border border-[var(--border-line)]"
      role="img"
      aria-label="Animasi 4 jalur perbandingan Heuristik, Local Search, Metaheuristik, dan Hybrid SA + 2-Opt"
    />
  );
}

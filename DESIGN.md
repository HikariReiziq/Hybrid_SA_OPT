# DESIGN.md: Animated Science Theater (Kurzgesagt Cinema + Guided Coach)

> Reading this as: 8-Minute Interactive Animated Explainer Video & Guided Simulation Web App for IT students learning Hybrid SA + 2-Opt Cloud Scheduling, in a Kurzgesagt Animated Science Theater style with a Guided Cursor Coach, dial ENERGY 3 / RHYTHM 3 / MOTION 3.

## 1. Visual Identity & Differentiation Anchor
- **Style**: **Interactive Animated Science Film** (teater animasi vektor modern dengan panggung widescreen, timeline video player di bawah, dan *Guided Coach Pointer* yang memandu kursor pengguna awam langkah demi langkah). Sengaja 100% berbeda dari slide kertas putih bergaris hitam maupun buku perkamen kuno.
- **Differentiation Anchor**: Jika logo dihapus, aplikasi langsung dikenali lewat **kanvas sinema Midnight Observatory (`#0B1120`)** tempat paket task meluncur hidup di pipa, bola panas SA melompati bukit di kanvas fisika 60fps, garis 2-Opt terurai dengan animasi pegas, dan **Pemandu Kursor Interaktif (Coach Hand + Halo Emas)** yang menuntun audiens awam.
- **Purpose of Every Major Choice**:
  - **Midnight Studio sebagai tema bawaan (R-21)**: Format produk adalah **video animasi interaktif / cinema theater**; latar gelap kontras tinggi membuat paket bergerak, api termal SA, dan sinar pemindai 2-Opt langsung menonjol seperti menonton film animasi sains.
  - **Working Daylight Studio Toggle (R-34)**: Menyediakan mode terang biru-slate sejuk (`#EEF4FB`) untuk ruang kelas dengan proyektor sangat terang, terverifikasi WCAG AA pada semua pasangan warna.
  - **3 Warna Fungsional + 1 Aksen Pemandu (R-29)**:
    - **SA Molten Amber**: panas suhu SA, bola eksplorasi, dan server bottleneck.
    - **2-Opt Sky Cyan**: pemotongan silangan 2-Opt, sinar poles lokal, dan busur penukaran task.
    - **Optimal Emerald**: jalur lurus, server seimbang, dan jawaban kuis benar.
    - **Coach Gold**: eksklusif untuk pointer pemandu kursor dan posisi timeline aktif (selalu berteks gelap `#0F172A`).
  - **Tipografi**: `Bricolage Grotesque` (judul ekspresif berkarakter studio animasi), `Plus Jakarta Sans` (narasi subtitle & instruksi Bahasa Indonesia super jelas), `IBM Plex Mono` (angka telemetri tabular).
  - **Gerak Bermakna (`MOTION 3` - Choreography)**: 60fps canvas physics (bola SA melompati bukit, paket mengalir ke rak server, kabel 2-Opt terurai mulus, busur swap task melayang, pointer pemandu mengarahkan klik). Menghormati penuh `prefers-reduced-motion`.

## 2. Color System (WCAG AA >= 4.5:1 Verified)

| Token | Midnight Theater (Default) | Daylight Studio (Toggle) | Peran Fungsional |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#070B14` | `#E3ECF6` | Bingkai luar cinema |
| `--bg-stage` | `#0E1526` | `#F8FBFF` | Panggung utama animasi |
| `--bg-panel` | `#162038` | `#FFFFFF` | Panel kontrol & kartu data |
| `--bg-inset` | `#1E2B4A` | `#EDF3FA` | Area lintasan & sub-panel |
| `--ink-primary` | `#F3F6FC` | `#0F172A` | Teks utama & judul |
| `--ink-secondary` | `#B2C0D8` | `#475569` | Keterangan & sumbu grafik |
| `--border-line` | `#2B3B5E` | `#C7D6E8` | Garis pemisah bersih |
| `--sa-heat` | `#FF7A3D` | `#B8380A` | Suhu SA & server bottleneck |
| `--sa-heat-soft` | `#361C15` | `#FFF1EB` | Latar status panas |
| `--opt-cyan` | `#38BDF8` | `#0369A1` | Aksi & sinar presisi 2-Opt |
| `--opt-cyan-soft` | `#102B42` | `#E8F5FE` | Latar status 2-Opt |
| `--ok-mint` | `#34D399` | `#047857` | Seimbang, optimal, benar |
| `--ok-mint-soft` | `#0F2E26` | `#E6F8F1` | Latar status optimal |
| `--coach-gold` | `#FBBF24` | `#F5B700` | Pointer pemandu & progress bar (teks `#0F172A`) |

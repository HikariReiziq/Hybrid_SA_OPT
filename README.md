# Hybrid Simulated Annealing + 2-Opt (Cloud Dispatch Network)

Presentasi interaktif berdurasi **~8 menit** dan laboratorium simulasi sisi klien untuk mata kuliah **Strategi Optimasi Komputasi Awan (SOKA)**, Kelompok 4 Kelas C, Institut Teknologi Sepuluh Nopember (ITS).

## Fitur Utama

- **Dual-Mode Navigasi**: **Mode Presentasi (Deck)** dengan kontrol langkah via keyboard (`←`, `→`, `Spasi`) untuk proyektor kelas + **Mode Eksplorasi** (scroll bebas) + **Sandbox Q&A**.
- **5 Adegan Padat (~8 Menit) + 2 Kuis Singkat**:
  1. **Masalah & The WHY**: Mini-Game Cloud Dispatch (6 task × 3 VM vs optimal Brute-Force) + bukti celah SA murni dari eksperimen CloudSim Kelompok 4.
  2. **Fundamental Simulated Annealing (SA)**: Intuisi panas -> dingin + Lab Termostat Metropolis interaktif + perbandingan pendinginan cepat vs bertahap.
  3. **Fundamental 2-Opt & Jembatan Cloud**: Klik jalur silang gaya *Mini Metro* -> morphing ke Cloud Scheduling (Pairwise 2-Opt Swap & Permutasi + EFT Decoder) + Kuis 1/2.
  4. **Hybrid SA + 2-Opt Beraksi**: Mention ringkas paper Gunawan & Iryanto (2023) & pola *Low-level Relay Hybrid (LRH)* + **Live Split-Screen Race** (SA Murni vs Hybrid SA + 2-Opt pada budget evaluasi setara).
  5. **Perbandingan Fair & Penutup**: Data baseline nyata Kelompok 4 (Sufferage, JAYA, SA Murni) + tombol **Impor JSON CloudSim** untuk memasukkan hasil simulasi tim + 4 checklist evaluasi adil + Kuis 2/2 + Referensi ringkas.
- **Sandbox Q&A**: Saklar **Ablation ON/OFF 2-Opt**, pengaturan parameter SA & skala workload, toggle sumbu-X (**Fitness Evaluation vs Langkah**), dan **Uji 10 Seed (`mean ± std`)**.
- **Light & Dark Mode**: Tema terang kontras tinggi sebagai bawaan proyektor kelas, dilengkapi tombol toggle mode gelap.

## Menjalankan Lokal

Butuh Node.js 20+.

```bash
npm install
npm run dev      # dev server http://localhost:5173
npm test         # unit test mesin algoritma & validator JSON
npm run build    # type-check + build produksi ke dist/
npm run preview  # pratinjau hasil build produksi
```

## Memasukkan Hasil CloudSim Tim

Pada **Adegan 05**, klik **Impor JSON CloudSim** atau perbarui [`public/data/cloudsim-hybrid.json`](public/data/cloudsim-hybrid.json) dengan mengubah `"isPlaceholder": false` dan mengisi array `"results"` per skenario (`SA+2Opt` / `DJAYA+2Opt`). Skema divalidasi otomatis oleh [`src/data/cloudsimSchema.ts`](src/data/cloudsimSchema.ts).

## Deploy GitHub Pages

Repositori dilengkapi workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) yang otomatis menjalankan `npm test`, `npm run build`, dan menerbitkan `dist/` ke GitHub Pages setiap push ke branch `main`.

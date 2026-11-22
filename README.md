# Hybrid Simulated Annealing + 2-Opt (Interactive Animated Explainer)

Presentasi animasi interaktif berdurasi **~10 menit** (fokus pemahaman fundamental untuk audiens IT awam) dengan **Pemandu Kursor Terarah (Guided Coach)** dan laboratorium simulasi untuk mata kuliah **Strategi Optimasi Komputasi Awan (SOKA)**, Kelompok 4 Kelas C, Institut Teknologi Sepuluh Nopember (ITS).

## Fitur Utama

- **2 Mode Fokus (Tanpa Duplikasi)**: **Presentasi** (teater animasi widescreen dengan tombol `▶ Putar Otomatis / ❚❚ Jeda`, scrubber bab bertanda *Cek Paham*, subtitle narasi, dan pintasan `←`, `→`, `Spasi`) serta **Sandbox Q&A** untuk sesi tanya jawab.
- **Pemandu Kursor Terarah (`Pemandu: ON/OFF`)**: Setiap adegan dilengkapi bilah misi langkah-demi-langkah dan badge panah berkait segitiga (`↓`/`↑`) yang selalu menunjuk tepat ke tombol/paket target tanpa saling tumpang tindih.
- **6 Animasi 60fps Nyata + Panduan Cara Baca Grafik + 3 Cek Paham di Sela Materi**:
  - **Episode 1 · Masalah Cloud**: Animasi 60fps *Bagi Asal (Macet 14 dtk)* vs *Bagi Cerdas SA + 2-Opt (Rata 9 dtk)*, eksperimen Papan Dispatch, lalu **Cek Paham 1/3** sebelum masuk SA.
  - **Episode 2 · Dasar SA**: Animasi fisika 60fps bola panas SA + termometer Suhu `T` live, eksperimen **Meteran Zona Hijau/Merah** (jarum acak) + animasi simulasi pendinginan di kurva Metropolis lengkap dengan panduan cara baca grafik, lalu **Cek Paham 2/3** sebelum masuk 2-Opt.
  - **Episode 3 · Dasar 2-Opt**: Animasi 60fps pelurusan kabel silang X, animasi 60fps **balok task terbang bertukar rak antar-VM** (`15 dtk → 10 dtk`, -33%), lalu **Cek Paham 3/3** sebelum masuk Hybrid.
  - **Episode 4 · Hybrid Live**: Mention ringkas paper *Gunawan & Iryanto (2023)*, animasi mesin 4 tahap LRH (`18s → 16s → 11s`), dan **Eksperimen Duel Live** (SA Murni vs Hybrid SA + 2-Opt) dengan panduan cara baca grafik (`↓ Makin ke BAWAH = Makin CEPAT!`) & komentator live.
  - **Episode 5 · Hasil & Penutup**: Perbandingan data asli CloudSim Kelompok 4 (Sufferage, JAYA, SA Murni) + panduan baca angka (`Makespan`, `± std`, `DOI`) + impor JSON CloudSim tim, ringkasan 3 poin, skor `X/3`, referensi, dan akses ke **Sandbox Q&A**.
- **Sandbox Q&A**: Uji Ablation ON/OFF 2-Opt, toggle sumbu-X (Evaluasi vs Langkah), Uji 10 Seed (`mean ± std`), serta **Midnight Theater (default) / Daylight Studio Toggle**.

## Menjalankan Lokal

Butuh Node.js 20+.

```bash
npm install
npm run dev      # dev server http://localhost:5173
npm test         # unit test mesin algoritma & validator JSON
npm run build    # type-check + build produksi ke dist/
npm run preview  # pratinjau hasil build produksi
```

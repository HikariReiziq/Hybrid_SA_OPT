# Hybrid Simulated Annealing + 2-Opt (Interactive Animated Explainer)

Film animasi interaktif berdurasi **~8 menit** dengan **Pemandu Kursor Interaktif (Guided Coach)** dan laboratorium simulasi untuk mata kuliah **Strategi Optimasi Komputasi Awan (SOKA)**, Kelompok 4 Kelas C, Institut Teknologi Sepuluh Nopember (ITS).

## Fitur Utama

- **Mode Film Animasi Interaktif + Auto-Play**: Layar teater widescreen dengan tombol `▶ Putar Otomatis / ❚❚ Jeda`, timeline chapter ala pemutar video (`Ep 1` s.d. `Ep 5`), subtitle narasi, dan navigasi keyboard (`←`, `→`, `Spasi`).
- **Pemandu Kursor Interaktif (`Pemandu: ON/OFF`)**: Setiap adegan dilengkapi bilah misi langkah-demi-langkah dan pointer kursor animasi (halo emas) yang menuntun audiens awam langsung ke tombol/paket yang perlu diklik.
- **Animasi 60fps Nyata (HTML5 Canvas & SVG)**:
  - **Episode 1**: Aliran paket cloud melewati router Hybrid SA + 2-Opt ke 3 server DC Jakarta & Surabaya + Mini-Game memindahkan task dari server berasap (target optimal 9 s).
  - **Episode 2**: Simulasi fisika bola panas **Simulated Annealing** melompati bukit menuju Global Optimum dibanding bola Greedy yang terjebak + Termostat Metropolis interaktif 3 langkah.
  - **Episode 3**: Animasi pelurusan dua kabel silang **2-Opt** secara halus + adaptasi Cloud (Pairwise Swap `15 s -> 10 s` & Permutasi Reverse + EFT) + **Kuis 1/2**.
  - **Episode 4**: Mention ringkas paper *Gunawan & Iryanto (2023)* & siklus bola data 4 stasiun LRH + **Live Broadcast Race** (SA Murni vs Hybrid SA + 2-Opt dengan sinar pemindai cyan pada budget evaluasi setara).
  - **Episode 5**: Perbandingan baseline nyata Kelompok 4 (Sufferage, JAYA, SA Murni) + impor JSON CloudSim tim + **Kuis 2/2** + Skor Akhir & Referensi ringkas.
- **Sandbox Q&A & Mode Scroll Bebas**: Uji Ablation ON/OFF 2-Opt, toggle sumbu-X (Evaluasi vs Langkah), Uji 10 Seed (`mean ± std`), serta **Midnight Theater (default) / Daylight Studio Toggle**.

## Menjalankan Lokal

Butuh Node.js 20+.

```bash
npm install
npm run dev      # dev server http://localhost:5173
npm test         # unit test mesin algoritma & validator JSON
npm run build    # type-check + build produksi ke dist/
npm run preview  # pratinjau hasil build produksi
```

# Product Requirements Document (PRD): Hybrid Simulated Annealing + 2-Opt

Ringkasan spesifikasi untuk aplikasi web presentasi interaktif 8 menit dan sandbox eksperimen **Hybrid Simulated Annealing + 2-Opt** pada mata kuliah Strategi Optimasi Komputasi Awan (SOKA), Kelompok 4 Kelas C ITS.

- **Tema Visual**: Perpaduan peta jaringan transit (*Mini Metro*) dan reaksi rak VM ekspresif (*Kurzgesagt*), Light Mode kontras tinggi untuk proyektor kelas + working Dark Mode toggle.
- **Format Navigasi**: Dual-Mode (**Mode Presentasi Deck 16:9** dengan keyboard `←`/`→`/`Spasi` + **Mode Eksplorasi Scroll Bebas**) serta **Sandbox Q&A** terpisah.
- **Porsi Presentasi (~8 Menit)**: 5 Adegan padat *to the point* + 2 Kuis singkat + mention ringkas paper *Gunawan & Iryanto (2023)* + perbandingan jujur melawan Sufferage, JAYA, dan SA Murni (dengan data baseline nyata Kelompok 4 dan jalur impor JSON untuk hasil CloudSim final tim).
- **Arsitektur Pengujian**: 2 seam berlevel tinggi (Seam Mesin Simulasi & Validasi JSON lewat Vitest + Seam Interaksi UI lewat verifikasi browser).

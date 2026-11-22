# DESIGN.md: Cloud Dispatch Network (Mini Metro × Kurzgesagt)

> Reading this as: 8-Minute Interactive Presentation & Explorable Simulation Web App for IT students learning Hybrid SA + 2-Opt Cloud Scheduling, in a Mini Metro Transit Network + Kurzgesagt Expressive Lab style, dial ENERGY 2 / RHYTHM 3 / MOTION 2.

## 1. Visual Identity & Differentiation Anchor
- **Style**: Perpaduan **Peta Jaringan Transit (*Mini Metro*)** yang bersih, geometris, dan tegas di proyektor kelas dengan **Reaksi Rak VM Ekspresif (*Kurzgesagt*)** di mana server yang kepenuhan memerah hangat dan sejuk kembali saat seimbang.
- **Identity Motif**: Garis rel warna tegas + simpul bertepi tinta (`2.5px`) + blok paket task berkode warna dan bentuk per VM, serta transisi visual langsung dari garis silang **X** menjadi sejajar.
- **Purpose of Every Major Choice**:
  - **Light Mode sebagai default**: Presentasi berlangsung di proyektor ruang kelas terang; permukaan `#F7F5EF` mencegah silau putih murni sambil menjaga rasio kontras tinta > 14:1.
  - **Working Dark Mode toggle**: Mendukung ruangan presentasi redup dan eksplorasi mandiri malam hari dengan token warna yang disesuaikan agar tetap lolos WCAG AA.
  - **3 Warna Inti + 1 Aksen Fokus**: Coral-Ember (`--sa-heat`) eksklusif untuk panas SA & VM bottleneck, Rail Cobalt (`--opt-rail`) eksklusif untuk operasi presisi 2-Opt, Emerald (`--ok-balance`) untuk hasil seimbang/optimal/benar, dan Signal Yellow (`--focus-signal`) terbatas pada sorotan kata kunci dan beat aktif.
  - **Tipografi**: `Bricolage Grotesque` memberi karakter hangat-geometris untuk judul presentasi; `Plus Jakarta Sans` menjaga keterbacaan teks Indonesia; `IBM Plex Mono` memastikan angka makespan, suhu, dan evaluasi sejajar tabular.
  - **Komposisi Bervariasi (`RHYTHM 3`)**: Setiap adegan punya tata letak khas sesuai fungsinya (Papan Dispatch 2-kolom -> Termostat Metropolis -> Panggung Morphing 2-Opt -> Split-Screen Race -> Matriks Perbandingan & Penutup).
  - **Gerak Bermakna (`MOTION 2`)**: Hanya menganimasikan perpindahan paket VM, penguraian garis silang 2-Opt, jarum probabilitas, dan balapan kurva konvergensi. Tanpa animasi loop dekoratif; menghormati `prefers-reduced-motion`.

## 2. Color System (CSS Variables)

| Token | Light Mode | Dark Mode | Kegunaan |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#E8E4DA` | `#0F1218` | Latar luar panggung |
| `--bg-surface` | `#F7F5EF` | `#171B24` | Permukaan utama slide / panel |
| `--bg-elevated` | `#FFFFFF` | `#202633` | Kartu interaktif & tabel |
| `--ink-primary` | `#181A20` | `#F3F2EC` | Teks utama & garis tepi |
| `--ink-secondary` | `#4C515E` | `#B0B6C4` | Teks sekunder & sumbu |
| `--border-ink` | `#181A20` | `#3B4354` | Bingkai panel & jalur |
| `--sa-heat` | `#C83D12` | `#F97046` | Panas SA & VM bottleneck |
| `--opt-rail` | `#1756B0` | `#63A4FF` | Operasi lokal 2-Opt |
| `--ok-balance` | `#157347` | `#3EDB8B` | Optimal, seimbang, benar |
| `--focus-signal` | `#F4C430` | `#F4C430` | Sorotan beat / kata kunci (teks `#181A20`) |

## 3. Radii, Elevation & Accessibility
- **Border Radius**: Panel utama `16px`, kartu dalam `12px`, kontrol tombol `8px`, simpul node `50%` (khusus geometri node peta). Tidak semua elemen berbentuk pil.
- **Shadow**: Hampir seluruh elemen datar berbingkai tinta tegas; bayangan solid tipis (`3px 3px 0`) hanya untuk tombol aksi utama dan kartu pilihan kuis saat hover.
- **Keyboard & Contrast**: Fokus `:focus-visible` berupa cincin `3px` kontras tinggi; semua tombol memiliki target sentuh minimal `44px` pada mobile.

/**
 * Sumber kebenaran seluruh materi presentasi animasi interaktif (tanpa batas durasi ketat,
 * fokus pemahaman fundamental dari nol untuk audiens IT awam):
 * 5 Episode · 15 Bagian · 7 Animasi 60fps · 4 Cek Paham di sela-sela materi.
 */

export interface SceneMeta {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  focusTag: string;
  /** Durasi auto-play per bagian (ms) saat tombol Putar Otomatis aktif */
  beatDurationMs: readonly number[];
  /** Label singkat per bagian untuk tooltip scrubber timeline */
  beatLabels: readonly string[];
  beats: readonly string[];
}

export type QuizId = 'q1' | 'q2' | 'q3' | 'q4';

export interface QuizQuestion {
  id: QuizId;
  badge: string;
  checkpointLabel: string;
  question: string;
  options: readonly {
    key: 'A' | 'B' | 'C' | 'D';
    label: string;
    correct: boolean;
    feedback: string;
  }[];
}

export const TEAM_MEMBERS = [
  { name: 'I Dewa Made Satya Raditya', nrp: '5027231051' },
  { name: 'Ahmad Wildan Fawwaz', nrp: '5027241001' },
  { name: 'Muhammad Rakha Hananditya Rauf', nrp: '5027241015' },
  { name: 'Theodorus Aaron Ugraha', nrp: '5027241056' },
  { name: 'M. Hikari Reiziq Rakhmadinta', nrp: '5027241079' },
] as const;

export const SCENES: readonly SceneMeta[] = [
  {
    id: 'masalah',
    number: '01',
    shortTitle: 'Masalah Cloud',
    title: 'Apa itu Penjadwalan Cloud, Makespan, dan 4 Keluarga Algoritma?',
    focusTag: 'Fundamental Dasar',
    beatDurationMs: [12000, 14000, 14000, 11000],
    beatLabels: [
      'Konsep Makespan',
      'Coba Bagi Tugas',
      '4 Keluarga Algoritma',
      'Cek Paham 1/4',
    ],
    beats: [
      'Bayangkan banyak tugas cloud masuk bersamaan ke 3 server dengan kecepatan berbeda. Jika dibagi asal, 1 server macet (14 dtk); jika dibagi cerdas, semua selesai rata di 9 dtk!',
      'Coba rasakan sendiri: klik balok task di server VM 2 yang berasap agar bebannya rata. Untuk 1.000 task di CloudSim, mustahil dilakukan manual.',
      'Sebelum masuk ke cara kerja SA dan 2-Opt, tonton dulu animasi 4 jalur ini agar langsung paham beda Heuristik, Local Search, Metaheuristik, dan Hybrid!',
      'Cek Paham 1/4: sebelum lanjut ke Simulated Annealing, pastikan kita sudah sepakat soal arti Makespan!',
    ],
  },
  {
    id: 'sa',
    number: '02',
    shortTitle: 'Dasar SA',
    title: 'Simulated Annealing: berani mundur sementara demi hasil terbaik.',
    focusTag: 'Fundamental SA',
    beatDurationMs: [14000, 17000, 11000],
    beatLabels: ['Animasi Pegunungan SA', 'Eksperimen Suhu & Peluang', 'Cek Paham 2/4'],
    beats: [
      'Lihat animasi bola di kanan: pencarian biasa (Greedy) langsung macet di lembah dangkal karena menolak langkah naik. SA justru berani melompati bukit saat suhu masih panas!',
      'Sekarang lihat cara kerja otaknya secara nyata: saat jadwal baru lebih lambat +4 dtk, SA memakai Meteran Zona Hijau/Merah sesuai Suhu T. Uji jarumnya dan putar simulasi pendinginan!',
      'Cek Paham 2/4: sebelum lanjut ke partner-nya (2-Opt), pastikan dulu kita paham fungsi Suhu T pada Simulated Annealing.',
    ],
  },
  {
    id: 'two-opt',
    number: '03',
    shortTitle: 'Dasar 2-Opt',
    title: '2-Opt: merapikan jalur silang & menukar beban server.',
    focusTag: 'Fundamental 2-Opt',
    beatDurationMs: [13000, 14000, 11000],
    beatLabels: ['Animasi Kabel Silang X', 'Animasi Tukar Task VM', 'Cek Paham 3/4'],
    beats: [
      'Kenalan dengan 2-Opt: ide sederhananya adalah memutus dua jalur yang saling menyilang X lalu menyambungnya lurus. Rute otomatis lebih pendek!',
      'Di Cloud Computing, logika 2-Opt dipakai untuk menukar 2 task antar-server secara langsung: paket dari VM panas terbang bertukar tempat dengan VM longgar sampai Makespan turun 33%!',
      'Cek Paham 3/4: pastikan paham kenapa SA dan 2-Opt saling melengkapi sebelum melihat bagaimana keduanya digabungkan!',
    ],
  },
  {
    id: 'hybrid-race',
    number: '04',
    shortTitle: 'Hybrid Live',
    title: 'Hybrid SA + 2-Opt: eksplorasi luas + polesan presisi.',
    focusTag: 'Cara Kerja & Eksperimen',
    beatDurationMs: [15000, 18000],
    beatLabels: ['Simulasi 4 Tahap Hybrid', 'Eksperimen Duel Live'],
    beats: [
      'Merujuk Gunawan & Iryanto (2023), 2-Opt dipasang langsung di dalam tiap putaran SA (Low-level Relay Hybrid). Klik tombol langkah demi langkah untuk melihat 1 siklus penuh bekerja!',
      'Waktunya pembuktian! Tonton duel SA Murni vs Hybrid SA + 2-Opt pada soal dan jatah percobaan yang sama. Ingat: garis makin ke BAWAH berarti makin CEPAT!',
    ],
  },
  {
    id: 'perbandingan',
    number: '05',
    shortTitle: 'Hasil & Penutup',
    title: 'Perbandingan adil dengan metode Kelompok 4 sebelumnya.',
    focusTag: 'Evaluasi & Q&A',
    beatDurationMs: [15000, 11000, 12000],
    beatLabels: ['Data CloudSim & Impor', 'Cek Paham 4/4', 'Ringkasan & Sandbox Q&A'],
    beats: [
      'Ini data asli CloudSim Kelompok 4 dari tugas sebelumnya (Sufferage, JAYA, SA Murni) lengkap dengan cara membaca angka ± std dan DOI, plus tombol impor JSON hasil Hybrid tim.',
      'Cek Paham 4/4: satu pertanyaan terakhir tentang syarat perbandingan algoritma yang adil secara ilmiah sebelum masuk ringkasan & Sandbox!',
      'Selesai! Lihat skor pemahaman akhir kamu di bawah lalu buka Sandbox Q&A untuk sesi tanya jawab dan eksperimen parameter bebas.',
    ],
  },
];

export const QUIZZES: Record<QuizId, QuizQuestion> = {
  q1: {
    id: 'q1',
    badge: 'Cek Paham 1 / 4 · Sebelum Masuk SA',
    checkpointLabel: 'Pastikan paham konsep dasar Cloud Task Scheduling dulu:',
    question:
      'Jika VM 1 selesai dalam 5 detik, VM 2 dalam 14 detik, dan VM 3 dalam 4 detik, berapakah nilai Makespan seluruh sistem?',
    options: [
      {
        key: 'A',
        label: '4 detik (waktu server yang paling cepat selesai)',
        correct: false,
        feedback:
          'Belum tepat. Meskipun VM 3 selesai di detik ke-4, seluruh batch pekerjaan belum tuntas selama VM 2 masih bekerja.',
      },
      {
        key: 'B',
        label: '14 detik (waktu server yang paling terakhir selesai / bottleneck)',
        correct: true,
        feedback:
          'Tepat! Makespan adalah waktu selesai total dari server paling lambat (bottleneck). Target optimasi kita adalah mengecilkan angka ini!',
      },
      {
        key: 'C',
        label: '23 detik (jumlah waktu seluruh VM ditambahkan)',
        correct: false,
        feedback:
          'Bukan dijumlahkan, karena ketiga VM bekerja secara paralel (bersamaan), bukan antre satu per satu.',
      },
      {
        key: 'D',
        label: '7,6 detik (rata-rata waktu ketiga VM)',
        correct: false,
        feedback:
          'Rata-rata tidak menunjukkan kapan semua pekerjaan benar-benar selesai; sistem tetap harus menunggu VM terlama (14 detik).',
      },
    ],
  },
  q2: {
    id: 'q2',
    badge: 'Cek Paham 2 / 4 · Sebelum Masuk 2-Opt',
    checkpointLabel: 'Pastikan paham inti cara kerja Simulated Annealing (SA) dulu:',
    question:
      'Mengapa pada awal pencarian (saat Suhu T masih tinggi), Simulated Annealing kadang mau menerima jadwal yang sementara lebih lambat?',
    options: [
      {
        key: 'A',
        label: 'Karena SA tidak bisa membedakan mana jadwal yang cepat dan mana yang lambat',
        correct: false,
        feedback:
          'SA tahu persis jadwal baru lebih lambat (ΔE > 0), tetapi sengaja memberinya peluang diterima agar tidak kaku.',
      },
      {
        key: 'B',
        label: 'Agar bisa melompati jebakan lokal (local optimum) dan menemukan jadwal global yang jauh lebih cepat',
        correct: true,
        feedback:
          'Benar sekali! Menerima langkah mundur sementara saat suhu panas membuat SA bisa keluar dari lembah sempit menuju lembah terdalam.',
      },
      {
        key: 'C',
        label: 'Supaya beban listrik semua server naik secara merata',
        correct: false,
        feedback:
          'Suhu T pada SA hanyalah parameter analogi dari pendinginan logam, bukan suhu fisik atau daya listrik server.',
      },
      {
        key: 'D',
        label: 'Agar SA berhenti secepat mungkin di iterasi pertama',
        correct: false,
        feedback:
          'Justru sebaliknya: suhu panas membuat SA rajin menjelajah di awal, lalu suhu diturunkan perlahan agar mengunci solusi terbaik di akhir.',
      },
    ],
  },
  q3: {
    id: 'q3',
    badge: 'Cek Paham 3 / 4 · Sebelum Gabungan Hybrid',
    checkpointLabel: 'Pastikan paham peran masing-masing sebelum melihat Hybrid SA + 2-Opt:',
    question:
      'Mengapa menggabungkan SA + 2-Opt jauh lebih kuat daripada hanya memakai 2-Opt sendirian?',
    options: [
      {
        key: 'A',
        label: 'Karena 2-Opt hanya mau langkah yang lebih baik sehingga mudah terjebak di local optimum, sedangkan SA bisa membantunya melompat keluar',
        correct: true,
        feedback:
          'Mantap! SA bertugas menjelajah luas agar tidak terjebak, lalu 2-Opt langsung memoles detail beban server supaya cepat rata.',
      },
      {
        key: 'B',
        label: 'Karena 2-Opt tidak bisa digunakan pada server yang memiliki kecepatan MIPS berbeda',
        correct: false,
        feedback:
          '2-Opt bisa dipakai di VM heterogen lewat penukaran pasangan task; kelemahan utamanya adalah mudah mentok di lembah lokal.',
      },
      {
        key: 'C',
        label: 'Karena SA otomatis menghapus semua task berat dari datacenter',
        correct: false,
        feedback:
          'Semua task tetap wajib dikerjakan. SA + 2-Opt hanya mencari pembagian task ke VM yang paling cepat dan seimbang.',
      },
      {
        key: 'D',
        label: 'Karena 2-Opt wajib dijalankan secara manual oleh operator manusia',
        correct: false,
        feedback:
          '2-Opt sepenuhnya otomatis dalam kode, hanya saja bila tanpa SA ia akan berhenti begitu tidak ada penukaran lokal yang lebih baik.',
      },
    ],
  },
  q4: {
    id: 'q4',
    badge: 'Cek Paham 4 / 4 · Evaluasi Ilmiah Adil',
    checkpointLabel: 'Pastikan paham cara menilai hasil perbandingan Hybrid vs SA Murni:',
    question:
      'Agar perbandingan Hybrid SA + 2-Opt melawan SA Murni adil secara ilmiah, syarat apa yang wajib dipenuhi?',
    options: [
      {
        key: 'A',
        label: 'Cukup ambil 1 hasil percobaan (seed) yang paling bagus untuk Hybrid',
        correct: false,
        feedback:
          'Memilih 1 seed beruntung tidak adil. Algoritma stokastik wajib diulang minimal 10 kali dan dilaporkan rata-rata ± std.',
      },
      {
        key: 'B',
        label: 'Samakan jatah total evaluasi jadwal (termasuk evaluasi di dalam 2-Opt), pakai dataset sama, dan uji multi-seed',
        correct: true,
        feedback:
          'Tepat sekali! Karena 2-Opt ikut memeriksa kandidat di tiap putaran SA, total evaluasi harus disamakan agar bukti keunggulannya jujur dan sah.',
      },
      {
        key: 'C',
        label: 'Cukup samakan jumlah putaran luar saja tanpa menghitung pengecekan di dalam 2-Opt',
        correct: false,
        feedback:
          'Menyamakan putaran luar saja tidak adil karena 1 putaran Hybrid memeriksa lebih banyak kandidat daripada 1 putaran SA murni.',
      },
      {
        key: 'D',
        label: 'Kurangi jumlah task pada pengujian Hybrid supaya lebih cepat selesai',
        correct: false,
        feedback:
          'Semua algoritma wajib diuji pada dataset Minggu 3 (GoCJ / NASA) yang persis sama agar perbandingannya valid.',
      },
    ],
  },
};

export const PAPER_MENTION = {
  title: 'Simulated Annealing - 2 Opt Algorithm for Solving Traveling Salesman Problem',
  authors: 'P. H. Gunawan & Iryanto (2023)',
  venue: 'International Journal of Computing, Vol. 22, No. 1, pp. 43-50',
  doi: '10.47839/ijc.22.1.2878',
  taxonomy: 'LRH (Low-level Relay Hybrid)',
  oneLineCore:
    'Inti paper: 2-Opt dipasang langsung di dalam perulangan SA (setiap ide baru dari SA langsung dirapikan 2-Opt sebelum dinilai). Hasil di paper: 1,2x sampai 5,7x lebih cepat dan stabil dibanding SA murni.',
} as const;

export const REFERENCES = [
  {
    tag: 'Hybrid Utama',
    text: 'Gunawan, P. H., & Iryanto (2023). Simulated Annealing - 2 Opt Algorithm for Solving Traveling Salesman Problem. Int. Journal of Computing, 22(1), 43-50. DOI: 10.47839/ijc.22.1.2878.',
  },
  {
    tag: 'Hybrid Pembanding',
    text: 'Gündüz, M., & Aslan, M. (2021). DJAYA: A discrete Jaya algorithm for solving traveling salesman problem. Applied Soft Computing, 105, 107275. DOI: 10.1016/j.asoc.2021.107275.',
  },
  {
    tag: 'Fondasi SA & 2-Opt',
    text: 'Kirkpatrick et al. (1983), Optimization by Simulated Annealing (Science); Croes (1958), A method for solving traveling-salesman problems (Operations Research).',
  },
  {
    tag: 'Baseline Kelompok 4',
    text: 'Maheswaran et al. (1999) Sufferage; Mishra et al. (2022) JAYA Cloud; Celik & Dal (2021) SA Scheduling; Hussain & Aleem (2018) GoCJ Dataset.',
  },
] as const;

export const FAIR_CHECKLIST = [
  {
    id: 'ablation',
    title: 'Uji Ablation (Dengan vs Tanpa 2-Opt)',
    desc: 'Bandingkan SA + 2-Opt langsung melawan SA murni agar kontribusi 2-Opt terbukti.',
  },
  {
    id: 'budget',
    title: 'Jatah Percobaan (Evaluasi) Sama',
    desc: 'Hitung seluruh pengecekan jadwal di dalam 2-Opt, bukan cuma jumlah putaran loop.',
  },
  {
    id: 'multirun',
    title: 'Diulang Minimal 10 Kali (Multi-Seed)',
    desc: 'Catat rata-rata dan simpangan (± std) agar terlihat mana algoritma yang konsisten.',
  },
  {
    id: 'overhead',
    title: 'Dataset Sama & Catat Waktu Proses',
    desc: 'Uji di dataset GoCJ / NASA Minggu 3 yang sama sambil memantau kecepatan scheduler.',
  },
] as const;

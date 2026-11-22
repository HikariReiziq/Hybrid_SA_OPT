/**
 * Sumber kebenaran seluruh teks materi presentasi animasi 8 menit (5 Episode + 2 Kuis),
 * narasi subtitle per beat, arahan pemandu kursor, identitas Kelompok 4 ITS, dan referensi ringkas.
 */

export interface SceneMeta {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  minutes: string;
  /** Durasi auto-play per beat (ms) pada Mode Video */
  beatDurationMs: readonly number[];
  beats: readonly string[];
}

export interface QuizQuestion {
  id: 'q1' | 'q2';
  badge: string;
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
    shortTitle: 'Masalah & Why',
    title: 'Kenapa pembagian task ke server cloud butuh Hybrid?',
    minutes: '1,5 mnt',
    beatDurationMs: [9000, 14000, 10000],
    beats: [
      'Tonton alirannya: paket task masuk ke server DC Jakarta & Surabaya. Hybrid SA + 2-Opt menggabungkan jelajah luas SA dan polesan cepat 2-Opt.',
      'Giliran kamu mencoba! Ikuti tangan pemandu untuk klik paket di server VM 2 yang berasap agar Makespan turun ke 9 detik.',
      'Di eksperimen CloudSim kita kemarin, SA murni sudah unggul di GoCJ, tetapi masih timpang di 1000 task dan goyang di NASA. Karena itu SA butuh partner.',
    ],
  },
  {
    id: 'sa',
    number: '02',
    shortTitle: 'Dasar SA',
    title: 'Simulated Annealing: panas untuk melompat, dingin untuk mengunci.',
    minutes: '1,5 mnt',
    beatDurationMs: [12000, 14000],
    beats: [
      'Lihat animasi bola di pegunungan: bola abu-abu (greedy) terjebak di lembah dangkal, sedangkan bola panas SA melompati bukit menuju lembah terdalam.',
      'Sekarang kendalikan sendiri! Ikuti pemandu untuk ubah Suhu T dan lempar dadu r agar merasakan logika Metropolis P = exp(-ΔE/T).',
    ],
  },
  {
    id: 'two-opt',
    number: '03',
    shortTitle: '2-Opt & Kuis 1',
    title: '2-Opt: lepas jalur silang, tukar beban server.',
    minutes: '1,5 mnt',
    beatDurationMs: [12000, 12000, 12000],
    beats: [
      'Lihat titik cahaya mengalir di jalur yang bersilangan membentuk X. Klik tombol pemandu atau garis merahnya untuk melihat animasi 2-Opt meluruskan jalur!',
      'Di Cloud Scheduling, logika yang sama menukar 2 task antara server panas dan longgar (Pairwise Swap) atau membalik urutan antrean task.',
      'Cek pemahaman cepat 1/2 sebelum kita adu SA Murni melawan Hybrid SA + 2-Opt secara langsung!',
    ],
  },
  {
    id: 'hybrid-race',
    number: '04',
    shortTitle: 'Hybrid Live',
    title: 'Hybrid SA + 2-Opt: eksplorasi global + sapuan presisi.',
    minutes: '2,0 mnt',
    beatDurationMs: [11000, 18000],
    beats: [
      'Merujuk Gunawan & Iryanto (2023), 2-Opt dipanggil langsung di tiap langkah inner loop SA (pola Low-level Relay / LRH). Ikuti bola data berputar melewati 4 stasiun!',
      'Tonton duel langsung! SA Murni (kiri) vs Hybrid SA + 2-Opt dengan sinar pemindai cyan (kanan) pada beban, seed, dan anggaran evaluasi yang persis sama.',
    ],
  },
  {
    id: 'perbandingan',
    number: '05',
    shortTitle: 'Hasil & Kuis 2',
    title: 'Perbandingan adil dengan metode sebelumnya.',
    minutes: '1,5 mnt',
    beatDurationMs: [12000, 14000],
    beats: [
      'Bandingkan Hybrid SA + 2-Opt dengan SA Murni, Sufferage, dan JAYA dari baseline CloudSim Kelompok 4, plus tombol impor JSON hasil final tim.',
      'Cek pemahaman 2/2, lihat skor akhir kamu, lalu buka Sandbox Q&A untuk eksperimen parameter bebas!',
    ],
  },
];

export const QUIZZES: Record<'q1' | 'q2', QuizQuestion> = {
  q1: {
    id: 'q1',
    badge: 'Kuis Cepat 1 / 2',
    question:
      'Mengapa 2-Opt saja tidak cukup kuat tanpa Simulated Annealing (SA) pada penjadwalan cloud berskala besar?',
    options: [
      {
        key: 'A',
        label:
          'Karena 2-Opt hanya menerima langkah yang lebih baik sehingga mudah terjebak di local optimum',
        correct: true,
        feedback:
          'Tepat! 2-Opt sangat tajam merapikan sekitar solusi, tetapi butuh lompatan panas SA agar bisa keluar dari jebakan lokal.',
      },
      {
        key: 'B',
        label: 'Karena 2-Opt tidak bisa menghitung Makespan pada VM heterogen',
        correct: false,
        feedback:
          '2-Opt tetap memakai fungsi objektif Makespan yang sama. Kelemahan utamanya adalah berhenti begitu tidak ada tetangga lokal yang lebih baik.',
      },
      {
        key: 'C',
        label: 'Karena 2-Opt wajib memakai populasi 100 kandidat sekaligus',
        correct: false,
        feedback:
          'Sebaliknya, baik SA maupun 2-Opt bekerja pada solusi tunggal (single-solution), bukan berbasis populasi besar.',
      },
      {
        key: 'D',
        label: 'Karena 2-Opt selalu lebih lambat daripada Round Robin di semua kasus',
        correct: false,
        feedback:
          'Round Robin memang instan karena tanpa optimasi, tetapi alasan utama menggabungkan SA + 2-Opt adalah meloloskan diri dari local optimum.',
      },
    ],
  },
  q2: {
    id: 'q2',
    badge: 'Kuis Cepat 2 / 2',
    question:
      'Agar perbandingan Hybrid SA + 2-Opt melawan SA Murni adil secara ilmiah, apa yang wajib disamakan?',
    options: [
      {
        key: 'A',
        label: 'Cukup pakai 1 random seed yang hasilnya paling bagus untuk Hybrid',
        correct: false,
        feedback:
          'Memilih 1 seed beruntung tidak adil. Algoritma stokastik wajib diuji minimal 10 seed lalu dilaporkan mean ± std.',
      },
      {
        key: 'B',
        label:
          'Anggaran fitness evaluation yang setara, dataset sama, uji multi-run, dan catat overhead waktu',
        correct: true,
        feedback:
          'Benar sekali! 2-Opt menambah evaluasi di tiap langkah SA, jadi budget evaluasi harus dihitung jujur bersama waktu eksekusi scheduler.',
      },
      {
        key: 'C',
        label: 'Cukup menyamakan jumlah iterasi luar tanpa menghitung evaluasi di dalam 2-Opt',
        correct: false,
        feedback:
          'Menyamakan iterasi saja menipu karena 1 iterasi SA + 2-Opt melakukan lebih banyak evaluasi daripada 1 iterasi SA murni.',
      },
      {
        key: 'D',
        label: 'Dataset untuk Hybrid boleh diperkecil agar lebih cepat selesai',
        correct: false,
        feedback:
          'Semua algoritma wajib diuji pada dataset Minggu 3 yang sama persis (GoCJ / NASA) agar perbandingan valid.',
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
    'Setiap kandidat di dalam inner loop SA langsung dipoles oleh 2-Opt sebelum diuji kriteria Metropolis. Hasil di paper: 1,2x hingga 5,7x lebih cepat dan lebih stabil dibanding SA murni.',
} as const;

export const REFERENCES = [
  {
    tag: 'Hybrid Utama',
    text: 'Gunawan, P. H., & Iryanto (2023). Simulated Annealing - 2 Opt Algorithm for Solving Traveling Salesman Problem. Int. Journal of Computing, 22(1), 43-50.',
  },
  {
    tag: 'Hybrid Pembanding',
    text: 'Gündüz, M., & Aslan, M. (2021). DJAYA: A discrete Jaya algorithm for solving traveling salesman problem. Applied Soft Computing, 105, 107275.',
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
    title: 'Ablation',
    desc: 'Bandingkan SA + 2-Opt langsung melawan SA murni.',
  },
  {
    id: 'budget',
    title: 'Budget Evaluasi Setara',
    desc: 'Hitung semua evaluasi di dalam 2-Opt, bukan hanya iterasi.',
  },
  {
    id: 'multirun',
    title: 'Multi-Run (≥ 10 Seed)',
    desc: 'Laporkan mean ± std agar stabilitas terlihat jelas.',
  },
  {
    id: 'overhead',
    title: 'Dataset Sama & Overhead',
    desc: 'Uji di GoCJ / NASA Minggu 3 sambil mencatat waktu scheduler.',
  },
] as const;

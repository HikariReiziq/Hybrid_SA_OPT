/**
 * Sumber kebenaran seluruh teks materi presentasi 8 menit (5 Adegan + 2 Kuis Singkat),
 * narasi beat, identitas Kelompok 4 Kelas C ITS, dan referensi ringkas.
 */

export interface SceneMeta {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  minutes: string;
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
    beats: [
      'Selamat datang! Hari ini kita bahas Hybrid Simulated Annealing + 2-Opt dalam 8 menit: SA menjelajah luas, 2-Opt merapikan kusutnya.',
      'Coba sendiri! Klik task di rak VM2 yang kepanasan lalu pindahkan ke VM lain supaya waktu selesai terakhir (Makespan) sekecil mungkin.',
      'Di eksperimen CloudSim kita kemarin, SA murni sudah unggul di GoCJ, tetapi masih timpang di 1000 task dan tidak stabil di NASA. Di sinilah SA butuh partner.',
    ],
  },
  {
    id: 'sa',
    number: '02',
    shortTitle: 'Dasar SA',
    title: 'Simulated Annealing: panas untuk nekat, dingin untuk kunci.',
    minutes: '1,5 mnt',
    beats: [
      'SA meniru pendinginan logam. Saat suhu masih panas, SA berani mencoba langkah yang sementara lebih buruk agar tidak terjebak di solusi tanggung (local optimum).',
      'Geser slider Suhu T dan kenaikan beban ΔE, lalu lempar dadu r. Lihat bagaimana peluang menerima langkah mundur mengecil saat suhu makin dingin.',
    ],
  },
  {
    id: 'two-opt',
    number: '03',
    shortTitle: '2-Opt & Kuis 1',
    title: '2-Opt: luruskan jalur bersilangan, ratakan beban VM.',
    minutes: '1,5 mnt',
    beats: [
      '2-Opt (Croes, 1958) sangat sederhana: cari dua jalur yang bersilangan membentuk X, lalu lepas dan sambung ulang agar tidak bersilangan. Klik jalur silangnya!',
      'Di Cloud Scheduling, logika yang sama dipakai untuk menukar pasangan task dari VM bottleneck (Pairwise Swap) atau membalik urutan antrean task (Permutasi + Decoder).',
      'Cek pemahaman cepat 1/2 sebelum kita gabungkan SA dan 2-Opt.',
    ],
  },
  {
    id: 'hybrid-race',
    number: '04',
    shortTitle: 'Hybrid Beraksi',
    title: 'Hybrid SA + 2-Opt: eksplorasi global + polesan presisi.',
    minutes: '2,0 mnt',
    beats: [
      'Merujuk Gunawan & Iryanto (2023), 2-Opt disisipkan langsung di dalam inner loop SA (pola Low-level Relay / LRH): SA membuka wilayah baru, 2-Opt langsung merapikannya.',
      'Tonton langsung perbedaannya! SA Murni dan Hybrid SA + 2-Opt dijalankan pada beban, seed, dan anggaran evaluasi yang persis sama.',
    ],
  },
  {
    id: 'perbandingan',
    number: '05',
    shortTitle: 'Banding & Kuis 2',
    title: 'Perbandingan adil dengan metode sebelumnya.',
    minutes: '1,5 mnt',
    beats: [
      'Bandingkan Hybrid SA + 2-Opt dengan SA Murni, Sufferage, dan JAYA. Data baseline diambil dari hasil CloudSim Kelompok 4, dan hasil hybrid tim siap dimuat lewat JSON.',
      'Cek pemahaman cepat 2/2, rekap skor, dan referensi. Setelah ini, buka Sandbox Q&A untuk otak-atik bebas!',
    ],
  },
];

export const QUIZZES: Record<'q1' | 'q2', QuizQuestion> = {
  q1: {
    id: 'q1',
    badge: 'KUIS CEPAT 1 / 2',
    question:
      'Mengapa 2-Opt saja tidak cukup kuat tanpa Simulated Annealing (SA) pada masalah penjadwalan cloud yang besar?',
    options: [
      {
        key: 'A',
        label: 'Karena 2-Opt hanya mau menerima langkah yang lebih baik sehingga mudah terjebak di local optimum',
        correct: true,
        feedback:
          'Tepat! 2-Opt bersifat greedy lokal: cepat merapikan sekitar solusi, tetapi butuh SA agar bisa melompat keluar dari jebakan lokal.',
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
        label: 'Karena 2-Opt selalu membutuhkan populasi 100 kandidat sekaligus',
        correct: false,
        feedback:
          'Justru sebaliknya: baik SA maupun 2-Opt bekerja pada solusi tunggal (single-solution), bukan berbasis populasi besar.',
      },
      {
        key: 'D',
        label: 'Karena 2-Opt selalu lebih lambat daripada Round Robin dalam semua kasus',
        correct: false,
        feedback:
          'Round Robin memang instan karena tanpa optimasi, tetapi alasan utama menggabungkan SA + 2-Opt adalah meloloskan diri dari local optimum.',
      },
    ],
  },
  q2: {
    id: 'q2',
    badge: 'KUIS CEPAT 2 / 2',
    question:
      'Agar perbandingan Hybrid SA + 2-Opt melawan SA Murni dianggap adil secara ilmiah, apa yang wajib disamakan?',
    options: [
      {
        key: 'A',
        label: 'Cukup pakai 1 random seed yang hasilnya paling bagus untuk Hybrid',
        correct: false,
        feedback:
          'Memilih 1 seed beruntung (cherry-picking) tidak adil. Algoritma stokastik wajib diuji minimal 10 seed lalu dilaporkan mean ± std.',
      },
      {
        key: 'B',
        label: 'Anggaran fitness evaluation yang setara, dataset sama, uji multi-run, dan catat overhead waktu',
        correct: true,
        feedback:
          'Benar sekali! 2-Opt menambah evaluasi di dalam tiap iterasi SA, jadi budget evaluasi harus dihitung jujur bersama waktu eksekusi scheduler.',
      },
      {
        key: 'C',
        label: 'Cukup menyamakan jumlah iterasi luar tanpa menghitung evaluasi di dalam 2-Opt',
        correct: false,
        feedback:
          'Menyamakan iterasi saja menipu karena 1 iterasi SA + 2-Opt bisa melakukan jauh lebih banyak evaluasi daripada 1 iterasi SA murni.',
      },
      {
        key: 'D',
        label: 'Dataset untuk Hybrid boleh dibuat lebih kecil supaya cepat selesai',
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
    'Setiap state baru di dalam inner loop SA langsung dipoles oleh 2-Opt sebelum diuji dengan kriteria Metropolis. Hasil di paper: 1,2x hingga 5,7x lebih cepat dan lebih stabil dibanding SA murni.',
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

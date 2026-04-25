export const COPY = {
  loading: {
    slip: "Memvalidasi slip gaji kamu... ⚡",
    gaji: "Mencari data benchmark gaji...",
    tanah: "Mengecek harga properti...",
    kabur: "Menghitung PPP dan perbandingan...",
    hidup: "Menghitung biaya hidup...",
    default: "Memuat...",
  },

  errors: {
    city_not_found:
      "Kota ini belum ada di database kami. Coba kota terdekat, atau pilih dari daftar.",
    network_error:
      "Koneksi gagal. Periksa internetmu dan coba lagi.",
    calculation_failed:
      "Perhitungan gagal. Coba lagi atau isi form manual.",
    ocr_failed:
      "Gagal membaca slip gaji. Coba foto ulang dengan cahaya lebih baik.",
    form_invalid: "Mohon isi semua field yang wajib.",
    salary_benchmark_unavailable:
      "Data benchmark belum tersedia untuk posisi dan lokasi ini. Jadilah yang pertama berkontribusi!",
  },

  verdict: {
    slip_sesuai:
      "Slip Gaji Kamu SESUAI ✓ — Semua komponen PPh21 dan BPJS sudah benar. HRD-mu taat regulasi bulan ini.",
    slip_pelanggaran:
      "Ditemukan {count} pelanggaran di slip gaji kamu. Perusahaan mungkin memotong lebih atau kurang dari yang seharusnya.",
    slip_v06_critical:
      "PERINGATAN KRITIS: Gaji pokok kamu di bawah UMK/UMR kota kamu. Ini adalah pelanggaran hukum yang serius dan harus ditindaklanjuti segera.",
    gaji_dibawah:
      "Gajimu di bawah median pasar. Apakah sudah sesuai dengan pengalaman dan skill kamu?",
    gaji_wajar:
      "Gajimu sesuai dengan market rate untuk posisi dan pengalamanmu.",
    gaji_diatas:
      "Gajimu di atas median pasar. Bagus! Pertimbangkan negosiasi untuk kenaikan berikutnya.",
    tanah_murah: "Harga ini di bawah harga pasar untuk area tersebut.",
    tanah_wajar: "Harga ini sesuai dengan harga pasar.",
    tanah_mahal: "Harga ini di atas harga pasar. Pertimbangkan negosiasi.",
    tanah_sangat_mahal: "Harga ini signifikan di atas harga pasar.",
  },

  violations: {
    v01_title: "PPh21 Tidak Dipotong",
    v01_desc:
      "PPh21 bulan ini tidak dipotong dari gajimu. Yang bertanggung jawab adalah perusahaan — kamu yangugikan di akhir tahun.",
    v02_title: "PPh21 Salah Hitung",
    v02_desc:
      "PPh21 dihitung tidak sesuai tarif efektif (TER) PMK 168/2023. Mungkin kamu kelebihan atau kurang bayar.",
    v03_title: "BPJS JHT Tidak Disetor",
    v03_desc:
      "Iuran JHT 2% dari gajimu tidak disetorkan ke BPJS Ketenagakerjaan. Tabungan pensiunmu berkurang.",
    v04_title: "BPJS JP Salah Hitung",
    v04_desc:
      "Iuran JP (Jaminan Pensiun) dihitung tidak sesuai batas gaji resmi BPJS. Kontribusi pensiunmu tidak lengkap.",
    v05_title: "BPJS Kesehatan Tidak Sesuai",
    v05_desc:
      "Iuran BPJS Kesehatan tidak sesuai dengan nominal resmi. Mungkin ada selisih yang tidak disetorkan.",
    v06_title: "Gaji di Bawah UMK/UMR",
    v06_desc:
      "Gaji pokokmu di bawah UMK/UMR kota kamu. Ini adalah pelanggaran hukum yang serius dan harus ditindaklanjuti segera.",
    v07_title: "Total Potongan Berlebihan",
    v07_desc:
      "Total potongan lebih besar dari yang diperbolehkan oleh regulasi. Perusahaan mungkin memotong lebih.",
    generic_violation: "Pelanggaran terdeteksi",
    generic_violation_desc:
      "Temukan detail pelanggaran di bawah dan segera tindak lanjuti dengan HRD perusahaan.",
  },

  cta: {
    cek_sekarang: "Cek Sekarang",
    cek_slip: "Cek Slip Gaji Sekarang",
    lihat_benchmark: "Lihat Benchmark Gaji",
    cek_properti: "Cek Harga Properti",
    bandingkan_ppp: "Bandingkan PPP",
    hitung_hidup: "Hitung Biaya Hidup",
    upgrade_basic: "Upgrade ke Basic — Rp 29K/bulan",
    upgrade_pro: "Upgrade ke Pro — Rp 79K/bulan",
    mulai_gratis: "Mulai Gratis",
    coba_sekarang: "Coba Sekarang",
    selengkapnya: "Selengkapnya",
    kembali: "Kembali",
  },

  empty_states: {
    no_history: "Belum ada audit yang dilakukan.",
    no_history_desc:
      "Mulai dengan cek slip gaji kamu — hanya butuh 30 detik.",
    no_benchmark: "Data benchmark belum tersedia untuk posisi ini.",
    no_benchmark_desc:
      "Jadilah yang pertama berkontribusi data gaji untuk kota dan posisi ini.",
    no_results: "Tidak ada hasil ditemukan.",
    no_results_desc: "Coba ubah kriteria pencarian atau coba lagi nanti.",
    loading: "Memuat...",
  },

  form: {
    gapok_label: "Gaji Pokok (Rp)",
    gapok_placeholder: "7.500.000",
    tunjangan_label: "Total Tunjangan (Rp)",
    tunjangan_placeholder: "2.500.000",
    bulan_label: "Bulan",
    tahun_label: "Tahun",
    kota_label: "Kota/Kabupaten",
    ptkp_label: "Status PTKP",
    npwp_label: "Punya NPWP",
    city_placeholder: "Ketik nama kota...",
    submit_label: "Periksa Sekarang",
    optional_label: "(opsional)",
    required_label: "(wajib)",
  },

  disclaimer:
    "Hasil audit berdasarkan regulasi PMK 168/2023. Untuk kepastian hukum, konsultasikan dengan konsultan pajak bersertifikat.",

  upgrade_copy: {
    basic_headline: "Buka Semua Detail",
    basic_subheadline:
      "Lihat selisih IDR per komponen (PPh21, JHT, JP, BPJS) dan dapatkan rekomendasi tindak lanjut.",
    pro_headline: "Full Access untuk Profesional",
    pro_subheadline:
      "Export PDF laporan audit, benchmark gaji unlimited, dan akses API untuk integrasi HRD.",
    gate_salary_label: "Median Gaji (P25/P75)",
    gate_salary_blurred: "Rp ???.??? - Rp ???.???",
    gate_trend_label: "Tren Gaji 3 Tahun",
    gate_trend_blurred: "+??%",
    upgrade_cta_basic: "Buka dengan Basic — Rp 29K/bulan",
    upgrade_cta_pro: "Buka dengan Pro — Rp 79K/bulan",
    free_cta: "Cek Gratisan Dulu",
  },

  pricing: {
    free_plan: "Free",
    free_price: "Rp 0",
    free_period: "selamanya",
    free_desc: "Cukup untuk pengecekan pertama.",
    basic_plan: "Basic",
    basic_price: "Rp 29K",
    basic_period: "per bulan",
    basic_desc: "Untuk pekerja yang ingin cek secara rutin.",
    pro_plan: "Pro",
    pro_price: "Rp 79K",
    pro_period: "per bulan",
    pro_desc: "Full access untuk HR dan individu yang serius.",
    monthly: "/bulan",
    popular_badge: "PALING POPULER",
    biaya_ter_reveal: "Kurang dari 1 kopi per hari. Batal kapan saja.",
  },
} as const;

export type COPY_KEYS = typeof COPY;

export const UPGRADE_COPY = {
  priceLabel: "Rp 29K/bulan",
  priceLabelPro: "Rp 79K/bulan",
  valueFrame: "Kurang dari 1 kopi per hari",
  roiFrame: "Jika selisih PPh21 Rp 50K/bulan → BEP 2 minggu",
  ctaPrimary: "Upgrade Paket Basic",
  ctaSecondary: "Lihat paket lengkap →",
  cancelAnytime: "Bisa dibatalkan kapan saja",
  trialNote: "Tidak ada kontrak, tidak ada biaya tersembunyi",
} as const;

export const PREMIUMGATE_HIDDEN_LABELS = {
  pph21: {
    label: "Selisih PPh21 kamu tersembunyi",
    benefit:
      "Lihat persis berapa PPh21 yang kurang dipotong bulan ini dan akumulasinya per tahun",
  },
  umk: {
    label: "Selisih UMK tersembunyi",
    benefit:
      "Lihat berapa persen gajimu di bawah UMK dan berapa yang seharusnya kamu terima",
  },
  bpjs: {
    label: "Detail potongan BPJS tersembunyi",
    benefit:
      "Lihat komponen BPJS mana yang salah dan berapa totalnya selama setahun",
  },
  annual_gross: {
    label: "Gaji bruto setahun tersembunyi",
    benefit: "Lihat akumulasi gaji bruto per tahun untuk kalkulasi pajak lengkap",
  },
  ppk: {
    label: "PKP kamu tersembunyi",
    benefit: "Lihat Penghasilan Kena Pajak kamu yang sebenarnya",
  },
} as const;

export const SAMPLE_RESULT = {
  pph21AtSlip: 0,
  pph21ShouldBe: 185000,
  monthlyDiff: 185000,
  annualAccumulation: 2220000,
  violationCode: "V02",
  violationMessage: "PPh21 Tidak Dipotong",
  recommendation:
    "Tunjukkan hasil ini ke HRD dan minta koreksi di slip bulan berikutnya.",
} as const;

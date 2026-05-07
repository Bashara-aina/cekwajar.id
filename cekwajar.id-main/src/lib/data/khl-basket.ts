// lib/data/khl-basket.ts
// KHL (Kebutuhan Hidup Layak) basket — 64 items per Permenaker 18/2022
// Baseline reference: Jakarta, 1 person, single household

export interface KhlItem {
  id: string
  name: string
  category: KhlCategory
  unit: string
  /** Monthly quantity per person */
  monthlyQty: number
  /** Jakarta baseline price per unit (IDR) */
  jakartaPrice: number
}

export type KhlCategory =
  | 'food'
  | 'clothing'
  | 'housing'
  | 'education'
  | 'health'
  | 'transportation'
  | 'recreation'

export const KHL_CATEGORIES: Record<KhlCategory, string> = {
  food: 'Makanan & Minuman',
  clothing: 'Pakaian & Perhiasan',
  housing: 'Perumahan & Fasilitas Rumah',
  education: 'Pendidikan',
  health: 'Kesehatan',
  transportation: 'Transportasi',
  recreation: 'Rekreasi & Lainnya',
}

export const KHL_ITEMS: KhlItem[] = [
  // ── Food (11 items) ────────────────────────────────────────────────────
  { id: 'F01', name: 'Beras',          category: 'food',          unit: 'kg',       monthlyQty: 9.0,   jakartaPrice: 15_000 },
  { id: 'F02', name: 'Ayam Ras',        category: 'food',          unit: 'kg',       monthlyQty: 1.2,   jakartaPrice: 35_000 },
  { id: 'F03', name: 'Telur Ayam',      category: 'food',          unit: 'kg',       monthlyQty: 1.5,   jakartaPrice: 28_000 },
  { id: 'F04', name: 'Susu Sapi',      category: 'food',          unit: 'liter',    monthlyQty: 2.0,   jakartaPrice: 18_000 },
  { id: 'F05', name: 'Tahu',           category: 'food',          unit: 'kg',       monthlyQty: 2.5,   jakartaPrice: 12_000 },
  { id: 'F06', name: 'Tempe',          category: 'food',          unit: 'kg',       monthlyQty: 2.0,   jakartaPrice: 10_000 },
  { id: 'F07', name: 'Sayuran',         category: 'food',          unit: 'kg',       monthlyQty: 6.0,   jakartaPrice: 10_000 },
  { id: 'F08', name: 'Buah-buahan',    category: 'food',          unit: 'kg',       monthlyQty: 2.0,   jakartaPrice: 18_000 },
  { id: 'F09', name: 'Mie Instan',     category: 'food',          unit: 'bungkus',  monthlyQty: 8.0,   jakartaPrice:  3_500 },
  { id: 'F10', name: 'Garam',          category: 'food',          unit: 'kg',       monthlyQty: 0.5,   jakartaPrice:  8_000 },
  { id: 'F11', name: 'Gula Pasir',     category: 'food',          unit: 'kg',       monthlyQty: 1.5,   jakartaPrice: 14_000 },

  // ── Clothing (13 items) ──────────────────────────────────────────────────
  { id: 'C01', name: 'Baju Jiraai',    category: 'clothing',      unit: 'stel',     monthlyQty: 0.08,  jakartaPrice: 250_000 },
  { id: 'C02', name: 'Baju Sial',      category: 'clothing',      unit: 'stel',     monthlyQty: 0.08,  jakartaPrice: 200_000 },
  { id: 'C03', name: 'Baju Olahrag',   category: 'clothing',      unit: 'stel',     monthlyQty: 0.04,  jakartaPrice: 180_000 },
  { id: 'C04', name: 'Jaket',          category: 'clothing',      unit: 'buah',     monthlyQty: 0.04,  jakartaPrice: 350_000 },
  { id: 'C05', name: 'Sepatu Kerja',    category: 'clothing',      unit: 'pasang',   monthlyQty: 0.04,  jakartaPrice: 300_000 },
  { id: 'C06', name: 'Sepatu Olahrag',  category: 'clothing',      unit: 'pasang',   monthlyQty: 0.04,  jakartaPrice: 200_000 },
  { id: 'C07', name: 'Sandal',         category: 'clothing',      unit: 'pasang',   monthlyQty: 0.08,  jakartaPrice:  75_000 },
  { id: 'C08', name: 'Daster',         category: 'clothing',      unit: 'stel',     monthlyQty: 0.08,  jakartaPrice: 120_000 },
  { id: 'C09', name: 'Kaus Dalam',     category: 'clothing',      unit: 'buah',     monthlyQty: 0.25,  jakartaPrice:  40_000 },
  { id: 'C10', name: 'BH / Baju Dlm',  category: 'clothing',      unit: 'buah',     monthlyQty: 0.1,   jakartaPrice:  80_000 },
  { id: 'C11', name: 'Celana Dalam',    category: 'clothing',      unit: 'buah',     monthlyQty: 0.25,  jakartaPrice:  35_000 },
  { id: 'C12', name: 'Sockoh',         category: 'clothing',      unit: 'pasang',   monthlyQty: 0.1,   jakartaPrice:  30_000 },
  { id: 'C13', name: 'Tali Kepala',     category: 'clothing',      unit: 'buah',     monthlyQty: 0.04,  jakartaPrice:  25_000 },

  // ── Housing (7 items) ──────────────────────────────────────────────────
  { id: 'H01', name: 'Biaya Sewa',      category: 'housing',       unit: 'bulan',    monthlyQty: 1.0,   jakartaPrice: 1_500_000 },
  { id: 'H02', name: 'Listrik',        category: 'housing',       unit: 'kWh',      monthlyQty: 80.0,  jakartaPrice:  1_500 },
  { id: 'H03', name: 'Air (PAM)',       category: 'housing',       unit: 'm3',       monthlyQty: 10.0,  jakartaPrice:  3_000 },
  { id: 'H04', name: 'Gas LPG 3kg',     category: 'housing',       unit: 'tabung',   monthlyQty: 0.5,   jakartaPrice:  25_000 },
  { id: 'H05', name: 'Sabun Mandi',     category: 'housing',       unit: 'buah',     monthlyQty: 2.0,   jakartaPrice:  12_000 },
  { id: 'H06', name: 'Sabun Cuci',      category: 'housing',       unit: 'kg',       monthlyQty: 0.5,   jakartaPrice:  15_000 },
  { id: 'H07', name: 'Peralatan Dapur', category: 'housing',       unit: 'bulan',    monthlyQty: 1.0,   jakartaPrice:  80_000 },

  // ── Education (10 items) ───────────────────────────────────────────────
  { id: 'E01', name: 'Buku Tulis',       category: 'education',     unit: 'buah',     monthlyQty: 2.0,   jakartaPrice:  8_000 },
  { id: 'E02', name: 'Pensil',          category: 'education',     unit: 'buah',     monthlyQty: 1.0,   jakartaPrice:  3_000 },
  { id: 'E03', name: 'Bolpoint',        category: 'education',     unit: 'buah',     monthlyQty: 1.0,   jakartaPrice:  5_000 },
  { id: 'E04', name: 'Penghapus',       category: 'education',     unit: 'buah',     monthlyQty: 0.5,   jakartaPrice:  3_000 },
  { id: 'E05', name: 'Penggaris',       category: 'education',     unit: 'buah',     monthlyQty: 0.5,   jakartaPrice:  3_000 },
  { id: 'E06', name: 'Buku Anak',       category: 'education',     unit: 'buah',     monthlyQty: 0.5,   jakartaPrice: 50_000 },
  { id: 'E07', name: 'Kursus / Bimbel', category: 'education',     unit: 'bulan',    monthlyQty: 1.0,   jakartaPrice: 300_000 },
  { id: 'E08', name: 'Seragam Sekolah',  category: 'education',     unit: 'stel',     monthlyQty: 0.04,  jakartaPrice: 250_000 },
  { id: 'E09', name: 'Tas Sekolah',     category: 'education',     unit: 'buah',     monthlyQty: 0.04,  jakartaPrice: 200_000 },
  { id: 'E10', name: 'Sandal Sekolah',   category: 'education',     unit: 'pasang',   monthlyQty: 0.08,  jakartaPrice:  80_000 },

  // ── Health (6 items) ────────────────────────────────────────────────────
  { id: 'K01', name: 'Obat感冒',         category: 'health',        unit: 'bulan',    monthlyQty: 1.0,   jakartaPrice: 50_000 },
  { id: 'K02', name: 'Paracetamol',       category: 'health',        unit: 'strip',   monthlyQty: 0.5,   jakartaPrice: 15_000 },
  { id: 'K03', name: 'Vitamin',          category: 'health',        unit: 'botol',   monthlyQty: 0.25,  jakartaPrice: 80_000 },
  { id: 'K04', name: 'Minyak Angin',     category: 'health',        unit: 'botol',   monthlyQty: 0.25,  jakartaPrice: 25_000 },
  { id: 'K05', name: 'Pembalut',         category: 'health',        unit: 'paket',   monthlyQty: 0.5,   jakartaPrice: 40_000 },
  { id: 'K06', name: 'Ke RS / Dokter',   category: 'health',        unit: 'kali',    monthlyQty: 0.1,   jakartaPrice: 150_000 },

  // ── Transportation (8 items) ────────────────────────────────────────────
  { id: 'T01', name: 'Bensin',          category: 'transportation', unit: 'liter',   monthlyQty: 12.0,  jakartaPrice: 13_000 },
  { id: 'T02', name: 'Ojol / Ojek',     category: 'transportation', unit: 'kali',    monthlyQty: 4.0,   jakartaPrice: 25_000 },
  { id: 'T03', name: 'Angkutan Umum',   category: 'transportation', unit: 'kali',    monthlyQty: 20.0,  jakartaPrice:  5_000 },
  { id: 'T04', name: 'Parkir',          category: 'transportation', unit: 'bulan',   monthlyQty: 1.0,   jakartaPrice: 150_000 },
  { id: 'T05', name: 'BBM Motor',        category: 'transportation', unit: 'liter',   monthlyQty: 8.0,   jakartaPrice: 13_000 },
  { id: 'T06', name: 'Servis Motor',     category: 'transportation', unit: 'bulan',   monthlyQty: 1.0,   jakartaPrice: 150_000 },
  { id: 'T07', name: 'Tol',            category: 'transportation', unit: 'bulan',   monthlyQty: 1.0,   jakartaPrice: 200_000 },
  { id: 'T08', name: 'Kuota Internet',  category: 'transportation', unit: 'bulan',   monthlyQty: 1.0,   jakartaPrice: 100_000 },

  // ── Recreation (9 items) ────────────────────────────────────────────────
  { id: 'R01', name: 'Pulsa / Internet',  category: 'recreation',   unit: 'bulan',   monthlyQty: 1.0,   jakartaPrice: 100_000 },
  { id: 'R02', name: 'TV Kabel',         category: 'recreation',   unit: 'bulan',   monthlyQty: 1.0,   jakartaPrice: 200_000 },
  { id: 'R03', name: 'Bioskop',           category: 'recreation',   unit: 'kali',   monthlyQty: 0.25,  jakartaPrice: 80_000 },
  { id: 'R04', name: 'Rokok',             category: 'recreation',   unit: 'bungkus', monthlyQty: 10.0,  jakartaPrice: 30_000 },
  { id: 'R05', name: 'Khitanan / Pesta', category: 'recreation',   unit: 'bulan',   monthlyQty: 0.02,  jakartaPrice: 500_000 },
  { id: 'R06', name: 'Barang Reparas',    category: 'recreation',   unit: 'bulan', monthlyQty: 1.0,   jakartaPrice: 100_000 },
  { id: 'R07', name: 'Haircut',           category: 'recreation',   unit: 'kali',   monthlyQty: 1.0,   jakartaPrice: 50_000 },
  { id: 'R08', name: 'Iuran Rt/Rw',       category: 'recreation',   unit: 'bulan', monthlyQty: 1.0,   jakartaPrice: 30_000 },
  { id: 'R09', name: 'Zakat / Sedekah',   category: 'recreation',   unit: 'bulan', monthlyQty: 1.0,   jakartaPrice: 100_000 },
]

/** Total item count */
export const KHL_ITEM_COUNT = KHL_ITEMS.length // 64

/** Total per capita monthly KHL for Jakarta baseline (1 person) */
export function getJakartaMonthlyKhl(): number {
  return KHL_ITEMS.reduce((sum, item) => sum + item.monthlyQty * item.jakartaPrice, 0)
}

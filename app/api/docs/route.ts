import { NextResponse } from "next/server";

/**
 * OpenAPI 3.0 JSON Spec - cekwajar.id API Documentation
 *
 * Dieses Dokument beschreibt alle API-Endpunkte der cekwajar.id Anwendung.
 * Format: OpenAPI 3.0.3 / Swagger 2.0 compatible
 */
const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "cekwajar.id API",
    description:
      "API untuk menghitung gaji bersih, PPh 21, BPJS, harga properti, dan perbandingan biaya hidup antar kota di Indonesia",
    version: "1.0.0",
    contact: {
      name: "cekwajar.id Support",
      url: "https://cekwajar.id",
    },
  },
  servers: [
    {
      url: "https://cekwajar.id",
      description: "Produksi",
    },
    {
      url: "https://dev.cekwajar.id",
      description: "Development",
    },
  ],
  paths: {
    "/api/pph21": {
      post: {
        tags: ["PPh 21"],
        summary: "Hitung PPh 21 dan gaji bersih",
        description:
          "Menghitung pajak PPh 21 berdasarkan slip gaji yang dimasukkan. Mendukung PTKP 2024.",
        operationId: "calculatePPh21",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PPh21Input",
              },
              example: {
                gross_monthly: 15000000,
                ptkp_status: "K1",
                city: "Jakarta",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Perhitungan berhasil",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PPh21Output",
                },
                example: {
                  net_monthly: 11850000,
                  pph21_monthly: 1150000,
                  bpjs_monthly: 450000,
                  total_deduction: 3150000,
                  brutto: 15000000,
                },
              },
            },
          },
          "400": {
            description: "Input tidak valid",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "429": {
            description: "Terlalu banyak permintaan",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RateLimitError",
                },
              },
            },
          },
        },
      },
    },
    "/api/bpjs": {
      post: {
        tags: ["BPJS"],
        summary: "Hitung kontribusi BPJS",
        description:
          "Menghitung kontribusi BPJS Kesehatan dan Ketenagakerjaan berdasarkan gaji bruto.",
        operationId: "calculateBPJS",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BPJSInput",
              },
              example: {
                gross_monthly: 15000000,
                city: "Jakarta",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Perhitungan berhasil",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BPJSOutput",
                },
                example: {
                  bpjs_ketenagakerjaan: 150000,
                  bpjs_kesehatan: 150000,
                  total: 300000,
                },
              },
            },
          },
          "400": {
            description: "Input tidak valid",
          },
        },
      },
    },
    "/api/property": {
      post: {
        tags: ["Properti"],
        summary: "Bandingkan harga properti",
        description:
          "Membandingkan harga properti yang dimasukkan dengan harga pasar di database kami.",
        operationId: "comparePropertyPrice",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PropertyInput",
              },
              example: {
                city: "Jakarta Selatan",
                property_type: "rumah",
                price: 2500000000,
                area_m2: 100,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Perbandingan berhasil",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PropertyOutput",
                },
                example: {
                  price_per_m2: 25000000,
                  market_price_per_m2: 28000000,
                  ratio: -10.71,
                  verdict: "MURAH",
                  verdict_code: "PROPERTY_MURAH",
                  sample_count: 85,
                },
              },
            },
          },
          "400": {
            description: "Input tidak valid",
          },
        },
      },
    },
    "/api/salary-benchmark": {
      post: {
        tags: ["Gaji"],
        summary: "Cari benchmark gaji",
        description:
          "Mencari benchmark gaji berdasarkan judul pekerjaan, kota, dan tahun pengalaman. Minimum 10 sampel.",
        operationId: "getSalaryBenchmark",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SalaryBenchmarkInput",
              },
              example: {
                job_title: "Software Engineer",
                city: "Jakarta",
                experience_years: 3,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Benchmark ditemukan",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SalaryBenchmarkOutput",
                },
                example: {
                  benchmark: {
                    job_title: "Software Engineer",
                    city: "Jakarta",
                    p50_idr: 12000000,
                    p75_idr: 18000000,
                    p90_idr: 25000000,
                    sample_count: 50,
                  },
                  message: "Benchmark data dari 50 salary records",
                },
              },
            },
          },
          "404": {
            description: "Benchmark tidak tersedia",
          },
        },
      },
    },
    "/api/worldbank": {
      get: {
        tags: ["World Bank"],
        summary: "Bandingkan data World Bank antar kota",
        description:
          "Mendapatkan indikator ekonomi (GDP, cost of living, dll) dari World Bank untuk membandingkan antar kota.",
        operationId: "getWorldBankIndicators",
        parameters: [
          {
            name: "current_city",
            in: "query",
            description: "Kota saat ini",
            required: false,
            schema: {
              type: "string",
              default: "jakarta",
              enum: [
                "jakarta",
                "surabaya",
                "bandung",
                "tangerang",
                "bekasi",
                "bali",
                "jogja",
                "singapore",
                "kuala_lumpur",
                "bangkok",
                "tokyo",
                "hong_kong",
              ],
            },
          },
          {
            name: "target_city",
            in: "query",
            description: "Kota target",
            required: false,
            schema: {
              type: "string",
              default: "singapore",
              enum: [
                "jakarta",
                "surabaya",
                "bandung",
                "tangerang",
                "bekasi",
                "bali",
                "jogja",
                "singapore",
                "kuala_lumpur",
                "bangkok",
                "tokyo",
                "hong_kong",
              ],
            },
          },
        ],
        responses: {
          "200": {
            description: "Data World Bank berhasil diambil",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WorldBankOutput",
                },
              },
            },
          },
        },
      },
    },
    "/api/midtrans/webhook": {
      post: {
        tags: ["Payment"],
        summary: "Midtrans Payment Webhook",
        description:
          "Endpoint untuk menerima notifikasi pembayaran dari Midtrans. Memproses settlement, capture, pending, expire, dan cancel.",
        operationId: "midtransWebhook",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MidtransNotification",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Notifikasi diterima",
          },
          "401": {
            description: "Signature tidak valid",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      PPh21Input: {
        type: "object",
        required: ["gross_monthly", "ptkp_status", "city"],
        properties: {
          gross_monthly: {
            type: "integer",
            description: "Gaji bruto per bulan dalam IDR",
            minimum: 1000000,
            maximum: 1000000000,
          },
          ptkp_status: {
            type: "string",
            enum: ["TK0", "K0", "K1", "K2", "K3"],
            description: "Status PTKP",
          },
          city: {
            type: "string",
            description: "Kota domisili",
          },
        },
      },
      PPh21Output: {
        type: "object",
        properties: {
          net_monthly: {
            type: "integer",
            description: "Gaji bersih per bulan",
          },
          pph21_monthly: {
            type: "integer",
            description: "PPh 21 per bulan",
          },
          bpjs_monthly: {
            type: "integer",
            description: "BPJS per bulan",
          },
          total_deduction: {
            type: "integer",
            description: "Total potongan",
          },
          brutto: {
            type: "integer",
            description: "Gaji bruto",
          },
        },
      },
      BPJSInput: {
        type: "object",
        required: ["gross_monthly", "city"],
        properties: {
          gross_monthly: {
            type: "integer",
            description: "Gaji bruto per bulan dalam IDR",
          },
          city: {
            type: "string",
            description: "Kota",
          },
        },
      },
      BPJSOutput: {
        type: "object",
        properties: {
          bpjs_ketenagakerjaan: {
            type: "integer",
            description: "Iuran BPJS Ketenagakerjaan",
          },
          bpjs_kesehatan: {
            type: "integer",
            description: "Iuran BPJS Kesehatan",
          },
          total: {
            type: "integer",
            description: "Total iuran",
          },
        },
      },
      PropertyInput: {
        type: "object",
        required: ["city", "property_type", "price", "area_m2"],
        properties: {
          city: {
            type: "string",
            description: "Kota lokasi properti",
          },
          property_type: {
            type: "string",
            enum: ["rumah", "tanah", "apartemen", "ruko"],
            description: "Tipe properti",
          },
          price: {
            type: "integer",
            description: "Harga properti dalam IDR",
          },
          area_m2: {
            type: "number",
            description: "Luas tanah/bangunan dalam m²",
          },
        },
      },
      PropertyOutput: {
        type: "object",
        properties: {
          price_per_m2: {
            type: "integer",
            description: "Harga per m² yang dimasukkan",
          },
          market_price_per_m2: {
            type: "integer",
            nullable: true,
            description: "Harga pasar per m²",
          },
          ratio: {
            type: "number",
            nullable: true,
            description: "Deviasi dari harga pasar (%)",
          },
          verdict: {
            type: "string",
            enum: ["MURAH", "WAJAR", "MAHAMAL", "TIDAK_TERSEDIA"],
            description: "Verdict harga",
          },
          verdict_code: {
            type: "string",
            description: "Kode verdict",
          },
          sample_count: {
            type: "integer",
            description: "Jumlah sampel",
          },
        },
      },
      SalaryBenchmarkInput: {
        type: "object",
        required: ["job_title", "city"],
        properties: {
          job_title: {
            type: "string",
            description: "Judul pekerjaan",
          },
          city: {
            type: "string",
            description: "Kota",
          },
          experience_years: {
            type: "integer",
            description: "Tahun pengalaman",
          },
        },
      },
      SalaryBenchmarkOutput: {
        type: "object",
        properties: {
          benchmark: {
            type: "object",
            nullable: true,
            properties: {
              job_title: { type: "string" },
              city: { type: "string" },
              p50_idr: { type: "integer", description: "Median salary" },
              p75_idr: { type: "integer", description: "75th percentile" },
              p90_idr: { type: "integer", description: "90th percentile" },
              sample_count: { type: "integer" },
            },
          },
          message: {
            type: "string",
            description: "Pesan informatif",
          },
        },
      },
      WorldBankOutput: {
        type: "object",
        properties: {
          current_city: {
            type: "object",
            properties: {
              name: { type: "string" },
              city: { type: "string" },
              indicators: {
                type: "object",
                properties: {
                  gdp_ppp: { type: "number" },
                  gdp_per_capita: { type: "number" },
                  cost_of_living: { type: "number" },
                  purchasing_power: { type: "number" },
                },
              },
            },
          },
          target_city: {
            type: "object",
            properties: {
              name: { type: "string" },
              city: { type: "string" },
              indicators: {
                type: "object",
                properties: {
                  gdp_ppp: { type: "number" },
                  gdp_per_capita: { type: "number" },
                  cost_of_living: { type: "number" },
                  purchasing_power: { type: "number" },
                },
              },
            },
          },
        },
      },
      MidtransNotification: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "ID pesanan",
          },
          transaction_status: {
            type: "string",
            enum: ["settlement", "capture", "pending", "expire", "cancel"],
            description: "Status transaksi",
          },
          gross_amount: {
            type: "string",
            description: "Jumlah gross",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Pesan error",
          },
        },
      },
      RateLimitError: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Pesan error",
          },
          retryAfter: {
            type: "integer",
            description: "Detik sebelum mencoba lagi",
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

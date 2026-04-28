'use client'
import { useState } from 'react'
import { Home, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PROPERTY_TYPES = ['RUMAH', 'TANAH', 'APARTEMEN', 'RUKO']

export default function WajarTanahPage() {
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [propertyType, setPropertyType] = useState('RUMAH')
  const [landArea, setLandArea] = useState(0)
  const [askingPrice, setAskingPrice] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!province || !city || landArea <= 0 || askingPrice <= 0) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        province, city, propertyType,
        landAreaSqm: landArea.toString(),
        askingPriceTotal: askingPrice.toString(),
        ...(district && { district }),
      })

      const res = await fetch(`/api/property/benchmark?${params}`)
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Search failed' })
    } finally {
      setLoading(false)
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'MURAH': return 'bg-green-100 text-green-800'
      case 'WAJAR': return 'bg-blue-100 text-blue-800'
      case 'MAHAL': return 'bg-amber-100 text-amber-800'
      case 'SANGAT_MAHAL': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Wajar Tanah</h1>
          <p className="text-slate-500">Cek apakah harga properti wajar</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Provinsi</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Contoh: DKI Jakarta"
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kota/Kabupaten</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kecamatan (opsional)</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Contoh: Kebayoran Baru"
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Properti</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Luas Tanah (m²)</label>
                <input
                  type="number"
                  value={landArea || ''}
                  onChange={(e) => setLandArea(parseInt(e.target.value) || 0)}
                  placeholder="Contoh: 120"
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Harga Permintaan (IDR)</label>
                <input
                  type="number"
                  value={askingPrice || ''}
                  onChange={(e) => setAskingPrice(parseInt(e.target.value) || 0)}
                  placeholder="Contoh: 1500000000"
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                />
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full" disabled={loading}>
              {loading ? 'Menghitung...' : <>Cek Harga Wajar <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </CardContent>
        </Card>

        {result && !result.error && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={getVerdictColor(result.verdict)}>{result.verdict}</Badge>
                <span className="text-sm text-slate-500">{result.sampleCount} sample</span>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">IDR {(result.pricePerSqm / 1000000).toFixed(0)}M</p>
                <p className="text-sm text-slate-500">per m²</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="font-semibold">IDR {(result.p25 / 1000000).toFixed(0)}M</p>
                  <p className="text-slate-500">P25</p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-600">IDR {(result.p50 / 1000000).toFixed(0)}M</p>
                  <p className="text-slate-500">Median</p>
                </div>
                <div>
                  <p className="font-semibold">IDR {(result.p75 / 1000000).toFixed(0)}M</p>
                  <p className="text-slate-500">P75</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 text-center">*{result.disclaimer}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
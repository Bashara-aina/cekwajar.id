'use client'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const LIFESTYLE_TIERS = ['HEMAT', 'STANDAR', 'NYAMAN']

export default function WajarHidupPage() {
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [currentSalary, setCurrentSalary] = useState(0)
  const [lifestyleTier, setLifestyleTier] = useState('STANDAR')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (!fromCity || !toCity || currentSalary <= 0) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        fromCity, toCity,
        currentSalary: currentSalary.toString(),
        lifestyleTier,
      })

      const res = await fetch(`/api/col/compare?${params}`)
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Comparison failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Wajar Hidup</h1>
          <p className="text-slate-500">Bandingkan biaya hidup antar kota</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kota Asal</label>
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="Contoh: Jakarta"
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kota Tujuan</label>
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="Contoh: Bandung"
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gaji Saat Ini (IDR)</label>
              <input
                type="number"
                value={currentSalary || ''}
                onChange={(e) => setCurrentSalary(parseInt(e.target.value) || 0)}
                placeholder="Contoh: 10000000"
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gaya Hidup</label>
              <select
                value={lifestyleTier}
                onChange={(e) => setLifestyleTier(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                <option value="HEMAT">Hemat — essential spending only</option>
                <option value="STANDAR">Standar — average lifestyle</option>
                <option value="NYAMAN">Nyaman — comfortable, dining out</option>
              </select>
            </div>

            <Button onClick={handleCompare} className="w-full" disabled={loading}>
              {loading ? 'Menghitung...' : <>Bandingkan <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </CardContent>
        </Card>

        {result && !result.error && (
          <Card className="mt-6">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-500">Gaji yang dibutuhkan di {toCity}</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                IDR {(result.requiredSalary / 1000000).toFixed(1)}M
              </p>

              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className={`text-lg font-semibold ${result.verdict === 'LEBIH_MURAH' ? 'text-green-600' : result.verdict === 'LEBIH_MAHAL' ? 'text-red-600' : 'text-slate-600'}`}>
                  {result.verdict === 'LEBIH_MURAH' && `${toCity} lebih murah ${Math.abs(parseFloat(result.percentChange)).toFixed(1)}%`}
                  {result.verdict === 'LEBIH_MAHAL' && `${toCity} lebih mahal ${result.percentChange}%`}
                  {result.verdict === 'SAMA' && 'Biaya hidup setara'}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Index {fromCity}</p>
                  <p className="font-semibold">{result.fromIndex}</p>
                </div>
                <div>
                  <p className="text-slate-500">Index {toCity}</p>
                  <p className="font-semibold">{result.toIndex}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
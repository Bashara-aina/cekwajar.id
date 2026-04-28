'use client'
import { useState } from 'react'
import { ArrowRight, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const COUNTRIES = [
  { code: 'USA', name: 'United States', flag: '🇺🇸' },
  { code: 'SGP', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MYS', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'THA', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VNM', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵' },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
  { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧' },
]

export default function WajarKaburPage() {
  const [currentSalary, setCurrentSalary] = useState(0)
  const [targetCountry, setTargetCountry] = useState('USA')
  const [offerSalary, setOfferSalary] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (!currentSalary || !targetCountry) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        currentIDRSalary: currentSalary.toString(),
        targetCountry,
        ...(offerSalary > 0 && { offerSalary: offerSalary.toString() }),
        tier: 'free',
      })

      const res = await fetch(`/api/abroad/compare?${params}`)
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
          <h1 className="text-2xl font-bold text-slate-900">Wajar Kabur</h1>
          <p className="text-slate-500">Bandingkan kekuasaan beli internasional</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gaji IDR Saat Ini</label>
              <input
                type="number"
                value={currentSalary || ''}
                onChange={(e) => setCurrentSalary(parseInt(e.target.value) || 0)}
                placeholder="Contoh: 15000000"
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Negara Tujuan</label>
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Offer Salary (opsional)</label>
              <input
                type="number"
                value={offerSalary || ''}
                onChange={(e) => setOfferSalary(parseInt(e.target.value) || 0)}
                placeholder="Gaji yang ditawarkan di negara tujuan"
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>

            <Button onClick={handleCompare} className="w-full" disabled={loading}>
              {loading ? 'Menghitung...' : <>Bandingkan <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </CardContent>
        </Card>

        {result && !result.error && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold">Hasil Perbandingan</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Ekuivalen Nominal</span>
                  <span className="font-semibold">
                    {result.currencyCode} {(result.nominalEquivalent / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Rasio Daya Beli</span>
                  <span className={`font-semibold ${result.isPPPBetter ? 'text-green-600' : 'text-red-600'}`}>
                    {result.purchasingPowerRatio}x
                    {result.isPPPBetter ? ' ↑ Lebih baik' : ' ↓ Lebih buruk'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Exchange Rate</span>
                  <span className="text-sm text-slate-500">1 IDR = {result.exchangeRate} {result.currencyCode}</span>
                </div>
              </div>

              {offerSalary > 0 && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-800">
                    {result.isPPPBetter
                      ? 'Offer tersebut memberikan daya beli LEBIH BAIK daripada gaji kamu saat ini.'
                      : 'Offer tersebut memberikan daya beli LEBIH BURUK daripada gaji kamu saat ini setelah disesuaikan PPP.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
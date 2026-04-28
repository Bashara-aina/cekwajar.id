'use client'
import { useState } from 'react'
import { Search, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const EXPERIENCE_BUCKETS = ['0-2', '3-5', '6-10', '10+']

export default function WajarGajiPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [experienceBucket, setExperienceBucket] = useState('0-2')
  const [userSalary, setUserSalary] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!jobTitle) return
    setLoading(true)
    
    try {
      const supabase = createClient()
      const params = new URLSearchParams({
        jobTitle,
        city: city || '',
        province: province || '',
        experienceBucket,
        ...(userSalary > 0 && { userSalary: userSalary.toString() }),
      })
      
      const res = await fetch(`/api/salary/benchmark?${params}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: 'Search failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Wajar Gaji</h1>
          <p className="text-slate-500">Cek apakah gajimu sesuai standar</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posisi / Judul Pekerjaan</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Contoh: Software Engineer"
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kota</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Jakarta"
                  className="w-full h-10 rounded-lg border border-slate-300 px-3"
                />
              </div>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pengalaman</label>
              <select
                value={experienceBucket}
                onChange={(e) => setExperienceBucket(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                {EXPERIENCE_BUCKETS.map((b) => (
                  <option key={b} value={b}>{b} tahun</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gaji Kamu (opsional)</label>
              <input
                type="number"
                value={userSalary || ''}
                onChange={(e) => setUserSalary(parseInt(e.target.value) || 0)}
                placeholder="Cek posisi kamu di pasar"
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>

            <Button onClick={handleSearch} className="w-full" disabled={loading || !jobTitle}>
              {loading ? 'Mencari...' : <>Cek Standar Gaji <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </CardContent>
        </Card>

        {result && !result.error && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900">{result.matchedTitle}</h3>
              <p className="text-sm text-slate-500">Data: {result.dataTier}</p>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-slate-700">IDR {(result.p25 / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-slate-500">P25</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">IDR {(result.p50 / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-slate-500">Median</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">IDR {(result.p75 / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-slate-500">P75</p>
                </div>
              </div>

              {result.userPosition && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center gap-3">
                  {result.userPosition === 'below_p25' && <TrendingDown className="h-6 w-6 text-red-500" />}
                  {result.userPosition === 'within_range' && <Minus className="h-6 w-6 text-emerald-500" />}
                  {result.userPosition === 'above_p75' && <TrendingUp className="h-6 w-6 text-emerald-500" />}
                  <div>
                    <p className="font-medium text-slate-900">
                      {result.userPosition === 'below_p25' && 'Gaji kamu di bawah standar'}
                      {result.userPosition === 'within_range' && 'Gaji kamu dalam range normal'}
                      {result.userPosition === 'above_p75' && 'Gaji kamu di atas standar'}
                    </p>
                    <p className="text-sm text-slate-500">Berdasarkan {result.sampleCount} sample</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
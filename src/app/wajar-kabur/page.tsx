'use client'

// ==============================================================================
// cekwajar.id — Wajar Kabur (PPP Abroad Comparison)
// Full implementation with World Bank PPP + Frankfurter exchange rates
// ==============================================================================

import { useState } from 'react'
import Link from 'next/link'
import { Plane, Lock, Info, ArrowRight, ChevronDown, Globe, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// --- Types --------------------------------------------------------------------

type PageState = 'IDLE' | 'LOADING' | 'RESULT' | 'GATED' | 'ERROR'

interface Country {
  country_code: string
  country_name: string
  currency_code: string
  flag_emoji: string
  is_free_tier: boolean
}

interface CompareResponse {
  success: boolean
  data?: {
    isGated: boolean
    countryName: string
    currencyCode: string
    idSalary: number
    nominalEquivalent: number
    nominalCurrency: string
    userPowerIntlUSD: number
    idPPPFactor: number
    foreignPPPFactor: number
    pppYear: number
    exchangeRate: number
    offerSalary: number | null
    offerPowerIntlUSD: number | null
    realRatio: number | null
    isPPPBetter: boolean | null
    disclaimer: string
  }
  error?: {
    code: string
    message: string
  }
}

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// --- Main Component ----------------------------------------------------------

export default function WajarKaburPage() {
  const [pageState, setPageState] = useState<PageState>('IDLE')
  const [salaryInput, setSalaryInput] = useState('')
  const [offerInput, setOfferInput] = useState('')
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [result, setResult] = useState<CompareResponse['data'] | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [gatedCountryName, setGatedCountryName] = useState('')

  // Load countries on mount
  useState(() => {
    fetch('/api/abroad/countries')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCountries(json.data.countries)
      })
      .catch(() => null)
  })

  const selectedCountryData = countries.find((c) => c.country_code === selectedCountry)
  const isSelectedGated =
    selectedCountryData && !selectedCountryData.is_free_tier

  const handleCompare = async () => {
    const salary = parseInt(salaryInput.replace(/\D/g, ''), 10)
    if (!salary || salary < 100000) {
      setErrorMessage('Masukkan gaji minimal Rp 100.000')
      return
    }
    if (!selectedCountry) {
      setErrorMessage('Pilih negara tujuan')
      return
    }

    setPageState('LOADING')
    setErrorMessage('')

    try {
      const params = new URLSearchParams({
        currentIDRSalary: salary.toString(),
        targetCountry: selectedCountry,
      })

      const offer = parseInt(offerInput.replace(/\D/g, ''), 10)
      if (offer && offer > 0) params.set('offerSalary', offer.toString())

      const res = await fetch(`/api/abroad/compare?${params}`)
      const json: CompareResponse = await res.json()

      if (!json.success) {
        setPageState('ERROR')
        setErrorMessage(json.error?.message ?? 'Terjadi kesalahan')
        return
      }

      const data = json.data!
      if (data.isGated) {
        setPageState('GATED')
        setGatedCountryName(data.countryName)
        return
      }

      setPageState('RESULT')
      setResult(data)
    } catch {
      setPageState('ERROR')
      setErrorMessage('Tidak dapat terhubung ke server')
    }
  }

  const resetState = () => {
    setPageState('IDLE')
    setResult(null)
    setSelectedCountry('')
    setErrorMessage('')
  }

  // === IDLE / LOADING ==========================================================

  if (pageState === 'IDLE' || pageState === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 text-center">
            <div className="mb-4"><Plane className="h-12 w-12 text-emerald-600 mx-auto" /></div>
            <Skeleton shimmer className="mx-auto h-8 w-40 mb-2" />
            <Skeleton shimmer className="mx-auto h-4 w-72" />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Salary Input */}
                <div>
                  <Skeleton shimmer className="h-4 w-36 mb-2" />
                  <Skeleton shimmer className="h-10 w-full" />
                </div>

                {/* Optional Offer */}
                <div>
                  <Skeleton shimmer className="h-4 w-56 mb-2" />
                  <Skeleton shimmer className="h-10 w-full" />
                </div>

                {/* Country Selector */}
                <div>
                  <Skeleton shimmer className="h-4 w-24 mb-2" />
                  <Skeleton shimmer className="h-10 w-full" />
                </div>

                {/* Submit Button */}
                <Skeleton shimmer className="h-10 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>

          {/* Info Skeleton */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Skeleton shimmer className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton shimmer className="h-4 w-32" />
                <Skeleton shimmer className="h-3 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === GATED ==================================================================

  if (pageState === 'GATED') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <div className="mb-4"><Lock className="h-12 w-12 text-slate-400 mx-auto" /></div>
          <h2 className="text-xl font-bold text-slate-900">Negara Ini Untuk Basic+</h2>
          <p className="mt-2 text-slate-500">
            Data PPP untuk <strong>{gatedCountryName}</strong> tersedia untuk langganan
            Basic+ ke atas.
          </p>
          <Button
            onClick={resetState}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700"
          >
            Pilih Negara Lain
          </Button>
          <div className="mt-6">
            <Link href="/upgrade" className="text-sm text-emerald-600 hover:text-emerald-700">
              Lihat Paket Berlangganan →
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/" className="text-sm text-slate-500 hover:text-emerald-600">
              ← Kembali ke Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // === ERROR ==================================================================

  if (pageState === 'ERROR') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <div className="mb-4"><XCircle className="h-12 w-12 text-red-500 mx-auto" /></div>
          <h2 className="text-xl font-bold text-red-900">Terjadi Kesalahan</h2>
          <p className="mt-2 text-red-600">{errorMessage}</p>
          <Button onClick={resetState} className="mt-6 bg-emerald-600 hover:bg-emerald-700">
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  // === RESULT =================================================================

  if (pageState === 'RESULT' && result) {
    const flag = selectedCountryData?.flag_emoji ?? ''
    const ratioDisplay = result.realRatio
      ? result.realRatio.toFixed(2)
      : null

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <button
            onClick={resetState}
            className="flex items-center text-sm text-slate-500 hover:text-emerald-600 mb-4"
          >
            ← Bandingkan Lagi
          </button>

          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Country Header */}
              <div className="text-center mb-6">
                <div className="mb-2"><Globe className="h-10 w-10 text-emerald-600 mx-auto" /></div>
                <div className="text-xl font-bold text-slate-800">{result.countryName}</div>
                <div className="text-sm text-slate-500">
                  1 {result.currencyCode} = {formatNumber(result.exchangeRate, 2)} IDR
                </div>
              </div>

              {/* Two Column Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Indonesia */}
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">🇮🇩 Gaji Kamu di Indonesia</div>
                  <div className="text-lg font-bold text-slate-700">
                    {formatIDR(result.idSalary)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    = {formatNumber(result.userPowerIntlUSD, 0)} international $
                  </div>
                </div>

                {/* Target Country */}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">{flag} Nominal Setara</div>
                  <div className="text-lg font-bold text-blue-700">
                    {formatNumber(result.nominalEquivalent, 0)} {result.currencyCode}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    = {formatNumber(result.userPowerIntlUSD, 0)} international $
                  </div>
                </div>
              </div>

              {/* Big Ratio Banner */}
              {result.realRatio !== null && result.offerSalary && (
                <div
                  className={`text-center p-4 rounded-xl mb-4 ${
                    result.isPPPBetter
                      ? 'bg-emerald-50 border-2 border-emerald-200'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  {result.isPPPBetter ? (
                    <div>
                      <div className="mb-2 h-8 w-8 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="text-lg font-bold text-emerald-700">
                        Penawaran {ratioDisplay}× lebih besar secara daya beli
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 h-8 w-8 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="text-lg font-bold text-red-700">
                        Penawaran hanya {ratioDisplay}× daya beli
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!result.offerSalary && (
                <div className="text-center p-3 bg-slate-50 rounded-lg text-sm text-slate-500 mb-4">
                  Masukkan tawaran gaji untuk melihat perbandingan penuh
                </div>
              )}

              {/* PPP Source */}
              <div className="text-center text-xs text-slate-400 mb-2">
                PPP sumber: World Bank {result.pppYear}
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700">{result.disclaimer}</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-emerald-600">
              ← Kembali ke Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
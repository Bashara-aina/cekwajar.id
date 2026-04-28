import Midtrans from 'midtrans-sdk-nodejs'

let _midtrans: Midtrans | null = null

export function getMidtransClient(): Midtrans {
  if (!_midtrans) {
    _midtrans = new Midtrans({
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    })
  }
  return _midtrans
}

export function isMidtransProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true'
}

export function getSnapJsUrl(): string {
  const isProd = isMidtransProduction()
  return isProd
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'
}

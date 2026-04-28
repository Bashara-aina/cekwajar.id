export function getMidtransClient(): unknown {
  return null
}

export function isMidtransProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true'
}

export function getSnapJsUrl(): string {
  return 'https://app.midtrans.com/snap/snap.js'
}

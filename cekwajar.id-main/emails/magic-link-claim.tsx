// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Magic Link Claim Email (post-payment guest claim)
// Sent to guests after payment to claim their account
// ══════════════════════════════════════════════════════════════════════════════

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface MagicLinkClaimProps {
  email: string
  link: string
  planName?: string
}

export default function MagicLinkClaim({
  email,
  link,
  planName = 'Pro',
}: MagicLinkClaimProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Akun cekwajar.id kamu menunggu — klik untuk buka dashboard
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.headerSection}>
            <Heading style={styles.logo}>cekwajar.id</Heading>
          </Section>

          {/* Main content */}
          <Section style={styles.mainSection}>
            <Heading style={styles.heading}>Selamat! Pembayaran berhasil.</Heading>
            <Text style={styles.text}>
              Pembayaranmu sudah kami terima. Klik tombol di bawah untuk simpan riwayat audit selamanya.
            </Text>
            <Text style={styles.text}>
              Email ini dikirim ke <strong>{email}</strong>
            </Text>

            <Section style={styles.ctaSection}>
              <Link href={link} style={styles.ctaButton}>
                Buka Dashboard Kamu
              </Link>
            </Section>

            <Text style={styles.subtext}>
              Link berlaku 7 hari. Email ini juga dapat dipakai untuk login selanjutnya.
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Features summary */}
          <Section style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Yang kamu dapatkan:</Text>
            <Text style={styles.featureItem}>✓ Audit slip gaji unlimited</Text>
            <Text style={styles.featureItem}>✓ Detail rupiah selisih</Text>
            <Text style={styles.featureItem}>✓ Skrip langkah ke HRD</Text>
            <Text style={styles.featureItem}>✓ Garansi 7 hari uang kembali</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.footerSection}>
            <Text style={styles.footerText}>
              Kalau ada yang aneh, balas email ini. Saya yang baca.
            </Text>
            <Text style={styles.footerSubtext}>
              — cekwajar.id
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    margin: '40px auto',
    padding: '40px',
    maxWidth: '480px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerSection: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  logo: {
    color: '#059669',
    fontSize: '24px',
    fontWeight: '700' as const,
    margin: '0',
  },
  mainSection: {
    marginBottom: '24px',
  },
  heading: {
    color: '#1e293b',
    fontSize: '22px',
    fontWeight: '700' as const,
    marginBottom: '16px',
    marginTop: '0',
  },
  text: {
    color: '#475569',
    fontSize: '15px',
    lineHeight: '24px',
    marginBottom: '12px',
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginTop: '24px',
    marginBottom: '24px',
  },
  ctaButton: {
    backgroundColor: '#10b981',
    borderRadius: '8px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600' as const,
    padding: '14px 28px',
    textDecoration: 'none',
  },
  subtext: {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '18px',
    textAlign: 'center' as const,
  },
  hr: {
    borderColor: '#e2e8f0',
    margin: '24px 0',
  },
  featuresSection: {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '20px',
    marginBottom: '24px',
  },
  featuresTitle: {
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '600' as const,
    marginBottom: '8px',
    marginTop: '0',
  },
  featureItem: {
    color: '#475569',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '4px 0',
  },
  footerSection: {
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '22px',
    marginBottom: '4px',
  },
  footerSubtext: {
    color: '#94a3b8',
    fontSize: '12px',
    marginTop: '0',
  },
}

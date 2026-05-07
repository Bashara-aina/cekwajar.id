// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Welcome Email (sent after anon-to-account migration)
// Sent once when a guest converts to a real account
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

interface WelcomeProps {
  email: string
  name?: string
}

export default function Welcome({ email, name }: WelcomeProps) {
  const displayName = name ?? email.split('@')[0]
  const emailPrefix = email.split('@')[0]

  return (
    <Html>
      <Head />
      <Preview>
        Selamat datang. Slip kamu aman di cekwajar.id
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.headerSection}>
            <Heading style={styles.logo}>cekwajar.id</Heading>
          </Section>

          {/* Main content */}
          <Section style={styles.mainSection}>
            <Heading style={styles.heading}>Selamat datang. Slip kamu aman.</Heading>
            <Text style={styles.salutation}>Hi {displayName},</Text>
            <Text style={styles.text}>
              Akun cekwajar.id kamu siap. Yang sudah aktif:
            </Text>

            {/* Feature list */}
            <Section style={styles.featureList}>
              <Text style={styles.featureItem}>✓ Audit slip gaji unlimited</Text>
              <Text style={styles.featureItem}>✓ Detail rupiah selisih</Text>
              <Text style={styles.featureItem}>✓ Skrip langkah ke HRD</Text>
              <Text style={styles.featureItem}>✓ Garansi 7 hari uang kembali</Text>
            </Section>

            <Text style={styles.text}>Cara pakai berikutnya:</Text>

            {/* Steps */}
            <Section style={styles.stepsSection}>
              <Text style={styles.step}>1. Login: cekwajar.id/auth/login (klik magic link)</Text>
              <Text style={styles.step}>2. Klik &quot;Wajar Slip&quot; → upload slip</Text>
              <Text style={styles.step}>3. Lihat hasil</Text>
            </Section>
          </Section>

          <Hr style={styles.hr} />

          {/* Closing */}
          <Section style={styles.closingSection}>
            <Text style={styles.closingText}>
              Kalau ada yang aneh, balas email ini. Saya yang baca.
            </Text>
            <Text style={styles.signature}>— cekwajar.id</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.footerSection}>
            <Text style={styles.footerText}>
              Kamu menerima email ini karena baru saja membuat akun cekwajar.id.
            </Text>
            <Text style={styles.footerText}>
              <Link href="/privacy" style={styles.footerLink}>Kebijakan Privasi</Link>
              {' · '}
              <Link href="/terms" style={styles.footerLink}>Syarat & Ketentuan</Link>
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
  salutation: {
    color: '#1e293b',
    fontSize: '16px',
    fontWeight: '600' as const,
    marginBottom: '12px',
  },
  text: {
    color: '#475569',
    fontSize: '15px',
    lineHeight: '24px',
    marginBottom: '12px',
  },
  featureList: {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '16px 20px',
    marginBottom: '20px',
  },
  featureItem: {
    color: '#475569',
    fontSize: '14px',
    lineHeight: '26px',
    margin: '0',
  },
  stepsSection: {
    paddingLeft: '8px',
    marginBottom: '24px',
  },
  step: {
    color: '#475569',
    fontSize: '14px',
    lineHeight: '26px',
    margin: '0',
  },
  hr: {
    borderColor: '#e2e8f0',
    margin: '24px 0',
  },
  closingSection: {
    marginBottom: '24px',
  },
  closingText: {
    color: '#475569',
    fontSize: '14px',
    lineHeight: '22px',
    marginBottom: '4px',
  },
  signature: {
    color: '#059669',
    fontSize: '14px',
    fontWeight: '600' as const,
    marginTop: '0',
  },
  footerSection: {
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '18px',
    marginBottom: '4px',
  },
  footerLink: {
    color: '#64748b',
    textDecoration: 'underline',
  },
}

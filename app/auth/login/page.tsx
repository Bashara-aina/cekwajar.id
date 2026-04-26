import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Masuk — cekwajar.id',
  description: 'Masuk ke akun cekwajar.id kamu.',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; intent?: string }
}) {
  return <LoginForm intent={searchParams?.intent} />
}
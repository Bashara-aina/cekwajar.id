'use client'

import * as React from 'react'
import { ThemeProvider } from '@/components/providers'
import { CommandMenu } from '@/components/CommandMenu'
import { Toaster } from '@/components/ui/toast'
import { PageTransition } from '@/components/transitions/PageTransition'
import { LocaleProvider } from '@/i18n/config'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <CommandMenu />
        <PageTransition>
          {children}
        </PageTransition>
        <Toaster />
      </LocaleProvider>
    </ThemeProvider>
  )
}

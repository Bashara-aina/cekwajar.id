import { useEffect } from 'react'

export function useKeyboardHeight() {
  useEffect(() => {
    if (!('visualViewport' in window)) return
    const onResize = () => {
      const keyboardH = window.innerHeight - window.visualViewport!.height
      document.documentElement.style.setProperty('--keyboard-h', `${Math.max(0, keyboardH)}px`)
    }
    window.visualViewport!.addEventListener('resize', onResize)
    return () => window.visualViewport!.removeEventListener('resize', onResize)
  }, [])
}

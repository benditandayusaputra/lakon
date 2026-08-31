'use client'

import { useEffect, useState } from 'react'
import type { CompilerRig } from '@lakon/sign-compiler'
import { extractCompilerRig } from './compiler-rig'
import { disposeAvatar, loadAvatar } from './vrm'

export const useCompilerRig = () => {
  const [rig, setRig] = useState<CompilerRig | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false
    loadAvatar()
      .then((avatar) => {
        if (!disposed) setRig(extractCompilerRig(avatar))
        disposeAvatar(avatar)
      })
      .catch((err: unknown) => {
        if (!disposed) setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      disposed = true
    }
  }, [])

  return { rig, error }
}

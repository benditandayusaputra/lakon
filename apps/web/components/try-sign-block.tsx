'use client'

import { useMemo } from 'react'
import { compileSign } from '@lakon/sign-compiler'
import { useCompilerRig } from '@/features/avatar/use-rig'
import { useContent } from '@/features/content/use-content'
import { PracticeBlock } from '@/components/practice-block'

export default function TrySignBlock({
  lang,
  missingText,
  loadingText,
}: {
  lang: 'id' | 'en'
  missingText: string
  loadingText: string
}) {
  const { content } = useContent()
  const { rig } = useCompilerRig()

  const trySign = useMemo(() => {
    if (!content || !rig) return null
    const sign = content.signs.halo ?? Object.values(content.signs)[0]
    if (!sign) return null
    try {
      return { sign, compiled: compileSign(sign, content.handshapes, rig) }
    } catch {
      return null
    }
  }, [content, rig])

  if (!trySign) {
    return (
      <p className="text-teks-sekunder max-w-prose">{content && rig ? missingText : loadingText}</p>
    )
  }
  return <PracticeBlock compiled={trySign.compiled} signLabel={trySign.sign.gloss[lang]} />
}

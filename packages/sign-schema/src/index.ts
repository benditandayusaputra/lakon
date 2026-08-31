import { z } from 'zod'

export const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const
export type Finger = (typeof FINGERS)[number]

const deg = z.number().min(-180).max(180)
const flex = z.tuple([z.number().min(0).max(180), z.number().min(0).max(180), z.number().min(0).max(180)])

export const handshapeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string(),
  flex: z.object({
    thumb: flex,
    index: flex,
    middle: flex,
    ring: flex,
    pinky: flex,
  }),
  spread: z.number().min(0).max(90),
})

export const locationSchema = z.object({ x: z.number(), y: z.number(), z: z.number() })

export const orientationSchema = z.object({ pitch: deg, yaw: deg, roll: deg })

export const keyframeSchema = z.object({
  t: z.number().int().min(0),
  handshape: z.string(),
  location: locationSchema,
  orientation: orientationSchema,
})

export const signSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  gloss: z.string(),
  dominant: z.enum(['right', 'left']),
  hands: z.enum(['one', 'two']),
  tracks: z.object({
    right: z.array(keyframeSchema).min(2).optional(),
    left: z.array(keyframeSchema).min(2).optional(),
  }),
  review: z.object({
    status: z.enum(['draft', 'in-review', 'approved']),
    validator: z.string().optional(),
    date: z.string().optional(),
  }),
})

export const scenarioSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  side: z.enum(['tuli', 'layanan']),
  nodes: z.array(
    z.object({
      id: z.string(),
      prompt: z.string(),
      expect: z.string().optional(),
      next: z.array(z.object({ label: z.string(), to: z.string().nullable() })).default([]),
    }),
  ),
  start: z.string(),
})

export type Handshape = z.infer<typeof handshapeSchema>
export type Keyframe = z.infer<typeof keyframeSchema>
export type Sign = z.infer<typeof signSchema>
export type Scenario = z.infer<typeof scenarioSchema>

export const parseHandshape = (v: unknown): Handshape => handshapeSchema.parse(v)
export const parseSign = (v: unknown): Sign => signSchema.parse(v)
export const parseScenario = (v: unknown): Scenario => scenarioSchema.parse(v)

export const isApproved = (s: Sign) => s.review.status === 'approved'

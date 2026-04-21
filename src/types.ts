export type TrainMode = 'beginner' | 'timed' | 'adaptive' | 'custom'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface SessionConfig {
  mode: TrainMode
  timerSeconds?: number
  customText?: string
  difficulty?: Difficulty
  focusMode?: boolean
  strictMode?: boolean
  soundEnabled?: boolean
}

export interface KeyStat {
  key: string
  attempts: number
  errors: number
}

export interface TypingSessionRecord {
  id: string
  at: number
  mode: TrainMode
  wpm: number
  accuracy: number
  durationSec: number
  errors: number
  keystrokes: number
}

export interface SessionSummary {
  wpm: number
  accuracy: number
  errors: number
  keystrokes: number
  correctChars: number
  durationSec: number
}

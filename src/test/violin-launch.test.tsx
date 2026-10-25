import { describe, expect, it } from 'vitest'
import {
  violinLaunch,
  isViolinLaunchActive,
  violinPriceCents,
  launchTimeRemaining,
} from '../../shared/violin-launch'

const start = Date.parse(violinLaunch.startsAt)
const end = Date.parse(violinLaunch.endsAt)

describe('preço e prazo fixos do lançamento', () => {
  it('cobra o valor de lançamento até o último instante e o preço regular a partir do término', () => {
    expect(violinPriceCents(violinLaunch.productId, 3000, start - 1)).toBe(3000)
    expect(violinPriceCents(violinLaunch.productId, 3000, start)).toBe(2790)
    expect(violinPriceCents(violinLaunch.productId, 3000, end - 1)).toBe(2790)
    expect(violinPriceCents(violinLaunch.productId, 3000, end)).toBe(4990)
    expect(violinPriceCents(violinLaunch.productId, 3000, end + 86400000)).toBe(4990)
  })
  it('respeita a meia-noite no horário de Brasília sem alterar outros produtos', () => {
    expect(isViolinLaunchActive(Date.parse('2026-10-28T02:59:59Z'))).toBe(true)
    expect(isViolinLaunchActive(Date.parse('2026-10-28T03:00:00Z'))).toBe(false)
    expect(violinPriceCents('library-violin-scores', 1290, end)).toBe(1290)
    expect(violinPriceCents('library-complete', 2790, end)).toBe(2790)
  })
  it('calcula o tempo real até o prazo e nunca reinicia nem fica negativo', () => {
    expect(launchTimeRemaining(end - 90061000)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    })
    expect(launchTimeRemaining(end - 100)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 })
    expect(launchTimeRemaining(end)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    expect(launchTimeRemaining(end + 90061000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
  })
})

import { describe, expect, it } from 'vitest'
import { activeLaunchCampaign } from '../lib/launch-campaign'
import type { ViolinLaunchCampaign } from '../data/violin-sales'

const campaign: ViolinLaunchCampaign = {
  title: 'Condição de lançamento',
  benefit: 'Benefício confirmado pelo responsável pelo produto.',
  startsAt: '2026-10-24T00:00:00-03:00',
  endsAt: '2026-10-26T23:59:59-03:00',
}

describe('prazo real da campanha', () => {
  it('publica a condição apenas durante o intervalo configurado', () => {
    const start = Date.parse(campaign.startsAt)
    const end = Date.parse(campaign.endsAt)
    expect(activeLaunchCampaign(campaign, start - 1)).toBeNull()
    expect(activeLaunchCampaign(campaign, start)).toBe(campaign)
    expect(activeLaunchCampaign(campaign, end - 1)).toBe(campaign)
    expect(activeLaunchCampaign(campaign, end)).toBeNull()
    expect(activeLaunchCampaign(campaign, end + 1)).toBeNull()
  })

  it('respeita o fuso de Brasília ao comparar horários em UTC', () => {
    expect(activeLaunchCampaign(campaign, Date.parse('2026-10-24T02:59:59Z'))).toBeNull()
    expect(activeLaunchCampaign(campaign, Date.parse('2026-10-24T03:00:00Z'))).toBe(campaign)
    expect(activeLaunchCampaign(campaign, Date.parse('2026-10-27T02:59:59Z'))).toBeNull()
  })

  it('não cria uma promoção sem condição, benefício ou prazo válido', () => {
    const now = Date.parse('2026-10-25T12:00:00-03:00')
    expect(activeLaunchCampaign(null, now)).toBeNull()
    for (const patch of [
      { title: ' ' },
      { benefit: '' },
      { endsAt: 'invalid' },
      { startsAt: '2026-10-24T00:00:00' },
      { startsAt: campaign.endsAt, endsAt: campaign.startsAt },
    ])
      expect(activeLaunchCampaign({ ...campaign, ...patch }, now)).toBeNull()
  })
})

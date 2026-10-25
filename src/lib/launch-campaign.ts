import type { ViolinLaunchCampaign } from '../data/violin-sales'

export function activeLaunchCampaign(
  campaign: ViolinLaunchCampaign | null,
  now = Date.now(),
): ViolinLaunchCampaign | null {
  if (!campaign || !campaign.title.trim() || !campaign.benefit.trim()) return null
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/
  if (!hasTimezone.test(campaign.startsAt) || !hasTimezone.test(campaign.endsAt)) return null
  const start = Date.parse(campaign.startsAt)
  const end = Date.parse(campaign.endsAt)
  return Number.isFinite(start) && Number.isFinite(end) && start < end && now >= start && now < end
    ? campaign
    : null
}

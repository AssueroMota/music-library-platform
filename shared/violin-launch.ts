// Fixed offer, reopened by the owner on 28/10 through 31/10. Never resets per visitor.
export const violinLaunch = {
  productId: 'library-violin-playbacks',
  startsAt: '2026-10-24T00:00:00-03:00',
  endsAt: '2026-11-01T00:00:00-03:00',
  launchPriceCents: 2790,
  regularPriceCents: 4990,
  deadlineLabel: '31/10 às 23h59',
  regularFromLabel: '01/11',
} as const

export function isViolinLaunchActive(now = Date.now()) {
  return now >= Date.parse(violinLaunch.startsAt) && now < Date.parse(violinLaunch.endsAt)
}

export function violinPriceCents(productId: string, databasePriceCents: number, now = Date.now()) {
  if (productId !== violinLaunch.productId || now < Date.parse(violinLaunch.startsAt))
    return databasePriceCents
  return isViolinLaunchActive(now) ? violinLaunch.launchPriceCents : violinLaunch.regularPriceCents
}

export function launchTimeRemaining(now = Date.now()) {
  const seconds = Math.max(0, Math.ceil((Date.parse(violinLaunch.endsAt) - now) / 1000))
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  }
}

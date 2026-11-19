import { createContext, useContext, useEffect, useState } from 'react'
import { violinOffers } from '../../shared/products'
import { isViolinLaunchActive, violinPriceCents } from '../../shared/violin-launch'

export const OfferRenderTime = createContext<number | undefined>(undefined)

export function useOfferPricing() {
  const renderedAt = useContext(OfferRenderTime)
  const [now, setNow] = useState(() => renderedAt ?? Date.now())
  useEffect(() => {
    const update = () => setNow(Date.now())
    update()
    const timer = window.setInterval(update, 1000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  return {
    now,
    launchActive: isViolinLaunchActive(now),
    prices: violinOffers.map((offer) => violinPriceCents(offer.id, offer.priceCents, now)),
  }
}

export type UpgradeQuote =
  | { alreadyComplete: true }
  | {
      alreadyComplete: false
      email: string
      completePriceCents: number
      creditCents: number
      priceCents: number
      pendingCheckoutUrl: string | null
      available: boolean
      checkoutEnabled: boolean
    }

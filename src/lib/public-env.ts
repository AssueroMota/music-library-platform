// Values pasted into hosting dashboards can retain dotenv's surrounding quotes.
export function publicEnv(value: string | undefined): string {
  const trimmed = value?.trim() ?? ''
  const quote = trimmed[0]
  if ((quote === '"' || quote === "'") && trimmed.at(-1) === quote)
    return trimmed.slice(1, -1).trim()
  return trimmed
}

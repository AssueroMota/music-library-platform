export function Logo({ light = false, href = '#inicio' }: { light?: boolean; href?: string }) {
  return (
    <a
      href={href}
      className={`logo ${light ? 'logo-light' : ''}`}
      aria-label="Music Library — início"
    >
      <img
        className="logo-image"
        src="/images/music-library-violinista.jpg"
        alt="Music Library"
        width={96}
        height={96}
        decoding="async"
      />
    </a>
  )
}

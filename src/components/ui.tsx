import { ArrowUpRight, AudioLines } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`container ${className}`}>{children}</div>
}

export function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  onClick,
}: {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'outline' | 'gold'
  className?: string
  onClick?: () => void
}) {
  const classes = `button button-${variant} ${className}`
  return href ? (
    <a className={classes} href={href}>
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  ) : (
    <button type="button" className={classes} onClick={onClick}>
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </button>
  )
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a
      href="#inicio"
      className={`logo ${light ? 'logo-light' : ''}`}
      aria-label="Music Library — início"
    >
      <span className="logo-symbol">
        <AudioLines size={26} strokeWidth={1.6} />
      </span>
      <span>
        music
        <span className="logo-second">
          library<span className="logo-dot">.</span>
        </span>
      </span>
    </a>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  light = false,
  center = false,
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  light?: boolean
  center?: boolean
}) {
  return (
    <div
      className={`section-heading ${light ? 'heading-light' : ''} ${center ? 'heading-center' : ''}`}
    >
      <span className="eyebrow">
        <i />
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  )
}

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

export function InstrumentImage({
  index,
  name,
  className = '',
}: {
  index: number
  name: string
  className?: string
}) {
  return (
    <div className={`instrument-image ${className}`}>
      <img
        src="/images/instruments.jpg"
        alt={name}
        loading="lazy"
        width="1536"
        height="1024"
        style={{ left: `${-(index % 3) * 100}%`, top: index >= 3 ? '-88%' : '0' }}
      />
    </div>
  )
}

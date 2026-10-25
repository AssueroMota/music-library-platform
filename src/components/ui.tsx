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

export function Logo({ light = false, href = '#inicio' }: { light?: boolean; href?: string }) {
  return (
    <a
      href={href}
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
  eyebrow?: string
  title: ReactNode
  children?: ReactNode
  light?: boolean
  center?: boolean
}) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.div
      className={`section-heading ${light ? 'heading-light' : ''} ${center ? 'heading-center' : ''}`}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55 }}
    >
      {eyebrow && (
        <span className="eyebrow">
          <i />
          {eyebrow}
        </span>
      )}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </motion.div>
  )
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

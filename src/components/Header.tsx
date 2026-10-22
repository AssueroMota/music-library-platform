import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X, Music2 } from 'lucide-react'
import { navigation } from '../data/content'
import { Container, Logo } from './ui'

export function Header() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 1080px)')
    const resized = () => {
      if (desktop.matches) setOpen(false)
    }
    window.addEventListener('keydown', close)
    desktop.addEventListener('change', resized)
    return () => {
      window.removeEventListener('keydown', close)
      desktop.removeEventListener('change', resized)
    }
  }, [open])
  return (
    <>
      <div className="announcement">
        <Music2 size={13} aria-hidden="true" />
        <span>PARTITURAS, ACOMPANHAMENTOS E REPERTÓRIOS. SEU PRÓXIMO PALCO COMEÇA AQUI.</span>
        <span className="announcement-tag">
          MUSIC LIBRARY <ArrowUpRight size={12} />
        </span>
      </div>
      <header className="header">
        <Container className="header-inner">
          <Logo light />
          <nav className="desktop-nav" aria-label="Navegação principal">
            {navigation.map(([name, href]) => (
              <a key={href} href={href}>
                {name}
              </a>
            ))}
          </nav>
          <a className="header-cta" href="#biblioteca">
            Conhecer a biblioteca <ArrowUpRight size={15} />
          </a>
          <button
            ref={menuButton}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </Container>
        <nav hidden={!open} className="mobile-nav" id="mobile-menu" aria-label="Navegação móvel">
          {navigation.map(([name, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {name}
              <ArrowUpRight size={16} />
            </a>
          ))}
        </nav>
      </header>
    </>
  )
}

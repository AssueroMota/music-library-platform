import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ContactBubble } from '../components/ContactBubble'
import { supportEmail } from '../data/contact'
import App from '../App'

function ContactDemo() {
  const [open, setOpen] = useState(false)
  return <ContactBubble open={open} onOpenChange={setOpen} />
}

it('prepara o e-mail para o suporte com a dúvida intacta e mantém o rascunho ao fechar', async () => {
  const user = userEvent.setup()
  render(<ContactDemo />)
  const launcher = screen.getByRole('button', { name: 'Entrar em contato com o suporte' })
  await user.click(launcher)
  const message = screen.getByRole('textbox', { name: 'Qual é a sua dúvida?' })
  expect(message).toHaveFocus()
  const question = 'Olá! O plano tem partituras & playbacks?\nComo recebo meu acesso?'
  await user.type(message, question)
  const mail = new URL(
    screen.getByRole('link', { name: 'Enviar por e-mail' }).getAttribute('href')!,
  )
  expect(mail.protocol).toBe('mailto:')
  expect(mail.pathname).toBe(supportEmail)
  expect(mail.searchParams.get('body')).toBe(question)
  expect(screen.getByText(/Seu aplicativo de e-mail será aberto/)).toBeInTheDocument()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(launcher).toHaveFocus()
  await user.click(launcher)
  expect(screen.getByRole('textbox')).toHaveValue(question)
})

it('impede o envio de uma dúvida vazia e oferece o endereço direto de suporte', async () => {
  render(<ContactDemo />)
  fireEvent.click(screen.getByRole('button', { name: 'Entrar em contato com o suporte' }))
  expect(fireEvent.click(screen.getByRole('link', { name: 'Enviar por e-mail' }))).toBe(false)
  expect(screen.getByRole('alert')).toHaveTextContent('Escreva sua dúvida')
  expect(screen.getByRole('textbox')).toHaveFocus()
  expect(screen.getByRole('link', { name: supportEmail })).toHaveAttribute(
    'href',
    expect.stringContaining(`mailto:${supportEmail}`),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Fechar contato' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('abre o mesmo contato a partir do rodapé da página', async () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Contato' }))
  expect(screen.getByRole('dialog', { name: 'Como podemos ajudar?' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: supportEmail })).toBeInTheDocument()
})

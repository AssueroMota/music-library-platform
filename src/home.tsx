import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import { HomePage } from './HomePage'

const root = document.getElementById('root')!
const renderedAt = root.dataset.renderedAt
if (renderedAt) hydrateRoot(root, <HomePage renderedAt={Number(renderedAt)} />)
else createRoot(root).render(<HomePage />)

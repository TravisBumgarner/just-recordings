import WrappedApp from '@/App'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

const ChromeRouter = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WrappedApp RouterComponent={ChromeRouter} />
  </React.StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Chart, registerables } from 'chart.js'
import './assets/main.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

Chart.register(...registerables)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/inter'
import './index.css'
import { applyTheme, initialMode } from './theme'
import { startEngine } from './engine/store'
import App from './App'

applyTheme(initialMode())
startEngine()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

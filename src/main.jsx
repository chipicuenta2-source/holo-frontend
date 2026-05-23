import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HoloAuthProvider } from './hooks/useHoloApi.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HoloAuthProvider>
      <App />
    </HoloAuthProvider>
  </React.StrictMode>,
)
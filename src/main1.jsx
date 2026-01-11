import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ExamGuard from './ExamGuard.jsx' // Import du gardien
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ExamGuard>
      <App />
    </ExamGuard>
  </React.StrictMode>,
)
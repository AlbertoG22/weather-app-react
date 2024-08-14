import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ForecastApp } from './ForecastApp.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ForecastApp />
  </StrictMode>,
)

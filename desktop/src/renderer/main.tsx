import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AssessmentApp } from './pages/AssessmentApp';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AssessmentApp />
  </StrictMode>,
);

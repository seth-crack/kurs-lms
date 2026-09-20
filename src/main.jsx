import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ConfirmHost from './ui/Confirm';
import ToastHost from './ui/Toast';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <ConfirmHost />
    <ToastHost />
  </BrowserRouter>
);
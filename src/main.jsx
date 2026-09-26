import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ConfirmHost from './ui/Confirm';
import ToastHost from './ui/Toast';

import './lib/supabase';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { useAuth } from './store/useAuth';
import { useUsers } from './store/useUsers';
import { useHomework } from './store/useHomework';
import { useGroups } from './store/useGroups';

// Инициализация
useAuth.getState().init();

// Когда пользователь вошёл — подтягиваем данные
const unsub = useAuth.subscribe((state) => {
  if (state.user && !state.loading) {
    useUsers.getState().refresh();
    useHomework.getState().refresh();
    useGroups.getState().refresh();
    unsub();
  }
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <ConfirmHost />
    <ToastHost />
  </BrowserRouter>
);
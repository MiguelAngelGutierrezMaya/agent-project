// React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// i18n
import '@/modules/shared/presentation/i18n';

// Components
import App from '@/modules/App';
import { ClerkAuth } from '@/modules/auth/presentation/components/Clerk/ClerkAuth.tsx';

// Styles
import './index.css';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <ClerkAuth>
        <App />
      </ClerkAuth>
    </StrictMode>
  );
}

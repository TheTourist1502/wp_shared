import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Card } from './card';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Card title="wp_shared">Shared components preview.</Card>
  </StrictMode>,
);

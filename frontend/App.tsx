
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <div className="bg-background text-copy font-sans">
            <AppRoutes />
          </div>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

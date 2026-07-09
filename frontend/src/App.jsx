import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchDashboard from './SearchDashboard';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0f1c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black text-slate-200 font-sans flex flex-col selection:bg-indigo-500/30">
        
        {/* Clean Fixed Header for Branding */}
        <header className="fixed top-0 left-0 w-full px-6 sm:px-10 py-6 bg-[#0f172a] z-50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 pointer-events-auto w-max">
            <span className="text-lg tracking-[0.2em] font-bold text-slate-200 hover:text-white transition-colors uppercase">
              ONGC NEXUS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] mt-0.5"></span>
          </div>
        </header>

        {/* Main Content Area Wrapper */}
        <main className="flex-grow w-full pt-28 sm:pt-32 flex flex-col">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><SearchDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
        
      </div>
    </BrowserRouter>
  );
}

export default App;

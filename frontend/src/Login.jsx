import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { username, password });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0f1c] flex flex-col lg:flex-row w-full h-screen animate-in fade-in duration-500">
      
      {/* Left Column - Branding */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black">
        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight leading-tight">
          Welcome to ONGC nexus
        </h1>
        <p className="text-xl lg:text-2xl text-slate-400 max-w-xl leading-relaxed">
          Connecting all knowledge assets across the ONGC corporation.
        </p>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center lg:justify-end px-8 lg:px-32 bg-black/40 border-l border-slate-800/50 shadow-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 lg:p-10 w-full max-w-md shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)]">
          <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Secure Login
          </h2>
          <p className="text-slate-400 text-center mb-6 text-sm">Sign in to access the knowledge repository</p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 hover:border-slate-600"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 hover:border-slate-600"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 mt-2"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const user = await response.json();
        // Simpan info user di local storage untuk dipakai nanti
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role === 'admin') navigate('/admin');
        else navigate('/user');
      } else {
        const err = await response.json();
        setError(err.error || 'Invalid username or password');
      }
    } catch (error) {
      setError('Koneksi ke server gagal. Pastikan server backend menyala.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-warm-50">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-warm-300 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-calm-300 opacity-20 blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md p-8 rounded-3xl shadow-xl z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-warm-400 to-warm-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-warm-400/30">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">CoWork Space</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">Reservasi Ruang Kerja Anda dengan Mudah</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 focus:border-transparent outline-none transition-all"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound size={18} />
              </div>
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 focus:border-transparent outline-none transition-all"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-gradient-to-r from-warm-500 to-warm-600 text-white font-medium rounded-xl hover:from-warm-600 hover:to-warm-700 focus:outline-none focus:ring-2 focus:ring-warm-500 shadow-lg shadow-warm-500/30 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}

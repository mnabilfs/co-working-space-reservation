import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, KeyRound, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/register';
      const body = isLogin ? { username, password } : { username, password, name };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        const user = await response.json();
        // Simpan info user di local storage untuk dipakai nanti
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role === 'admin') navigate('/admin');
        else navigate('/user');
      } else {
        const err = await response.json();
        setError(err.error || (isLogin ? 'Invalid username or password' : 'Gagal mendaftar'));
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
          <p className="text-gray-500 text-sm mt-1 text-center">
            {isLogin ? 'Reservasi Ruang Kerja Anda dengan Mudah' : 'Daftar Akun Baru untuk Memulai'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Type size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                required
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
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit" 
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-warm-500 to-warm-600 text-white font-medium rounded-xl hover:from-warm-600 hover:to-warm-700 focus:outline-none focus:ring-2 focus:ring-warm-500 shadow-lg shadow-warm-500/30 transition-all active:scale-[0.98]"
          >
            {isLogin ? 'Sign In' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-warm-600 font-semibold hover:text-warm-700 focus:outline-none"
            >
              {isLogin ? "Register di sini" : "Login di sini"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

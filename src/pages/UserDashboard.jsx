import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, LogOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/spaces');
      const data = await res.json();
      setSpaces(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSpaces = spaces.filter(space => 
    space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBook = (space) => {
    setSelectedSpace(space);
    setShowModal(true);
  };

  const confirmBooking = async () => {
    try {
      await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user ? user.id : 2,
          spaceId: selectedSpace.id,
          date: new Date().toISOString().split('T')[0]
        })
      });
      setReservationSuccess(true);
      fetchSpaces(); // Refresh data
      setTimeout(() => {
        setShowModal(false);
        setReservationSuccess(false);
        setSelectedSpace(null);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-12">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-warm-500 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="text-xl font-bold text-gray-800">CoWork</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 hidden sm:inline">Halo, {user?.name || 'User'}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Temukan Ruang Kerja Idealmu</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Pesan meja on-demand, ruang meeting, atau dapatkan rekomendasi tempat kerja remote-friendly di seluruh Indonesia dan Global.</p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input 
            type="text" 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-warm-400 focus:border-transparent outline-none text-lg transition-shadow"
            placeholder="Cari lokasi, kota, atau nama co-working..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSpaces.map((space, index) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} key={space.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="relative h-48 overflow-hidden">
                <img src={space.imageUrl} alt={space.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span>{space.rating}</span>
                </div>
                {space.isRemoteFriendly && (
                  <div className="absolute top-4 left-4 bg-calm-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm">
                    Remote Friendly
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{space.name}</h3>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${space.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {space.status}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <MapPin size={16} className="mr-1" />
                  {space.location}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {space.features && space.features.map((feature, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">Rp {Number(space.price).toLocaleString('id-ID')}</span>
                    <span className="text-gray-500 text-sm">/hari</span>
                  </div>
                  
                  <button 
                    onClick={() => handleBook(space)}
                    disabled={space.status !== 'Available'}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      space.status === 'Available' 
                        ? 'bg-warm-500 hover:bg-warm-600 text-white shadow-md shadow-warm-500/20' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Booking
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {showModal && selectedSpace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !reservationSuccess && setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-md w-full z-10 shadow-2xl relative">
              {reservationSuccess ? (
                <div className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Reservasi Berhasil!</h3>
                  <p className="text-gray-500">Silakan cek riwayat reservasi Anda.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Konfirmasi Reservasi</h3>
                  <p className="text-gray-500 mb-6">Anda akan memesan <strong>{selectedSpace.name}</strong>.</p>
                  
                  <div className="bg-warm-50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Harga per hari</span>
                      <span className="font-semibold text-gray-900">Rp {Number(selectedSpace.price).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipe Ruangan</span>
                      <span className="font-semibold text-gray-900">{selectedSpace.type}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">Batal</button>
                    <button onClick={confirmBooking} className="flex-1 px-4 py-3 bg-warm-500 text-white rounded-xl hover:bg-warm-600 font-medium transition-colors shadow-md shadow-warm-500/20">Konfirmasi</button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Building, CalendarCheck, Edit, Trash2, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ruangan');
  const [spaces, setSpaces] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [formData, setFormData] = useState({
    name: '', location: '', price: '', type: 'Desk', status: 'Available', imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [spacesRes, resRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/spaces', { cache: 'no-store' }),
        fetch('http://localhost:5000/api/reservations', { cache: 'no-store' }),
        fetch('http://localhost:5000/api/users', { cache: 'no-store' })
      ]);
      setSpaces(await spacesRes.json());
      setReservations(await resRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ---- SPACES ACTIONS ----
  const toggleSpaceStatus = async (space) => {
    const newStatus = space.status === 'Available' ? 'Booked' : 'Available';
    try {
      await fetch(`http://localhost:5000/api/spaces/${space.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...space, status: newStatus })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteSpace = async (id) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
      try {
        await fetch(`http://localhost:5000/api/spaces/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const openAddModal = () => {
    setEditingSpace(null);
    setFormData({ name: '', location: '', price: '', type: 'Desk', status: 'Available', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (space) => {
    setEditingSpace(space);
    setFormData({ ...space, imageUrl: space.imageUrl || '' });
    setIsModalOpen(true);
  };

  const handleSaveSpace = async (e) => {
    e.preventDefault();
    try {
      if (editingSpace) {
        await fetch(`http://localhost:5000/api/spaces/${editingSpace.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('http://localhost:5000/api/spaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // ---- RESERVATION ACTIONS ----
  const updateReservationStatus = async (res, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/reservations/${res.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'Menunggu Konfirmasi';
      case 'Confirmed': return 'Dikonfirmasi';
      case 'Cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const pendingCount = reservations.filter(r => r.status === 'Pending').length;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-warm-500 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold text-gray-800">Admin Panel</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('ruangan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'ruangan' ? 'text-warm-600 bg-warm-50' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Building size={20} /> Ruangan
            </button>
            <button 
              onClick={() => setActiveTab('reservasi')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors relative ${activeTab === 'reservasi' ? 'text-warm-600 bg-warm-50' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <CalendarCheck size={20} /> Reservasi
              {pendingCount > 0 && (
                <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('pengguna')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'pengguna' ? 'text-warm-600 bg-warm-50' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Users size={20} /> Pengguna
            </button>
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-500 w-full rounded-xl font-medium transition-colors">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Monitoring</h1>
            <p className="text-gray-500">Kelola ketersediaan ruang, reservasi, dan pengguna.</p>
          </div>
          <button onClick={handleLogout} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <LogOut size={24} />
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('ruangan')}>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><Building size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Total Ruangan</p>
              <p className="text-2xl font-bold text-gray-900">{spaces.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('reservasi')}>
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><CalendarCheck size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Total Reservasi</p>
              <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
            </div>
            {pendingCount > 0 && (
              <div className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                {pendingCount} Pending
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('pengguna')}>
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Total Pengguna</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        {/* View: RUANGAN */}
        {activeTab === 'ruangan' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Manajemen Ruangan</h2>
              <button onClick={openAddModal} className="px-4 py-2 bg-warm-500 text-white rounded-lg text-sm font-medium hover:bg-warm-600 transition-colors flex items-center gap-2">
                <Plus size={16} /> Tambah Ruangan
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Nama Ruangan</th>
                    <th className="px-6 py-4">Lokasi</th>
                    <th className="px-6 py-4">Tipe</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Harga/Hari</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {spaces.map(space => (
                    <tr key={space.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{space.name}</td>
                      <td className="px-6 py-4">{space.location}</td>
                      <td className="px-6 py-4">{space.type}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleSpaceStatus(space)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            space.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {space.status}
                        </button>
                      </td>
                      <td className="px-6 py-4">Rp {Number(space.price).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button onClick={() => openEditModal(space)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteSpace(space.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {spaces.length === 0 && (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Belum ada data ruangan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* View: RESERVASI */}
        {activeTab === 'reservasi' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Daftar Reservasi</h2>
              <p className="text-sm text-gray-500 mt-1">Kelola status booking dari pengguna. Ubah status untuk mengonfirmasi atau membatalkan.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Pengguna</th>
                    <th className="px-6 py-4">Ruangan</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Jam</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.map(res => {
                    let slots = [];
                    try { slots = JSON.parse(res.timeSlots); } catch(e) {}
                    return (
                    <tr key={res.id} className={`hover:bg-gray-50/50 ${res.status === 'Pending' ? 'bg-yellow-50/30' : ''}`}>
                      <td className="px-6 py-4">#{res.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{res.userName || 'Unknown'}</td>
                      <td className="px-6 py-4">{res.spaceName || 'Unknown'}</td>
                      <td className="px-6 py-4">{res.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {slots.map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-warm-50 text-warm-700 rounded text-[11px] font-medium border border-warm-200 whitespace-nowrap">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">Rp {Number(res.totalPrice || 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(res.status)}`}>
                          {getStatusLabel(res.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {res.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateReservationStatus(res, 'Confirmed')}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                              >
                                ✓ Konfirmasi
                              </button>
                              <button
                                onClick={() => updateReservationStatus(res, 'Cancelled')}
                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                              >
                                ✕ Batalkan
                              </button>
                            </>
                          )}
                          {res.status === 'Confirmed' && (
                            <button
                              onClick={() => updateReservationStatus(res, 'Cancelled')}
                              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                            >
                              Batalkan
                            </button>
                          )}
                          {res.status === 'Cancelled' && (
                            <button
                              onClick={() => updateReservationStatus(res, 'Confirmed')}
                              className="px-3 py-1.5 border border-green-200 text-green-600 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors"
                            >
                              Aktifkan Ulang
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ); })}
                  {reservations.length === 0 && (
                    <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">Belum ada reservasi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* View: PENGGUNA */}
        {activeTab === 'pengguna' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Daftar Pengguna</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">#{user.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </main>

      {/* Form Modal for Add/Edit Space */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-md w-full z-10 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{editingSpace ? 'Edit Ruangan' : 'Tambah Ruangan'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
              </div>
              <form onSubmit={handleSaveSpace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ruangan</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga/Hari</label>
                    <input required type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 outline-none bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="Desk">Desk</option>
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Private Office">Private Office</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar (Opsional)</label>
                  <input type="text" placeholder="https://..." className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 outline-none" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">Batal</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-warm-500 text-white rounded-xl hover:bg-warm-600 font-medium transition-colors">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

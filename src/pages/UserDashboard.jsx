import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, LogOut, CheckCircle2, CalendarDays, Clock, ClipboardList, Building, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_TIME_SLOTS = [
  { label: '08:00 - 09:00', start: '08:00', end: '09:00' },
  { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
  { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
  { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
  { label: '12:00 - 13:00', start: '12:00', end: '13:00' },
  { label: '13:00 - 14:00', start: '13:00', end: '14:00' },
  { label: '14:00 - 15:00', start: '14:00', end: '15:00' },
  { label: '15:00 - 16:00', start: '15:00', end: '16:00' },
  { label: '16:00 - 17:00', start: '16:00', end: '17:00' },
  { label: '17:00 - 18:00', start: '17:00', end: '18:00' },
  { label: '18:00 - 19:00', start: '18:00', end: '19:00' },
  { label: '19:00 - 20:00', start: '19:00', end: '20:00' },
  { label: '20:00 - 21:00', start: '20:00', end: '21:00' },
  { label: '21:00 - 22:00', start: '21:00', end: '22:00' },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ruangan');
  const [searchTerm, setSearchTerm] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [myReservations, setMyReservations] = useState([]);

  // Booking form state
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchSpaces();
    if (user) fetchMyReservations();
  }, []);

  const fetchSpaces = async () => {
    try {
      const res = await fetch('https://coworking-backend-ewaq.onrender.com/api/spaces', { cache: 'no-store' });
      const data = await res.json();
      setSpaces(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyReservations = async () => {
    try {
      const res = await fetch(`https://coworking-backend-ewaq.onrender.com/api/reservations/user/${user.id}`, { cache: 'no-store' });
      const data = await res.json();
      setMyReservations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookedSlots = async (spaceId, date) => {
    console.log('Fetching booked slots for:', spaceId, date);
    try {
      const res = await fetch(`https://coworking-backend-ewaq.onrender.com/api/reservations/booked-slots?spaceId=${spaceId}&date=${date}&_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      console.log('Received booked slots:', data);
      setBookedSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
      setBookedSlots([]);
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
    // Use local timezone for 'today'
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    setBookingDate(localDate);
    setSelectedSlots([]);
    setBookedSlots([]);
    setShowModal(true);
    setReservationSuccess(false);
    fetchBookedSlots(space.id, localDate);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setBookingDate(newDate);
    setSelectedSlots([]);
    if (selectedSpace) {
      fetchBookedSlots(selectedSpace.id, newDate);
    }
  };

  const toggleSlot = (slotLabel) => {
    setSelectedSlots(prev =>
      prev.includes(slotLabel)
        ? prev.filter(s => s !== slotLabel)
        : [...prev, slotLabel]
    );
  };

  const isSlotBooked = (slotLabel) => {
    return Array.isArray(bookedSlots) && bookedSlots.includes(slotLabel);
  };

  const getTotalPrice = () => {
    if (!selectedSpace) return 0;
    return selectedSlots.length * selectedSpace.price;
  };

  const confirmBooking = async () => {
    if (!bookingDate || selectedSlots.length === 0) return;
    try {
      await fetch('https://coworking-backend-ewaq.onrender.com/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user ? user.id : 2,
          spaceId: selectedSpace.id,
          date: bookingDate,
          timeSlots: selectedSlots,
          totalPrice: getTotalPrice()
        })
      });
      setReservationSuccess(true);
      fetchSpaces();
      fetchMyReservations();
      setTimeout(() => {
        setShowModal(false);
        setReservationSuccess(false);
        setSelectedSpace(null);
        setBookingDate('');
        setSelectedSlots([]);
        setBookedSlots([]);
        setActiveTab('pemesanan');
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
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

  const parseTimeSlots = (timeSlotsStr) => {
    try {
      return JSON.parse(timeSlotsStr);
    } catch {
      return [];
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch {
      return dateString;
    }
  };

  const availableCount = ALL_TIME_SLOTS.filter(s => !isSlotBooked(s.label)).length;

  return (
    <div className="min-h-screen bg-warm-50 pb-12">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-warm-500 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="text-xl font-bold text-gray-800">CoWork</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('ruangan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'ruangan' ? 'bg-white text-warm-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Building size={16} />
              <span className="hidden sm:inline">Ruangan</span>
            </button>
            <button
              onClick={() => { setActiveTab('pemesanan'); fetchMyReservations(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${activeTab === 'pemesanan' ? 'bg-white text-warm-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ClipboardList size={16} />
              <span className="hidden sm:inline">Pemesanan</span>
              {myReservations.filter(r => r.status === 'Pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {myReservations.filter(r => r.status === 'Pending').length}
                </span>
              )}
            </button>
          </nav>

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

        {/* === TAB: RUANGAN === */}
        {activeTab === 'ruangan' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                        <span className="text-gray-500 text-sm">/jam</span>
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
          </motion.div>
        )}

        {/* === TAB: PEMESANAN === */}
        {activeTab === 'pemesanan' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pemesanan Saya</h1>
              <p className="text-gray-600">Riwayat dan status booking ruang kerja Anda.</p>
            </div>

            {myReservations.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList size={36} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pemesanan</h3>
                <p className="text-gray-500 mb-6">Anda belum melakukan booking. Cari dan pesan ruang kerja yang sesuai.</p>
                <button
                  onClick={() => setActiveTab('ruangan')}
                  className="px-6 py-3 bg-warm-500 text-white rounded-xl font-medium hover:bg-warm-600 transition-colors"
                >
                  Cari Ruangan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myReservations.map((res, index) => {
                  const slots = parseTimeSlots(res.timeSlots);
                  return (
                    <motion.div
                      key={res.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        {res.spaceImage && (
                          <div className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                            <img src={res.spaceImage} alt={res.spaceName} className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{res.spaceName || 'Ruangan Dihapus'}</h3>
                              {res.spaceLocation && (
                                <div className="flex items-center text-gray-500 text-sm mt-1">
                                  <MapPin size={14} className="mr-1" />
                                  {res.spaceLocation}
                                </div>
                              )}
                            </div>
                            <span className={`inline-flex items-center self-start px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusBadge(res.status)}`}>
                              {res.status === 'Pending' && <Clock size={12} className="mr-1.5" />}
                              {res.status === 'Confirmed' && <CheckCircle2 size={12} className="mr-1.5" />}
                              {getStatusLabel(res.status)}
                            </span>
                          </div>

                          {/* Date */}
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <CalendarDays size={16} className="text-warm-500" />
                            <span className="font-medium">{formatDate(res.date)}</span>
                          </div>

                          {/* Time Slots */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {slots.map((slot, i) => (
                              <div key={i} className="px-3 py-1.5 bg-warm-50 border border-warm-200 rounded-lg text-xs font-medium text-warm-700 flex items-center gap-1.5">
                                <Clock size={12} />
                                {slot}
                              </div>
                            ))}
                          </div>

                          {/* Total Price */}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-gray-500">{slots.length} slot × Rp {Number(res.spacePrice || 0).toLocaleString('id-ID')}</span>
                            <span className="text-lg font-bold text-gray-900">Rp {Number(res.totalPrice || 0).toLocaleString('id-ID')}</span>
                          </div>

                          {res.status === 'Pending' && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-700">
                              ⏳ Booking Anda sedang menunggu konfirmasi dari admin.
                            </div>
                          )}
                          {res.status === 'Confirmed' && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
                              ✅ Booking Anda telah dikonfirmasi. Selamat bekerja!
                            </div>
                          )}
                          {res.status === 'Cancelled' && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                              ❌ Booking Anda telah dibatalkan oleh admin.
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

      </main>

      {/* === BOOKING MODAL with Time Slot Cards === */}
      <AnimatePresence>
        {showModal && selectedSpace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !reservationSuccess && setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-2xl w-full z-10 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">

              {reservationSuccess ? (
                <div className="text-center py-16 px-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil!</h3>
                  <p className="text-gray-500">Silakan cek menu <strong>Pemesanan</strong> untuk status booking Anda.</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Booking {selectedSpace.name}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <MapPin size={14} /> {selectedSpace.location} · {selectedSpace.type}
                    </p>
                  </div>

                  {/* Scrollable Content */}
                  <div className="overflow-y-auto flex-1 p-6">
                    {/* Date Picker */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <CalendarDays size={16} className="inline mr-2 text-warm-500" />
                        Pilih Tanggal
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-400 focus:border-transparent outline-none transition-shadow"
                      />
                    </div>

                    {/* Available count badge */}
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-warm-500 text-white rounded-full text-sm font-semibold">
                        {availableCount} Jadwal Tersedia
                      </div>
                    </div>

                    {/* Time Slot Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {ALL_TIME_SLOTS.map((slot) => {
                        const booked = isSlotBooked(slot.label);
                        const selected = selectedSlots.includes(slot.label);
                        return (
                          <button
                            key={slot.label}
                            type="button"
                            disabled={booked}
                            onClick={() => toggleSlot(slot.label)}
                            className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                              booked
                                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                : selected
                                  ? 'border-warm-500 bg-warm-50 shadow-md'
                                  : 'border-gray-200 bg-white hover:border-warm-300 hover:bg-warm-50/50'
                            }`}
                          >
                            {/* Checkmark badge */}
                            {selected && (
                              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-warm-500 rounded-full flex items-center justify-center shadow-sm">
                                <Check size={14} className="text-white" strokeWidth={3} />
                              </div>
                            )}

                            <div className={`text-[10px] font-medium mb-1 ${booked ? 'text-gray-400' : selected ? 'text-warm-600' : 'text-gray-400'}`}>
                              60 Menit
                            </div>
                            <div className={`text-sm font-bold mb-1 ${booked ? 'text-gray-400' : selected ? 'text-warm-700' : 'text-gray-800'}`}>
                              {slot.label}
                            </div>
                            <div className={`text-xs font-medium ${booked ? 'text-gray-400' : selected ? 'text-warm-600' : 'text-gray-500'}`}>
                              {booked ? 'Booked' : `Rp${Number(selectedSpace.price).toLocaleString('id-ID')}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer - Summary & Actions */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    {selectedSlots.length > 0 && (
                      <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Jadwal dipilih</span>
                          <span className="text-sm font-semibold text-warm-600">{selectedSlots.length} slot</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {selectedSlots.sort().map(s => (
                            <span key={s} className="px-2 py-1 bg-warm-50 text-warm-700 rounded-md text-xs font-medium border border-warm-200">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-600">{selectedSlots.length} × Rp {Number(selectedSpace.price).toLocaleString('id-ID')}</span>
                          <span className="text-xl font-bold text-gray-900">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">Batal</button>
                      <button
                        onClick={confirmBooking}
                        disabled={!bookingDate || selectedSlots.length === 0}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                          bookingDate && selectedSlots.length > 0
                            ? 'bg-warm-500 text-white hover:bg-warm-600 shadow-md shadow-warm-500/20'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Konfirmasi Booking
                      </button>
                    </div>
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

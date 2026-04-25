import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connected to Supabase via JS Client');

// --- API ROUTES ---

// LOGIN
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role, name')
    .eq('username', username)
    .eq('password', password);

  if (error) return res.status(500).json({ error: error.message });
  if (data && data.length > 0) res.json(data[0]);
  else res.status(401).json({ error: 'Invalid credentials' });
});

// REGISTER
app.post('/api/register', async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Semua field (username, password, nama) harus diisi' });
  }

  // Check username exists
  const { data: userCheck } = await supabase.from('users').select('id').eq('username', username);
  if (userCheck && userCheck.length > 0) return res.status(400).json({ error: 'Username sudah digunakan' });

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password, role: 'user', name }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data[0].id, username, role: 'user', name });
});

// SPACES
app.get('/api/spaces', async (req, res) => {
  const { data, error } = await supabase.from('spaces').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  
  const formatted = data.map(r => ({ ...r, features: JSON.parse(r.features), isRemoteFriendly: Boolean(r.isRemoteFriendly) }));
  res.json(formatted);
});

app.post('/api/spaces', async (req, res) => {
  const { name, location, price, type, status, imageUrl, features, isRemoteFriendly } = req.body;
  const payload = {
    name, location, price, rating: 5.0, status, type, 
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', 
    features: JSON.stringify(features || []), 
    isRemoteFriendly: isRemoteFriendly ? true : false
  };

  const { data, error } = await supabase.from('spaces').insert([payload]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data[0].id });
});

app.put('/api/spaces/:id', async (req, res) => {
  const { name, location, price, type, status, imageUrl } = req.body;
  const payload = { name, location, price, type, status, imageUrl };
  const { data, error } = await supabase.from('spaces').update(payload).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ changes: 1 });
});

app.delete('/api/spaces/:id', async (req, res) => {
  const { error } = await supabase.from('spaces').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ changes: 1 });
});

// RESERVATIONS
app.get('/api/reservations', async (req, res) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      spaces!inner (name, location, type, price, imageUrl),
      users!inner (name)
    `)
    .order('id', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const rows = data.map(r => ({
    id: r.id,
    userId: r.userId,
    spaceId: r.spaceId,
    date: r.date,
    timeSlots: r.timeSlots,
    totalPrice: r.totalPrice,
    status: r.status,
    spaceName: r.spaces?.name,
    spaceLocation: r.spaces?.location,
    spaceType: r.spaces?.type,
    spacePrice: r.spaces?.price,
    userName: r.users?.name
  }));
  res.json(rows);
});

// USER-SPECIFIC RESERVATIONS
app.get('/api/reservations/user/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      spaces!inner (name, location, type, price, imageUrl)
    `)
    .eq('userId', req.params.userId)
    .order('id', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const rows = data.map(r => ({
    id: r.id,
    userId: r.userId,
    spaceId: r.spaceId,
    date: r.date,
    timeSlots: r.timeSlots,
    totalPrice: r.totalPrice,
    status: r.status,
    spaceName: r.spaces?.name,
    spaceLocation: r.spaces?.location,
    spaceType: r.spaces?.type,
    spacePrice: r.spaces?.price,
    spaceImage: r.spaces?.imageUrl
  }));
  res.json(rows);
});

// GET BOOKED SLOTS for a specific space and date
app.get('/api/reservations/booked-slots', async (req, res) => {
  const { spaceId, date } = req.query;
  const { data, error } = await supabase
    .from('reservations')
    .select('timeSlots')
    .eq('spaceId', spaceId)
    .eq('date', date)
    .neq('status', 'Cancelled');

  if (error) return res.status(500).json({ error: error.message });

  let bookedSlots = [];
  data.forEach(row => {
    try {
      const slots = JSON.parse(row.timeSlots);
      bookedSlots = bookedSlots.concat(slots);
    } catch(e) {}
  });
  res.json(bookedSlots);
});

app.post('/api/reservations', async (req, res) => {
  const { userId, spaceId, date, timeSlots, totalPrice, status } = req.body;
  const payload = {
    userId, spaceId, date, timeSlots: JSON.stringify(timeSlots || []), totalPrice: totalPrice || 0, status: status || 'Pending'
  };
  const { data, error } = await supabase.from('reservations').insert([payload]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data[0].id });
});

app.put('/api/reservations/:id', async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase.from('reservations').update({ status }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ changes: 1 });
});

// USERS
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('id, username, role, name').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;

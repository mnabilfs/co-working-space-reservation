export const users = [
  { id: 1, username: 'admin', password: 'password', role: 'admin', name: 'Admin Utama' },
  { id: 2, username: 'user', password: 'password', role: 'user', name: 'Pengguna Biasa' }
];

export const coworkingSpaces = [
  {
    id: 1,
    name: "Co-work Hub Jakarta",
    location: "Jakarta Selatan, Indonesia",
    price: 150000,
    rating: 4.8,
    status: "Available",
    type: "Desk",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    features: ["High-speed Wi-Fi", "Free Coffee", "Meeting Room Access"],
    isRemoteFriendly: true,
  },
  {
    id: 2,
    name: "Quiet Zone Bandung",
    location: "Bandung, Indonesia",
    price: 120000,
    rating: 4.6,
    status: "Booked",
    type: "Meeting Room",
    imageUrl: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=800",
    features: ["Whiteboard", "Projector", "Soundproof"],
    isRemoteFriendly: true,
  },
  {
    id: 3,
    name: "Global Connect Bali",
    location: "Canggu, Bali",
    price: 200000,
    rating: 4.9,
    status: "Available",
    type: "Desk",
    imageUrl: "https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=800",
    features: ["Ocean View", "Ergonomic Chair", "24/7 Access"],
    isRemoteFriendly: true,
  },
  {
    id: 4,
    name: "Urban Nest Surabaya",
    location: "Surabaya, Indonesia",
    price: 100000,
    rating: 4.5,
    status: "Available",
    type: "Desk",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=800",
    features: ["Free Printing", "Lounge Area"],
    isRemoteFriendly: false,
  }
];

export const reservations = [
  {
    id: 1,
    userId: 2,
    spaceId: 2,
    date: "2026-04-25",
    status: "Confirmed"
  }
];

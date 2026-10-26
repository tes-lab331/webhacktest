// data.js
// "Database" palsu. Ini cuma array JavaScript biasa, bukan database sungguhan.
// Dipakai supaya demo bisa jalan di GitHub Pages (hosting statis, tanpa server/database asli).

const USERS = [
  { id: 1, username: "admin",  password: "S4ngatRahasia!", nama: "Admin Warung", role: "admin", saldo: 58250000, email: "admin@warungaman.id" },
  { id: 2, username: "budi",   password: "budi123",        nama: "Budi Santoso", role: "user",  saldo: 245000,   email: "budi@example.com" },
  { id: 3, username: "sari",   password: "sari456",        nama: "Sari Wulandari", role: "user", saldo: 1750000, email: "sari@example.com" },
];

// Beberapa "review produk" awal untuk demo stored XSS
const SEED_REVIEWS = [
  { nama: "Budi", teks: "Barangnya bagus, pengiriman cepat!" },
  { nama: "Sari", teks: "Sesuai deskripsi, recommended." },
];

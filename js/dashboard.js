// dashboard.js
// ===========================================================================
// RENTAN (BROKEN ACCESS CONTROL / IDOR): halaman ini mengambil "id" langsung
// dari URL (?id=2) lalu menampilkan data user dengan id tersebut -- TANPA
// mengecek apakah id itu benar-benar milik orang yang sedang login.
// Akibatnya siapa pun yang sedang login bisa mengubah angka di address bar
// dan melihat data milik akun lain. Ini contoh A01: Broken Access Control.
//
// Perbaikan sebenarnya: server harus selalu mencocokkan sesi login dengan
// id yang diminta, bukan percaya begitu saja pada id di URL.
// ===========================================================================

function loadProfile() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = parseInt(params.get("id"), 10);
  const session = JSON.parse(localStorage.getItem("demo_session") || "null");

  const box = document.getElementById("profileBox");
  const warn = document.getElementById("idorWarning");

  if (!requestedId) {
    box.innerHTML = `<p>Tambahkan <code>?id=1</code>, <code>?id=2</code>, atau <code>?id=3</code> di belakang URL untuk melihat profil.</p>`;
    return;
  }

  const user = USERS.find((u) => u.id === requestedId);
  if (!user) {
    box.innerHTML = `<p>User dengan id ${requestedId} tidak ditemukan.</p>`;
    return;
  }

  if (session && session.id !== requestedId) {
    warn.style.display = "block";
    warn.textContent = `⚠️ Kamu login sebagai "${session.username}" (id=${session.id}), tapi halaman ini tetap menampilkan data milik id=${requestedId} tanpa izin. Seharusnya server menolak permintaan ini.`;
  }

  box.innerHTML = `
    <table>
      <tr><th>ID</th><td>${user.id}</td></tr>
      <tr><th>Nama</th><td>${user.nama}</td></tr>
      <tr><th>Username</th><td>${user.username}</td></tr>
      <tr><th>Email</th><td>${user.email}</td></tr>
      <tr><th>Role</th><td>${user.role}</td></tr>
      <tr><th>Saldo</th><td>Rp ${user.saldo.toLocaleString("id-ID")}</td></tr>
    </table>`;
}

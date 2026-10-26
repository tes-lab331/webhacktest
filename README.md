# Demo Kerentanan Web — Kelompok 9

Situs statis (HTML/CSS/JS, tanpa backend) untuk dipraktekkan langsung saat presentasi
"Keamanan dan Privasi Web Modern". Dibuat **sengaja rentan** untuk tujuan edukasi.
Jangan dipakai sebagai contoh kode untuk proyek sungguhan, dan jangan isi dengan data asli.

## Cara pakai di GitHub Pages

1. Buat repository baru di GitHub, upload semua isi folder ini (index.html, dashboard.html,
   reviews.html, debug.html, robots.txt, folder css/ dan js/).
2. Buka **Settings → Pages**, pilih branch `main` dan folder `/root`, lalu Save.
3. Tunggu 1-2 menit, situs akan aktif di `https://<username>.github.io/<nama-repo>/`.
4. Data demo (login, ulasan) tersimpan di `localStorage` browser masing-masing pengunjung,
   jadi aman dicoba berkali-kali — tinggal klik "Reset ulasan" atau buka mode incognito untuk
   mengembalikan ke kondisi awal.

## Alur demo (±10 menit, sesuai slide "Aktivitas")

### 1. SQL Injection — halaman Masuk (`index.html`)
- Login normal dulu: username `budi`, password `budi123` → berhasil biasa.
- Logout (atau buka tab baru/incognito), lalu coba serangan:
  username `budi`, password `' OR '1'='1`
- Tunjukkan query yang muncul di kotak hitam, jelaskan kenapa `OR '1'='1'` membuat
  kondisinya selalu benar — sama seperti contoh di slide "Contoh SQL Injection".
- Kaitkan ke pencegahan: *prepared statement* memisahkan perintah dari isian, jadi input
  seperti ini tidak pernah dianggap sebagai bagian perintah.

### 2. Broken Access Control / IDOR — halaman Profil (`dashboard.html`)
- Setelah login sebagai budi, klik "Lanjut ke dashboard" (otomatis ke `?id=2`).
- Ubah angka di address bar jadi `?id=1` atau `?id=3` → data user lain (termasuk saldo admin)
  ikut terlihat, padahal tidak login sebagai mereka.
- Kaitkan ke pencegahan: server harus selalu memverifikasi "apakah orang ini berhak melihat
  data ini", bukan percaya begitu saja pada id yang diminta.

### 3. Stored XSS — halaman Ulasan Produk (`reviews.html`)
- Kirim ulasan biasa dulu untuk menunjukkan fitur normal.
- Lalu kirim ulasan berisi:
  `<script>alert('Halaman ini kena XSS')</script>`
  atau yang lebih halus (kalau browser memblokir tag script di demo tertentu):
  `<img src=x onerror="alert('XSS lewat gambar rusak')">`
- Refresh halaman untuk menunjukkan serangan ini "tersimpan" dan muncul lagi ke siapa pun
  yang membuka halaman tersebut.
- Kaitkan ke pencegahan: tampilkan input sebagai teks biasa (textContent), bukan HTML mentah.

### 3a. Reflected XSS lewat URL — halaman Cari Produk (`search.html`), dari Termux
Beda dengan demo di `reviews.html` (stored, lewat form), yang ini **reflected**: payload tidak
disimpan, tapi langsung "dipantulkan" begitu link dibuka. Cocok didemokan dari Termux karena
link-nya dibuat lewat terminal, bukan diketik di form.

1. Di Termux, siapkan payload dan encode supaya aman dipakai di URL:
   ```bash
   PAYLOAD="<img src=x onerror=\"alert('XSS dari Termux!')\">"
   ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$PAYLOAD")
   URL="https://tes-lab331.github.io/webhacktest/search.html?q=$ENC"
   echo "$URL"
   ```
2. **Penting soal curl**: situs ini statis (tidak ada server yang memproses `?q=`), jadi payload
   baru "ditempel" ke halaman oleh JavaScript di browser, bukan oleh server. Artinya `curl "$URL"`
   TIDAK akan menunjukkan payload di response — yang kelihatan cuma HTML aslinya. Ini disebut
   **DOM-based XSS**. Kalau mau pakai curl untuk sesi recon, pakai untuk menunjukkan baris kode
   rentannya langsung dari sumbernya:
   ```bash
   curl -s "https://tes-lab331.github.io/webhacktest/search.html" | grep -A2 "innerHTML"
   ```
   Baris itu yang membuktikan: nilai dari URL ditempel ke HTML tanpa dibersihkan dulu.
3. Untuk benar-benar menjalankan XSS-nya (karena perlu browser, bukan cuma terminal), buka
   `$URL` di Chrome HP, atau langsung dari Termux:
   ```bash
   termux-open-url "$URL"
   ```
   (butuh paket `termux-api` terpasang)
4. Payload lengkap yang sekaligus auto-download `test.txt` dan redirect ke index (seperti demo
   `xss-download.html`), tinggal di-encode dan dipakai dengan cara yang sama:
   ```bash
   PAYLOAD="<img src=x onerror=\"alert('XSS');var a=document.createElement('a');a.href='test.txt';a.download='test.txt';document.body.appendChild(a);a.click();setTimeout(()=>location.href='index.html',2500)\">"
   ```
- Kaitkan ke pencegahan: sama seperti stored XSS, tampilkan input sebagai teks biasa
  (textContent), jangan pernah innerHTML dari data yang tidak tepercaya — termasuk dari URL.

### 3b. XSS dengan Auto-Download — halaman Demo XSS (`xss-download.html`)
- Klik link "Demo XSS + Download" di navbar.
- Halaman ini menjalankan XSS payload otomatis:
  - Alert pop-up menunjukkan XSS berhasil berjalan.
  - File `test.txt` otomatis terunduh ke folder Downloads.
  - Halaman redirect balik ke index dalam 3 detik.
- Tunjukkan ke penonton bahwa file yang diunduh itu teks biasa (tidak HTML), tapi tetap di-trigger
  dari halaman yang rentan XSS — ini simulasi bagaimana attacker bisa manipulasi download tanpa
  persetujuan pengguna.

### 4. Security Misconfiguration — halaman Debug (`debug.html`)
- Tunjukkan file `robots.txt` situs ini — baris `Disallow: /debug.html` justru membocorkan
  alamat halaman yang coba disembunyikan.
- Buka `debug.html`, tunjukkan info yang harusnya tidak pernah terbuka ke publik: password
  bawaan admin, info server, pesan error teknis.
- Kaitkan ke pencegahan: matikan mode debug di production, hapus halaman semacam ini sebelum
  rilis, jangan taruh alamat rahasia di robots.txt.

## Struktur file

```
index.html      - login (demo SQL injection)
dashboard.html   - profil (demo IDOR / broken access control)
reviews.html     - ulasan produk (demo stored XSS)
debug.html       - halaman debug bocor (demo security misconfiguration)
robots.txt       - sengaja membocorkan alamat debug.html
css/style.css    - tampilan bersama semua halaman
js/data.js       - "database" palsu (array user & ulasan)
js/login.js      - logika simulasi SQL injection
js/dashboard.js  - logika IDOR
js/reviews.js    - logika stored XSS
```

Setiap file JS punya komentar blok yang menandai bagian rentan dan menjelaskan perbaikannya,
jadi bisa langsung dibaca di layar saat presentasi kalau ingin menunjukkan kodenya.

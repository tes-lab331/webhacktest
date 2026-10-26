// reviews.js
// ===========================================================================
// RENTAN (STORED XSS): ulasan yang diketik pengguna disimpan apa adanya di
// localStorage (meniru "database"), lalu ditampilkan lagi memakai innerHTML
// TANPA dibersihkan/di-escape dulu. Kalau isinya berupa tag <script> atau
// atribut seperti onerror=, browser akan ikut menjalankannya untuk SEMUA
// orang yang membuka halaman ini -- itu sebabnya disebut "stored" (tersimpan
// dan menyerang siapa pun yang melihat halamannya, bukan cuma pengirimnya).
//
// Perbaikan sebenarnya: pakai textContent (bukan innerHTML), atau proses
// input lewat fungsi escaping sebelum ditampilkan.
// ===========================================================================

function getReviews() {
  const stored = localStorage.getItem("demo_reviews");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("demo_reviews", JSON.stringify(SEED_REVIEWS));
  return SEED_REVIEWS;
}

function saveReview(nama, teks) {
  const reviews = getReviews();
  reviews.push({ nama, teks });
  localStorage.setItem("demo_reviews", JSON.stringify(reviews));
}

function renderReviews() {
  const list = document.getElementById("reviewList");
  const reviews = getReviews();
  // VULNERABLE: innerHTML menampilkan teks ulasan sebagai HTML mentah,
  // bukan sebagai teks biasa.
  list.innerHTML = reviews
    .map(
      (r) => `
      <div class="review">
        <div class="meta">${r.nama}</div>
        <div>${r.teks}</div>
      </div>`
    )
    .join("");
}

function handleReviewSubmit(event) {
  event.preventDefault();
  const nama = document.getElementById("reviewerName").value || "Anonim";
  const teks = document.getElementById("reviewText").value;
  if (!teks.trim()) return;
  saveReview(nama, teks);
  document.getElementById("reviewText").value = "";
  renderReviews();
}

function resetReviews() {
  localStorage.setItem("demo_reviews", JSON.stringify(SEED_REVIEWS));
  renderReviews();
}

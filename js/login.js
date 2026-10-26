// login.js
// ===========================================================================
// RENTAN (SIMULASI SQL INJECTION): kode di bawah ini sengaja meniru pola
// paling umum yang bikin SQL injection terjadi di aplikasi asli, yaitu
// MEMBANGUN QUERY DENGAN MENEMPEL LANGSUNG INPUT PENGGUNA.
//
// Di aplikasi nyata query ini akan dikirim ke database sungguhan, misalnya:
//   SELECT * FROM users WHERE username='<input>' AND password='<input>'
// Di sini tidak ada database asli (GitHub Pages cuma hosting statis), jadi
// query tadi hanya ditampilkan sebagai teks, lalu "dievaluasi" oleh fungsi
// evaluateFakeQuery() di bawah -- cukup untuk menunjukkan KONSEPnya ke
// penonton, tanpa perlu server/database beneran.
// ===========================================================================

function buildQuery(username, password) {
  return `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
}

// Evaluator pseudo-SQL yang sangat sederhana: memotong query jadi daftar
// kondisi "field='nilai'" yang dipisah AND / OR, lalu mengujinya satu per
// satu ke tiap baris di USERS -- persis seperti cara database mencocokkan
// baris ke klausa WHERE, hanya tanpa parser SQL sungguhan.
function evaluateFakeQuery(query) {
  const whereClause = query.split(/WHERE/i)[1];
  // pisah berdasar OR dulu (presedensi disederhanakan: OR me-override AND di sekitarnya,
  // sama seperti contoh klasik ' OR '1'='1 di slide presentasi)
  const orParts = whereClause.split(/\sOR\s/i);

  for (const row of USERS) {
    const matches = orParts.some((orPart) => {
      const andParts = orPart.split(/\sAND\s/i);
      return andParts.every((cond) => evalCondition(cond, row));
    });
    if (matches) return row;
  }
  return null;
}

function evalCondition(cond, row) {
  cond = cond.trim();
  // kondisi tautologi seperti '1'='1'
  const tautology = cond.match(/^'([^']*)'\s*=\s*'([^']*)'$/);
  if (tautology) return tautology[1] === tautology[2];

  // kondisi field='nilai', misalnya username='budi'
  const fieldMatch = cond.match(/^(\w+)\s*=\s*'([^']*)'$/);
  if (fieldMatch) {
    const [, field, value] = fieldMatch;
    return String(row[field] ?? "") === value;
  }
  // kondisi yang tak terbaca -> anggap salah
  return false;
}

function highlightQuery(query) {
  return query
    .replace(/'/g, "<span class='tok'>&#39;</span>")
    .replace(/\bOR\b/gi, "<span class='tok'>OR</span>")
    .replace(/\bAND\b/gi, "<span class='tok'>AND</span>");
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const query = buildQuery(username, password);
  document.getElementById("queryLog").innerHTML = highlightQuery(query);

  const resultBox = document.getElementById("loginResult");
  const user = evaluateFakeQuery(query);
  const legitMatch = USERS.find(u => u.username === username && u.password === password);

  if (user && !legitMatch) {
    // berhasil login TANPA password yang benar -> ini inti dari serangannya
    resultBox.className = "result breach";
    resultBox.innerHTML =
      `⚠️ Login berhasil sebagai <b>${user.username}</b> (role: ${user.role}) ` +
      `TANPA password yang valid.<br>Query di atas selalu bernilai benar karena ` +
      `ada bagian <code>OR '1'='1'</code> yang ditempelkan lewat input, sehingga ` +
      `aplikasi mengira login sah.`;
    localStorage.setItem("demo_session", JSON.stringify(user));
    addContinueButton(resultBox, user);
  } else if (user && legitMatch) {
    resultBox.className = "result ok";
    resultBox.textContent = `Login berhasil sebagai ${user.username}.`;
    localStorage.setItem("demo_session", JSON.stringify(user));
    addContinueButton(resultBox, user);
  } else {
    resultBox.className = "result fail";
    resultBox.textContent = "Username atau password salah.";
  }
}

function addContinueButton(container, user) {
  const btn = document.createElement("button");
  btn.textContent = "Lanjut ke dashboard →";
  btn.onclick = () => (window.location.href = `dashboard.html?id=${user.id}`);
  container.appendChild(document.createElement("br"));
  container.appendChild(btn);
}

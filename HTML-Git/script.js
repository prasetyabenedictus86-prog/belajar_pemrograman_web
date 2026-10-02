console.log("File script.js berhasil jalan!");

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     0. STYLE TAMBAHAN (disuntikkan lewat JS, style.css tetap utuh)
     ========================================================== */
  const extraCss = document.createElement("style");
  extraCss.textContent = `
    /* Efek muncul saat scroll */
    .reveal { opacity: 0; transform: translateY(30px);
              transition: opacity 0.8s ease, transform 0.8s ease; }
    .reveal.tampil { opacity: 1; transform: translateY(0); }

    /* Kursor berkedip untuk efek mengetik */
    .kursor::after { content: "|"; margin-left: 4px; animation: kedip 0.7s infinite; }
    @keyframes kedip { 50% { opacity: 0; } }

    /* Tombol melayang */
    .tombol-float { width: 46px; height: 46px; border-radius: 50%; border: none;
      cursor: pointer; font-size: 20px; color: #fff;
      background: linear-gradient(135deg, #ff0055, #7f00ff);
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      transition: transform 0.2s ease; }
    .tombol-float:hover { transform: scale(1.12) rotate(8deg); }

    /* Baris tabel yang diklik */
    tr.dipilih td { background-color: rgba(255, 252, 0, 0.45); font-weight: bold; }
    tr { cursor: pointer; }
    tr:first-child { cursor: default; }

    /* Daftar hobi interaktif */
    ul li { transition: transform 0.25s ease, color 0.25s ease; cursor: pointer; }
    ul li:hover { transform: translateX(10px); color: #ff0055; }
    ul li.aktif { color: #7f00ff; font-weight: bold; }
    ul li.aktif::after { content: " \\2728"; }

    /* Kotak sapaan & pencarian */
    .kotak-info { text-align: center; font-size: 18px; }
    .kotak-info small { display: block; opacity: 0.75; margin-top: 4px; }
    .input-cari { width: 100%; box-sizing: border-box; padding: 10px;
      border: 2px solid #00c8d6; border-radius: 8px; font-size: 15px; outline: none; }
    .input-cari:focus { border-color: #ff0055; box-shadow: 0 0 8px rgba(255,0,85,0.5); }

    /* Mode gelap */
    body.dark { color: #eee; }
    body.dark > * { background-color: rgba(25, 25, 40, 0.93) !important; color: #eee; }
    body.dark h1 { color: #ff6fa5; }
    body.dark table { background-color: #1e1e2e; }
    body.dark th { background-color: #2c2c44; color: #fff; }
    body.dark td, body.dark th { border-color: #666; }
    body.dark a { color: #66d9ff; }
    body.dark .input-cari { background: #2c2c44; color: #fff; }
    body.dark .warna { background-color: transparent !important; color: #000; }
  `;
  document.head.appendChild(extraCss);

  /* ==========================================================
     1. EFEK MENGETIK PADA JUDUL (h1)
     ========================================================== */
  const judul = document.querySelector("h1");
  if (judul) {
    const teksJudul = judul.textContent.trim();
    judul.textContent = "";
    judul.classList.add("kursor");
    let i = 0;
    const ketik = setInterval(() => {
      judul.textContent = teksJudul.slice(0, ++i);
      if (i >= teksJudul.length) {
        clearInterval(ketik);
        setTimeout(() => judul.classList.remove("kursor"), 1500);
      }
    }, 80);
  }

  /* ==========================================================
     2. SAPAAN OTOMATIS + JAM DIGITAL (WIB)
     ========================================================== */
  if (judul) {
    const kotakInfo = document.createElement("div");
    kotakInfo.className = "kotak-info";
    judul.insertAdjacentElement("afterend", kotakInfo);

    const hari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const perbaruiJam = () => {
      const sekarang = new Date();
      const jam = Number(
        new Intl.DateTimeFormat("id-ID", {
          hour: "numeric",
          hour12: false,
          timeZone: "Asia/Jakarta",
        }).format(sekarang),
      );

      let sapaan = "Selamat malam";
      if (jam >= 4 && jam < 11) sapaan = "Selamat pagi";
      else if (jam >= 11 && jam < 15) sapaan = "Selamat siang";
      else if (jam >= 15 && jam < 18) sapaan = "Selamat sore";

      const tanggal = sekarang.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      });
      const waktu = sekarang.toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
      });
      const namaHari =
        hari[
          new Date(
            sekarang.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
          ).getDay()
        ];

      kotakInfo.innerHTML =
        `\u{1F44B} <b>${sapaan}, selamat datang!</b>` +
        `<small>${namaHari}, ${tanggal} &bull; ${waktu} WIB</small>`;
    };
    perbaruiJam();
    setInterval(perbaruiJam, 1000);
  }

  /* ==========================================================
     3. ANIMASI MUNCUL SAAT DI-SCROLL
        (.muncul dilewati karena sudah punya animasi sendiri)
     ========================================================== */
  const targetReveal = document.querySelectorAll(
    "body > p, body > ul, body > table, .warna",
  );
  const pengamat = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("tampil");
          pengamat.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  targetReveal.forEach((el) => {
    el.classList.add("reveal");
    pengamat.observe(el);
  });

  /* ==========================================================
     4. DAFTAR HOBI INTERAKTIF (klik untuk menandai favorit)
     ========================================================== */
  document.querySelectorAll("ul li").forEach((li) => {
    li.title = "Klik untuk tandai favorit";
    li.addEventListener("click", () => li.classList.toggle("aktif"));
  });

  /* ==========================================================
     5. TABEL TEMAN: KOLOM PENCARIAN + SOROT BARIS
     ========================================================== */
  const tabel = document.querySelector("table");
  if (tabel) {
    // Kotak pencarian
    const kotakCari = document.createElement("div");
    const input = document.createElement("input");
    input.type = "search";
    input.className = "input-cari";
    input.placeholder = "\u{1F50D} Cari teman atau kebiasaan...";
    kotakCari.appendChild(input);
    tabel.insertAdjacentElement("beforebegin", kotakCari);

    const barisData = [...tabel.querySelectorAll("tr")].slice(1); // lewati header

    // Pesan jika tidak ada hasil
    const kosong = document.createElement("tr");
    kosong.innerHTML =
      '<td colspan="2" style="text-align:center">Tidak ada yang cocok \u{1F622}</td>';
    kosong.style.display = "none";
    tabel.appendChild(kosong);

    input.addEventListener("input", () => {
      const kata = input.value.toLowerCase().trim();
      let adaHasil = false;
      barisData.forEach((tr) => {
        const cocok = tr.textContent.toLowerCase().includes(kata);
        tr.style.display = cocok ? "" : "none";
        if (cocok) adaHasil = true;
      });
      kosong.style.display = adaHasil ? "none" : "";
    });

    // Klik baris untuk menyorot
    barisData.forEach((tr) => {
      tr.addEventListener("click", () => tr.classList.toggle("dipilih"));
    });
  }

  /* ==========================================================
     6. KONFETI SAAT FOTO DIKLIK
     ========================================================== */
  const foto = document.querySelector(".muncul img");
  if (foto) {
    foto.style.cursor = "pointer";
    foto.title = "Klik aku!";
    foto.addEventListener("click", (e) => {
      const warna = ["#ff007f", "#7f00ff", "#00f0ff", "#fffc00", "#00e676"];
      for (let n = 0; n < 40; n++) {
        const k = document.createElement("span");
        k.style.cssText = `
          position:fixed; left:${e.clientX}px; top:${e.clientY}px;
          width:8px; height:8px; border-radius:2px; pointer-events:none;
          background:${warna[n % warna.length]}; z-index:9999;`;
        document.body.appendChild(k);

        const sudut = Math.random() * Math.PI * 2;
        const jarak = 80 + Math.random() * 160;
        k.animate(
          [
            { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
            {
              transform: `translate(${Math.cos(sudut) * jarak}px, ${
                Math.sin(sudut) * jarak + 120
              }px) rotate(${Math.random() * 720}deg)`,
              opacity: 0,
            },
          ],
          {
            duration: 1000 + Math.random() * 600,
            easing: "cubic-bezier(.2,.7,.4,1)",
          },
        ).onfinish = () => k.remove();
      }
    });
  }

  /* ==========================================================
     7. TOMBOL MELAYANG: MODE GELAP & KEMBALI KE ATAS
     ========================================================== */
  const wadah = document.createElement("div");
  // Inline style dipakai supaya tidak ikut style "body > *" dari style.css
  wadah.style.cssText = `
    position:fixed; right:20px; bottom:20px; display:flex; flex-direction:column;
    gap:10px; padding:0; margin:0; background:none; border:none;
    box-shadow:none; z-index:1000;`;

  const tombolGelap = document.createElement("button");
  tombolGelap.className = "tombol-float";
  tombolGelap.textContent = "\u{1F319}";
  tombolGelap.title = "Mode gelap / terang";

  const tombolAtas = document.createElement("button");
  tombolAtas.className = "tombol-float";
  tombolAtas.textContent = "\u2B06";
  tombolAtas.title = "Kembali ke atas";
  tombolAtas.style.display = "none";

  wadah.append(tombolAtas, tombolGelap);
  document.body.appendChild(wadah);

  // Mode gelap (diingat lewat localStorage)
  const setGelap = (aktif) => {
    document.body.classList.toggle("dark", aktif);
    tombolGelap.textContent = aktif ? "\u2600\uFE0F" : "\u{1F319}";
    try {
      localStorage.setItem("modeGelap", aktif ? "1" : "0");
    } catch (e) {}
  };
  try {
    setGelap(localStorage.getItem("modeGelap") === "1");
  } catch (e) {}
  tombolGelap.addEventListener("click", () =>
    setGelap(!document.body.classList.contains("dark")),
  );

  // Tombol kembali ke atas
  window.addEventListener("scroll", () => {
    tombolAtas.style.display = window.scrollY > 300 ? "block" : "none";
  });
  tombolAtas.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );

  /* ==========================================================
     8. JUDUL TAB BERUBAH SAAT PINDAH TAB
     ========================================================== */
  const judulAsli = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden
      ? "Yah, kok pergi... \u{1F622}"
      : judulAsli;
  });
});

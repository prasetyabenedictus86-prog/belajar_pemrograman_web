console.log("File script.js berhasil jalan!");

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     HELPER
     ========================================================== */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // localStorage + JSON (dibungkus try...catch)
  const simpanLS = (kunci, nilai) => {
    try {
      localStorage.setItem(kunci, JSON.stringify(nilai));
    } catch (e) {}
  };
  const bacaLS = (kunci, awal) => {
    try {
      return JSON.parse(localStorage.getItem(kunci)) ?? awal;
    } catch (e) {
      return awal;
    }
  };

  // Membuat elemen dengan cepat
  function buat(tag, kelas, teks) {
    const el = document.createElement(tag);
    if (kelas) el.className = kelas;
    if (teks) el.textContent = teks;
    return el;
  }

  const judul = $("h1");
  const tabel = $("table");
  const daftarHobi = $("body > ul");

  /* ==========================================================
     1. PROGRESS BAR SCROLL
     ========================================================== */
  const bar = buat("div");
  bar.id = "progres-scroll";
  document.body.appendChild(bar);
  window.addEventListener("scroll", () => {
    const tinggi = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (tinggi > 0 ? (window.scrollY / tinggi) * 100 : 0) + "%";
  });

  /* ==========================================================
     2. EFEK MENGETIK PADA JUDUL
     ========================================================== */
  if (judul) {
    const teksJudul = judul.textContent.trim();
    const span = buat("span", "judul-teks kursor");
    judul.textContent = "";
    judul.appendChild(span);
    let i = 0;
    const ketik = setInterval(() => {
      span.textContent = teksJudul.slice(0, ++i);
      if (i >= teksJudul.length) {
        clearInterval(ketik);
        setTimeout(() => span.classList.remove("kursor"), 1500);
      }
    }, 80);
  }

  /* ==========================================================
     3. SAPAAN OTOMATIS + JAM DIGITAL (WIB) - object Date & Intl
     ========================================================== */
  const kotakInfo = buat("div", "kotak-info");
  if (judul) judul.insertAdjacentElement("afterend", kotakInfo);

  function perbaruiJam() {
    const sekarang = new Date();
    const opsi = { timeZone: "Asia/Jakarta" };
    const jam =
      Number(
        new Intl.DateTimeFormat("id-ID", {
          ...opsi,
          hour: "numeric",
          hour12: false,
        }).format(sekarang),
      ) % 24;

    let sapaan;
    if (jam >= 4 && jam < 11) sapaan = "Selamat pagi";
    else if (jam >= 11 && jam < 15) sapaan = "Selamat siang";
    else if (jam >= 15 && jam < 18) sapaan = "Selamat sore";
    else sapaan = "Selamat malam";

    const tanggal = sekarang.toLocaleDateString("id-ID", {
      ...opsi,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const waktu = sekarang.toLocaleTimeString("id-ID", opsi);

    kotakInfo.replaceChildren();
    const b = buat("b", "", `\u{1F44B} ${sapaan}, selamat datang!`);
    const kecil = buat("small", "", `${tanggal} \u2022 ${waktu} WIB`);
    kotakInfo.append(b, kecil);
  }
  perbaruiJam();
  setInterval(perbaruiJam, 1000);

  /* ==========================================================
     4. KOTAK STATISTIK (angka naik otomatis dengan setInterval)
     ========================================================== */
  const statistik = buat("div", "statistik");
  const angkaEl = {};
  [
    ["hobi", "Hobi"],
    ["teman", "Teman"],
    ["medsos", "Medsos"],
  ].forEach(([kunci, label]) => {
    const kotak = buat("div", "stat");
    const angka = buat("span", "angka", "0");
    kotak.append(angka, document.createTextNode(label));
    statistik.appendChild(kotak);
    angkaEl[kunci] = angka;
  });
  kotakInfo.insertAdjacentElement("afterend", statistik);

  function animasiAngka(el, target) {
    let sekarang = Number(el.textContent);
    if (sekarang === target) return;
    const langkah = target > sekarang ? 1 : -1;
    const t = setInterval(() => {
      sekarang += langkah;
      el.textContent = sekarang;
      if (sekarang === target) clearInterval(t);
    }, 120);
  }

  const barisTeman = () =>
    [...tabel.tBodies[0].rows]
      .slice(1)
      .filter((r) => !r.classList.contains("baris-kosong"));
  function perbaruiStatistik() {
    animasiAngka(angkaEl.hobi, $$("body > ul li").length);
    animasiAngka(angkaEl.teman, barisTeman().length);
    animasiAngka(angkaEl.medsos, $$('a[target="_blank"]').length);
  }

  /* ==========================================================
     5. ANIMASI MUNCUL SAAT DI-SCROLL (IntersectionObserver)
     ========================================================== */
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
  $$("body > p, body > ul, body > table, .warna").forEach((el) => {
    el.classList.add("reveal");
    pengamat.observe(el);
  });

  /* ==========================================================
     6. DAFTAR HOBI: klik = favorit, tombol acak = Math.random()
     ========================================================== */
  $$("body > ul li").forEach((li) => {
    li.title = "Klik untuk tandai favorit";
    li.addEventListener("click", () => li.classList.toggle("aktif"));
  });

  if (daftarHobi) {
    const aksi = buat("div", "aksi-hobi");
    const tombol = buat("button", "tombol", "\u{1F3B2} Hobi apa hari ini?");
    tombol.type = "button";
    const hasil = buat("span");
    hasil.id = "hasil-hobi";
    aksi.append(tombol, hasil);
    daftarHobi.insertAdjacentElement("afterend", aksi);

    tombol.addEventListener("click", () => {
      const hobi = $$("body > ul li").map((li) =>
        li.textContent.replace(/\s*\u2728$/, "").trim(),
      );
      const acak = hobi[Math.floor(Math.random() * hobi.length)];
      hasil.textContent = `Hari ini cocoknya: ${acak}!`;
    });
  }

  /* ==========================================================
     7. TABEL TEMAN: cari, urutkan, sorot, dan tambah baris
     ========================================================== */
  if (tabel) {
    const tbody = tabel.tBodies[0];

    // --- Pencarian ---
    const kotakCari = buat("div");
    const input = buat("input", "input-teks");
    input.type = "search";
    input.placeholder = "\u{1F50D} Cari teman atau kebiasaan...";
    kotakCari.appendChild(input);
    tabel.insertAdjacentElement("beforebegin", kotakCari);

    const kosong = tbody.insertRow();
    kosong.className = "baris-kosong";
    const tdKosong = kosong.insertCell();
    tdKosong.colSpan = 2;
    tdKosong.style.textAlign = "center";
    tdKosong.textContent = "Tidak ada yang cocok \u{1F622}";
    kosong.style.display = "none";

    input.addEventListener("input", () => {
      const kata = input.value.toLowerCase().trim();
      let ada = false;
      barisTeman().forEach((tr) => {
        const cocok = tr.textContent.toLowerCase().includes(kata);
        tr.style.display = cocok ? "" : "none";
        if (cocok) ada = true;
      });
      kosong.style.display = ada ? "none" : "";
    });

    // --- Sorot baris (event delegation) ---
    tbody.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      if (tr && barisTeman().includes(tr)) tr.classList.toggle("dipilih");
    });

    // --- Urutkan dengan klik header (array sort) ---
    const arah = [true, true];
    $$("th").forEach((th, idx) => {
      th.title = "Klik untuk urutkan";
      th.addEventListener("click", () => {
        const urut = barisTeman().sort((a, b) => {
          const x = a.cells[idx].textContent.trim();
          const y = b.cells[idx].textContent.trim();
          return arah[idx]
            ? x.localeCompare(y, "id")
            : y.localeCompare(x, "id");
        });
        arah[idx] = !arah[idx];
        urut.forEach((tr) => tbody.insertBefore(tr, kosong));
      });
    });

    // --- Tambah teman (DOM: insertRow, insertCell) ---
    const form = buat("div");
    form.append(buat("b", "", "Tambah teman:"));
    const inNama = buat("input", "input-teks");
    inNama.placeholder = "Nama teman";
    inNama.maxLength = 20;
    const inKebiasaan = buat("input", "input-teks");
    inKebiasaan.placeholder = "Kebiasaannya";
    inKebiasaan.maxLength = 60;
    const tombolTambah = buat("button", "tombol", "Tambah");
    tombolTambah.type = "button";
    const errTambah = buat("p", "pesan-error");
    form.append(inNama, inKebiasaan, tombolTambah, errTambah);
    tabel.insertAdjacentElement("afterend", form);

    tombolTambah.addEventListener("click", () => {
      const nama = inNama.value.trim();
      const kebiasaan = inKebiasaan.value.trim();
      if (nama === "" || kebiasaan === "") {
        errTambah.textContent = "Nama dan kebiasaan wajib diisi.";
        return;
      }
      if (!/^[A-Za-z\s]{2,}$/.test(nama)) {
        errTambah.textContent = "Nama hanya boleh huruf (minimal 2).";
        return;
      }
      if (
        barisTeman().some(
          (r) =>
            r.cells[0].textContent.trim().toLowerCase() === nama.toLowerCase(),
        )
      ) {
        errTambah.textContent = "Teman dengan nama itu sudah ada.";
        return;
      }
      errTambah.textContent = "";

      const tr = tbody.insertRow(tbody.rows.length - 1); // sebelum baris "kosong"
      tr.className = "baru";
      tr.insertCell().textContent =
        nama.charAt(0).toUpperCase() + nama.slice(1);
      tr.insertCell().textContent = kebiasaan;
      inNama.value = "";
      inKebiasaan.value = "";
      perbaruiStatistik();
    });
  }

  perbaruiStatistik();

  /* ==========================================================
     8. KONFETI SAAT FOTO DIKLIK (Web Animations API)
     ========================================================== */
  const foto = $(".muncul img");
  if (foto) {
    foto.style.cursor = "pointer";
    foto.title = "Klik aku!";
    foto.addEventListener("click", (e) => {
      const warna = ["#ff007f", "#7f00ff", "#00f0ff", "#fffc00", "#00e676"];
      for (let n = 0; n < 40; n++) {
        const k = buat("span", "konfeti");
        k.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:8px;height:8px;
          border-radius:2px;pointer-events:none;background:${warna[n % warna.length]};z-index:9999;`;
        document.body.appendChild(k);
        const sudut = Math.random() * Math.PI * 2;
        const jarak = 80 + Math.random() * 160;
        k.animate(
          [
            { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
            {
              transform: `translate(${Math.cos(sudut) * jarak}px, ${Math.sin(sudut) * jarak + 120}px) rotate(${Math.random() * 720}deg)`,
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
     9. KALKULATOR IP SEMESTER (array, loop, reduce, localStorage)
     ========================================================== */
  const skrip = $('script[src="script.js"]');

  // ARRAY skala nilai: [huruf, bobot]
  const skalaNilai = [
    ["A", 4],
    ["AB", 3.5],
    ["B", 3],
    ["BC", 2.5],
    ["C", 2],
    ["D", 1],
    ["E", 0],
  ];
  const bobot = Object.fromEntries(skalaNilai);

  const ipk = buat("div", "ipk");
  ipk.append(buat("h3", "", "\u{1F393} Kalkulator IP Semester"));
  ipk.append(
    buat(
      "p",
      "info-kecil",
      "Hitung IP semestermu. Skala nilai umum (A = 4 sampai E = 0), sesuaikan dengan aturan kampus.",
    ),
  );

  const judulKolom = buat("div", "ipk-judul");
  ["Mata kuliah", "SKS", "Nilai", ""].forEach((t) =>
    judulKolom.appendChild(buat("span", "", t)),
  );
  const daftarMk = buat("div", "ipk-daftar");
  const errIpk = buat("p", "pesan-error");
  const tbTambah = buat("button", "tombol", "+ Tambah mata kuliah");
  tbTambah.type = "button";
  const tbReset = buat("button", "tombol sekunder", "Reset");
  tbReset.type = "button";
  const aksiIpk = buat("div", "ipk-aksi");
  aksiIpk.append(tbTambah, tbReset);

  const hasilIpk = buat("div", "ipk-hasil");
  const angkaIpk = buat("div", "ipk-angka", "0.00");
  const barIpk = buat("div", "ipk-bar");
  const isiIpk = buat("div", "ipk-isi");
  barIpk.appendChild(isiIpk);
  const ketIpk = buat("div", "info-kecil", "");
  hasilIpk.append(angkaIpk, barIpk, ketIpk);

  ipk.append(judulKolom, daftarMk, errIpk, aksiIpk, hasilIpk);
  skrip.insertAdjacentElement("beforebegin", ipk);

  let matkul = bacaLS("ipkMatkul", [
    { nama: "Algoritma dan Pemrograman", sks: 3, nilai: "A" },
    { nama: "Matematika Diskrit", sks: 3, nilai: "B" },
  ]);

  function hitungIpk() {
    let pesan = "";
    const valid = matkul.filter((m, i) => {
      const ok = Number.isInteger(m.sks) && m.sks >= 1 && m.sks <= 6;
      if (!ok && !pesan)
        pesan = `SKS baris ${i + 1} harus bilangan bulat 1 sampai 6.`;
      return ok;
    });
    errIpk.textContent = pesan;

    const totalSks = valid.reduce((jml, m) => jml + m.sks, 0);
    const totalMutu = valid.reduce((jml, m) => jml + m.sks * bobot[m.nilai], 0);
    const ip = totalSks ? totalMutu / totalSks : 0;

    let predikat;
    if (totalSks === 0) predikat = "Isi mata kuliah dulu.";
    else if (ip >= 3.5) predikat = "Sangat memuaskan";
    else if (ip >= 3) predikat = "Memuaskan";
    else if (ip >= 2.5) predikat = "Cukup baik";
    else predikat = "Perlu ditingkatkan";

    angkaIpk.textContent = ip.toFixed(2);
    isiIpk.style.width = (ip / 4) * 100 + "%";
    ketIpk.textContent = totalSks
      ? `${totalSks} SKS \u2022 ${predikat}`
      : predikat;
    simpanLS("ipkMatkul", matkul);
  }

  function renderMatkul() {
    daftarMk.replaceChildren();
    matkul.forEach((m, i) => {
      const baris = buat("div", "ipk-baris");

      const inNamaMk = buat("input");
      inNamaMk.placeholder = "Nama mata kuliah";
      inNamaMk.maxLength = 40;
      inNamaMk.value = m.nama;
      inNamaMk.addEventListener("input", () => {
        m.nama = inNamaMk.value;
        hitungIpk();
      });

      const inSks = buat("input");
      inSks.type = "number";
      inSks.min = 1;
      inSks.max = 6;
      inSks.value = m.sks;
      inSks.addEventListener("input", () => {
        m.sks = Number(inSks.value);
        hitungIpk();
      });

      const pilih = buat("select");
      skalaNilai.forEach(([huruf]) => {
        // LOOP membuat opsi nilai
        const opsi = buat("option", "", huruf);
        opsi.value = huruf;
        pilih.appendChild(opsi);
      });
      pilih.value = m.nilai;
      pilih.addEventListener("change", () => {
        m.nilai = pilih.value;
        hitungIpk();
      });

      const hapus = buat("button", "ipk-hapus", "\u00D7");
      hapus.type = "button";
      hapus.setAttribute("aria-label", "Hapus baris " + (i + 1));
      hapus.addEventListener("click", () => {
        matkul.splice(i, 1);
        renderMatkul();
      });

      baris.append(inNamaMk, inSks, pilih, hapus);
      daftarMk.appendChild(baris);
    });
    hitungIpk();
  }

  tbTambah.addEventListener("click", () => {
    if (matkul.length >= 12) {
      errIpk.textContent = "Maksimal 12 mata kuliah.";
      return;
    }
    matkul.push({ nama: "", sks: 2, nilai: "A" });
    renderMatkul();
  });
  tbReset.addEventListener("click", () => {
    if (confirm("Kosongkan semua mata kuliah?")) {
      matkul = [];
      renderMatkul();
    }
  });
  renderMatkul();

  /* ==========================================================
     10. PENGHITUNG KUNJUNGAN (localStorage)
     ========================================================== */
  const kunjungan = bacaLS("kunjungan", 0) + 1;
  const terakhir = bacaLS("kunjunganTerakhir", null);
  simpanLS("kunjungan", kunjungan);
  simpanLS("kunjunganTerakhir", Date.now());

  const kaki = buat("div", "kotak-info");
  kaki.appendChild(
    buat("b", "", `Kamu sudah membuka halaman ini ${kunjungan} kali.`),
  );
  kaki.appendChild(
    buat(
      "small",
      "",
      terakhir
        ? "Terakhir berkunjung: " + new Date(terakhir).toLocaleString("id-ID")
        : "Ini kunjungan pertamamu, selamat datang!",
    ),
  );
  skrip.insertAdjacentElement("beforebegin", kaki);

  /* ==========================================================
     11. TOMBOL MELAYANG: ukuran teks, mode gelap, ke atas
     ========================================================== */
  const wadah = buat("div");
  wadah.id = "tombol-float";
  const tombolKecil = buat("button", "tombol-float", "A-");
  const tombolBesar = buat("button", "tombol-float", "A+");
  const tombolGelap = buat("button", "tombol-float", "\u{1F319}");
  const tombolAtas = buat("button", "tombol-float", "\u2B06");
  tombolKecil.title = "Perkecil teks";
  tombolBesar.title = "Perbesar teks";
  tombolGelap.title = "Mode gelap / terang";
  tombolAtas.title = "Kembali ke atas";
  tombolAtas.style.display = "none";
  wadah.append(tombolAtas, tombolBesar, tombolKecil, tombolGelap);
  document.body.appendChild(wadah);

  // Ukuran teks (12px - 24px)
  let ukuran = bacaLS("ukuranTeks", 16);
  const terapkanUkuran = () => {
    document.body.style.fontSize = ukuran + "px";
    simpanLS("ukuranTeks", ukuran);
  };
  terapkanUkuran();
  tombolBesar.addEventListener("click", () => {
    ukuran = Math.min(24, ukuran + 2);
    terapkanUkuran();
  });
  tombolKecil.addEventListener("click", () => {
    ukuran = Math.max(12, ukuran - 2);
    terapkanUkuran();
  });

  // Mode gelap
  const setGelap = (aktif) => {
    document.body.classList.toggle("dark", aktif);
    tombolGelap.textContent = aktif ? "\u2600\uFE0F" : "\u{1F319}";
    simpanLS("modeGelap", aktif);
  };
  setGelap(
    bacaLS(
      "modeGelap",
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    ),
  );
  tombolGelap.addEventListener("click", () =>
    setGelap(!document.body.classList.contains("dark")),
  );

  // Kembali ke atas
  window.addEventListener("scroll", () => {
    tombolAtas.style.display = window.scrollY > 300 ? "block" : "none";
  });
  tombolAtas.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );

  /* ==========================================================
     12. JUDUL TAB BERUBAH SAAT PINDAH TAB
     ========================================================== */
  const judulAsli = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden
      ? "Yah, kok pergi... \u{1F622}"
      : judulAsli;
  });
});

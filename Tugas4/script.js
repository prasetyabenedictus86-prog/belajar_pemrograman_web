const $ = (id) => document.getElementById(id);

let data = { nama: "", jml: 0, pilihan: [], terpilih: "", email: "" };

function tampilError(idErr, pesan, ...inputs) {
  $(idErr).textContent = pesan;
  inputs.forEach((el) => el && el.classList.add("invalid"));
  if (inputs[0]) inputs[0].focus();
}
function bersihkanError(idErr, ...inputs) {
  $(idErr).textContent = "";
  inputs.forEach((el) => el && el.classList.remove("invalid"));
}
function tampil(sectionId) {
  const el = $(sectionId);
  el.hidden = false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}
function kunci(sectionId) {
  $(sectionId)
    .querySelectorAll("input, select, button")
    .forEach((el) => (el.disabled = true));
}

/* Langkah 1: Nama dan Jumlah Pilihan */
$("ok1").addEventListener("click", () => {
  const nama = $("nama").value.trim();
  const jmlStr = $("jml").value.trim();
  bersihkanError("err1", $("nama"), $("jml"));

  if (nama === "")
    return tampilError("err1", "Nama tidak boleh kosong.", $("nama"));
  if (!/^[A-Za-z\s.'-]+$/.test(nama))
    return tampilError(
      "err1",
      "Nama hanya boleh berisi huruf, spasi, titik, apostrof, atau strip.",
      $("nama"),
    );
  if (!/^\d+$/.test(jmlStr))
    return tampilError(
      "err1",
      "Jumlah Pilihan harus berupa bilangan bulat positif.",
      $("jml"),
    );
  const jml = parseInt(jmlStr, 10);
  if (jml < 1 || jml > 20)
    return tampilError(
      "err1",
      "Jumlah Pilihan harus antara 1 dan 20.",
      $("jml"),
    );

  data.nama = nama;
  data.jml = jml;
  kunci("step1");

  const wadah = $("daftarPilihan");
  wadah.innerHTML = "";
  for (let i = 1; i <= jml; i++) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<label for="p${i}">Pilihan ${i} :</label>
                    <input type="text" id="p${i}" class="teks-pilihan" placeholder="Teks Pilihan ${i}">`;
    wadah.appendChild(row);
  }
  tampil("step2");
  $("p1").focus();
});

/* Langkah 2: Teks Pilihan */
$("ok2").addEventListener("click", () => {
  const inputs = [...document.querySelectorAll(".teks-pilihan")];
  inputs.forEach((el) => el.classList.remove("invalid"));
  bersihkanError("err2");

  const nilai = inputs.map((el) => el.value.trim());
  const kosong = inputs.find((el, i) => nilai[i] === "");
  if (kosong)
    return tampilError("err2", "Semua Teks Pilihan harus diisi.", kosong);

  const lower = nilai.map((v) => v.toLowerCase());
  const idxKembar = lower.findIndex((v, i) => lower.indexOf(v) !== i);
  if (idxKembar !== -1)
    return tampilError(
      "err2",
      "Teks Pilihan tidak boleh sama.",
      inputs[idxKembar],
    );

  data.pilihan = nilai;
  kunci("step2");
  renderPilihan();
  tampil("step3");
});

/* Langkah 3: Radio Button */
function renderPilihan() {
  const wadah = $("wadahPilihan");
  wadah.innerHTML = "";
  data.pilihan.forEach((teks, i) => {
    const lbl = document.createElement("label");
    lbl.className = "inline";
    const r = document.createElement("input");
    r.type = "radio";
    r.name = "pilihan";
    r.value = teks;
    if (i === 0) r.checked = true;
    lbl.append(r, " " + teks);
    wadah.appendChild(lbl);
  });
}

$("ok3").addEventListener("click", () => {
  bersihkanError("err3");
  const radio = document.querySelector('input[name="pilihan"]:checked');
  const nilai = radio ? radio.value : "";

  if (!nilai) return tampilError("err3", "Silakan pilih salah satu pilihan.");

  data.terpilih = nilai;
  kunci("step3");
  tampil("step4");
  $("email").focus();
});

/* Langkah 4: Email (pattern matching) */
const POLA_EMAIL =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

$("ok4").addEventListener("click", () => {
  const email = $("email").value.trim();
  bersihkanError("err4", $("email"));

  if (email === "")
    return tampilError("err4", "Email tidak boleh kosong.", $("email"));
  if (!POLA_EMAIL.test(email))
    return tampilError(
      "err4",
      "Format email tidak valid (contoh: nama@domain.com).",
      $("email"),
    );

  data.email = email;
  kunci("step4");

  $("kalimat").textContent =
    `Hallo, nama saya ${data.nama}, email ${data.email} saya mempunyai sejumlah ${data.jml} pilihan yaitu ` +
    `${data.pilihan.join(", ")}, dan saya memilih ${data.terpilih}`;
  tampil("hasil");
});

$("ulang").addEventListener("click", () => location.reload());

// Enter pada input memicu tombol OK pada langkahnya
document.addEventListener("keydown", (e) => {
  if (
    e.key !== "Enter" ||
    e.target.tagName !== "INPUT" ||
    e.target.type === "radio"
  )
    return;
  const sec = e.target.closest("section");
  const btn = sec && sec.querySelector("button:not(.sekunder)");
  if (btn && !btn.disabled) btn.click();
});

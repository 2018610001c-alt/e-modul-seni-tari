(() => {
  const pages = {};
  const routes = ["beranda","petunjuk","kompetensi","unit1","unit2","unit3","evaluasi","glosarium"];
  const DB_NAME = "emodul-senitari-v21";
  const DB_VERSION = 1;
  const STORE = "attachments";
  let dbPromise = openDB();

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error("IndexedDB tidak tersedia")); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function getFile(id) {
    try {
      const db = await dbPromise;
      return await new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch { return null; }
  }
  async function putFile(id, file) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, "readwrite").objectStore(STORE).put({
        id, name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, blob: file
      });
      req.onsuccess = resolve; req.onerror = () => reject(req.error);
    });
  }
  async function removeFile(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
      req.onsuccess = resolve; req.onerror = () => reject(req.error);
    });
  }
  function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n/1024).toFixed(1)} KB`;
    return `${(n/1024/1024).toFixed(1)} MB`;
  }
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  function closeSidebar() { $("#sidebar").classList.remove("open"); $("#sidebarOverlay").classList.remove("show"); }
  function openSidebar() { $("#sidebar").classList.add("open"); $("#sidebarOverlay").classList.add("show"); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

  function header(kicker, title, description) {
    return `<div class="page-head"><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${description}</p></div>`;
  }
  function card(icon, title, text, route) {
    return `<div class="card"><div class="icon">${icon}</div><h3>${title}</h3><p>${text}</p>${route ? `<button class="btn btn-outline" data-route="${route}">Pelajari</button>` : ""}</div>`;
  }
  function steps(items) {
    return items.map((x,i) => `<div class="step"><div class="num">${i+1}</div><div><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></div></div>`).join("");
  }
  function visual(type) {
    if (type === "space") return `<div class="visual stage-space"><span>VISUAL · RUANG</span><img src="assets/penari.png" alt="Foto penari"></div>`;
    if (type === "energy") return `<div class="visual stage-energy"><span>VISUAL · GERAK</span><img src="assets/gerakan-tari.jpg" alt="Ilustrasi gerakan tari"></div>`;
    return `<div class="visual floor-photo"><span>VISUAL · POLA LANTAI</span><img src="assets/pola-lantai.jpg" alt="Pola lantai tari"></div>`;
  }
  async function attachmentBox(id, title, description, formats) {
    const item = await getFile(id);
    return `<div class="attachment-box">
      <div class="attachment-icon">📎</div>
      <div class="attachment-body">
        <div class="attachment-heading"><div><div class="eyebrow">HASIL KARYA</div><h3>${title}</h3></div><span class="status ${item ? "filled" : ""}">${item ? "Sudah terisi" : "Belum diisi"}</span></div>
        <p>${description}</p>
        <div class="accepted">Format: ${formats}</div>
        <div class="file-row"><div class="file-info"><strong>${item ? esc(item.name) : "Belum ada file"}</strong>${item ? `<small>${formatBytes(item.size)}</small>` : ""}</div>
        <label class="btn btn-primary"><input type="file" hidden data-file-input="${id}">${item ? "Ganti File" : "Pilih File"}</label>
        ${item ? `<button class="btn btn-outline" data-remove-file="${id}">Hapus</button>` : ""}</div>
      </div>
    </div>`;
  }

  function quiz(id, question, options, correct, explanation) {
    return `<div class="quiz"><div class="quiz-top"><span>SOAL ${id}</span><small>Latihan</small></div><h3>${question}</h3>${options.map(o => `<label class="option"><input type="radio" name="q${id}" value="${o[0]}">${o}</label>`).join("")}<button class="btn btn-primary" data-quiz="${id}" data-answer="${correct}" data-exp="${esc(explanation)}">Periksa Jawaban</button><div id="qresult${id}" class="feedback"></div></div>`;
  }

  pages.beranda = async () => `
    <div class="hero"><div class="hero-copy"><div class="kicker">PANDUAN PELATIHAN MANDIRI · FASE D</div><h1>Pemanfaatan Canva dan Media Digital dalam Pembelajaran Seni Tari SMP</h1><p>E-modul berbasis proyek untuk membantu guru Seni Tari mengembangkan literasi digital melalui LKPD interaktif, presentasi multimedia, video tutorial, dan portofolio digital.</p><div class="hero-actions"><button class="btn btn-primary" data-route="unit1">Mulai Belajar →</button><button class="btn btn-secondary" data-route="kompetensi">Lihat Kompetensi</button></div></div><div class="hero-art"></div></div>
    <div class="section-head"><h2>Rangkaian Pembelajaran</h2><p>Tiga unit proyek yang dipelajari secara bertahap.</p></div><div class="cards">${card("📘","Unit 1 · LKPD Digital","Menganalisis ruang, tenaga, dan waktu melalui LKPD digital interaktif.","unit1")}${card("🎬","Unit 2 · Presentasi","Merancang presentasi tari dengan video, pola lantai, dan kuis.","unit2")}${card("📱","Unit 3 · Video","Membuat video edukasi tari singkat dan portofolio digital.","unit3")}</div>
    <div class="panel"><h3>Identitas Modul</h3><div class="chips"><span>Seni Tari</span><span>SMP Fase D</span><span>Kelas VII–IX</span><span>Berbasis Proyek</span><span>Canva</span></div><p><strong>Penyusun:</strong> Yustisia Khairani, S.Pd</p></div>`;

  pages.petunjuk = async () => header("","Petunjuk Penggunaan","Gunakan menu di sebelah kiri untuk berpindah bagian. E-modul ini berfokus pada materi, proyek, evaluasi, dan lampiran hasil karya.") +
    `<div class="cards">${card("▶","Media","Area gambar/video tempat materi demonstrasi tari ditampilkan.")}${card("↗","Tautan","Tautan dapat diarahkan ke template Canva, referensi, YouTube, Google Drive, atau sumber lain.")}${card("★","Tugas","Menandai proyek yang harus dikerjakan pada akhir setiap unit.")}</div>
    <div class="panel"><h2>Alur Belajar</h2><div class="flow-steps"><div><span>1</span><strong>Pelajari materi</strong><small>Baca konsep dan contoh media.</small></div><div><span>2</span><strong>Ikuti panduan</strong><small>Kerjakan langkah di setiap unit.</small></div><div><span>3</span><strong>Buat proyek</strong><small>Hasilkan karya sesuai instruksi.</small></div><div><span>4</span><strong>Lampirkan karya</strong><small>Pilih file hasil akhir di unit terkait.</small></div><div><span>5</span><strong>Perbarui bila perlu</strong><small>Gunakan Ganti File untuk revisi.</small></div></div></div>
    <div class="panel"><h2>Cara Lampiran Hasil Karya</h2><ol><li>Pilih file hasil karya dari perangkat.</li><li>Setelah dipilih, nama file dan status <strong>Sudah terisi</strong> akan tampil.</li><li>Gunakan <strong>Ganti File</strong> jika hasil karya diperbarui.</li><li>Gunakan <strong>Hapus</strong> untuk mengosongkan lampiran.</li></ol>`;//<div class="tip">Pada versi lokal, file disimpan di browser perangkat ini. Untuk publikasi dengan pengumpulan online, area ini nantinya dapat dihubungkan ke server/Google Drive tanpa mengubah tampilan utama.</div></div>`;

  pages.kompetensi = async () => header("","Kompetensi & Capaian Pembelajaran","Tiga area kompetensi digital pendidik diterapkan melalui praktik membuat media pembelajaran.") +
    `<div class="cards">${card("01","Digital Resources","Memilih, membuat, dan memodifikasi bahan ajar tari secara digital.")}${card("02","Teaching & Learning","Mengintegrasikan perangkat digital ke dalam strategi pengajaran seni tari.")}${card("03","Facilitating Learners","Membimbing siswa memanfaatkan media digital untuk berekspresi dan berkreasi seni.")}</div><div class="panel"><h2>Capaian Pembelajaran Acuan</h2><p><strong>Mata Pelajaran:</strong> Seni Tari · <strong>Fase/Kelas:</strong> Fase D / VII–IX SMP · <strong>Elemen:</strong> Menciptakan & Mengalami.</p><div class="cp-box">Pada akhir fase ini, peserta didik mampu merangkaikan gerak tari kreasi berdasarkan unsur utama tari (tenaga, ruang, dan waktu) serta mengidentifikasi ragam gerak tari tradisi/kreasi daerah setempat.</div></div>`;

  pages.unit1 = async () => header("UNIT 1","Pengembangan LKPD Digital Interaktif Tari","Fokus: analisis unsur utama tari — tenaga, ruang, dan waktu.") +
    `<div class="unit-layout"><div class="panel"><h2>Tujuan Pembelajaran</h2><p>${EMODUL.units.unit1.objective}</p><h3>Konsep Utama</h3><div class="concepts"><div><b>Ruang</b><span>Jangkauan, level, arah hadap.</span></div><div><b>Tenaga</b><span>Kuat, sedang, lembut; kualitas gerak.</span></div><div><b>Waktu</b><span>Tempo, ritme, durasi.</span></div></div></div><div>${visual("space")}</div></div>
    <div class="panel"><h2>Uraian Materi</h2><p>Seni tari bersifat visual dan kinestetik. LKPD digital dapat menyajikan gambar gerak, diagram pola ruang, dan kolom respon interaktif.</p></div>
    <div class="panel"><h2>Panduan Praktis Canva</h2>${steps([["Langkah 1","Buka Canva, cari “LKPD” atau “Worksheet”, lalu pilih dokumen A4."],["Langkah 2","Buat header dengan judul “LKPD Interaktif: Mengamati Unsur Tari”."],["Langkah 3","Masukkan foto peragaan gerak tari dan fokuskan figur penari."],["Langkah 4","Buat tiga kolom analisis: Ruang, Tenaga, Waktu."],["Langkah 5","Simpan sebagai PDF interaktif atau bagikan sebagai tautan."]])}</div>
    <div class="project"><div>${visual("energy")}</div><div><div class="eyebrow">★ PROYEK 1</div><h2>LKPD Digital Interaktif</h2><p>Buat satu halaman LKPD yang meminta siswa menganalisis unsur ruang, tenaga, dan waktu dari dua gambar gerak tari tradisi/kreasi daerah.</p><div class="rubric"><div>Kejelasan visual gerak tari <b>Nilai 1–4</b></div><div>Ketepatan instruksi <b>Nilai 1–4</b></div><div>Estetika tata letak <b>Nilai 1–4</b></div></div></div></div>
    ${await attachmentBox("unit1-final","Lampiran Hasil Proyek 1","Unggah LKPD Digital yang telah selesai dibuat.","PDF, JPG, PNG")}`;

  pages.unit2 = async () => header("UNIT 2","Perancangan Media Presentasi Tari Interaktif","Fokus: mengidentifikasi ragam gerak tari tradisi / kreasi daerah.") +
    `<div class="unit-layout"><div class="panel"><h2>Tujuan Pembelajaran</h2><p>${EMODUL.units.unit2.objective}</p><h3>Struktur Slide</h3><ul><li>Slide apersepsi</li><li>Slide anatomi gerak</li><li>Slide pola lantai</li><li>Slide kuis interaktif</li></ul></div><div>${visual("floor")}</div></div>
    <div class="panel"><h2>Panduan Praktis Canva</h2>${steps([["Langkah 1","Pilih Presentasi (16:9)."],["Langkah 2","Masukkan video demonstrasi melalui Unggahan atau sumber YouTube yang relevan."],["Langkah 3","Buat pola lantai menggunakan Line & Shapes."],["Langkah 4","Buat kuis dengan hyperlink ke slide “Selamat!” atau “Coba Lagi!”."]])}</div>
    <div class="panel media-panel"><div class="media-demo"><video controls preload="metadata"><source src="assets/demonstrasi1.mp4" type="video/mp4">Browser tidak mendukung video.</video></div><div><div class="eyebrow">MEDIA DEMONSTRASI</div><h2>Video dalam presentasi</h2><p>Contoh video sudah dipasang agar Anda dapat melihat bentuk akhirnya. Nantinya video dapat diganti tanpa mengubah layout.</p><a class="btn btn-primary" href="${EMODUL.links.youtube}" target="_blank" rel="noopener">Buka YouTube ↗</a></div></div>
    <div class="project"><div class="slides-preview"><div>APERSEPSI</div><div>ANATOMI GERAK</div><div>POLA LANTAI</div><div>KUIS</div></div><div><div class="eyebrow">★ PROYEK 2</div><h2>Presentasi 5–8 Slide</h2><p>Dilengkapi minimal satu video demonstrasi dan satu slide kuis interaktif.</p><div class="rubric"><div>Integrasi video <b>Nilai 1–4</b></div><div>Kejelasan pola lantai <b>Nilai 1–4</b></div><div>Fungsi tautan kuis <b>Nilai 1–4</b></div></div></div></div>
    ${await attachmentBox("unit2-final","Lampiran Hasil Proyek 2","Unggah file presentasi Canva yang telah selesai.","PDF, PPTX")}`;

  pages.unit3 = async () => header("UNIT 3","Produksi Konten Video & Portofolio Digital Tari","Fokus: merangkaikan gerak dan publikasi karya siswa.") +
    `<div class="unit-layout"><div class="panel"><h2>Tujuan Pembelajaran</h2><p>${EMODUL.units.unit3.objective}</p><div class="video-timeline"><div><b>0–5 dtk</b><span>Judul & Opening</span></div><div><b>6–30 dtk</b><span>Demonstrasi lambat</span></div><div><b>31–60 dtk</b><span>Musik full</span></div></div></div><div class="phone"><div class="phone-screen"><div class="phone-title">TARI TUTORIAL</div><video controls preload="metadata"><source src="assets/demonstrasi3.mp4" type="video/mp4"></video><div class="tag">Video tutorial</div></div></div></div>
    <div class="panel"><h2>Panduan Praktis Canva Video</h2>${steps([["Langkah 1","Pilih Video Seluler / Mobile Video (1080 × 1920 px)."],["Langkah 2","Impor klip rekaman gerak tari."],["Langkah 3","Gunakan Timeline Editor untuk trim dan merangkai bagian."],["Langkah 4","Tambahkan teks penjelas nama gerak dengan Text Animation."],["Langkah 5","Tambahkan audio dan sinkronkan ketukan gerak."],["Langkah 6","Ekspor video dalam format MP4."]])}</div>
    <div class="panel portfolio"><div class="portfolio-cover"><div class="eyebrow">PORTOFOLIO DIGITAL</div><h2>Galeri Karya Tari Siswa</h2><p>Ruang untuk mendokumentasikan karya dan refleksi belajar.</p></div><div class="gallery"><div><img src="assets/penari.png" alt="Karya tari 1"><span>Gerak Tradisi</span></div><div><img src="assets/gerakan-tari.jpg" alt="Karya tari 2"><span>Kreasi Gerak</span></div><div><video controls preload="metadata"><source src="assets/demonstrasi1.mp4" type="video/mp4"></video><span>Tutorial</span></div><div><video controls preload="metadata"><source src="assets/demonstrasi2.mp4" type="video/mp4"></video><span>Dokumentasi</span></div></div></div>
    <div class="project simple"><div><div class="eyebrow">★ PROYEK 3</div><h2>Video Edukasi Tutorial Tari</h2><p>Buat satu video berdurasi 30–60 detik yang memperagakan rangkaian gerak tari kreasi/tradisi daerah.</p></div><div class="rubric"><div>Gerak + teks + musik <b>Nilai 1–4</b></div><div>Pencahayaan & rekaman <b>Nilai 1–4</b></div><div>Kepraktisan sebagai media belajar <b>Nilai 1–4</b></div></div></div>
    ${await attachmentBox("unit3-final","Lampiran Hasil Proyek 3","Unggah video edukasi tutorial tari yang sudah final.","MP4, MOV, WEBM")}`;

  pages.evaluasi = async () => header("BAGIAN III","Evaluasi & Refleksi","Gunakan lembar refleksi setelah menyelesaikan seluruh proyek.") +
    `<div class="panel"><h2>Evaluasi Diri Guru</h2><table><thead><tr><th>No.</th><th>Indikator</th><th>Refleksi</th></tr></thead><tbody>${[
      "Saya mampu merancang bahan ajar visual tari di Canva (LKPD Digital).",
      "Saya mampu mengintegrasikan video dan fitur interaktif ke dalam slide presentasi.",
      "Saya mampu menyunting video tutorial gerak tari berdurasi pendek.",
      "Saya mampu menggunakan media digital untuk memfasilitasi kreativitas tari siswa."
    ].map((x,i)=>`<tr><td>${i+1}</td><td>${x}</td><td><select><option>Pilih</option><option>Belum Mampu</option><option>Cukup Mampu</option><option>Sangat Mampu</option></select></td></tr>`).join("")}</tbody></table></div>
    <div class="section-head"><h2>Tes Formatif Akhir Modul</h2><p>Gunakan sebagai latihan pemahaman.</p></div>
    ${quiz(1,"Seorang guru ingin mengajarkan perbedaan gerak tari berintensitas Tenaga Kuat dan Tenaga Lembut. Fitur Canva manakah yang paling efektif digunakan pada LKPD Digital?",["A. Paragraf teks cerita sejarah tari.","B. Dua klip video/GIF perbandingan gerak dengan teks penjelas tingkat tenaga.","C. Tabel warna tanpa gambar.","D. Foto penari dari jarak jauh."],"B","Visual bergerak paling langsung memperlihatkan perbedaan intensitas gerak.")}
    ${quiz(2,"Saat menyusun presentasi Canva untuk materi Pola Lantai Tari Kelompok, cara terbaik agar siswa memahami lintasan pergerakan penari adalah…",["A. Koordinat posisi dalam rumus matematika.","B. Animasi garis pergerakan sesuai urutan alur tari.","C. Foto panggung kosong.","D. Rekaman audio tanpa gambar."],"B","Animasi garis membantu memperlihatkan arah dan urutan perpindahan penari.")}`;

  pages.glosarium = async () => header("BAGIAN III","Glosarium","Istilah penting yang digunakan dalam e-modul.") +
    `<div class="glossary">${[
      ["DigCompEdu","Kerangka kerja standar kompetensi digital bagi pendidik di tingkat internasional."],
      ["LKPD Digital","Lembar kerja siswa dalam bentuk file elektronik interaktif yang memuat media visual dan tautan."],
      ["Overlay Text","Teks yang ditempatkan menimpa tayangan video untuk memberikan keterangan tambahan."],
      ["Pola Lantai","Garis-garis imajiner di atas panggung yang dilalui oleh penari."],
      ["Unsur Utama Tari","Elemen dasar pembentuk tari yang meliputi tenaga, ruang, dan waktu."]
    ].map(([a,b])=>`<div class="term"><strong>${a}</strong><p>${b}</p></div>`).join("")}</div>`;

  async function render(route) {
    currentRoute = pages[route] ? route : "beranda";
    $("#content").innerHTML = await pages[currentRoute]();
    $$(".nav-item").forEach(x=>x.classList.toggle("active", x.dataset.page===currentRoute));
    bindPage(); closeSidebar(); window.scrollTo(0,0);
  }
  function bindPage() {
    $$("[data-route]").forEach(x=>x.onclick=()=>render(x.dataset.route));
    $$("[data-file-input]").forEach(inp=>inp.onchange=async e=>{
      const f=e.target.files?.[0]; if(!f) return;
      try{ await putFile(inp.dataset.fileInput,f); toast("File berhasil dilampirkan ✓"); await render(currentRoute); }
      catch(err){ console.error(err); toast("File belum dapat disimpan di browser ini."); }
    });
    $$("[data-remove-file]").forEach(btn=>btn.onclick=async()=>{ try{ await removeFile(btn.dataset.removeFile); toast("Lampiran dihapus."); await render(currentRoute); }catch{toast("Lampiran belum dapat dihapus.")} });
    $$("[data-quiz]").forEach(btn=>btn.onclick=()=>{
      const id=btn.dataset.quiz, chosen=document.querySelector(`input[name="q${id}"]:checked`), result=$(`#qresult${id}`);
      if(!chosen){toast("Pilih jawaban terlebih dahulu."); return;}
      result.className=`feedback ${chosen.value===btn.dataset.answer?"good":"bad"}`;
      result.textContent=(chosen.value===btn.dataset.answer?"Benar! ":"Belum tepat. ")+btn.dataset.exp;
    });
  }

  $("#menuBtn").onclick=openSidebar;
  $("#sidebarOverlay").onclick=closeSidebar;
  window.addEventListener("keydown", e=>{ if(e.key==="Escape") closeSidebar(); });

  // Navigation: delegated click handler so every sidebar item, including Evaluasi,
  // always routes correctly even after the page content is re-rendered.
  const sidebarNav = document.querySelector(".sidebar nav");
  if (sidebarNav) {
    sidebarNav.addEventListener("click", (e) => {
      const item = e.target.closest(".nav-item");
      if (!item) return;
      e.preventDefault();
      const page = item.dataset.page;
      if (page && pages[page]) render(page);
    });
  }

  render("beranda");
})();

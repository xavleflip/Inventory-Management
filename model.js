/* Model prototipe lokal. Semua jumlah disimpan dalam satuan terkecil (1/100). */
(() => {
  const fail = message => { throw new Error(message); };
  const id = () => crypto.randomUUID();
  const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function amount(value, positive = false) {
    const text = String(value).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(text)) fail('Gunakan angka positif dengan maksimal 2 desimal.');
    const n = Math.round(Number(text) * 100);
    if (!Number.isSafeInteger(n) || n > 9999999999 || (positive && n === 0)) fail('Jumlah tidak valid atau melebihi batas.');
    return n;
  }
  const text = (value, label) => String(value || '').trim().slice(0,255) || fail(label + ' wajib diisi.');
  function date(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value+'T00:00:00Z')) || new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value || value > today()) fail('Tanggal harus valid dan tidak melewati hari ini.');
    return value;
  }
  function actor(s, uid, owner = false) {
    const u = s.users.find(u => u.id === uid && u.active);
    if (!u || (owner && u.role !== 'pemilik')) fail('Akses ditolak untuk akun ini.');
    return u;
  }
  const balance = (s, mid, end = '9999-12-31', before = false) => {
    const m = s.materials.find(m => m.id === mid);
    return m ? m.initial + s.transactions.filter(t => t.materialId === mid && (before ? t.date < end : t.date <= end)).reduce((n,t) => n + (t.type === 'masuk' ? t.quantity : -t.quantity),0) : 0;
  };
  function nextMaterialCode(s) {
    let highest=BigInt(s.materialCodeSequence||'0');
    for(const m of s.materials) {
      const match=/^BB-(\d+)$/i.exec(m.code);
      if(match && BigInt(match[1])>highest) highest=BigInt(match[1]);
    }
    const code='BB-'+String(highest+1n).padStart(3,'0');
    if(code.length>50) fail('Nomor kode bahan telah mencapai batas. Hubungi pengelola.');
    return code;
  }
  function material(s, uid, f) {
    actor(s,uid,true);
    const old = f.id ? s.materials.find(m => m.id === f.id) : null;
    if (f.id && !old) fail('Bahan tidak ditemukan.');
    const m = {id:old?.id || id(), code:old?old.code:nextMaterialCode(s), name:text(f.name,'Nama'), unit:text(f.unit,'Satuan'), initial:amount(f.initial), minimum:amount(f.minimum)};
    if (!['kg','liter','pcs','gram'].includes(m.unit)) fail('Satuan tidak valid.');
    if (s.materials.some(x => x.id !== m.id && x.code === m.code)) fail('Kode bahan sudah digunakan.');
    if (old && s.transactions.some(t => t.materialId === m.id) && (m.initial !== old.initial || m.unit !== old.unit)) fail('Persediaan awal dan satuan terkunci karena bahan memiliki riwayat. Gunakan transaksi untuk mengubah stok.');
    if (old) Object.assign(old,m); else {s.materials.push(m);s.materialCodeSequence=String(BigInt(m.code.slice(3)));}
    return m;
  }
  function removeMaterial(s,uid,mid) {
    actor(s,uid,true);
    if(s.transactions.some(t=>t.materialId===mid)) fail('Bahan memiliki riwayat transaksi dan tidak dapat dihapus.');
    s.materials=s.materials.filter(m=>m.id!==mid);
  }
  function transact(s,uid,f) {
    const user=actor(s,uid);
    const m=s.materials.find(m=>m.id===f.materialId);
    if(!m) fail('Pilih bahan baku yang tersedia.');
    if(!['masuk','keluar','adjustment'].includes(f.type)) fail('Jenis transaksi tidak valid.');
    const t={id:id(),materialId:m.id,userId:user.id,userName:user.name,type:f.type,quantity:amount(f.quantity,true),date:date(f.date),notes:String(f.notes||'').trim().slice(0,255),reason:''};
    if(t.type==='adjustment') { if(!['Rusak','Kedaluwarsa','Hilang'].includes(f.reason)) fail('Pilih alasan penyesuaian.'); t.reason=f.reason; t.notes=text(f.notes,'Keterangan penyesuaian'); }
    // Cek seluruh lintasan saldo: transaksi mundur tanggal juga tidak boleh menghasilkan saldo negatif.
    let running=m.initial;
    const ordered=[...s.transactions.filter(x=>x.materialId===m.id),t].sort((a,b)=>a.date.localeCompare(b.date));
    for(const x of ordered) { running+=x.type==='masuk'?x.quantity:-x.quantity; if(running<0) fail('Stok tidak mencukupi pada tanggal transaksi atau transaksi setelahnya. Stok terkini: '+balance(s,m.id)/100+' '+m.unit+'.'); if(running>9999999999) fail('Stok melebihi batas penyimpanan.'); }
    s.transactions.push(t);
    return t;
  }
  async function passwordHash(password,salt) {
    const enc=new TextEncoder();
    const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
    return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function saveUser(s,uid,f) {
    actor(s,uid,true);
    const old=f.id?s.users.find(u=>u.id===f.id):null;
    if(f.id&&!old) fail('Pengguna tidak ditemukan.');
    const name=text(f.name,'Nama'),email=text(f.email,'Email').toLowerCase(),role=f.role;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Email tidak valid.');
    if(!['pemilik','karyawan'].includes(role)) fail('Peran tidak valid.');
    if(s.users.some(u=>u.id!==old?.id && u.email===email)) fail('Email sudah digunakan.');
    const active=f.active!==false;
    if(old?.id===uid && (!active || role!=='pemilik')) fail('Akun yang sedang digunakan harus tetap menjadi pemilik aktif.');
    if(old?.active && old.role==='pemilik' && (!active || role!=='pemilik') && s.users.filter(u=>u.active&&u.role==='pemilik').length===1) fail('Minimal satu pemilik harus tetap aktif.');
    let salt=old?.salt,hash=old?.hash;
    if(f.password || !old) { if(String(f.password||'').length<6) fail('Kata sandi minimal 6 karakter.'); salt=id(); hash=await passwordHash(f.password,salt); }
    const u={id:old?.id||id(),name,email,role,active,salt,hash};
    if(old) Object.assign(old,u); else s.users.push(u);
    return u;
  }
  function removeUser(s,uid,target) {
    actor(s,uid,true);
    const u=s.users.find(u=>u.id===target);
    if(!u) fail('Pengguna tidak ditemukan.');
    if(uid===target) fail('Akun yang sedang digunakan tidak dapat dihapus.');
    if(u.active&&u.role==='pemilik'&&s.users.filter(x=>x.active&&x.role==='pemilik').length===1) fail('Pemilik aktif terakhir tidak dapat dihapus.');
    if(s.transactions.some(t=>t.userId===target)) fail('Pengguna memiliki riwayat transaksi. Nonaktifkan akun melalui Ubah.');
    s.users=s.users.filter(u=>u.id!==target);
  }
  async function login(s,email,password) {
    const u=s.users.find(u=>u.active&&u.email===email.trim().toLowerCase());
    if(!u || await passwordHash(password,u.salt)!==u.hash) fail('Email atau kata sandi salah, atau akun tidak aktif.');
    return u.id;
  }
  const filter = (s,f={}) => {
    if(f.start&&f.end&&f.start>f.end) fail('Tanggal mulai tidak boleh melewati tanggal akhir.');
    return s.transactions.filter(t=>(!f.start||t.date>=f.start)&&(!f.end||t.date<=f.end)&&(!f.materialId||t.materialId===f.materialId)&&(!f.type||(f.type==='movement'?(t.type==='masuk'||t.type==='keluar'):t.type===f.type))).slice().reverse().sort((a,b)=>b.date.localeCompare(a.date));
  };
  function csv(rows) {
    return '\uFEFF'+rows.map(row=>row.map(v=>{let t=String(v??'');if(/^[\s]*[=+@-]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';}).join(',')).join('\r\n');
  }
  async function seed() {
    const s={version:1,revision:0,users:[],materials:[],transactions:[]};
    for(const [uid,name,email,role] of [['u1','Ibu Sasa','pemilik@sasacil.id','pemilik'],['u2','Budi Santoso','karyawan@sasacil.id','karyawan']]) {const salt=id();s.users.push({id:uid,name,email,role,active:true,salt,hash:await passwordHash('sasacil123',salt)});}
    [['Beras','kg',50,15],['Minyak Goreng','liter',20,10],['Telur Ayam','kg',15,8],['Daging Ayam','kg',25,10],['Gula Pasir','kg',12,5],['Tepung Terigu','kg',18,5],['Cabai Rawit','kg',6,3],['Bumbu Halus','kg',8,3]].forEach(([name,unit,initial,minimum],i)=>s.materials.push({id:'m'+i,code:'BB-'+String(i+1).padStart(3,'0'),name,unit,initial:initial*100,minimum:minimum*100}));
    for(const [mid,type,q,notes,reason] of [['m0','masuk',10,'Belanja bahan pagi'],['m1','keluar',12,'Penggorengan menu harian'],['m2','keluar',7,'Persiapan lauk telur'],['m3','keluar',8,'Menu ayam goreng'],['m6','adjustment',3,'Cabai rusak saat pemeriksaan','Rusak'],['m4','keluar',4,'Persiapan minuman']]) transact(s,'u2',{materialId:mid,type,quantity:q,date:today(),notes,reason});
    return s;
  }
  globalThis.Sasacil={amount,today,actor,balance,nextMaterialCode,material,removeMaterial,transact,saveUser,removeUser,login,filter,csv,seed};
})();

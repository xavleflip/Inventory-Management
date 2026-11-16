# Kantin Sasacil — Prototipe Manajemen Bahan Baku

Prototipe web untuk mengelola persediaan bahan baku dapur Kantin Sasacil. Aplikasi ini memperagakan pemantauan stok, pencatatan bahan masuk dan keluar, penyesuaian bahan rusak atau kedaluwarsa, laporan persediaan, serta pembagian akses pemilik usaha dan karyawan.

Prototipe ini dikembangkan untuk mendukung proposal proyek mata kuliah Kewirausahaan dan menjadi acuan interaktif bagi pengembangan aplikasi Laravel/PHP/MySQL yang direncanakan.

![Dashboard persediaan Kantin Sasacil](pratinjau-desktop.png)

## Cara Menjalankan

### Membuka langsung

1. Pastikan `index.html`, `style.css`, `model.js`, dan `app.js` berada dalam folder yang sama.
2. Buka `index.html` menggunakan browser berbasis Chromium terbaru, seperti Chrome, Edge, atau Brave.
3. Masuk menggunakan salah satu akun demo di bawah.

Aplikasi tidak memerlukan proses kompilasi, instalasi paket, konfigurasi database, atau koneksi ke CDN. Setelah berkas tersedia secara lokal, prototipe dapat dijalankan tanpa internet.

### Menggunakan server lokal

Jika browser membatasi penyimpanan berkas lokal atau Web Crypto, pastikan Python 3 tersedia, lalu jalankan perintah berikut melalui PowerShell:

```powershell
Set-Location -LiteralPath 'D:\Kuliah\Semester 5\KWU\bab 2\sasacil'
python -m http.server 8765 --bind 127.0.0.1
```

Buka [http://127.0.0.1:8765](http://127.0.0.1:8765). Tekan `Ctrl+C` pada terminal untuk menghentikan server.

Gunakan alamat dan port yang sama ketika membuka aplikasi kembali. Penyimpanan pada mode berkas lokal terpisah dari penyimpanan pada localhost.

## Akun Demo

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Pemilik usaha | `pemilik@sasacil.id` | `sasacil123` |
| Karyawan | `karyawan@sasacil.id` | `sasacil123` |

Kredensial tersebut berlaku untuk data contoh awal. Perubahan akun tetap tersimpan di browser sampai data demo diatur ulang.

## Fitur dan Hak Akses

| Fitur | Pemilik usaha | Karyawan |
| --- | --- | --- |
| Dashboard dan peringatan stok minimum | Melihat | Melihat |
| Daftar bahan, pencarian, dan filter status stok | Melihat | Melihat |
| Menambah, mengubah, dan menghapus bahan yang memenuhi syarat | Mengelola | Tidak tersedia |
| Menetapkan batas stok minimum | Mengelola | Tidak tersedia |
| Mencatat bahan masuk dan keluar | Mencatat | Mencatat |
| Menyesuaikan stok bahan rusak, kedaluwarsa, atau hilang | Mencatat | Mencatat |
| Riwayat transaksi dan filter tanggal, bahan, serta jenis transaksi | Melihat | Melihat |
| Rekap persediaan dan ekspor CSV | Tersedia | Tidak tersedia |
| Akun pengguna, peran, kata sandi, dan status aktif | Mengelola | Tidak tersedia |
| Mengatur ulang data contoh | Tersedia dengan konfirmasi | Tidak tersedia |

Tampilan menyesuaikan ukuran layar komputer maupun perangkat kecil. Tabel dan menu navigasi yang panjang dapat digeser secara horizontal di dalam areanya.

## Contoh Alur Penggunaan

1. Masuk sebagai pemilik dan tinjau **Ringkasan** untuk mengetahui bahan yang perlu diisi ulang.
2. Buka **Bahan baku** untuk menambahkan bahan beserta satuan, saldo awal, dan stok minimumnya.
3. Buka **Transaksi**, pilih **Bahan masuk**, lalu catat penerimaan bahan. Jumlah tersebut akan menambah persediaan.
4. Pilih **Bahan keluar** untuk mencatat pemakaian dapur. Jumlah yang melebihi ketersediaan akan ditolak.
5. Gunakan **Penyesuaian stok** untuk bahan rusak, kedaluwarsa, atau hilang. Sertakan alasan dan keterangan spesifik.
6. Buka **Laporan & riwayat** untuk menyaring transaksi dan mengekspor riwayat atau rekap persediaan sebagai CSV.
7. Masuk sebagai karyawan untuk memperagakan fitur pencatatan dan pembatasan akses pengelolaan.

## Aturan Persediaan

```text
Stok terkini = saldo awal + bahan masuk − bahan keluar − penyesuaian
```

- Jumlah mendukung maksimal dua angka desimal. Secara internal, model menyimpannya sebagai bilangan bulat per 1/100 satuan untuk menghindari akumulasi kesalahan perhitungan pecahan.
- Satuan yang tersedia adalah `kg`, `liter`, `pcs`, dan `gram`. Jumlah mengikuti satuan bahan yang dipilih; tidak ada konversi satuan otomatis.
- Peringatan stok minimum muncul ketika saldo **kurang dari atau sama dengan** batas yang ditetapkan.
- Bahan keluar dan penyesuaian tidak boleh menyebabkan stok negatif. Untuk transaksi mundur tanggal, sistem memeriksa lintasan saldo pada riwayat transaksi. Transaksi bertanggal sama mengikuti urutan pencatatan.
- Tanggal transaksi tidak boleh melewati hari ini berdasarkan zona waktu `Asia/Jakarta`.
- Penyesuaian mengurangi stok dan wajib dilengkapi alasan (`Rusak`, `Kedaluwarsa`, atau `Hilang`), keterangan, serta identitas pengguna pencatat.
- Bahan yang sudah memiliki transaksi tidak dapat dihapus; saldo awal dan satuannya dikunci. Kode, nama, dan batas stok minimum tetap dapat diubah.
- Pengguna yang memiliki riwayat transaksi tidak dapat dihapus; gunakan status nonaktif. Akun pemilik yang sedang digunakan dan pemilik aktif terakhir dilindungi dari perubahan yang menghilangkan akses pemilik.
- Rekap persediaan memperhitungkan seluruh jenis pergerakan dalam periode terpilih. Filter jenis transaksi hanya berlaku pada tabel riwayat.

## Teknologi dan Struktur Proyek

Prototipe menggunakan kemampuan bawaan browser agar mudah dijalankan dan diperiksa.

| Komponen | Fungsi |
| --- | --- |
| HTML dan CSS | Halaman awal, tampilan, dan tata letak responsif |
| JavaScript tanpa framework | Antarmuka, aturan persediaan, laporan, dan pengelolaan akun |
| `localStorage` | Penyimpanan data contoh pada browser dan asal situs yang digunakan |
| Web Crypto | Hash kata sandi menggunakan PBKDF2-SHA-256, salt acak, dan 100.000 iterasi |
| Blob dan URL objek | Unduhan laporan CSV |

```text
sasacil/
├── index.html              # Halaman awal aplikasi
├── style.css               # Tampilan responsif
├── model.js                # Logika stok, akun, validasi, filter, dan CSV
├── app.js                  # Antarmuka, penanganan interaksi, dan penyimpanan lokal
├── README.md               # Ringkasan proyek dan cara menjalankan
├── PETUNJUK.md             # Petunjuk penggunaan dan pemetaan kebutuhan proposal
├── VERIFIKASI.md           # Catatan hasil verifikasi sebelumnya
├── pratinjau-desktop.png   # Pratinjau tampilan komputer
└── pratinjau-mobile.png    # Pratinjau tampilan perangkat kecil
```

`model.js` menjadi tempat aturan persediaan dan akun. `app.js` menghubungkan aturan tersebut dengan antarmuka serta menyimpan perubahan. Saat mengembangkan prototipe, pertahankan validasi stok pada model agar aturan yang sama berlaku untuk seluruh formulir.

## Penyimpanan, Sesi, dan Pengaturan Ulang

Data aplikasi disimpan pada kunci `sasacil-prototype-v1` di `localStorage`. Memuat ulang halaman mempertahankan data yang tersimpan, tetapi pengguna harus masuk kembali. Tidak tersedia database server bersama atau sinkronisasi antarperangkat.

Perubahan dari tab lain membuat aplikasi meminta pengguna masuk kembali. Pemeriksaan revisi menolak benturan perubahan yang terdeteksi, tetapi belum memberikan perlindungan akses serentak yang atomik seperti transaksi database.

Untuk mengembalikan data contoh, masuk sebagai pemilik, pilih **Atur ulang data demo** pada bagian bawah halaman, lalu konfirmasikan. Tindakan ini mengganti data prototipe dengan data contoh dan mengeluarkan pengguna dari aplikasi. Ekspor laporan yang diperlukan sebelum mengatur ulang data. Berkas CSV tidak dapat diimpor untuk memulihkan data aplikasi.

## Verifikasi dan Dokumentasi

[Catatan verifikasi](VERIFIKASI.md) bertanggal 6 November 2026 mendokumentasikan 35 pemeriksaan model yang lulus serta skenario browser yang mencakup login, peran, validasi stok, penyesuaian, laporan, penyimpanan, dan tata letak responsif. Catatan tersebut merupakan hasil pemeriksaan pada waktu itu, bukan pengujian yang otomatis dijalankan setiap kali README dibuka.

Dokumentasi yang tersedia dalam folder proyek:

- [Petunjuk penggunaan dan pemetaan kebutuhan fungsional](PETUNJUK.md).
- [Hasil verifikasi](VERIFIKASI.md).
- [Pratinjau tampilan komputer](pratinjau-desktop.png).
- [Pratinjau tampilan perangkat kecil](pratinjau-mobile.png).

Laporan prototipe telah dibuat secara terpisah pada 8 November 2026, terdiri atas 24 halaman dan 18 tangkapan layar. Berkas laporan tidak disertakan dalam folder `sasacil` ini.

## Batasan Prototipe

Gunakan data contoh. Autentikasi dan pemeriksaan peran berjalan di browser, sehingga pengguna dapat mengubah JavaScript atau data yang tersimpan. Hash kata sandi saja belum menjadikan prototipe ini sistem multipengguna yang aman.

Backend Laravel/PHP/MySQL yang direncanakan dalam proposal belum diimplementasikan. Penggunaan produksi memerlukan autentikasi dan otorisasi server, validasi, sesi aman, transaksi database dan penguncian stok, pencadangan, serta konfigurasi penerapan. Prototipe ini belum memiliki endpoint API, database bersama, atau fitur pencadangan dan pemulihan otomatis.

## Penyelesaian Masalah

| Masalah | Tindakan yang disarankan |
| --- | --- |
| Aplikasi tidak berjalan saat berkas dibuka langsung | Gunakan perintah localhost di atas serta izinkan JavaScript dan penyimpanan browser. |
| Data berbeda setelah mengganti alamat atau browser | Kembali ke browser, alamat, dan port semula; penyimpanan terikat pada lingkungan tersebut. |
| Akun demo tidak dapat digunakan | Periksa apakah akun telah diubah atau dinonaktifkan. Jika tersedia, gunakan akun pemilik aktif lainnya untuk mengelolanya. |
| Transaksi stok ditolak | Periksa jumlah, satuan, tanggal, dan pergerakan stok sebelum atau sesudahnya; transaksi mundur tanggal harus mempertahankan riwayat saldo yang tidak negatif. |
| Bahan atau pengguna tidak dapat dihapus | Pertahankan data yang memiliki riwayat transaksi; nonaktifkan pengguna jika diperlukan. |
| Seluruh akses pemilik hilang pada lingkungan demo | Menghapus penyimpanan situs aplikasi akan membuat data contoh dihasilkan kembali saat halaman dimuat ulang, tetapi seluruh data lokal sebelumnya akan hilang secara permanen. |

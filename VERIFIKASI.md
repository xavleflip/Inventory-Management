# Hasil verifikasi

Dilakukan pada 6 November 2026.

- **35 pemeriksaan model lulus** dengan Node.js: kredensial benar/salah, pembatasan peran pada operasi data, angka maksimal dua desimal, hitungan tanpa galat pecahan, saldo minimum, penolakan saldo negatif, validasi tanggal, transaksi mundur tanggal, alasan penyesuaian, perlindungan master yang memiliki riwayat, akun aktif/nonaktif, filter periode dan bahan, serta escaping ekspor CSV.
- **Pengujian browser lulus** menggunakan Playwright dan Microsoft Edge yang terpasang: login salah/benar, tambah bahan, pengeluaran melebihi stok, pengeluaran valid, indikator saat saldo sama dengan minimum, penguncian saldo awal, penyesuaian bahan rusak, filter bahan, saldo akhir periode, unduhan CSV, tambah akun, login akun baru, pembatasan menu dan aksi karyawan, persistensi setelah reload, dan reset data dengan konfirmasi.
- **Responsivitas:** tidak ada overflow halaman pada lebar 320, 768, 1024, dan 1440 piksel. Tabel dan navigasi panjang dapat digeser secara horizontal dalam kontainernya.
- **Mode offline:** membuka `index.html` melalui `file://` dan masuk ke dashboard berhasil diuji.
- Tidak ada JavaScript page error yang tercatat selama skenario browser.
- Tangkapan layar desktop dan mobile disertakan; tampilan telah diperiksa secara visual.

Pengujian ini memverifikasi prototipe lokal. Belum ada audit aksesibilitas dengan screen reader, pengujian backend Laravel/MySQL, uji beban, atau pengujian keamanan produksi karena komponen tersebut tidak dibangun dalam prototipe ini.


## Pembaruan SasaStok — 16 November 2026

Catatan 6 November di atas dipertahankan sebagai riwayat versi sebelumnya. Alur reset data yang tercatat pada pemeriksaan lama telah dihapus pada pembaruan ini.

Pengujian browser pembaruan menggunakan Playwright dan Brave berbasis Chromium pada konteks terisolasi, tanpa mengubah data browser pengguna. Hasilnya lulus untuk:

- Identitas dan judul SasaStok; halaman pemilik/karyawan tanpa label prototipe/demo/simulasi.
- Login tanpa kredensial yang ditampilkan maupun tombol pengisian akun demo.
- Tidak adanya tombol atau penanganan reset data, termasuk saat aksi dipicu dari tombol buatan dalam pengujian.
- Data lama tetap terbaca dengan kunci yang sama serta utuh setelah navigasi dan pemuatan ulang.
- Login salah/benar, tambah bahan, penolakan stok negatif, transaksi valid, penyesuaian, saldo laporan, ekspor riwayat/persediaan dengan nama sasastok-, akun baru, dan pembatasan peran.
- Tidak ada overflow halaman pada lebar 320, 768, 1024, dan 1440 piksel.
- Tidak ada JavaScript page error selama skenario browser.

README diperiksa terhadap kontrol dan aturan yang tersedia. Tautan dokumen/gambar lokal diperiksa keberadaannya. Tautan hosting dicantumkan sesuai alamat yang diberikan pengelola; pembaruan lokal ini tidak mempublikasikan perubahan ke hosting. Pratinjau diperbarui berdasarkan tampilan SasaStok dengan palet yang dipilih pengelola.

Pengujian ini tidak mencakup audit screen reader, uji beban, atau keamanan server. Pembaruan tampilan tidak mengubah batas arsitektur lokal yang dijelaskan pada README.

Kontras pasangan warna teks yang diperiksa: tombol utama 5,05:1; menu aktif/status aman 6,12:1; peringatan 7,90:1; teks sidebar 11,66:1; teks sekunder pada latar krem 5,01:1. Pemeriksaan ini bukan audit aksesibilitas menyeluruh.

## Revisi masukan dosen — 20 November 2026

Pengujian menggunakan konteks browser terisolasi, tanpa mengubah data browser pengguna. Pemeriksaan model dan browser mencakup:

- Keempat kartu membuka rincian dengan filter status, rentang tanggal, dan jenis yang sesuai; kartu transaksi mengecualikan penyesuaian.
- Filter Perlu diisi ulang mencakup bahan habis dan bahan dengan persediaan sampai minimum.
- Kartu bekerja melalui klik, Enter, dan Spasi; fokus berpindah ke konten tujuan.
- Kode otomatis mengikuti nomor BB terbesar, melewati BB-999 dengan benar, tidak mengonsumsi nomor saat validasi gagal, tidak memakai ulang nomor yang telah dihapus, dan tetap berlanjut setelah data dimuat ulang.
- Kode lama dipertahankan dan pengisian kode melalui data formulir tidak dapat menimpa penomoran otomatis.
- Formulir langsung memfokuskan Nama bahan. Persediaan awal dan satuan bahan yang bertransaksi tetap terkunci.
- Istilah Persediaan awal/akhir muncul pada UI serta header ekspor CSV. Tombol pembersihan filter memakai Bersihkan filter.
- Pembatasan peran Karyawan, persistensi bahan, dan tampilan pada lebar 320, 390, 768, dan 1366 piksel.
- Pemeriksaan regresi model atas autentikasi, peran, desimal, stok negatif, tanggal, penyesuaian, akun, filter, dan CSV.
- Tidak ada JavaScript page error selama skenario browser pembaruan.

Hasil ini memverifikasi revisi lokal. Tidak mencakup publikasi ke hosting, UAT lapangan, audit screen reader, backend, atau uji beban.

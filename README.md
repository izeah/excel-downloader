
# Excel Downloader

Project ini adalah sebuah halaman web sederhana yang berfungsi untuk mengunduh file Excel dari sebuah endpoint API. Halaman ini dirancang untuk memudahkan pengguna dalam mengambil data dalam format Excel yang dihasilkan oleh backend, dengan antarmuka yang bersih dan modern.

## Fitur Utama

- **Antarmuka Minimalis**: Desain yang sederhana dan fokus pada fungsi utama, yaitu mengunduh file.
- **Input URL Dinamis**: Pengguna dapat memasukkan URL endpoint API mana pun untuk mengunduh file.
- **Penanganan Autentikasi**: Jika endpoint memerlukan autentikasi (dan mengembalikan status 401), sebuah modal login akan muncul secara otomatis. Setelah berhasil login, proses unduh akan dilanjutkan.
- **Progress Bar Real-time**: Memberikan umpan balik visual kepada pengguna selama proses unduhan berlangsung.
- **Notifikasi Status**: Modal akan muncul untuk memberitahu pengguna apakah unduhan berhasil atau gagal.
- **Desain Responsif**: Tampilan yang baik pada berbagai ukuran layar, dari desktop hingga mobile.

## Cara Menggunakan

1. **Clone atau Unduh Repositori**
   Clone atau unduh file dari repositori ini ke komputer lokal Anda.

2. **Jalankan Server Lokal**
   Karena aplikasi ini menggunakan `fetch` API untuk berkomunikasi dengan server, Anda perlu menjalankannya melalui sebuah server web lokal untuk menghindari masalah CORS. Anda bisa menggunakan ekstensi seperti **Live Server** di Visual Studio Code.

3. **Buka di Browser**
   Buka `index.html` melalui server lokal Anda (misalnya, `http://127.0.0.1:5500/index.html`).

4. **Mulai Mengunduh**
   - Masukkan URL endpoint API yang ingin Anda tuju pada kolom input.
   - Klik tombol **DOWNLOAD**.
   - Jika endpoint memerlukan login, masukkan kredensial Anda pada modal yang muncul.
   - File Excel akan terunduh secara otomatis.

## Tumpukan Teknologi

- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
- **Framework & Library**:
  - [Bootstrap 5.3](https://getbootstrap.com/): Untuk layout dan komponen antarmuka yang responsif.

## Persyaratan API

Aplikasi ini mengharapkan endpoint API memiliki perilaku sebagai berikut:

- **Metode HTTP**: `POST`
- **Respons Sukses (200 OK)**:
  - Header `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (atau tipe file Excel lainnya).
  - Header `Content-Disposition`: `attachment; filename="nama-file-anda.xlsx"` untuk menentukan nama file yang akan diunduh.
- **Respons Gagal Autentikasi (401 Unauthorized)**:
  - Mengembalikan status `401` untuk memicu modal login pada aplikasi.
- **API Login**:
  - Aplikasi ini secara default melakukan request `POST` ke `/v1/auth/login` dengan body JSON `{ "email": "...", "password": "..." }`.
  - Respons login yang sukses diharapkan mengembalikan JSON dengan format `{ "data": { "token": "..." } }`.

Anda dapat mengubah URL login dan logika autentikasi lainnya di dalam file `script.js` sesuai kebutuhan backend Anda.

---

Dibuat dengan cinta untuk mempermudah pekerjaan sehari-hari. Semoga bermanfaat!

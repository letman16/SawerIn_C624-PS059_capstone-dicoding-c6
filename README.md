# SawerIn - Platform Donasi Online

<div align="center">
  <img src="https://sawerin.hk1m.com/assets/static/images/logo.png" alt="SawerIn Logo" width="30%">
</div>

SawerIn adalah platform donasi online yang mempermudah proses donasi dan membantu lebih banyak orang.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)
- [Kontak](#kontak)

## 🌟 Fitur

- **Landing Page:** Menampilkan informasi platform.
- **Pendaftaran Pengguna:** Proses cepat dan mudah.
- **Memberi Donasi:** Donasi mudah dengan berbagai metode pembayaran.
- **Dashboard Pengguna:** Mengelola riwayat donasi dan saldo.
- **Profil Pengguna:** Mengelola informasi pribadi.
- **Akun Bank Pengguna:** Pengelolaan akun bank untuk penarikan dana.
- **Layanan Pelanggan:** Chat langsung dengan tim CS.
- **Dashboard Admin:** Pengelolaan user, transaksi, metode pembayaran, dompet dan analitik.

## 🛠️ Instalasi

Ikuti langkah-langkah berikut untuk menginstal proyek ini:

1. **Clone repositori:**
    ```sh
    git clone https://github.com/letman16/SawerIn_C624-PS059_capstone-dicoding-c6.git
    ```
2. **Masuk ke direktori proyek:**
    ```sh
    cd SawerIn_C624-PS059_capstone-dicoding-c6
    ```
3. **Instal dependensi:**
    ```sh
    npm install
    ```
4. **Buat database "sawerin" dan import database:**
    - Buat database baru bernama `sawerin` di MySQL Anda.
    - [Download database](https://drive.google.com/file/d/1modP88r1TY0vCvco8OMJBbQiW9CCybaa/view?usp=sharing) dan import ke dalam database `sawerin`.

5. **Konfigurasi server:**
    - Edit file `models/model_mysql.js` dan `models/model.js` dengan pengaturan server yang sesuai.

## 🚀 Penggunaan

Setelah instalasi dan konfigurasi, jalankan server dengan perintah berikut:

```sh
npm run start
```

Atau untuk pengembangan dengan nodemon:

```sh
npm run start-dev
```

## 🤝 Kontribusi

Kami menyambut kontribusi dari semua pihak. Untuk berkontribusi, ikuti langkah berikut:

1. Fork repositori ini.
2. Buat branch baru: git checkout -b fitur-anda.
3. Commit perubahan Anda: git commit -m 'Menambahkan fitur baru'.
4. Push ke branch: git push origin fitur-anda.
5. Buat Pull Request.
   
## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](https://opensource.org/license/mit).

## 📞 Kontak
Jika Anda memiliki pertanyaan atau masalah, jangan ragu untuk menghubungi kami di <a href="mailto:support@sawerin.my.id">support@sawerin.my.id</a>.

Terima kasih, selanjutnya akan dijelaskan pada [video demo aplikasi](https://drive.google.com/file/d/1kpv2iRedhRjRlr8j7bK2QNFWMtO6mvj0/view?usp=sharing).

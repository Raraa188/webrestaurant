# Debugging Payment Form

## Cara Mengecek Error

1. Buka aplikasi di browser: http://localhost:5173/
2. Tekan **F12** atau **Ctrl+Shift+I** untuk membuka Developer Tools
3. Klik tab **Console**
4. Lakukan langkah berikut:
   - Pilih beberapa menu
   - Tambahkan ke keranjang
   - Klik "Lanjut ke Pembayaran"
   - Isi nama (minimal 3 karakter)
   - Pilih metode pembayaran
   - Klik "Bayar & Ambil Antrian"
5. Lihat pesan di Console

## Pesan Console yang Seharusnya Muncul

Jika berhasil, Anda akan melihat:
```
Form submitted
User name: [nama yang diisi]
Payment method: [metode yang dipilih]
Cart: [array berisi item]
Calling submitOrder...
submitOrder called with: {userName: "...", paymentMethod: "...", cartLength: ...}
Creating new order: {queueNumber: 1, userName: "...", ...}
Order submitted successfully, queue number: 1
Queue number received: 1
Payment complete, calling onPaymentComplete
```

## Kemungkinan Masalah

### 1. Tombol tidak merespon
- Pastikan Anda mengklik tombol "Bayar & Ambil Antrian" (bukan tombol Batal)
- Cek apakah ada error di console

### 2. Validasi gagal
- Pastikan nama minimal 3 karakter
- Jika muncul "Validation failed" di console, periksa input nama

### 3. Cart kosong
- Jika muncul "Cart is empty", pastikan Anda sudah menambahkan item ke keranjang
- Jangan tutup/refresh halaman setelah menambahkan item

### 4. Error lainnya
- Screenshot console dan kirimkan ke developer

## Solusi Cepat

Jika masih tidak bisa, coba:
1. Refresh halaman (F5)
2. Tambahkan item ke keranjang lagi
3. Coba proses pembayaran lagi
4. Periksa console untuk error

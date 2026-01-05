// Bank service icons/placeholders
const serviceIcon = 'https://via.placeholder.com/300x200/4A90E2/ffffff?text=';

export const menuData = [
    // Layanan Teller (Quick Services)
    {
        id: 1,
        name: 'Setor Tunai',
        category: 'Layanan Teller',
        description: 'Menyetor uang tunai ke rekening tabungan atau giro',
        price: 0, // Free
        image: `${serviceIcon}Setor+Tunai`,
        prepTime: 1, // Fast
    },
    {
        id: 2,
        name: 'Tarik Tunai',
        category: 'Layanan Teller',
        description: 'Penarikan uang tunai dari rekening',
        price: 0, // Free
        image: `${serviceIcon}Tarik+Tunai`,
        prepTime: 1, // Fast
    },
    {
        id: 3,
        name: 'Transfer Antar Rekening',
        category: 'Layanan Teller',
        description: 'Transfer dana ke rekening bank lain',
        price: 6500,
        image: `${serviceIcon}Transfer`,
        prepTime: 1, // Fast
    },
    {
        id: 4,
        name: 'Pembayaran Tagihan',
        category: 'Layanan Teller',
        description: 'Pembayaran listrik, air, telepon, dan tagihan lainnya',
        price: 2500,
        image: `${serviceIcon}Bayar+Tagihan`,
        prepTime: 1, // Fast
    },
    {
        id: 5,
        name: 'Cek Saldo & Mutasi',
        category: 'Layanan Teller',
        description: 'Cetak buku tabungan dan mutasi rekening',
        price: 0, // Free
        image: `${serviceIcon}Cek+Saldo`,
        prepTime: 1, // Fast
    },

    // Layanan Customer Service
    {
        id: 6,
        name: 'Buka Rekening Baru',
        category: 'Customer Service',
        description: 'Pembukaan rekening tabungan atau giro baru',
        price: 0, // Free
        image: `${serviceIcon}Buka+Rekening`,
        prepTime: 3, // Slow
    },
    {
        id: 7,
        name: 'Pembuatan Kartu ATM',
        category: 'Customer Service',
        description: 'Pembuatan kartu ATM/Debit baru atau penggantian',
        price: 15000,
        image: `${serviceIcon}Kartu+ATM`,
        prepTime: 2, // Medium
    },
    {
        id: 8,
        name: 'Aktivasi Mobile Banking',
        category: 'Customer Service',
        description: 'Registrasi dan aktivasi layanan mobile banking',
        price: 0, // Free
        image: `${serviceIcon}Mobile+Banking`,
        prepTime: 2, // Medium
    },
    {
        id: 9,
        name: 'Pengaduan & Komplain',
        category: 'Customer Service',
        description: 'Penanganan keluhan dan pengaduan nasabah',
        price: 0, // Free
        image: `${serviceIcon}Komplain`,
        prepTime: 2, // Medium
    },
    {
        id: 10,
        name: 'Update Data Nasabah',
        category: 'Customer Service',
        description: 'Perubahan data alamat, nomor telepon, email, dll',
        price: 0, // Free
        image: `${serviceIcon}Update+Data`,
        prepTime: 2, // Medium
    },

    // Layanan Pinjaman
    {
        id: 11,
        name: 'Kredit Tanpa Agunan',
        category: 'Layanan Pinjaman',
        description: 'Pengajuan pinjaman personal tanpa jaminan',
        price: 50000, // Admin fee
        image: `${serviceIcon}KTA`,
        prepTime: 3, // Slow
    },
    {
        id: 12,
        name: 'Kredit Pemilikan Rumah',
        category: 'Layanan Pinjaman',
        description: 'Pengajuan KPR untuk pembelian rumah',
        price: 100000, // Admin fee
        image: `${serviceIcon}KPR`,
        prepTime: 3, // Slow
    },
    {
        id: 13,
        name: 'Kredit Kendaraan',
        category: 'Layanan Pinjaman',
        description: 'Pengajuan kredit untuk pembelian motor atau mobil',
        price: 75000, // Admin fee
        image: `${serviceIcon}Kredit+Motor`,
        prepTime: 3, // Slow
    },

    // Layanan Investasi
    {
        id: 14,
        name: 'Deposito Berjangka',
        category: 'Layanan Investasi',
        description: 'Pembukaan deposito dengan bunga menarik',
        price: 0, // Free
        image: `${serviceIcon}Deposito`,
        prepTime: 2, // Medium
    },
    {
        id: 15,
        name: 'Konsultasi Keuangan',
        category: 'Layanan Investasi',
        description: 'Konsultasi perencanaan keuangan dan investasi',
        price: 0, // Free
        image: `${serviceIcon}Konsultasi`,
        prepTime: 3, // Slow
    },
];

export const categories = ['All', 'Layanan Teller', 'Customer Service', 'Layanan Pinjaman', 'Layanan Investasi'];

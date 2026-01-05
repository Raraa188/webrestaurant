// Bank teller/counter data
export const tellerData = [
    {
        id: 1,
        name: 'Teller 1',
        type: 'TELLER',
        services: ['Setor Tunai', 'Tarik Tunai', 'Transfer'],
        status: 'active', // active, break, closed
        currentQueue: null
    },
    {
        id: 2,
        name: 'Teller 2',
        type: 'TELLER',
        services: ['Setor Tunai', 'Tarik Tunai', 'Transfer'],
        status: 'active',
        currentQueue: null
    },
    {
        id: 3,
        name: 'Customer Service 1',
        type: 'CS',
        services: ['Buka Rekening', 'Kartu ATM', 'Mobile Banking', 'Pengaduan'],
        status: 'active',
        currentQueue: null
    },
    {
        id: 4,
        name: 'Customer Service 2',
        type: 'CS',
        services: ['Buka Rekening', 'Kartu ATM', 'Mobile Banking', 'Pengaduan'],
        status: 'active',
        currentQueue: null
    }
];

// Service categories mapping
export const serviceCategories = {
    'TELLER': {
        name: 'Teller',
        prefix: 'T',
        icon: '💰',
        services: ['Setor Tunai', 'Tarik Tunai', 'Transfer', 'Pembayaran Tagihan']
    },
    'CS': {
        name: 'Customer Service',
        prefix: 'C',
        icon: '👤',
        services: ['Buka Rekening', 'Kartu ATM', 'Mobile Banking', 'Pengaduan']
    },
    'LOAN': {
        name: 'Pinjaman',
        prefix: 'L',
        icon: '🏠',
        services: ['KTA', 'KPR', 'Kredit Kendaraan']
    },
    'INVESTMENT': {
        name: 'Investasi',
        prefix: 'I',
        icon: '📈',
        services: ['Deposito', 'Konsultasi Keuangan']
    }
};

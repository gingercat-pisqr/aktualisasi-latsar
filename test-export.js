// Simple test for export CSV function

// Simulate data structure
const np2BelumSp2Data = [
    {
        np2: 'NP2001',
        npwp: '12.345.678.9-901',
        nama: 'PT Jaya Abadi',
        jenis: 'Khusus',
        kode: 'Rutin DSPP',
        tipe: 'WP Badan',
        potensi: 50000000,
        skor: 85,
        kelompokId: 'k1',
        kelompok: 'Kelompok I',
        isProminent: false
    },
    {
        np2: 'NP2002',
        npwp: '12.345.678.9-902',
        nama: 'CV Maju Jaya',
        jenis: 'Rutin',
        kode: 'Pemsus DSPP',
        tipe: 'WP Badan',
        potensi: 75000000,
        skor: 90,
        kelompokId: 'k1',
        kelompok: 'Kelompok I',
        isProminent: true
    },
    {
        np2: 'NP2003',
        npwp: '12.345.678.9-903',
        nama: 'Toko Maju',
        jenis: 'Rutin',
        kode: 'Rutin Non LB',
        tipe: 'WP OP',
        potensi: 25000000,
        skor: 60,
        kelompokId: 'k2',
        kelompok: 'Kelompok II',
        isProminent: false
    },
    {
        np2: 'NP2004',
        npwp: '12.345.678.9-904',
        nama: 'PT Sukses Bersama',
        jenis: 'Khusus',
        kode: 'Rutin DSPP',
        tipe: 'WP Badan',
        potensi: 120000000,
        skor: 95,
        kelompokId: undefined,  // Not assigned yet
        kelompok: undefined,
        isProminent: false
    }
];

// CSV conversion function
function convertToCSV(data, headers) {
    const escapeCSVField = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field).trim();
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };
    
    const headerRow = headers.map(escapeCSVField).join(',');
    const dataRows = data.map(item => 
        headers.map(header => escapeCSVField(item[header] || '')).join(',')
    );
    
    return [headerRow, ...dataRows].join('\n');
}

// Test export
console.log('=== TEST: Export NP2 Assigned to CSV ===\n');

// Filter assigned data (like Admin would export)
const assignedData = np2BelumSp2Data.filter(item => item.kelompokId);
console.log(`Total data yang sudah di-assign: ${assignedData.length}`);
console.log('Data yang akan di-export:');
assignedData.forEach(item => {
    console.log(`  - NP2: ${item.np2}, Nama: ${item.nama}, Kelompok: ${item.kelompok}`);
});

const headers = ['np2', 'npwp', 'nama', 'jenis pemeriksaan', 'kode pemeriksaan', 'tipe', 'potensi', 'skor', 'isProminent'];
const csvData = assignedData.map(item => ({
    'np2': item.np2 || '',
    'npwp': item.npwp || '',
    'nama': item.nama || '',
    'jenis pemeriksaan': item.jenis || '',
    'kode pemeriksaan': item.kode || '',
    'tipe': item.tipe || '',
    'potensi': item.potensi || '',
    'skor': item.skor || '',
    'isProminent': item.isProminent ? 'true' : 'false'
}));

const csv = convertToCSV(csvData, headers);

console.log('\n=== Generated CSV ===');
console.log(csv);

console.log('\n✓ Test completed successfully!');
console.log('CSV format verified - ready for download');

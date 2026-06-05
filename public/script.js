var IS_CONNECTED = false;
var TOTAL_KASUS = 0;

// ========== DATA ==========
let = timData = {
    k1: [
        { id:'tim-ia', name:'Tim I-A', ketua:'Eko Adrianto', anggota:'Rio Nugraha Putra', kasus:0, maxKasus:TOTAL_KASUS/6, bebanKerja:0 },
        { id:'tim-ib', name:'Tim I-B', ketua:'Sumanty Elisabeth M', anggota:'Aulia Rahman Hakim', kasus:0, maxKasus:TOTAL_KASUS/6, bebanKerja:0 },
        { id:'tim-ic', name:'Tim I-C', ketua:'Purwoko Erie Dharmawan', anggota:'Yoga Esthi Nugraha', kasus:0, maxKasus:TOTAL_KASUS/6, bebanKerja:0 },
    ],

    k2: [
        { id:'tim-iia', name:'Tim II-A', ketua:'Wildan Kristianto', anggota:'Robiansyah', kasus: 0, maxKasus:TOTAL_KASUS/6, bebanKerja:0 },
        { id:'tim-iib', name:'Tim II-B', ketua:'Heni Maryati', anggota:'Dimas Nugroho', kasus:0, maxKasus:TOTAL_KASUS/6, bebanKerja:0 },
        { id:'tim-iic', name:'Tim II-C', ketua:'Tri Hariyono', anggota:'I Made Sukmawijaya', kasus:0, maxKasus:TOTAL_KASUS/6, bebanKerja:0 },
    ]
};

let np2belumsp2 = [];

let currentAssignNP2 = '';

var sp2BelumLhp = [];

let np2BelumSp2Data = [];

const PROMINENT_BONUS = 100;

const logData = [];

const deadlineK1 = [
    // { sp2:'SP2-2024-0301', nama:'PT Karya Mandiri', tim:'Tim I-A', jatuhTempo:'12 Jun 2025', sisaHari:8, jenis:'Khusus' },
    // { sp2:'SP2-2024-0275', nama:'PT Sumber Makmur', tim:'Tim I-C', jatuhTempo:'24 Jun 2025', sisaHari:20, jenis:'Khusus' },
    // { sp2:'SP2-2024-0295', nama:'CV Mitra Sejati', tim:'Tim I-A', jatuhTempo:'19 Jun 2025', sisaHari:15, jenis:'Khusus' },
    // { sp2:'SP2-2024-0280', nama:'Hendra Kusuma', tim:'Tim I-B', jatuhTempo:'05 Jul 2025', sisaHari:58, jenis:'Rutin' },
];

const deadlineK2 = [
    // { sp2:'SP2-2024-0288', nama:'CV Usaha Tani', tim:'Tim II-B', jatuhTempo:'18 Jun 2025', sisaHari:14, jenis:'Rutin' },
    // { sp2:'SP2-2024-0260', nama:'PT Nusantara Jaya', tim:'Tim II-C', jatuhTempo:'15 Jul 2025', sisaHari:68, jenis:'Khusus' },
    // { sp2:'SP2-2024-0268', nama:'Siti Aminah', tim:'Tim II-A', jatuhTempo:'10 Jul 2025', sisaHari:63, jenis:'Rutin' },
];

// ========== RENDER FUNCTIONS ==========
function renderKasusTabel(data) {
    const tbody = document.getElementById('kasus-tbody');
    tbody.innerHTML = data.map(k => `
        <tr onclick="openDetail('${k.sp2}','${k.nama}')">
            <td class="mono">${k.sp2}</td>
            <td class="mono">${k.npwp}</td>
            <td class="name" style="overflow-x:auto; max-width: 3rem">${k.nama}</td>
            <td>${renderJenisBadge(k.jenis)}</td>
            <td>${k.tipe === 'Badan' ? '<span class="badge badge-purple">Badan</span>' : '<span class="badge badge-gray">OP</span>'}</td>
            <td>${renderKodeBadge(k.kode)}</td>
            <td><span class="badge ${k.kelompok.includes('I ') || k.kelompok === 'Kelompok I' ? 'badge-blue' : 'badge-teal'}">${k.tim}</span></td>
            <td style="font-size:11px; color:var(--text2)">${k.kelompok}</td>
            <td class="mono">${k.tglSp2}</td>
            <td class="mono">${k.jatuhTempo}</td>
            <td class="mono">${k.potensi.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })}</td>
            <td><span class="chip" style="color:${statusColor(k.proses)};border-color:${statusColor(k.proses)}40;background:${statusColor(k.proses)}20">${k.proses}</span></td>
            <td><button class="btn btn-ghost btn-sm">Detail</button></td>
        </tr>
    `).join('');
}

function statusColor(s) {
    if(s==='Sudah LHP') return 'var(--red)';
    if(s==='Sudah SPHP') return 'var(--amber)';
    return 'var(--green)';
}

function renderJenisBadge(jenis) {
    const normalized = String(jenis || '').trim().toLowerCase();
    if (normalized === 'khusus') return '<span class="badge badge-red">Khusus</span>';
    if (normalized === 'rutin') return '<span class="badge badge-blue">Rutin</span>';
    if (normalized === 'tujuan lain') return '<span class="badge badge-tujuan-lain">Tujuan Lain</span>';
    return `<span class="badge badge-gray">${jenis || '—'}</span>`;
}

function renderKodeBadge(kode) {
    if (!kode) return '<span class="badge badge-gray">—</span>';
    return `<span class="badge badge-kode">${kode}</span>`;
}

function renderAntrianTabel(data) {
    const tbody = document.getElementById('antrian-tbody');

    tbody.innerHTML = data.map((a, index) => `
        <tr>
            <td class="mono" style="font-size:11px; overflow-x:auto; max-width: 3rem">${a.np2}</td>
            <td class="name" style="font-size:11px; overflow-x:auto; max-width: 3rem">${a.nama}</td>
            <td>${renderJenisBadge(a.jenis)}</td>
            <td>${String(a.tipe).toLowerCase().includes('badan') ? '<span class="badge badge-purple">Badan</span>' : '<span class="badge badge-gray">OP</span>'}</td>
            <td class="mono" style="font-size:10px">${a.potensi.toLocaleString ? a.potensi.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }) : a.potensi}</td>
            <td>${renderKodeBadge(a.kode)}</td>
            <td>${a.skor}</td>
            <td style="display: block;">
                <button class="btn btn-primary btn-sm" onclick="openAssign('${a.nama}','${a.np2}','${a.jenis}','${a.tipe}','${a.potensi.toLocaleString ? a.potensi.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }) : a.potensi}','${a.kode}')">Assign</button>
                
                <button class="btn ${a.isProminent ? 'btn-success' : 'btn-danger'} btn-sm" style="margin-left:0.5rem;" title="Prominent People" onClick="setIsProminent(${index})">${a.isProminent ? 'Prominent ✓' : 'Mark Prominent'}</button>
            </td>
        </tr>
    `).join('');
}

function setIsProminent(indexOrItem) {
    // Accept either numeric index or item object/identifier
    let idx = -1;
    if (Number.isInteger(indexOrItem)) idx = indexOrItem;
    else if (typeof indexOrItem === 'string') idx = np2BelumSp2Data.findIndex(i => i.np2 === indexOrItem || i.nama === indexOrItem);
    else if (indexOrItem && typeof indexOrItem === 'object') idx = np2BelumSp2Data.findIndex(i => i.np2 === indexOrItem.np2 || i.nama === indexOrItem.nama);

    if (idx < 0 || idx >= np2BelumSp2Data.length) return;

    const item = np2BelumSp2Data[idx];
    item.isProminent = !item.isProminent;

    if (typeof item.baseSkor !== 'number') {
        item.baseSkor = Number(item.baseSkor) || Number(item.skor) || 0;
    }

    item.skor = item.isProminent ? (item.baseSkor + PROMINENT_BONUS) : item.baseSkor;

    // Rerender views
    renderAntrianTabel(np2BelumSp2Data);
    renderDashboard();
}

function extractYear(value) {
    if (!value) return '';
    const match = String(value).match(/(20\d{2})/);
    return match ? match[1] : '';
}

function formatCurrency(value) {
    const number = Number(String(value).replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(number)) return 'Rp 0';
    return number.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

function parseIndonesianDate(value) {
    const months = { jan:0,feb:1,mar:2,apr:3,mei:4,jun:5,jul:6,agu:7,sep:8,okt:9,nov:10,des:11 };
    const match = String(value).trim().toLowerCase().match(/^(\d{1,2})\s+([a-z]{3,})\s+(\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = months[match[2].slice(0,3)];
    const year = Number(match[3]);
    if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null;
    return new Date(year, month, day);
}

function parseTableCellValue(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    const normalized = text.replace(/\./g, '').replace(/,/g, '.').replace(/\s+/g, '');
    if (/^-?\d+(\.\d+)?$/.test(normalized)) {
        return Number(normalized);
    }
    const dateValue = parseIndonesianDate(text);
    if (dateValue) return dateValue.getTime();
    const iso = Date.parse(text);
    if (!Number.isNaN(iso)) return iso;
    return text.toLowerCase();
}

function sortTableByColumn(table, columnIndex, direction) {
    const tbody = table.tBodies[0];

    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aText = a.children[columnIndex]?.textContent || '';

        const bText = b.children[columnIndex]?.textContent || '';

        const aValue = parseTableCellValue(aText);

        const bValue = parseTableCellValue(bText);

        if (aValue === bValue) return 0;

        const order = aValue > bValue ? 1 : -1;
        
        return direction === 'asc' ? order : -order;
    });
    rows.forEach(row => tbody.appendChild(row));
}

function attachTableSorting() {
    document.querySelectorAll('.tbl').forEach(table => {
        const headers = table.querySelectorAll('thead th');

        headers.forEach((th, idx) => {
            th.classList.add('sortable');
            th.dataset.sortDirection = '';
            th.addEventListener('click', () => {
                const currentDirection = th.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
               
                table.querySelectorAll('thead th').forEach(header => header.dataset.sortDirection = '');
               
                th.dataset.sortDirection = currentDirection;
                
                sortTableByColumn(table, idx, currentDirection);
            });
        });
    });
}

function getDashboardFilters() {
    const year = document.getElementById('filter-tahun-pajak').value;
    return year ? { year } : {};
}

function filterByYear(data, field) {
    const year = getDashboardFilters().year;

    if (!year) return data;

    return data.filter(item => extractYear(item[field] || item.np2 || item.tglSp2) === year);
}

function renderDashboard() {
    const filteredAntrian = filterByYear(np2BelumSp2Data, 'np2');
    const filteredKasus = filterByYear(sp2BelumLhp, 'tglSp2');

    document.getElementById('card-total-np2-antre').textContent = filteredAntrian.length;

    const totalTimKasus = Object.values(timData).flat().reduce((sum, tim) => sum + tim.kasus, 0);
    document.getElementById('card-kasus-berjalan').textContent = totalTimKasus;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const deadlineCount = filteredKasus.reduce((count, kasus) => {
        const deadline = new Date(kasus.jatuhTempo);
        deadline.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return count + (diffDays >= 0 && diffDays < 30 ? 1 : 0);
    }, 0);

    document.getElementById('card-deadline-kurang-30-hari').textContent = deadlineCount;

    const totalPotensi = filteredKasus.reduce((sum, kasus) => {
        const nominal = Number(String(kasus.potensi).replace(/[^0-9.-]/g, ''));
        return sum + (Number.isNaN(nominal) ? 0 : nominal);
    }, 0);
    document.getElementById('card-total-potensi').textContent = formatCurrency(totalPotensi);

    renderAntreanDashboard(filteredAntrian);
    renderDistribusiBeban();
}

function filterTahunPajak() {
    renderDashboard();
}

function renderDistribusiBeban() {
    ['k1', 'k2'].forEach((kelompok, idx) => {
        const bars = document.getElementById(`dashboard-bars-${kelompok}`);
        const badge = document.getElementById(`dashboard-total-${kelompok}`);
        if (!bars || !badge) return;

        const tims = timData[kelompok] || [];
        const totalKasus = tims.reduce((sum, tim) => sum + tim.kasus, 0);
        badge.textContent = `${totalKasus} Kasus`;
        badge.className = `badge ${kelompok === 'k1' ? 'badge-amber' : 'badge-green'}`;

        bars.innerHTML = tims.map(t => {
            const pct = Math.round((t.kasus / t.maxKasus) * 100);
            const barColor = pct >= 80 ? 'var(--red)' : pct >= 60 ? 'var(--amber)' : 'var(--green)';
            return `
                <div class="bar-row">
                    <div class="bar-label">${t.name}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width:${pct}%; background:${barColor}">
                            <span class="bar-val">${t.kasus}/${t.maxKasus}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    });
}

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim());
    if (!lines.length) return [];

    const detectDelimiter = (headerLine) => {
        const commaCount = (headerLine.match(/,/g) || []).length;
        const semicolonCount = (headerLine.match(/;/g) || []).length;
        return semicolonCount > commaCount ? ';' : ',';
    };

    const delimiter = detectDelimiter(lines[0]);

    const parseLine = line => {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        return values.map(value => value.trim().replace(/^"|"$/g, '').trim());
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase());
    return lines.slice(1).map(line => {
        const values = parseLine(line);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        return row;
    });
}

function lookupCSVField(row, keys) {
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(row, key.toLowerCase()) && row[key.toLowerCase()] !== undefined) {
            return String(row[key.toLowerCase()]).trim();
        }
    }
    return '';
}

function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
        showToast('✕ Format file harus .csv', 'amber');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = String(e.target.result || '');
        const rows = parseCSV(text);
        if (!rows.length) {
            showToast('✕ File CSV kosong atau tidak valid', 'amber');
            event.target.value = '';
            return;
        }

        const existingNp2 = new Set(np2BelumSp2Data.map(item => item.np2));
        const imported = [];
        let skipped = 0;

        rows.forEach((row, index) => {
            const np2 = lookupCSVField(row, ['np2', 'nomor np2', 'no np2']);
            const nama = lookupCSVField(row, ['nama wp', 'nama', 'name']);
            const npwp = lookupCSVField(row, ['npwp']);
            if (!np2 || !nama || !npwp) {
                skipped += 1;
                return;
            }

            if (existingNp2.has(np2)) {
                skipped += 1;
                return;
            }

            const jenisRaw = lookupCSVField(row, ['jenis pemeriksaan', 'jenis']);
            const jenis = jenisRaw ? jenisRaw.trim() : 'Rutin';
            const potensiRaw = lookupCSVField(row, ['potensi']);
            const potensi = potensiRaw || '0';
            const kode = lookupCSVField(row, ['kode pemeriksaan', 'kode', 'kd klu']);
            const tanggalNp2 = lookupCSVField(row, ['tanggal np2', 'tanggal np2', 'tanggal np2']);
            const tanggalUsulan = lookupCSVField(row, ['tanggal usulan instruksi', 'tanggal usulan']);
            const noUsulan = lookupCSVField(row, ['no usulan instruksi', 'no usulan']);
            const masa = lookupCSVField(row, ['masa']);
            const up2 = lookupCSVField(row, ['up2']);
            const kanwil = lookupCSVField(row, ['kanwil']);
            const tipe = lookupCSVField(row, ['kode pemeriksaan']).at(-1) === '1' ? 'WP Badan' : 'WP OP';
            const potensiNumber = Number(String(potensi).replace(/[^0-9.-]/g, ''));
            const skor = Number.isNaN(potensiNumber) ? 0 : Math.min(99, Math.max(0, Math.round(potensiNumber / 10000000)));

            imported.push({ np2, npwp, nama, jenis, kode, tipe, potensi, skor, baseSkor: skor, tanggalNp2, tanggalUsulan, noUsulan, masa, up2, kanwil, isProminent: false });
            existingNp2.add(np2);
        });

        if (!imported.length) {
            showToast('⚠ Tidak ada baris valid untuk ditambahkan', 'amber');
            event.target.value = '';
            return;
        }

        np2BelumSp2Data = imported.concat(np2BelumSp2Data);
        filterAntrian();
        renderDashboard();
        showToast(`✓ ${imported.length} baris CSV berhasil ditambahkan`, 'green');
        event.target.value = '';
    };
    reader.onerror = function() {
        showToast('✕ Gagal membaca file CSV', 'red');
        event.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
}

function renderAntreanDashboard(data) {
    const tbody = document.getElementById('antrean-table');

    tbody.innerHTML = data.slice(0, 4).map(a => `
        <tr>
            <td class="mono">${a.np2}</td>
            <td class="name" style="overflow-x:auto; max-width: 3rem">${a.nama}</td>
            <td>${renderJenisBadge(a.jenis)}</td>
            <td>${String(a.tipe).toLowerCase().includes('badan') ? '<span class="badge badge-purple">Badan</span>' : '<span class="badge badge-gray">OP</span>'}</td>
            <td>${renderKodeBadge(a.kode)}</td>
            <td><button class="btn btn-primary btn-sm" onclick="openAssign('${a.nama}','${a.np2}','${a.jenis}','${a.tipe}','${a.potensi}','${a.kode}')">Assign</button></td>
        </tr>
    `).join('');
}

function renderTimCards(kelompok, containerId) {
    const tims = timData[kelompok];

    const container = document.getElementById(containerId);

    container.innerHTML = tims.map(t => {
        const pct = Math.round((t.kasus / t.maxKasus) * 100);

        const barColor = pct >= 80 ? 'var(--red)' : pct >= 60 ? 'var(--amber)' : 'var(--green)';

        return `
            <div style="background:var(--bg4); border:1px solid var(--border); border-radius:var(--radius); padding:10px; margin-bottom:8px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                    <span style="font-size:12px; font-weight:600;">${t.name}</span>
                    <span class="badge" style="background:${barColor}20; color:${barColor}">${t.kasus}/${t.maxKasus} Kasus</span>
                </div>

                <div class="progress-bar" style="margin-bottom:6px;"><div class="progress-fill" style="width:${pct}%; background:${barColor}"></div></div>
                <div style="font-size:10px; color:var(--text3)">Ketua: ${t.ketua} · Anggota: ${t.anggota}</div>
            </div>
        `;
    }).join('');
}

function renderBebanKerja() {
    ['k1','k2'].forEach((k, ki) => {
        const tims = timData[k];
        
        const container = document.getElementById(`beban-kelompok${ki+1}`);
        
        container.innerHTML = tims.map(t => {
        
            const pct = Math.round((t.kasus / t.maxKasus) * 100);
        
            const barColor = pct >= 80 ? 'var(--red)' : pct >= 60 ? 'var(--amber)' : 'var(--green)';
        
            return `
                <div class="team-card" style="margin-bottom:12px;">
                    <div class="team-header">
                        <div class="team-name">${t.name}</div>
                        <span class="badge" style="background:${barColor}20;color:${barColor}">${pct}% Kapasitas</span>
                    </div>

                    <div class="team-members">
                        <div class="member-chip"><span class="member-role">SPV</span><span class="member-name">${k==='k1'?'Kadi Wartono':'Agus Sukoco'}</span></div>
                        <div class="member-chip"><span class="member-role">Ketua</span><span class="member-name">${t.ketua}</span></div>
                        <div class="member-chip"><span class="member-role">Anggota</span><span class="member-name">${t.anggota}</span></div>
                    </div>

                    <div class="workload-row">
                        <span class="workload-label">Kasus Aktif</span>
                        <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${pct}%;background:${barColor}"></div></div>
                        <span class="workload-count">${t.kasus}</span>
                    </div>

                    <div class="workload-row">
                        <span class="workload-label">Beban Kerja</span>
                        <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${pct}%;background:${barColor}"></div></div>
                        <span class="workload-count">${t.bebanKerja}</span>
                    </div>

                    <div style="font-size:11px;color:var(--text3);margin-top:6px;">Jangka waktu tiap kasus: 6 bulan</div>
                </div>
            `;
        }).join('');
    });
}

function renderBebanKerjaSummary() {
    const k1Kasus = timData.k1.reduce((sum, tim) => sum + tim.kasus, 0);
    const k2Kasus = timData.k2.reduce((sum, tim) => sum + tim.kasus, 0);
    const allTeams = Object.values(timData).flat();
    const avg = allTeams.length ? (allTeams.reduce((sum, tim) => sum + tim.kasus, 0) / allTeams.length).toFixed(1) : '0';
    const heaviest = allTeams.reduce((max, tim) => tim.bebanKerja > max.bebanKerja ? tim : max, allTeams[0] || { name:'—', kasus:0 });

    document.getElementById('card-kasus-k1').textContent = k1Kasus;
    document.getElementById('card-kasus-k2').textContent = k2Kasus;
    document.getElementById('card-rerata-kasus').textContent = avg;
    document.getElementById('card-beban-terberat').textContent = heaviest.name;
    document.getElementById('card-beban-terberat-sub').textContent = `${heaviest.kasus} kasus aktif`;
}

function calculateSisaHari(jatuhTempoStr) {
    try {
        const jatuhTempo = new Date(jatuhTempoStr);
        if (Number.isNaN(jatuhTempo.getTime())) return 0;
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        jatuhTempo.setHours(0, 0, 0, 0);
        
        const diffTime = jatuhTempo - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    } catch (e) {
        return 0;
    }
}

function prepareDeadlineData() {
    if (!sp2BelumLhp || sp2BelumLhp.length === 0) {
        return { k1: [], k2: [] };
    }

    const deadlineData = sp2BelumLhp.map(item => ({
        sp2: item.sp2,
        nama: item.nama,
        tim: item.tim,
        jenis: item.jenis,
        jatuhTempo: item.jatuhTempo,
        kelompok: item.kelompok,
        sisaHari: calculateSisaHari(item.jatuhTempo)
    })).filter(item => item.sisaHari > 0);

    return {
        k1: deadlineData.filter(item => item.kelompok === 'Kelompok I').sort((a, b) => a.sisaHari - b.sisaHari),
        k2: deadlineData.filter(item => item.kelompok === 'Kelompok II').sort((a, b) => a.sisaHari - b.sisaHari)
    };
}

function updateDeadlineStats(allDeadlines) {
    const kurang14 = allDeadlines.filter(d => d.sisaHari < 14).length;
    const dari14Ke30 = allDeadlines.filter(d => d.sisaHari >= 14 && d.sisaHari < 30).length;
    const lebih30 = allDeadlines.filter(d => d.sisaHari >= 30).length;
    
    const elem14 = document.getElementById('dl-kurang-14-hari');
    const elem1430 = document.getElementById('dl-14-30-hari');
    const elem30 = document.getElementById('dl-lebih-30-hari');
    
    if (elem14) elem14.textContent = kurang14;
    if (elem1430) elem1430.textContent = dari14Ke30;
    if (elem30) elem30.textContent = lebih30;
}

function renderDeadline(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = data.sort((a,b) => a.sisaHari - b.sisaHari).map(d => {
        const color = d.sisaHari < 14 ? 'var(--red)' : d.sisaHari < 30 ? 'var(--amber)' : 'var(--green)';
        const bg = d.sisaHari < 14 ? 'var(--red-dim)' : d.sisaHari < 30 ? 'var(--amber-dim)' : 'var(--green-dim)';
        return `
        <div class="deadline-item">
            <div class="deadline-days" style="background:${bg}; color:${color}">
                <span class="num">${d.sisaHari}</span>
                
                <span class="unit">hari</span>
            </div>

            <div class="deadline-info">
                <div class="deadline-np2">${d.sp2}</div>

                <div class="deadline-name">${d.nama}</div>
                
                <div class="deadline-team">
                    ${d.tim} · <span class="badge ${d.jenis==='KHUSUS' ? 'badge-red' : 'badge-blue'}" style="font-size:9px">${d.jenis}</span>
                </div>
            </div>

            <div style="font-size:10px; color:var(--text3); text-align:right; flex-shrink:0;">${d.jatuhTempo}</div>
        </div>
        `;
    }).join('');
}

function renderLog() {
    const container = document.getElementById('log-list');
    container.innerHTML = logData.map(l => `
        <div class="log-item">
            <div class="log-icon" style="background:${l.color}20; color:${l.color}">${l.icon}</div>
            
            <div class="log-content">
                <div class="log-action">
                    <span class="badge badge-gray" style="font-size:9px">${l.aksi}</span>
                </div>
                
                <div class="log-detail">${l.detail}</div>
                
                <div class="log-time">${l.waktu}</div>
            </div>
        </div>
    `).join('');
}

// ========== NAVIGATION ==========
const pageTitles = {
    dashboard: 'Dasbor', kasus: 'Kasus Aktif per Tim',
    assign: 'Assignment Manual', bebankerja: 'Beban Kerja',
    deadline: 'Deadline Kasus', log: 'Log Aktivitas'
};

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
        if(n.getAttribute('onclick')?.includes(id)) n.classList.add('active');
    });
    document.getElementById('page-title').textContent = pageTitles[id] || id;
    
    if(id === 'dashboard') {
        renderDashboard();
    } else if(id === 'assign') {
        renderAntrianTabel(np2BelumSp2Data);
        renderTimCards('k1', 'tim-cards-k1');
        renderTimCards('k2', 'tim-cards-k2');
        renderBebanKerja();
        renderBebanKerjaSummary();
    } else if(id === 'bebankerja') {
        renderBebanKerja();
        renderBebanKerjaSummary();
    } else if(id === 'log') {
        renderLog();
    }
}

function switchTab(el, tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    el.classList.add('active');
    
    let data = sp2BelumLhp;
    
    if(tab === 'k1') data = sp2BelumLhp.filter(k => k.kelompok === 'Kelompok I');
    
    if(tab === 'k2') data = sp2BelumLhp.filter(k => k.kelompok === 'Kelompok II');
    
    renderKasusTabel(data);
}

function filterKasus() {
    const q = document.getElementById('search-kasus').value.toLowerCase();

    const jenis = document.getElementById('filter-jenis').value;
    
    const tim = document.getElementById('filter-tim').value;

    let data = sp2BelumLhp.filter(k =>
        (!q || k.nama.toLowerCase().includes(q) || k.sp2.toLowerCase().includes(q) || k.npwp.includes(q)) &&
        (!jenis || k.jenis.toLowerCase() === jenis) &&
        (!tim || k.tim === tim)
    );

    renderKasusTabel(data);
}

function filterAntrian() {
    const q = document.getElementById('search-antri').value.toLowerCase();

    const data = np2BelumSp2Data.filter(a => !q || a.nama.toLowerCase().includes(q) || a.np2.toLowerCase().includes(q));
    
    renderAntrianTabel(data);
}

// ========== MODALS ==========
function openAssign(nama, np2, jenis='KHUSUS', tipe='WP Badan', potensi='—', skor='—') {
    currentAssignNP2 = np2;

    document.getElementById('modal-np2').textContent = np2;

    document.getElementById('modal-wp').textContent = nama;

    document.getElementById('modal-jenis').innerHTML = jenis === 'KHUSUS'
        ? '<span class="badge badge-red">Khusus</span>'
        : '<span class="badge badge-blue">Rutin</span>';

    document.getElementById('modal-tipe').textContent = tipe;

    document.getElementById('modal-potensi').textContent = potensi.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    document.getElementById('sel-kelompok').value = '';

    document.getElementById('sel-tim').innerHTML = '<option value="">— Pilih Tim —</option>';

    document.getElementById('modal-assign').classList.add('show');
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function updateTimOptions() {
    const k = document.getElementById('sel-kelompok').value;

    const sel = document.getElementById('sel-tim');

    sel.innerHTML = '<option value="">— Pilih Tim —</option>';

    if(!k) return;

    const tims = timData[k];

    tims.sort((a,b) => a.kasus - b.kasus).forEach(t => {
        sel.innerHTML += `<option value="${t.id}">${t.name} — ${t.kasus} kasus aktif</option>`;
    });
    
    const rec = tims.reduce((a,b) => a.kasus < b.kasus ? a : b);

    document.getElementById('rekomendasi-tim').textContent = `${rec.name} (beban terendah: ${rec.kasus} kasus)`;
}

function confirmAssign() {
    const kelompok = document.getElementById('sel-kelompok').value;
    const timId = document.getElementById('sel-tim').value;
    const timText = document.getElementById('sel-tim').options[document.getElementById('sel-tim').selectedIndex]?.text?.split(' — ')[0] || '';
    if(!kelompok || !timId) { showToast('⚠ Pilih kelompok dan tim terlebih dahulu', 'amber'); return; }

    const timObject = timData[kelompok]?.find(t => t.id === timId);

    if(!timObject) {
        showToast('✕ Tim tidak ditemukan', 'red');
        return;
    }

    const np2 = currentAssignNP2;

    if(!np2) {
        showToast('✕ Data NP2 tidak valid', 'red');
        return;
    }

    timObject.kasus += 1;

    let item = np2BelumSp2Data.at(np2BelumSp2Data.findIndex(item => item.np2 === String(np2)));

    const sp2obj = {
        sp2: '',
        npwp: item.npwp || '',
        nama: item.nama || '',
        jenis: item.jenis || '',
        tipe: item.tipe || '',
        tim: kelompok == "k1"? (
            timId == "tim i-a"? "Tim I-A" : (
                timId == "tim i-b"? "Tim I-B" : "Tim I-C"
            ) 
        )
        : 
        (
            timId == "tim ii-a" ? "Tim II-A" : (
                timId == "tim ii-b"? "Tim II-B" : "Tim II-C"
            )
        ),
        kelompok: kelompok == 'k1'? "Kelompok 1" : "Kelompok 2",
        potensi: item.potensi || 0,
        kode: item.kode || '',
        proses: 'Belum Input',
        skor: (typeof item.skor === 'number') ? item.skor : (Number(item.baseSkor) || 0),
        tglSp2: '',
        jatuhTempo: ''
    };
    
    switch(timId) {
        case "tim i-a":
            timData.k1.at(0).bebanKerja += item.bebanKerja;
            break;
        case "tim i-b":
            timData.k1.at(1).bebanKerja += item.bebanKerja;
            break;
        case "tim i-c":
            timData.k1.at(2).bebanKerja += item.bebanKerja;
            break;
        case "tim ii-a":
            timData.k2.at(0).bebanKerja += item.bebanKerja;
            break;
        case "tim ii-b":
            timData.k2.at(1).bebanKerja += item.bebanKerja;
            break;
        case "tim ii-c":
            timData.k2.at(2).bebanKerja += item.bebanKerja;
            break;  
        default:
            break;
    }

    np2BelumSp2Data = np2BelumSp2Data.filter(item => item.np2 !== np2);
    sp2BelumLhp.push(sp2obj);

    closeModal('modal-assign');
    showToast(`✓ ${np2} berhasil di-assign ke ${timText}`, 'green');

    logData.unshift({
        aksi: 'Assignment',
        icon: '⊕',
        color: 'var(--blue)',
        entitas: np2,
        detail: `${np2} (${document.getElementById('modal-wp').textContent}) di-assign ke ${timText} oleh Admin P3`,
        waktu: new Date().toISOString().replace('T',' ').slice(0,19)
    });
    

    filterAntrian();
    renderDashboard();
    renderTimCards('k1', 'tim-cards-k1');
    renderTimCards('k2', 'tim-cards-k2');
    renderBebanKerja();
    renderBebanKerjaSummary();
    renderLog();
    currentAssignNP2 = '';
}

function openDetail(sp2, nama) {
    document.getElementById('detail-title').textContent = sp2;
    const k = sp2BelumLhp.find(k => k.sp2 === sp2) || {};
    document.getElementById('detail-body').innerHTML = `
        <div class="info-grid" style="margin-bottom:16px;">
            <div class="info-row"><div class="info-label">SP2</div><div class="info-value mono">${sp2}</div></div>
            <div class="info-row"><div class="info-label">Nama WP</div><div class="info-value">${nama}</div></div>
            <div class="info-row"><div class="info-label">NPWP</div><div class="info-value mono">${k.npwp||'—'}</div></div>
            <div class="info-row"><div class="info-label">Jenis</div><div class="info-value">${k.jenis||'—'}</div></div>
            <div class="info-row"><div class="info-label">Tim Pengampu</div><div class="info-value">${k.tim||'—'}</div></div>
            <div class="info-row"><div class="info-label">Kelompok</div><div class="info-value">${k.kelompok||'—'}</div></div>
            <div class="info-row"><div class="info-label">Tanggal SP2</div><div class="info-value mono">${k.tglSp2||'—'}</div></div>
            <div class="info-row"><div class="info-label">Jatuh Tempo</div><div class="info-value mono">${k.deadline||'—'}</div></div>
            <div class="info-row"><div class="info-label">Potensi</div><div class="info-value">${k.potensi.toLocaleString('id-ID', {
                style: "currency",
                currency: "IDR"
            })||'—'}</div></div>
            <div class="info-row"><div class="info-label">Proses</div><div class="info-value">${k.proses||'—'}</div></div>
        </div>

        <div class="divider"></div>

        <div style="font-size:11px; color:var(--text3)">Jangka waktu pemeriksaan: 6 bulan dari tanggal SP2</div>
    `;
    document.getElementById('modal-detail').classList.add('show');
}

function autoAssignAll() {
    if (!np2BelumSp2Data.length) {
        showToast('⚠ Tidak ada NP2 antrean untuk di-assign', 'amber');
        return;
    }

    const teams = Object.values(timData).flat();
    const assignedCount = np2BelumSp2Data.length;
    const assignmentSummary = {};

    // For each NP2, pick lowest-load team, increment its kasus, and convert NP2 -> SP2 entry
    np2BelumSp2Data.forEach(item => {
        teams.sort((a, b) => a.kasus - b.kasus || a.name.localeCompare(b.name));
        const target = teams[0];
        target.kasus += 1;
        
        // determine kelompok by checking team id membership
        const kelompok = (timData.k1 || []).some(t => t.id === target.id) ? 'Kelompok I' : 'Kelompok II';
        
        // create SP2-like object from NP2 item
        const sp2obj = {
            sp2: '',
            npwp: item.npwp || '',
            nama: item.nama || '',
            jenis: item.jenis || '',
            tipe: item.tipe || '',
            tim: target.name,
            kelompok: kelompok,
            potensi: item.potensi || 0,
            kode: item.kode || '',
            proses: 'Belum Input',
            skor: (typeof item.skor === 'number') ? item.skor : (Number(item.baseSkor) || 0),
            tglSp2: '',
            jatuhTempo: ''
        };

        target.bebanKerja += sp2obj.skor;

        sp2BelumLhp.push(sp2obj);

        assignmentSummary[target.name] = (assignmentSummary[target.name] || 0) + 1;
    });

    const assignmentText = Object.entries(assignmentSummary)
        .map(([name, count]) => `${name} (${count})`)
        .join(', ');

    logData.unshift({
        aksi: 'Auto-Assign',
        icon: '⚡',
        color: 'var(--amber)',
        entitas: `Batch ${assignedCount}`,
        detail: `Auto-assign ${assignedCount} kasus NP2 pada tim beban terendah: ${assignmentText}`,
        waktu: new Date().toISOString().replace('T',' ').slice(0,19)
    });

    // clear NP2 queue
    np2BelumSp2Data = [];
    filterAntrian();
    renderDashboard();
    renderTimCards('k1', 'tim-cards-k1');
    renderTimCards('k2', 'tim-cards-k2');
    renderBebanKerja();
    renderBebanKerjaSummary();
    renderLog();
    showToast(`✓ ${assignedCount} kasus berhasil di-assign`, 'green');
}

async function getNP2BelumSP2(cookieValue) {
    try {
        const response = await fetch('/api/data/np2belumsp2', {
            method: "POST",
            headers: { 'Content-Type': 'text/plain' },
            body: cookieValue
        });

        const responseText = await response.text();
        let responseJson = responseText;
        try {
            responseJson = JSON.parse(responseText);
        } catch (e) {
            // keep raw text when JSON parse fails
        }

        if (response.ok) {
            responseJson = JSON.parse(responseText);
            const array = responseJson["object"];

            np2BelumSp2Data = array.map((item) => ({
                npwp: item[0],
                nama: item[1],
                np2: item[5],
                tipe: item[7].at(-1) == 2 ? "Badan" : "OP",
                jenis: item[9],
                potensi: item[10],
                kode: item[7] == 1462 || item[7] == 1461 || item[7] == 1452 || item[7] == 1451? "Pemsus DSPP" : 
                        (item[7] == 1162 || item[7] == 1172 || item[7] == 1171 ? "Rutin DSPP" : 
                            (item[7] == 1122 || item[7] == 1121? "Rutin Non LB (Likuidasi)" :
                                (item[7] == 1182 || item[7] == 1181 || item[7] == 2182? "Rutin LB" : "Lainnya")
                            )
                        ),
                skor: menghitungBebanKerja(item, true),
                baseSkor: menghitungBebanKerja(item, true),
                isProminent: false
                })
            );

            TOTAL_KASUS += np2BelumSp2Data.length;

            // return response.ok;
            renderDashboard();
            
            console.log('Updated np2BelumSp2Data:', np2BelumSp2Data);
            setAPIConnectionStatus(true);
            showToast('↻ Data diperbarui dari API', 'blue');
        } else {
            // return null;
            showToast('✕ Gagal memperbarui data', 'red');
            setAPIConnectionStatus(false);
            console.error('API error:', response.status, responseJson);
        }
    } catch (error) {
        setAPIConnectionStatus(false);
        showToast('✕ Gagal terhubung ke server', 'red');
        console.error(error);
    }
}

function menghitungBebanKerja(item, isNp2) {
    let bebanKerja = 0;

    if(isNp2) {
        if (item[7] == 1182) bebanKerja = 100;

        if (item[7] == 1462 || item[7] == 1452) bebanKerja = 85;

        if (item[7] == 2182) bebanKerja = 75;

        if (item[7] == 1461 || item[7] == 1451) bebanKerja = 60;

        if (item[7] == 1181) bebanKerja = 50;

        if (item[7] == 1162 || item[7] == 1172 || item[7] == 1171) bebanKerja = 40;

        if (item[7] == 1122 || item[7] == 1121) bebanKerja = 20;
                
        if (item[10] > 500000000) bebanKerja += 25;

    } else {
        if (item[8] == 1182) bebanKerja = 100;

        if (item[8] == 1462 || item[8] == 1452) bebanKerja = 85;

        if (item[8] == 2182) bebanKerja = 75;

        if (item[8] == 1461 || item[8] == 1451) bebanKerja = 60;

        if (item[8] == 1181) bebanKerja = 50;

        if (item[8] == 1162 || item[8] == 1172 || item[8] == 1171) bebanKerja = 40;

        if (item[8] == 1122 || item[8] == 1121) bebanKerja = 20;
                
        if (item[23] > 500000000) bebanKerja += 25;
    }

    return bebanKerja;
}

async function getSP2BelumLHP(cookieValue) {
    try {
        const response = await fetch('/api/data/sp2belumlhp', {
            method: "POST",
            headers: { 'Content-Type': 'text/plain' },
            body: cookieValue
        });

        const responseText = await response.text();
        let responseJson = responseText;
        try {
            responseJson = JSON.parse(responseText);
        } catch (e) {
            // keep raw text when JSON parse fails
        }

        if (response.ok) {
            responseJson = JSON.parse(responseText);
            const array = responseJson["object"];

            sp2BelumLhp = array.map((item) => ({
                sp2: item[5],

                npwp: item[0],

                nama: item[1],

                jenis: item[9],

                tipe: item[8].at(-1) == 2 ? "Badan" : "OP",

                tim: item[26].includes("KADI WARTONO")?
                        (item[26].includes("EKO ADRIANTO")?
                            "Tim I-A"
                            :
                            (item[26].includes("PURWOKO ERIE DHARMAWAN")?"Tim I-B":"Tim I-C")
                        )
                    :
                        (item[26].includes("TRI HARIYONO")?
                            "Tim II-A"
                            :
                            (item[26].includes("WILDAN KRISTIANTO")? "Tim II-B":"Tim II-C")
                        ),

                kelompok: item[26].includes("KADI WARTONO")? "Kelompok I" : "Kelompok II",
                
                potensi: item[23],

                tglSp2: item[11],

                kode: item[8] == 1462 || item[8] == 1461 || item[8] == 1452 || item[8] == 1451? "Pemsus DSPP" : 
                        (item[8] == 1162 || item[8] == 1172 || item[8] == 1171 ? "Rutin DSPP" : 
                            item[8] == 1122 || item[8] == 1121? "Rutin Non LB (Likuidasi)" : "Rutin LB"
                        ),

                proses: item[22] !== null? "Sudah LHP" : (
                    item[20] !== null? "Sudah SPHP" : (
                        item[11] !== null? "Sedang Diperiksa": "Belum Input"
                    )
                ),

                jatuhTempo: (() => {
                    const base = new Date(item[11]);
                    if (Number.isNaN(base.getTime())) return item[11];
                    const result = new Date(base);
                    result.setMonth(result.getMonth() + 6);
                    return result.toISOString().split('T')[0];
                })(),

                skor: menghitungBebanKerja(item, false),
            }));
            
            if (timData.k1.at(0).kasus == 0 && timData.k1.at(1).kasus == 0 && timData.k1.at(2).kasus == 0 &&
                timData.k2.at(0).kasus == 0 && timData.k2.at(1).kasus == 0 && timData.k2.at(2).kasus == 0) {
                    sp2BelumLhp.map((item) => {
                        if (item.proses !== "Sudah LHP") {
                            switch(item.tim) {
                                case 'Tim I-A':
                                    timData.k1.at(0).kasus += 1;
                                    timData.k1.at(0).bebanKerja += item.skor;
                                    break;
                                case 'Tim I-B':
                                    timData.k1.at(1).kasus += 1;
                                    timData.k1.at(1).bebanKerja += item.skor;
                                    break;
                                case 'Tim I-C':
                                    timData.k1.at(2).kasus += 1;
                                    timData.k1.at(2).bebanKerja += item.skor;
                                    break;
                                case 'Tim II-A':
                                    timData.k2.at(0).kasus += 1;
                                    timData.k2.at(0).bebanKerja += item.skor;
                                    break;
                                case 'Tim II-B':
                                    timData.k2.at(1).kasus += 1;
                                    timData.k2.at(1).bebanKerja += item.skor;
                                    break;
                                case 'Tim II-C':
                                    timData.k2.at(2).kasus += 1;
                                    timData.k2.at(2).bebanKerja += item.skor;
                                    break;
                                default:
                                    break;
                            }
                        }
                    })
            }

            TOTAL_KASUS += sp2BelumLhp.length;

            renderKasusTabel(sp2BelumLhp);
            renderDashboard();
            renderBebanKerja();
            renderBebanKerjaSummary();
            
            // Update deadline data
            const deadlineData = prepareDeadlineData();
            renderDeadline(deadlineData.k1, 'deadline-k1');
            renderDeadline(deadlineData.k2, 'deadline-k2');
            updateDeadlineStats(deadlineData.k1.concat(deadlineData.k2));
            
            console.log('Updated SP2 Belum LHP Data:', sp2BelumLhp);
            setAPIConnectionStatus(true);
            showToast('↻ Data diperbarui dari API', 'blue');
            // return response.ok;
        } else {
            // return null;
            showToast('✕ Gagal memperbarui data', 'red');
            setAPIConnectionStatus(false);
            console.error('API error:', response.status, responseJson);
        }
    } catch (error) {
        setAPIConnectionStatus(false);
        showToast('✕ Gagal terhubung ke server', 'red');
        console.error(error);
    }
}

function refreshData() {
    if (IS_CONNECTED) {
        const cookieValue = document.getElementById("input-cookie")?.value.trim() || '';
        getNP2BelumSP2(cookieValue);
        getSP2BelumLHP(cookieValue);
    } else {
        const modal = document.getElementById('modal-login-portal-p2');
        if (modal) modal.classList.add('show');
        // >>> Lanjut ke fungsi cekCookie()
    }
}

function setAPIConnectionStatus(connected) {
    const apiConnection = document.getElementById("api-connection");
    if (connected) {
        IS_CONNECTED = true;
        apiConnection.classList.remove("badge-red");
        apiConnection.classList.add("badge-green");
        apiConnection.textContent = "● API Terhubung";
    } else {
        apiConnection.classList.remove("badge-green");
        apiConnection.classList.add("badge-red");
        apiConnection.textContent = "● API Terputus";
        IS_CONNECTED = false;
    }
}

async function cekCookie() {
    const modal = document.getElementById('modal-login-portal-p2');
    const cookieValue = document.getElementById("input-cookie").value.trim();

    if (!cookieValue) {
        showToast('⚠ Cookie tidak boleh kosong', 'amber');
        return;
    }

    getNP2BelumSP2(cookieValue);

    getSP2BelumLHP(cookieValue);
    
    renderDashboard();
    
    modal.classList.remove('show');
}

function showToast(msg, type='green') {
    const t = document.getElementById('toast');
    const colors = { green:'var(--green)', amber:'var(--amber)', blue:'var(--blue)', red:'var(--red)' };
    t.style.borderColor = colors[type];
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
    renderAntrianTabel(np2BelumSp2Data);
    renderTimCards('k1', 'tim-cards-k1');
    renderTimCards('k2', 'tim-cards-k2');
    renderBebanKerja();
    renderBebanKerjaSummary();
    
    // Prepare deadline data from sp2BelumLhp
    const deadlineData = prepareDeadlineData();
    renderDeadline(deadlineData.k1, 'deadline-k1');
    renderDeadline(deadlineData.k2, 'deadline-k2');
    updateDeadlineStats(deadlineData.k1.concat(deadlineData.k2));
    
    renderLog();
    attachTableSorting();
});

// ========== INIT ==========
function init() {
    renderKasusTabel(sp2BelumLhp);
    renderDashboard();
    renderTimCards('k1', 'tim-cards-k1');
    renderTimCards('k2', 'tim-cards-k2');
    renderBebanKerja();
    renderBebanKerjaSummary();
    
    // Prepare deadline data from sp2BelumLhp
    const deadlineData = prepareDeadlineData();
    renderDeadline(deadlineData.k1, 'deadline-k1');
    renderDeadline(deadlineData.k2, 'deadline-k2');
    
    // Update deadline statistics
    updateDeadlineStats(deadlineData.k1.concat(deadlineData.k2));
    
    renderLog();
    attachTableSorting();
    setInterval(() => {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString('id-ID');
    }, 1000);
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if(e.target === m) m.classList.remove('show'); });
});

init();
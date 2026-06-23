var IS_CONNECTED = false;
var TOTAL_KASUS = 0;

// ========== USER MANAGEMENT ==========
const userProfiles = {
    admin: { id: 'admin', name: 'Admin P3', role: 'admin', avatar: 'AD', description: 'Administrator' },
    spv1: { id: 'spv1', name: 'SPV Kelompok I', role: 'spv', kelompok: 'k1', avatar: 'S1', description: 'Supervisor Kelompok I' },
    spv2: { id: 'spv2', name: 'SPV Kelompok II', role: 'spv', kelompok: 'k2', avatar: 'S2', description: 'Supervisor Kelompok II' }
};

let currentUser = userProfiles.admin;

// ========== DATA ==========
let = timData = {
    k1: [
        { id:'tim-ia', name:'Tim I-A', ketua:'Eko Adrianto', anggota:'Rio Nugraha Putra', kasus:0, maxKasus:(TOTAL_KASUS/6).toFixed(0), bebanKerja:0 },
        { id:'tim-ib', name:'Tim I-B', ketua:'Sumanty Elisabeth M', anggota:'Aulia Rahman Hakim', kasus:0, maxKasus:(TOTAL_KASUS/6).toFixed(0), bebanKerja:0 },
        { id:'tim-ic', name:'Tim I-C', ketua:'Purwoko Erie Dharmawan', anggota:'Yoga Esthi Nugraha', kasus:0, maxKasus:(TOTAL_KASUS/6).toFixed(0), bebanKerja:0 },
    ],

    k2: [
        { id:'tim-iia', name:'Tim II-A', ketua:'Wildan Kristianto', anggota:'Robiansyah', kasus: 0, maxKasus:(TOTAL_KASUS/6).toFixed(0), bebanKerja:0 },
        { id:'tim-iib', name:'Tim II-B', ketua:'Heni Maryati', anggota:'Dimas Nugroho', kasus:0, maxKasus:(TOTAL_KASUS/6).toFixed(0), bebanKerja:0 },
        { id:'tim-iic', name:'Tim II-C', ketua:'Tri Hariyono', anggota:'I Made Sukmawijaya', kasus:0, maxKasus:(TOTAL_KASUS/6).toFixed(0), bebanKerja:0 },
    ]
};

let np2belumsp2 = [];

let currentAssignNP2 = '';

var sp2BelumLhp = [];

let np2BelumSp2Data = [];

const PROMINENT_BONUS = 100;

const logData = [];

const deadlineK1 = [];

const deadlineK2 = [];

// ========== USER MANAGEMENT FUNCTIONS ==========
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
            dropdown.style.display = 'flex';
        } else {
            dropdown.style.display = 'none';
        }
    }
}

function switchUser(userId) {
    if (!userProfiles[userId]) return;
    
    currentUser = userProfiles[userId];
    
    // Update UI
    document.getElementById('user-avatar').textContent = currentUser.avatar;
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.description;
    
    // Close dropdown
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    
    // Log activity
    logData.unshift({
        aksi: 'Login',
        icon: '🔐',
        color: 'var(--blue)',
        entitas: currentUser.name,
        detail: `User berganti ke ${currentUser.name}`,
        waktu: new Date().toISOString().replace('T',' ').slice(0,19)
    });
    
    // Refresh dashboard
    renderDashboard();
    renderAssignedNP2Table();
    renderLog();
    
    showToast(`✓ Berhasil login sebagai ${currentUser.name}`, 'green');
}

function canAccessAssignment() {
    // Admin dapat assign NP2 ke Kelompok
    // SPV hanya dapat assign ke Tim dalam kelompoknya
    return true;
}

function getAssignmentTargetType() {
    // Admin assign ke Kelompok, SPV assign ke Tim
    return currentUser.role === 'admin' ? 'kelompok' : 'tim';
}

function filterAssignmentOptions(targetType) {
    // Filter options berdasarkan user role
    if (currentUser.role === 'admin') {
        return ['Kelompok I', 'Kelompok II'];
    } else if (currentUser.role === 'spv') {
        return currentUser.kelompok === 'k1' ? 'k1' : 'k2';
    }
    return null;
}

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

function canRollbackTeam(item) {
    if (!item || !item.kelompok) return false;
    if (item.proses === 'Sudah LHP') return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'spv') {
        const kelompokNama = currentUser.kelompok === 'k1' ? 'Kelompok I' : 'Kelompok II';
        return item.kelompok === kelompokNama;
    }
    return false;
}

function rollbackGroupAssignment(np2) {
    const item = np2BelumSp2Data.find(i => i.np2 === np2);
    if (!item || !item.kelompokId) {
        showToast('⚠ Data tidak ditemukan atau belum di-assign ke kelompok', 'amber');
        return;
    }
    if (currentUser.role !== 'admin') {
        showToast('✕ Hanya Administrator dapat membatalkan assignment kelompok', 'red');
        return;
    }
    if (!confirm(`Yakin membatalkan assignment ${np2} dari ${item.kelompok}?`)) return;

    const oldGroup = item.kelompok;
    delete item.kelompokId;
    item.kelompok = '';

    showToast(`✓ Assignment ${np2} ke ${oldGroup} dibatalkan`, 'green');
    logData.unshift({
        aksi: 'Rollback Kelompok',
        icon: '↺',
        color: 'var(--red)',
        entitas: np2,
        detail: `${np2} (${item.nama}) rollback assignment dari ${oldGroup} oleh ${currentUser.name}`,
        waktu: new Date().toISOString().replace('T',' ').slice(0,19)
    });

    renderDashboard();
    renderAssignedNP2Table();
    renderLog();
}

function rollbackTeamAssignment(np2) {
    const index = sp2BelumLhp.findIndex(i => i.np2 === np2);
    if (index < 0) {
        showToast('⚠ Data SP2 tidak ditemukan', 'amber');
        return;
    }

    const item = sp2BelumLhp[index];
    if (item.proses === 'Sudah LHP') {
        showToast('✕ Kasus sudah selesai, rollback tidak diperbolehkan', 'red');
        return;
    }

    if (currentUser.role === 'spv') {
        const allowed = currentUser.kelompok === 'k1' ? 'Kelompok I' : 'Kelompok II';
        if (item.kelompok !== allowed) {
            showToast('✕ Hanya kasus dari kelompok Anda yang dapat dibatalkan', 'red');
            return;
        }
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'spv') {
        showToast('✕ Hanya Administrator atau SPV dapat membatalkan assignment tim', 'red');
        return;
    }

    if (!confirm(`Yakin membatalkan assignment tim ${np2} dari ${item.tim}?`)) return;

    const score = Number(item.skor) || 0;
    const teamObj = Object.values(timData).flat().find(t => t.name === item.tim);
    if (teamObj) {
        teamObj.kasus = Math.max(0, teamObj.kasus - 1);
        teamObj.bebanKerja = Math.max(0, teamObj.bebanKerja - score);
    }

    const np2Item = {
        np2: item.np2 || '',
        npwp: item.npwp || '',
        nama: item.nama || '',
        jenis: item.jenis || '',
        tipe: item.tipe || '',
        potensi: item.potensi || 0,
        kode: item.kode || '',
        skor: score,
        baseSkor: item.baseSkor || score,
        isProminent: false,
        kelompok: item.kelompok || '',
        kelompokId: item.kelompok === 'Kelompok I' ? 'k1' : item.kelompok === 'Kelompok II' ? 'k2' : undefined
    };

    np2BelumSp2Data.unshift(np2Item);
    sp2BelumLhp.splice(index, 1);

    showToast(`✓ Assignment tim ${np2} dibatalkan`, 'green');
    logData.unshift({
        aksi: 'Rollback Tim',
        icon: '↺',
        color: 'var(--red)',
        entitas: np2,
        detail: `${np2} (${item.nama}) rollback assignment dari ${item.tim} oleh ${currentUser.name}`,
        waktu: new Date().toISOString().replace('T',' ').slice(0,19)
    });

    renderDashboard();
    renderKasusTabel(sp2BelumLhp);
    renderAssignedNP2Table();
    renderAntrianTabel(np2BelumSp2Data);
    renderTimCards('k1', 'assign-bars-k1', 'assign-total-k1');
    renderTimCards('k2', 'assign-bars-k2', 'assign-total-k2');
    renderBebanKerja();
    renderBebanKerjaSummary();
    renderLog();
}

function getAntrianDataByRole() {
    if (currentUser.role === 'admin') {
        // Admin sees NP2 that haven't been assigned to any kelompok
        return np2BelumSp2Data.filter(item => !item.kelompokId);
    } else if (currentUser.role === 'spv') {
        // SPV sees NP2 assigned to their kelompok
        return np2BelumSp2Data.filter(item => item.kelompokId === currentUser.kelompok);
    }
    return np2BelumSp2Data;
}

function renderAntrianTabel(data) {
    const tbody = document.getElementById('antrian-tbody');
    
    // Filter data based on user role
    const filteredData = currentUser.role === 'admin' 
        ? data.filter(item => !item.kelompokId)
        : currentUser.role === 'spv'
        ? data.filter(item => item.kelompokId === currentUser.kelompok)
        : data;

    tbody.innerHTML = filteredData.map((a, index) => `
        <tr>
            <td class="mono" style="font-size:11px; overflow-x:auto; max-width: 3rem">${a.np2}</td>
            
            <td class="name" style="font-size:11px; overflow-x:auto; max-width: 3rem">${a.nama}</td>
            
            <td>${renderJenisBadge(a.jenis)}</td>
            
            <td>${String(a.tipe).toLowerCase().includes('badan') ? '<span class="badge badge-purple">Badan</span>' : '<span class="badge badge-gray">OP</span>'}</td>
            
            <td class="mono" style="font-size:10px">
            ${a.potensi.toLocaleString ? a.potensi.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }) : a.potensi.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })}
            </td>

            <td>${renderKodeBadge(a.kode)}</td>
            
            <td>${a.skor}</td>
            
            <td>
                <button class="btn btn-primary btn-sm" title="Assign" onclick="
                openAssign(
                '${a.nama}','${a.np2}','${a.jenis}','${a.tipe}','${a.potensi.toLocaleString('id-ID', {style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,})}','${a.kode}','${a.skor}')">Assign</button>
                
                <button class="btn ${a.isProminent ? 'btn-success' : 'btn-danger'} btn-sm" style="margin-left:0.5rem;" title="Prominent People" onClick="setIsProminent(${index})">${a.isProminent ? 'Prominent ✓' : '⚑'}</button>
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
    // Filter data based on user role
    let antrianData = np2BelumSp2Data;
    if (currentUser.role === 'admin') {
        antrianData = np2BelumSp2Data.filter(item => !item.kelompokId);
    } else if (currentUser.role === 'spv') {
        antrianData = np2BelumSp2Data.filter(item => item.kelompokId === currentUser.kelompok);
    }
    
    const filteredAntrian = filterByYear(antrianData, 'np2');
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
    renderDeadlineNearbyTable(filteredKasus);
}

function filterTahunPajak() {
    renderDashboard();
}

function getKodeCategory(kode) {
    const text = String(kode || '').toLowerCase();
    if (text.includes('pemsus')) return 'Pemsus DSPP';
    if (text.includes('rutin dspp') || text.includes('rutindsp')) return 'Rutin DSPP';
    if (text.includes('rutin non lb')) return 'Rutin Non LB (Likuidasi)';
    if (text.includes('rutin lb')) return 'Rutin LB';
    return 'Lainnya';
}

function renderDistribusiBeban() {
    const categories = ['Pemsus DSPP', 'Rutin DSPP', 'Rutin Non LB (Likuidasi)', 'Rutin LB', 'Lainnya'];
    const colors = {
        'Pemsus DSPP': '#8b5cf6',
        'Rutin DSPP': '#2563eb',
        'Rutin Non LB (Likuidasi)': '#14b8a6',
        'Rutin LB': '#f59e0b',
        'Lainnya': '#6b7280'
    };

    ['k1', 'k2'].forEach((kelompok, idx) => {
        const bars = document.getElementById(`dashboard-bars-${kelompok}`);
        const badge = document.getElementById(`dashboard-total-${kelompok}`);
        if (!bars || !badge) return;

        const allTeamCases = sp2BelumLhp.filter(item => item.kelompok === (kelompok === 'k1' ? 'Kelompok I' : 'Kelompok II'));
        const totalKasus = allTeamCases.length;
        badge.textContent = `${totalKasus} Kasus`;
        badge.className = `badge ${kelompok === 'k1' ? 'badge-amber' : 'badge-green'}`;

        const legendHtml = `
            <div class="bar-legend">
                ${categories.map(cat => `
                    <div class="bar-legend-item">
                        <span class="bar-legend-color" style="background:${colors[cat]}"></span>
                        <span>${cat}</span>
                    </div>
                `).join('')}
            </div>
        `;

        bars.innerHTML = legendHtml + timData[kelompok].map(t => {
            const teamCases = allTeamCases.filter(item => item.tim === t.name);
            const counts = categories.reduce((acc, cat) => {
                acc[cat] = teamCases.filter(item => getKodeCategory(item.kode) === cat).length;
                return acc;
            }, {});

            const total = Object.values(counts).reduce((sum, current) => sum + current, 0);
            const segments = categories.map(cat => {
                const count = counts[cat];
                if (!count) return '';
                return `
                    <div class="bar-segment" style="flex:${count}; background:${colors[cat]}" title="${cat}: ${count} kasus">
                        ${total > 0 && Math.round((count / total) * 100) >= 10 ? `<span class="bar-segment-label">${count}</span>` : ''}
                    </div>
                `;
            }).join('');

            return `
                <div class="bar-row">
                    <div class="bar-label">${t.name}</div>
                    <div class="bar-track">
                        ${segments || '<div class="bar-empty">Tidak ada kasus</div>'}
                    </div>
                    <div class="bar-total">${total} kasus</div>
                </div>
            `;
        }).join('');
    });
}

function renderDeadlineNearbyTable(data) {
    const tbody = document.getElementById('tabel-jatuh-tempo-terdekat');

    if (!tbody) return;

    const deadlineRows = (data || [])
        .map(item => ({
            ...item,
            sisaHari: calculateSisaHari(item.jatuhTempo)
        }))
        .filter(item => item.sisaHari >= 0)
        .sort((a, b) => a.sisaHari - b.sisaHari)
        .slice(0, 8);

    tbody.innerHTML = deadlineRows.map(item => {
        const status = item.proses || '—';
        return `
            <tr>
                <td class="mono">${item.sp2 || '—'}</td>
                <td class="mono">${item.np2 || '—'}</td>
                <td class="mono">${item.npwp || '—'}</td>
                <td>${item.nama || '—'}</td>
                <td>${item.tim || '—'}</td>
                <td class="mono">${item.jatuhTempo || '—'}</td>
                <td>${item.sisaHari}</td>
                <td><span class="chip" style="color:${statusColor(status)};border-color:${statusColor(status)}40;background:${statusColor(status)}20">${status}</span></td>
            </tr>
        `;
    }).join('');
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

function calculateJatuhTempo(sp2Date) {
    if (!sp2Date) return '';
    const parsedDate = parseIndonesianDate(sp2Date) || new Date(sp2Date);
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) return sp2Date;
    const result = new Date(parsedDate);
    result.setMonth(result.getMonth() + 6);
    return result.toISOString().split('T')[0];
}

function normalizeTimValue(value) {
    if (!value) return '';
    const cleaned = String(value).trim();
    if (/^tim\s*i[-\s]?a$/i.test(cleaned)) return 'Tim I-A';
    if (/^tim\s*i[-\s]?b$/i.test(cleaned)) return 'Tim I-B';
    if (/^tim\s*i[-\s]?c$/i.test(cleaned)) return 'Tim I-C';
    if (/^tim\s*ii[-\s]?a$/i.test(cleaned)) return 'Tim II-A';
    if (/^tim\s*ii[-\s]?b$/i.test(cleaned)) return 'Tim II-B';
    if (/^tim\s*ii[-\s]?c$/i.test(cleaned)) return 'Tim II-C';
    return cleaned;
}

function mapCsvRowToSp2BelumLhp(row) {
    const npwp = lookupCSVField(row, ['NPWP']);
    const nama = lookupCSVField(row, ['NAMA WP', 'NAMA']);
    const sp2 = lookupCSVField(row, ['SP2']);
    const np2 = lookupCSVField(row, ["NP2"]);
    const tglSp2 = lookupCSVField(row, ['TANGGAL SP2']);
    const jenis = lookupCSVField(row, ['JENIS PEMERIKSAAN', 'JENIS']) || '';
    const kodeRaw = lookupCSVField(row, ['KODE PEMERIKSAAN', 'KD KLU', 'KODE']);
    const kodeNumber = Number(String(kodeRaw).replace(/[^0-9]/g, ''));
    let kode = kodeNumber == 1462 || kodeNumber == 1461 || kodeNumber == 1452 || kodeNumber == 1451? "Pemsus DSPP" : 
                        (kodeNumber == 1162 || kodeNumber == 1172 || kodeNumber == 1171 ? "Rutin DSPP" : 
                            (kodeNumber == 1122 || kodeNumber == 1121? "Rutin Non LB (Likuidasi)" :
                                (kodeNumber == 1182 || kodeNumber == 1181 || kodeNumber == 2182? "Rutin LB" : "Lainnya")
                            )
                        );

    const rawTim = lookupCSVField(row, ['TIM']);

    let tim = normalizeTimValue(rawTim);

    if (rawTim) {
        tim = rawTim.includes("KADI WARTONO")?
                        (rawTim.includes("EKO ADRIANTO")?
                            "Tim I-A"
                            :
                            (rawTim.includes("PURWOKO ERIE DHARMAWAN")?"Tim I-B":"Tim I-C")
                        )
                    :
                        (rawTim.includes("TRI HARIYONO")?
                            "Tim II-A"
                            :
                            (rawTim.includes("WILDAN KRISTIANTO")? "Tim II-B":"Tim II-C")
                        );
    }

    const kelompok = tim.includes("Tim II")? "Kelompok II" : "Kelompok I";

    const lhpDate = lookupCSVField(row, ['tanggal lhp', 'lhp']);

    const sphpDate = lookupCSVField(row, ['tanggal sphp', 'sphp']);

    const proses = lookupCSVField(row, ['TANGGAL LHP']) !== "null"? "Sudah LHP" : (
                    lookupCSVField(row, ['TANGGAL SPHP']) !== "null"? "Sudah SPHP" : (
                        lookupCSVField(row, ['TANGGAL SP2']) ? "Sedang Diperiksa": "Belum Input"
                    )
                );
    
    const potensiRaw = lookupCSVField(row, ['POTENSI AWAL']);

    const potensiValue = Number(String(potensiRaw).replace(/[^0-9.-]/g, ''));

    const potensi = Number.isNaN(potensiValue) ? 0 : potensiValue;

    const tipe = String(kodeRaw).at(-1) === '2' ? 'Badan' : 'OP';
    
    const skor = menghitungBebanKerja(row, false, proses);
    
    if (proses !== "Sudah LHP") {
        switch(tim) {
            case 'Tim I-A':
                timData.k1.at(0).kasus += 1;
                timData.k1.at(0).bebanKerja += skor;
                break;
            case 'Tim I-B':
                timData.k1.at(1).kasus += 1;
                timData.k1.at(1).bebanKerja += skor;
                break;
            case 'Tim I-C':
                timData.k1.at(2).kasus += 1;
                timData.k1.at(2).bebanKerja += skor;
                break;
            case 'Tim II-A':
                timData.k2.at(0).kasus += 1;
                timData.k2.at(0).bebanKerja += skor;
                break;
            case 'Tim II-B':
                timData.k2.at(1).kasus += 1;
                timData.k2.at(1).bebanKerja += skor;
                break;
            case 'Tim II-C':
                timData.k2.at(2).kasus += 1;
                timData.k2.at(2).bebanKerja += skor;
                break;
            default:
                break;
        }
    }

    return {
        sp2,
        np2,
        npwp,
        nama,
        jenis,
        tipe,
        tim,
        kelompok,
        potensi,
        tglSp2,
        kode,
        proses,
        jatuhTempo: calculateJatuhTempo(tglSp2),
        skor
    };
}

function updateTeamWorkloadFromSp2() {
    const teams = Object.values(timData).flat();
    TOTAL_KASUS = sp2BelumLhp.length;
    teams.forEach(team => {
        team.kasus = 0;
        team.bebanKerja = 0;
        team.maxKasus = TOTAL_KASUS ? TOTAL_KASUS / 6 : 0;
    });

    sp2BelumLhp.forEach(item => {
        if (item.proses !== 'Sudah LHP') {
            const target = teams.find(team => team.name === item.tim);
            if (target) {
                target.kasus += 1;
                target.bebanKerja += Number(item.skor) || 0;
            }
        }
    });
}
 
// NP2 Belum SP2 functions
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
            let kode = Number(lookupCSVField(row, ['kode pemeriksaan', 'kode', 'kd klu']));
            kode = kode == 1462 || kode == 1461 || kode == 1452 || kode == 1451? "Pemsus DSPP" : 
                        (kode == 1162 || kode == 1172 || kode == 1171 ? "Rutin DSPP" : 
                            (kode == 1122 || kode == 1121? "Rutin Non LB (Likuidasi)" :
                                (kode == 1182 || kode == 1181 || kode == 2182? "Rutin LB" : "Lainnya")
                            )
                        );
            const tanggalNp2 = lookupCSVField(row, ['tanggal np2', 'tanggal np2', 'tanggal np2']);
            const tanggalUsulan = lookupCSVField(row, ['tanggal usulan instruksi', 'tanggal usulan']);
            const noUsulan = lookupCSVField(row, ['no usulan instruksi', 'no usulan']);
            const masa = lookupCSVField(row, ['masa']);
            const up2 = lookupCSVField(row, ['up2']);
            const kanwil = lookupCSVField(row, ['kanwil']);
            const tipe = lookupCSVField(row, ['kode pemeriksaan']).at(-1) === '1' ? 'WP Badan' : 'WP OP';
            const potensiNumber = Number(String(potensi).replace(/[^0-9.-]/g, ''));
            const skor = menghitungBebanKerja(row, true, "NP2");

            imported.push({ np2, npwp, nama, jenis, kode, tipe, potensi, skor, baseSkor: skor, tanggalNp2, tanggalUsulan, noUsulan, masa, up2, kanwil, isProminent: false });
            TOTAL_KASUS += 1;
            timData.k1.forEach(t => t.maxKasus = (TOTAL_KASUS / 6).toFixed(0));
            timData.k2.forEach(t => t.maxKasus = (TOTAL_KASUS / 6).toFixed(0));
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
        renderDistribusiBeban();
        showToast(`✓ ${imported.length} baris CSV berhasil ditambahkan`, 'green');
        event.target.value = '';
    };

    reader.onerror = function() {
        showToast('✕ Gagal membaca file CSV', 'red');
        event.target.value = '';
    };

    reader.readAsText(file, 'UTF-8');
}

function handleKasusCsvUpload(event) {
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

        const imported = rows.map(mapCsvRowToSp2BelumLhp).filter(item => item.sp2 && item.npwp && item.nama);
        if (!imported.length) {
            showToast('⚠ Tidak ada baris valid untuk ditambahkan', 'amber');
            event.target.value = '';
            return;                                              
        }

        sp2BelumLhp = imported;

        updateTeamWorkloadFromSp2();
        renderKasusTabel(sp2BelumLhp);
        renderDashboard();
        renderBebanKerja();
        renderBebanKerjaSummary();
        renderDistribusiBeban();


        const deadlineData = prepareDeadlineData();
        renderDeadline(deadlineData.k1, 'deadline-k1');
        renderDeadline(deadlineData.k2, 'deadline-k2');
        updateDeadlineStats(deadlineData.k1.concat(deadlineData.k2));

        showToast(`✓ ${imported.length} baris CSV berhasil diimpor ke Kasus Aktif`, 'green');
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
            <td>${a.skor}</td>
            <td><button class="btn btn-primary btn-sm" onclick="openAssign('${a.nama}','${a.np2}','${a.jenis}','${a.tipe}','${a.potensi}','${a.kode}', '${a.skor}')">Assign</button></td>
        </tr>
    `).join('');
}

function renderTimCards(kelompok, containerId, totalId) {
    const tims = timData[kelompok];
    const container = document.getElementById(containerId);
    const totalBadge = totalId ? document.getElementById(totalId) : null;

    if (!container) return;

    const totalCases = tims.reduce((sum, t) => sum + Number(t.kasus || 0), 0);
    if (totalBadge) totalBadge.textContent = `${totalCases} Kasus`;

    container.innerHTML = tims.map(t => {
        const maxKasus = Number(t.maxKasus) || 0;
        const pct = maxKasus ? Math.round((t.kasus / maxKasus) * 100) : 0;
        const barColor = pct >= 80 ? 'var(--red)' : pct >= 60 ? 'var(--amber)' : 'var(--green)';

        const fillHtml = t.kasus > 0
            ? `<div class="bar-segment" style="width:${Math.min(pct, 100)}%; background:${barColor}">${t.kasus}</div>`
            : `<div class="bar-empty">0 kasus</div>`;

        return `
            <div class="bar-row" style="align-items:center; margin-bottom:8px;">
                <div class="bar-label">${t.name}</div>
                <div class="bar-track">${fillHtml}</div>
                <div class="bar-total">${t.kasus}/${t.maxKasus} kasus</div>
            </div>
        `;
    }).join('');
}

function renderBebanKerja() {
    ['k1','k2'].forEach((k, ki) => {
        const tims = timData[k];
        const container = document.getElementById(`beban-kelompok${ki+1}`);
        if (!container) return;

        container.innerHTML = tims.map(t => {
            const maxKasus = Number(t.maxKasus) || 0;
            const pct = maxKasus ? Math.round((t.kasus / maxKasus) * 100) : 0;
            const barColor = pct >= 80 ? 'var(--red)' : pct >= 60 ? 'var(--amber)' : 'var(--green)';

            const aktifBar = t.kasus > 0
                ? `<div class="bar-segment" style="width:${Math.min(pct, 100)}%; background:${barColor}">${t.kasus}</div>`
                : `<div class="bar-empty">0 kasus</div>`;

            const bebanBar = t.bebanKerja > 0
                ? `<div class="bar-segment" style="width:${Math.min(pct, 100)}%; background:${barColor}">${t.bebanKerja}</div>`
                : `<div class="bar-empty">0</div>`;

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

                    <div class="bar-row" style="margin-bottom:8px;">
                        <div class="bar-label">Kasus Aktif</div>
                        <div class="bar-track">${aktifBar}</div>
                        <div class="bar-total">${t.kasus}</div>
                    </div>

                    <div class="bar-row" style="margin-bottom:8px;">
                        <div class="bar-label">Beban Kerja</div>
                        <div class="bar-track">${bebanBar}</div>
                        <div class="bar-total">${t.bebanKerja}</div>
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
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    })).filter(item => Number.isFinite(item.sisaHari));

    return {
        k1: deadlineData.filter(item => item.kelompok === 'Kelompok I').sort((a, b) => a.sisaHari - b.sisaHari),
        k2: deadlineData.filter(item => item.kelompok === 'Kelompok II').sort((a, b) => a.sisaHari - b.sisaHari)
    };
}

function updateDeadlineStats(allDeadlines) {
    const melewati = allDeadlines.filter(d => d.sisaHari < 0).length;
    const kurang14 = allDeadlines.filter(d => d.sisaHari >= 0 && d.sisaHari < 14).length;
    const dari14Ke30 = allDeadlines.filter(d => d.sisaHari >= 14 && d.sisaHari < 30).length;
    const lebih30 = allDeadlines.filter(d => d.sisaHari >= 30).length;
    
    const elemMelewati = document.getElementById('dl-melewati-jatuh-tempo');
    const elem14 = document.getElementById('dl-kurang-14-hari');
    const elem1430 = document.getElementById('dl-14-30-hari');
    const elem30 = document.getElementById('dl-lebih-30-hari');
    
    if (elemMelewati) elemMelewati.textContent = melewati;
    if (elem14) elem14.textContent = kurang14;
    if (elem1430) elem1430.textContent = dari14Ke30;
    if (elem30) elem30.textContent = lebih30;
}

function renderDeadline(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = data.sort((a,b) => a.sisaHari - b.sisaHari).map(d => {
        const color = d.sisaHari < 14 ? 'var(--red)' : d.sisaHari < 30 ? 'var(--amber)' : 'var(--green)';
        const bg = d.sisaHari < 14 ? 'var(--red-dim)' : d.sisaHari < 30 ? 'var(--amber-dim)' : 'var(--green-dim)';
        const displayValue = Math.abs(d.sisaHari);
        const displayText = d.sisaHari < 0 ? `Lewat ${displayValue}` : `${displayValue}`;
        const unitLabel = d.sisaHari < 0 ? 'hari lewat' : 'hari';
        return `
        <div class="deadline-item">
            <div class="deadline-days" style="background:${bg}; color:${color}">
                <span class="num">${displayText}</span>
                
                <span class="unit">${unitLabel}</span>
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

function renderAssignedNP2Table() {
    const tbody = document.getElementById('assigned-np2-tbody');
    if (!tbody) return;
    
    // Get data based on user role
    let assignedData = [];
    if (currentUser.role === 'admin') {
        // Admin melihat semua data yang sudah di-assign ke kelompok
        assignedData = np2BelumSp2Data.filter(item => item.kelompokId);
    } else if (currentUser.role === 'spv') {
        // SPV hanya melihat data yang di-assign ke kelompok mereka
        assignedData = np2BelumSp2Data.filter(item => item.kelompokId === currentUser.kelompok);
    }
    
    if (!assignedData.length) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:var(--text3); padding:20px;">Tidak ada data NP2 yang sudah di-assign</td></tr>`;
        return;
    }
    
    tbody.innerHTML = assignedData.map(item => `
        <tr>
            <td class="mono" style="font-size:11px;">${item.np2}</td>
            <td style="font-size:11px; max-width:12rem; overflow:hidden; text-overflow:ellipsis;">${item.nama}</td>
            <td class="mono" style="font-size:10px;">${item.npwp}</td>
            <td style="font-size:11px;">${renderJenisBadge(item.jenis)}</td>
            <td style="font-size:11px;">${String(item.tipe || '').toLowerCase().includes('badan') ? '<span class="badge badge-purple">Badan</span>' : '<span class="badge badge-gray">OP</span>'}</td>
            <td class="mono" style="font-size:10px;">${item.potensi.toLocaleString ? item.potensi.toLocaleString('id-ID', {style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,}) : item.potensi}</td>
            <td style="font-size:11px;">${renderKodeBadge(item.kode)}</td>
            <td style="font-size:11px;">${item.skor}</td>
            <td style="font-size:11px;"><span class="badge ${item.kelompokId === 'k1' ? 'badge-blue' : 'badge-teal'}">${item.kelompok}</span></td>
            <td style="font-size:11px;">
                ${currentUser.role === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="rollbackGroupAssignment('${item.np2}')">Rollback</button>` : '<span style="color:var(--text3); font-size:11px;">-</span>'}
            </td>
        </tr>
    `).join('');
}

function filterAssignedNP2() {
    const query = document.getElementById('search-assigned')?.value?.toLowerCase() || '';
    let assignedData = [];
    
    if (currentUser.role === 'admin') {
        assignedData = np2BelumSp2Data.filter(item => item.kelompokId);
    } else if (currentUser.role === 'spv') {
        assignedData = np2BelumSp2Data.filter(item => item.kelompokId === currentUser.kelompok);
    }
    
    if (!query) {
        renderAssignedNP2Table();
        return;
    }
    
    const filteredData = assignedData.filter(item => 
        item.np2.toLowerCase().includes(query) || 
        item.nama.toLowerCase().includes(query) ||
        item.npwp.includes(query)
    );
    
    const tbody = document.getElementById('assigned-np2-tbody');
    if (!tbody) return;
    
    if (!filteredData.length) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text3); padding:20px;">Tidak ada hasil pencarian</td></tr>`;
        return;
    }
    
    tbody.innerHTML = filteredData.map(item => `
        <tr>
            <td class="mono" style="font-size:11px;">${item.np2}</td>
            <td style="font-size:11px; max-width:12rem; overflow:hidden; text-overflow:ellipsis;">${item.nama}</td>
            <td class="mono" style="font-size:10px;">${item.npwp}</td>
            <td style="font-size:11px;">${renderJenisBadge(item.jenis)}</td>
            <td style="font-size:11px;">${String(item.tipe || '').toLowerCase().includes('badan') ? '<span class="badge badge-purple">Badan</span>' : '<span class="badge badge-gray">OP</span>'}</td>
            <td class="mono" style="font-size:10px;">${item.potensi.toLocaleString ? item.potensi.toLocaleString('id-ID', {style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,}) : item.potensi}</td>
            <td style="font-size:11px;">${renderKodeBadge(item.kode)}</td>
            <td style="font-size:11px;">${item.skor}</td>
            <td style="font-size:11px;"><span class="badge ${item.kelompokId === 'k1' ? 'badge-blue' : 'badge-teal'}">${item.kelompok}</span></td>
        </tr>
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
        renderAssignedNP2Table();
        renderTimCards('k1', 'assign-bars-k1', 'assign-total-k1');
        renderTimCards('k2', 'assign-bars-k2', 'assign-total-k2');
        renderBebanKerja();
        renderBebanKerjaSummary();
        renderDistribusiBeban();
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
function openAssign(nama, np2, jenis='KHUSUS', tipe='WP Badan', potensi='—', kode = '—', skor='—') {
    currentAssignNP2 = np2;

    // Update modal title berdasarkan role
    const titleEl = document.getElementById('modal-assign-title');
    if (currentUser.role === 'admin') {
        titleEl.textContent = 'Assign Kasus ke Kelompok';
    } else {
        titleEl.textContent = `Assign Kasus ke Tim (${currentUser.kelompok === 'k1' ? 'Kelompok I' : 'Kelompok II'})`;
    }

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

    document.getElementById('modal-skor').textContent = skor;

    document.getElementById('modal-kode').textContent = np2BelumSp2Data.find(item => item.np2 === np2)?.kode || '—';

    // Handle based on role
    const kelompokSelect = document.getElementById('sel-kelompok');
    const timSelect = document.getElementById('sel-tim');
    const kelompokFormGroup = kelompokSelect.closest('.form-group');
    const timFormGroup = timSelect.closest('.form-group');

    if (currentUser.role === 'admin') {
        // Admin: Show kelompok options, hide tim
        kelompokFormGroup.style.display = 'block';
        timFormGroup.style.display = 'none';
        kelompokSelect.value = '';
        timSelect.innerHTML = '<option value="">— Pilih Tim —</option>';
        kelompokSelect.label = 'Kelompok';
    } else {
        // SPV: Hide kelompok, show tim for their group
        kelompokFormGroup.style.display = 'none';
        timFormGroup.style.display = 'block';
        const k = currentUser.kelompok;
        kelompokSelect.value = k;
        updateTimOptions();
    }

    document.getElementById('modal-assign').classList.add('show');
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function updateTimOptions() {
    const k = document.getElementById('sel-kelompok').value;

    const sel = document.getElementById('sel-tim');

    sel.innerHTML = '<option value="">— Pilih Tim —</option>';

    if(!k) return;

    const tims = timData[k];

    const sortedTims = [...tims].sort((a,b) => a.kasus - b.kasus);
    sortedTims.forEach(t => {
        sel.innerHTML += `<option value="${t.id}">${t.name} — ${t.kasus} kasus aktif</option>`;
    });
    
    const rec = sortedTims.reduce((a,b) => a.kasus < b.kasus ? a : b);

    document.getElementById('rekomendasi-tim').textContent = `${rec.name} (beban terendah: ${rec.kasus} kasus)`;
}

function confirmAssign() {
    const np2 = currentAssignNP2;
    
    if(!np2) {
        showToast('✕ Data NP2 tidak valid', 'red');
        return;
    }
    
    let item = np2BelumSp2Data.find(item => item.np2 === String(np2));
    
    if (!item) {
        showToast('✕ Item NP2 tidak ditemukan', 'red');
        return;
    }
    
    // ADMIN: Assign ke Kelompok
    if (currentUser.role === 'admin') {
        const kelompok = document.getElementById('sel-kelompok').value;
        if (!kelompok) { 
            showToast('⚠ Pilih kelompok terlebih dahulu', 'amber'); 
            return; 
        }
        
        // Update NP2 item dengan kelompok
        item.kelompok = kelompok === 'k1' ? 'Kelompok I' : 'Kelompok II';
        item.kelompokId = kelompok;
        
        showToast(`✓ ${np2} berhasil di-assign ke ${item.kelompok}`, 'green');
        
        logData.unshift({
            aksi: 'Assignment Kelompok',
            icon: '⊕',
            color: 'var(--blue)',
            entitas: np2,
            detail: `${np2} (${item.nama}) di-assign ke ${item.kelompok} oleh ${currentUser.name}`,
            waktu: new Date().toISOString().replace('T',' ').slice(0,19)
        });
    }
    // SPV: Assign ke Tim
    else if (currentUser.role === 'spv') {
        const timId = document.getElementById('sel-tim').value;
        const timText = document.getElementById('sel-tim').options[document.getElementById('sel-tim').selectedIndex]?.text?.split(' — ')[0] || '';
        
        if (!timId) { 
            showToast('⚠ Pilih tim terlebih dahulu', 'amber'); 
            return; 
        }
        
        const kelompok = currentUser.kelompok;
        const timObject = timData[kelompok]?.find(t => t.id === timId);
        
        if (!timObject) {
            showToast('✕ Tim tidak ditemukan', 'red');
            return;
        }
        
        // Check if NP2 is assigned to SPV's kelompok
        if (!item.kelompokId || item.kelompokId !== kelompok) {
            showToast('✕ NP2 ini belum di-assign ke kelompok Anda', 'red');
            return;
        }
        
        // Increment kasus count
        timObject.kasus += 1;
        
        // Create SP2 object
        const sp2obj = {
            sp2: '',
            np2: item.np2 || '',
            npwp: item.npwp || '',
            nama: item.nama || '',
            jenis: item.jenis || '',
            tipe: item.tipe || '',
            tim: timText,
            kelompok: item.kelompok,
            potensi: item.potensi || 0,
            kode: item.kode || '',
            proses: 'Belum Input',
            skor: (typeof item.skor === 'number') ? item.skor : (Number(item.baseSkor) || 0),
            tglSp2: '',
            jatuhTempo: ''
        };
        
        // Update beban kerja
        switch(timId) {
            case "tim-ia": 
            case "tim-ib": 
            case "tim-ic": {
                const team = timData.k1.find(t => t.id === timId);
                if (team) team.bebanKerja += item.skor;
                break;
            }
            case "tim-iia": 
            case "tim-iib": 
            case "tim-iic": {
                const team = timData.k2.find(t => t.id === timId);
                if (team) team.bebanKerja += item.skor;
                break;
            }
        }
        
        // Remove from NP2 queue and add to SP2
        np2BelumSp2Data = np2BelumSp2Data.filter(item => item.np2 !== np2);
        sp2BelumLhp.push(sp2obj);
        
        showToast(`✓ ${np2} berhasil di-assign ke ${timText}`, 'green');
        
        logData.unshift({
            aksi: 'Assignment Tim',
            icon: '⊕',
            color: 'var(--blue)',
            entitas: np2,
            detail: `${np2} (${item.nama}) di-assign ke ${timText} oleh ${currentUser.name}`,
            waktu: new Date().toISOString().replace('T',' ').slice(0,19)
        });
    }
    
    closeModal('modal-assign');
    filterAntrian();
    renderDashboard();
    renderAssignedNP2Table();
    renderTimCards('k1', 'assign-bars-k1', 'assign-total-k1');
    renderTimCards('k2', 'assign-bars-k2', 'assign-total-k2');
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

    if (currentUser.role === 'admin') {
        const unassigned = np2BelumSp2Data.filter(item => !item.kelompokId);
        if (!unassigned.length) {
            showToast('⚠ Tidak ada NP2 yang belum di-assign ke kelompok', 'amber');
            return;
        }

        const groupCounts = {
            k1: np2BelumSp2Data.filter(item => item.kelompokId === 'k1').length,
            k2: np2BelumSp2Data.filter(item => item.kelompokId === 'k2').length
        };

        const assignmentSummary = { 'Kelompok I': 0, 'Kelompok II': 0 };

        unassigned.forEach(item => {
            const targetGroup = groupCounts.k1 <= groupCounts.k2 ? 'k1' : 'k2';
            const kelompokName = targetGroup === 'k1' ? 'Kelompok I' : 'Kelompok II';

            item.kelompokId = targetGroup;
            item.kelompok = kelompokName;

            groupCounts[targetGroup] += 1;
            assignmentSummary[kelompokName] += 1;
        });

        const assignmentText = Object.entries(assignmentSummary)
            .filter(([, count]) => count > 0)
            .map(([name, count]) => `${name} (${count})`)
            .join(', ');

        logData.unshift({
            aksi: 'Auto-Assign',
            icon: '⚡',
            color: 'var(--amber)',
            entitas: `Batch ${unassigned.length}`,
            detail: `Auto-assign ${unassigned.length} NP2 ke kelompok: ${assignmentText}`,
            waktu: new Date().toISOString().replace('T',' ').slice(0,19)
        });

        filterAntrian();
        renderDashboard();
        renderAssignedNP2Table();
        renderLog();
        showToast(`✓ ${unassigned.length} NP2 berhasil di-assign ke kelompok`, 'green');
        return;
    }

    if (currentUser.role === 'spv') {
        const kelompok = currentUser.kelompok;
        const groupItems = np2BelumSp2Data.filter(item => item.kelompokId === kelompok);

        if (!groupItems.length) {
            showToast('⚠ Tidak ada NP2 yang sudah di-assign ke kelompok Anda untuk di-assign ke tim', 'amber');
            return;
        }

        const teams = [...(timData[kelompok] || [])];
        const assignedCount = groupItems.length;
        const assignmentSummary = {};

        groupItems.forEach(item => {
            teams.sort((a, b) => a.kasus - b.kasus || a.name.localeCompare(b.name));
            const target = teams[0];
            target.kasus += 1;
            target.bebanKerja += Number(item.skor) || 0;

            const sp2obj = {
                sp2: '',
                np2: item.np2 || '',
                npwp: item.npwp || '',
                nama: item.nama || '',
                jenis: item.jenis || '',
                tipe: item.tipe || '',
                tim: target.name,
                kelompok: item.kelompok,
                potensi: item.potensi || 0,
                kode: item.kode || '',
                proses: 'Belum Input',
                skor: (typeof item.skor === 'number') ? item.skor : (Number(item.baseSkor) || 0),
                tglSp2: '',
                jatuhTempo: ''
            };

            sp2BelumLhp.push(sp2obj);
            assignmentSummary[target.name] = (assignmentSummary[target.name] || 0) + 1;
        });

        np2BelumSp2Data = np2BelumSp2Data.filter(item => item.kelompokId !== kelompok);

        const assignmentText = Object.entries(assignmentSummary)
            .map(([name, count]) => `${name} (${count})`)
            .join(', ');

        logData.unshift({
            aksi: 'Auto-Assign',
            icon: '⚡',
            color: 'var(--amber)',
            entitas: `Batch ${assignedCount}`,
            detail: `Auto-assign ${assignedCount} NP2 ke tim ${currentUser.kelompok === 'k1' ? 'Kelompok I' : 'Kelompok II'}: ${assignmentText}`,
            waktu: new Date().toISOString().replace('T',' ').slice(0,19)
        });

        filterAntrian();
        renderDashboard();
        renderTimCards('k1', 'assign-bars-k1', 'assign-total-k1');
        renderTimCards('k2', 'assign-bars-k2', 'assign-total-k2');
        renderBebanKerja();
        renderBebanKerjaSummary();
        renderLog();
        showToast(`✓ ${assignedCount} NP2 berhasil di-assign ke tim`, 'green');
        return;
    }

    showToast('✕ Role tidak dikenali untuk auto-assign', 'red');
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
                skor: menghitungBebanKerja(item, true, "NP2"),
                baseSkor: menghitungBebanKerja(item, true, "NP2"),
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

function menghitungBebanKerja(item, isNp2, proses) {
    let kode_pemeriksaan = Number(item["kode pemeriksaan"]);
    
    let bebanKerja = 0;
    
    if(isNp2) {
        if (!kode_pemeriksaan) kode_pemeriksaan = item[7];

        if (kode_pemeriksaan == 1182) bebanKerja = 100;

        if (kode_pemeriksaan == 2182) bebanKerja = 85;

        if (kode_pemeriksaan == 1181) bebanKerja = 75;

        if (kode_pemeriksaan == 1462 || kode_pemeriksaan == 1452) bebanKerja = 60;

        if (kode_pemeriksaan == 1461 || kode_pemeriksaan == 1451) bebanKerja = 50;

        if (kode_pemeriksaan == 1162 || kode_pemeriksaan == 1172 || kode_pemeriksaan == 1171) bebanKerja = 40;

        if (kode_pemeriksaan == 1122 || kode_pemeriksaan == 1121) bebanKerja = 20;
                
        if (item[10] > 500000000) bebanKerja += 25;

    } else {
        if (proses != "Sudah LHP") {
            if (!kode_pemeriksaan) kode_pemeriksaan = item[8];
    
            if (kode_pemeriksaan == 1182) bebanKerja = 100;
    
            if (kode_pemeriksaan == 2182) bebanKerja = 85;
    
            if (kode_pemeriksaan == 1181) bebanKerja = 75;
    
            if (kode_pemeriksaan == 1462 || kode_pemeriksaan == 1452) bebanKerja = 60;
    
            if (kode_pemeriksaan == 1461 || kode_pemeriksaan == 1451) bebanKerja = 50;
    
            if (kode_pemeriksaan == 1162 || kode_pemeriksaan == 1172 || kode_pemeriksaan == 1171) bebanKerja = 40;
    
            if (kode_pemeriksaan == 1122 || kode_pemeriksaan == 1121) bebanKerja = 20;
                    
            if (item[23] > 500000000) bebanKerja += 25;
        }
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
                sp2: item[10],

                np2: item[5],

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

                skor: menghitungBebanKerja(item, false, item[22] !== null? "Sudah LHP" : "Belum LHP"),
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

// ========== EXPORT FUNCTIONS ==========
function convertToCSV(data, headers) {
    // Escape quotes and wrap fields with quotes if they contain special characters
    const escapeCSVField = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field).trim();
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };
    
    // Create header row
    const headerRow = headers.map(escapeCSVField).join(',');
    
    // Create data rows
    const dataRows = data.map(item => 
        headers.map(header => escapeCSVField(item[header] || '')).join(',')
    );
    
    return [headerRow, ...dataRows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`✓ File ${filename} berhasil diunduh`, 'green');
}

function exportAssignedNP2ToCSV() {
    // Filter data berdasarkan role user
    let dataToExport = [];
    
    if (currentUser.role === 'admin') {
        // Admin bisa export semua data yang sudah di-assign ke kelompok
        dataToExport = np2BelumSp2Data.filter(item => item.kelompokId);
    } else if (currentUser.role === 'spv') {
        // SPV hanya bisa export data yang di-assign ke kelompok mereka
        dataToExport = np2BelumSp2Data.filter(item => item.kelompokId === currentUser.kelompok);
    }
    
    if (!dataToExport.length) {
        showToast('⚠ Tidak ada data NP2 yang sudah di-assign untuk diekspor', 'amber');
        return;
    }
    
    // Define CSV headers (sesuai dengan field yang diimport)
    const headers = ['np2', 'npwp', 'nama', 'jenis pemeriksaan', 'kode pemeriksaan', 'tipe', 'potensi', 'skor', 'isProminent'];
    
    // Map data ke struktur CSV
    const csvData = dataToExport.map(item => ({
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
    
    // Convert to CSV
    const csv = convertToCSV(csvData, headers);
    
    // Generate filename dengan timestamp dan user role
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const userLabel = currentUser.role === 'admin' 
        ? 'AllKelompok' 
        : `Kelompok_${currentUser.kelompok === 'k1' ? 'I' : 'II'}`;
    const filename = `NP2_Assigned_${userLabel}_${dateStr}_${timeStr}.csv`;
    
    // Download file
    downloadCSV(csv, filename);
    
    // Log activity
    logData.unshift({
        aksi: 'Export NP2',
        icon: '📥',
        color: 'var(--amber)',
        entitas: filename,
        detail: `${dataToExport.length} data NP2 diekspor oleh ${currentUser.name}`,
        waktu: new Date().toISOString().replace('T',' ').slice(0,19)
    });
    
    renderLog();
}

function exportLogToCSV() {
    if (!logData.length) {
        showToast('⚠ Tidak ada log aktivitas untuk diekspor', 'amber');
        return;
    }

    const headers = ['aksi', 'icon', 'entitas', 'detail', 'waktu'];
    const csvData = logData.map(item => ({
        aksi: item.aksi || '',
        icon: item.icon || '',
        entitas: item.entitas || '',
        detail: item.detail || '',
        waktu: item.waktu || ''
    }));

    const csv = convertToCSV(csvData, headers);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const filename = `Log_Aktivitas_${currentUser.id || 'user'}_${dateStr}_${timeStr}.csv`;

    downloadCSV(csv, filename);

    logData.unshift({
        aksi: 'Export Log',
        icon: '📥',
        color: 'var(--blue)',
        entitas: filename,
        detail: `Log aktivitas diekspor oleh ${currentUser.name}`,
        waktu: new Date().toISOString().replace('T',' ').slice(0,19)
    });

    renderLog();
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
    renderAntrianTabel(np2BelumSp2Data);
    renderAssignedNP2Table();
    renderTimCards('k1', 'assign-bars-k1', 'assign-total-k1');
    renderTimCards('k2', 'assign-bars-k2', 'assign-total-k2');
    renderBebanKerja();
    renderBebanKerjaSummary();
    
    // Prepare deadline data from sp2BelumLhp
    const deadlineData = prepareDeadlineData();
    renderDeadline(deadlineData.k1, 'deadline-k1');
    renderDeadline(deadlineData.k2, 'deadline-k2');
    updateDeadlineStats(deadlineData.k1.concat(deadlineData.k2));
    
    renderLog();
    attachTableSorting();
    
    // Close user dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('user-dropdown');
        const userChip = document.querySelector('.user-chip');
        if (dropdown && userChip && !userChip.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
});

// ========== INIT ==========
function init() {
    renderKasusTabel(sp2BelumLhp);
    renderDashboard();
    renderAntrianTabel(np2BelumSp2Data);
    renderAssignedNP2Table();
    renderTimCards('k1', 'assign-bars-k1', 'assign-total-k1');
    renderTimCards('k2', 'assign-bars-k2', 'assign-total-k2');
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
// Admin Dashboard Functionality
class AdminDashboard {
    constructor() {
        this.init();
    }

    init() {
        console.log('Initializing Admin Dashboard...');
        
        // Check authentication
        if (!adminAuth.requireAuth()) return;
        
        this.loadStats();
        this.loadRecentPendaftaran();
        this.loadPaketPerformance();
        this.initUserMenu();
    }

    // Load dashboard statistics
    loadStats() {
        const peserta = storage.getPeserta();
        const paket = storage.getPaket();
        const statistik = storage.getStatistik();

        // Update stats
        document.getElementById('totalPeserta').textContent = statistik.totalPeserta;
        document.getElementById('totalPendapatan').textContent = 'Rp ' + this.formatCurrency(statistik.totalPendapatan);
        document.getElementById('pendingVerification').textContent = statistik.pesertaPending;
        document.getElementById('paketAktif').textContent = paket.filter(p => p.aktif).length;

        // Calculate growth (demo data)
        document.getElementById('pesertaGrowth').textContent = '12%';
        document.getElementById('pendapatanGrowth').textContent = '18%';
    }

    // Load recent pendaftaran
    loadRecentPendaftaran() {
        const peserta = storage.getPeserta();
        const recentPeserta = peserta
            .sort((a, b) => new Date(b.tanggalDaftar) - new Date(a.tanggalDaftar))
            .slice(0, 5);

        const container = document.getElementById('recentPendaftaran');
        
        if (recentPeserta.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-users text-4xl mb-4 opacity-50"></i>
                    <p>Belum ada pendaftaran</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentPeserta.map(peserta => {
            const paket = storage.getPaketById(peserta.paketId);
            const statusBadge = this.getStatusBadge(peserta.status);
            
            return `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            ${peserta.nama.charAt(0)}
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">${peserta.nama}</p>
                            <p class="text-sm text-gray-500">${peserta.email}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="flex items-center space-x-2">
                            ${statusBadge}
                            <span class="text-sm font-medium text-gray-900">${paket ? paket.nama : 'Unknown'}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">${this.formatDate(peserta.tanggalDaftar)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Load paket performance
    loadPaketPerformance() {
        const paket = storage.getPaket().filter(p => p.aktif);
        const peserta = storage.getPeserta();
        const statistik = storage.getStatistik();

        const container = document.getElementById('paketPerformance');
        
        container.innerHTML = paket.map(p => {
            const pesertaCount = statistik.pesertaPerPaket[p.id] || 0;
            const percentage = (pesertaCount / p.kuota) * 100;
            
            return `
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-900">${p.nama}</span>
                        <span class="text-sm text-gray-500">${pesertaCount}/${p.kuota}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-gradient-to-r from-blue-900 to-blue-700 h-2 rounded-full transition-all duration-1000" 
                             style="width: ${percentage}%">
                        </div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500">
                        <span>Rp ${this.formatCurrency(p.harga)}</span>
                        <span>${Math.round(percentage)}% terisi</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Initialize user menu dropdown
    initUserMenu() {
        const userMenu = document.getElementById('userMenu');
        const dropdownMenu = document.getElementById('dropdownMenu');

        if (userMenu && dropdownMenu) {
            userMenu.addEventListener('click', (e) => {
                dropdownMenu.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });
        }
    }

    // Utility functions
    getStatusBadge(status) {
        const badges = {
            'pending_verification': '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>',
            'verified': '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Verified</span>',
            'rejected': '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Ditolak</span>'
        };
        return badges[status] || '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>';
    }

    formatCurrency(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    new AdminDashboard();
});
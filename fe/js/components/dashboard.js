Vue.component('dashboard-page', {
  template: `
    <div class="admin-page dashboard-page">
      <div class="print-report-head">
        <div>
          <span>Warung Bakso Tulus</span>
          <h1>Laporan Dashboard</h1>
          <p>Ringkasan operasional per {{ currentDateText }}</p>
        </div>
        <div class="print-report-meta">
          <small>Dicetak</small>
          <strong>{{ currentDateText }}</strong>
        </div>
      </div>

      <div class="dashboard-intro animate-right">
        <div>
          <h1>Halo, Admin Tulus <v-icon color="#c2372f">mdi-hand-wave-outline</v-icon></h1>
          <p>Berikut ringkasan warung Anda hari ini, {{ currentDateText }}.</p>
        </div>
        <div class="dashboard-actions">
          <v-btn class="soft-button" depressed>
            <v-icon left small color="#c2372f">mdi-calendar-month</v-icon>
            Hari ini
          </v-btn>
          <v-btn class="btn-primary" depressed @click="printDashboard">
            <v-icon left small>mdi-download</v-icon>
            Cetak Laporan
          </v-btn>
        </div>
      </div>

      <div v-if="loading" class="ui-loading">
        <v-progress-circular indeterminate color="#c2372f" size="42"></v-progress-circular>
        <span>Memuat ringkasan...</span>
      </div>

      <div v-else>
        <v-row class="summary-row">
          <v-col cols="12" md="6" v-for="card in summaryCards" :key="card.label">
            <div class="summary-card animate-up">
              <div>
                <div class="summary-label">{{ card.label }}</div>
                <div class="summary-value">{{ card.value }}</div>
                <div class="summary-note" :class="card.noteClass">{{ card.note }}</div>
              </div>
              <div class="summary-icon" :class="card.iconClass">
                <v-icon>{{ card.icon }}</v-icon>
              </div>
            </div>
          </v-col>
        </v-row>

        <div class="dashboard-content-grid">
          <div class="dashboard-main-column">
            <section class="ui-card chart-panel animate-up delay-2">
              <div class="panel-head">
                <div>
                  <h2>Penjualan Mingguan</h2>
                  <p>7 hari terakhir - Rp</p>
                </div>
                <div class="legend-row">
                  <span><i class="legend-dot income"></i>Pendapatan</span>
                  <span><i class="legend-dot orders"></i>Pesanan</span>
                </div>
              </div>
              <div class="chart-box">
                <canvas id="dashboard-chart"></canvas>
              </div>
            </section>

          </div>

          <section class="ui-card top-menu-panel animate-up delay-3">
            <div class="panel-head compact top-menu-head">
              <div class="top-menu-head-copy">
                <div class="top-menu-title-row">
                  <h2>Menu Terlaris Bulan Ini</h2>
                  <button type="button" class="panel-link-button" @click="showAllProducts">
                    <span>Lihat semua</span>
                    <v-icon small>mdi-chevron-right</v-icon>
                  </button>
                </div>
                <p>Berdasarkan transaksi bulan berjalan</p>
              </div>
            </div>
            <div class="top-menu-list">
              <div v-for="(item, index) in topProducts" :key="item.nama" class="top-menu-item">
                <div class="menu-thumb">
                  <v-icon color="#c2372f">{{ menuIcon(item.nama, item.kategori) }}</v-icon>
                </div>
                <div class="top-menu-info">
                  <strong>{{ item.nama }}</strong>
                  <div class="top-menu-progress"><span :style="{width: progressWidth(item.qty)}"></span></div>
                  <small>{{ formatCurrency(item.omzet || 0, true) }}</small>
                </div>
                <b>{{ item.qty }}x</b>
              </div>
            </div>
          </section>
        </div>

        <section class="ui-card recent-orders animate-up delay-4">
          <div class="panel-head compact">
            <div>
              <h2>Pesanan Terbaru</h2>
              <p>Update realtime dari meja pelanggan</p>
            </div>
            <button type="button" @click="$root.setPage && $root.setPage('order')">Lihat semua -&gt;</button>
          </div>

          <v-simple-table class="doc-table">
            <template v-slot:default>
              <thead>
                <tr>
                  <th>ID Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!recentOrders.length">
                  <td colspan="5" class="empty-cell">Belum ada pesanan.</td>
                </tr>
                <tr v-for="order in recentOrders" :key="order.key">
                  <td><strong>{{ order.kode_pesanan }}</strong></td>
                  <td>{{ order.nama_pelanggan }} - Meja {{ order.no_meja || '-' }}</td>
                  <td><strong>Rp {{ formatCurrency(order.total) }}</strong></td>
                  <td><span class="status-pill" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span></td>
                  <td>{{ formatTime(order.tgl_pesanan) }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </section>
      </div>
    </div>
  `,
  data() {
    return {
      orders: [],
      menus: [],
      reportTodaySummary: { omzet: 0, modal: 0, laba: 0, qty: 0, transaksi: 0 },
      reportWeekRows: [],
      reportTopRows: [],
      loading: true,
      lastFetched: null
    }
  },
  mounted() {
    this.load()
  },
  computed: {
    currentDateText() {
      return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    },
    todayKey() {
      return this.toLocalDateKey(new Date())
    },
    todayOrders() {
      return this.groupOrders(this.orders).filter(order => (order.tgl_pesanan || '').slice(0, 10) === this.todayKey)
    },
    totalRevenue() {
      return Number(this.reportTodaySummary.omzet || 0)
    },
    pendingCount() {
      return this.groupOrders(this.orders).filter(order => order.status === 'baru').length
    },
    activeMenuCount() {
      return this.menus.length
    },
    lowStockCount() {
      return this.menus.filter(menu => Number(menu.stok || 0) > 0 && Number(menu.stok || 0) <= 5).length
    },
    summaryCards() {
      return [
        {
          label: 'Pesanan Hari Ini',
          value: this.todayOrders.length,
          note: 'Naik ' + Math.max(this.todayOrders.length, 1) + '% vs kemarin',
          noteClass: 'note-ok',
          icon: 'mdi-clipboard-text-outline',
          iconClass: 'icon-red'
        },
        {
          label: 'Total Transaksi Hari Ini',
          value: 'Rp ' + this.formatCurrency(this.totalRevenue),
          note: 'Naik 8.2%',
          noteClass: 'note-ok',
          icon: 'mdi-credit-card-outline',
          iconClass: 'icon-blue'
        },
        {
          label: 'Menunggu Konfirmasi',
          value: this.pendingCount,
          note: this.pendingCount ? 'Perlu tindakan' : 'Tidak ada antrian',
          noteClass: this.pendingCount ? 'note-alert' : 'note-ok',
          icon: 'mdi-alarm-check',
          iconClass: 'icon-yellow'
        },
        {
          label: 'Menu Aktif',
          value: this.activeMenuCount,
          note: this.lowStockCount + ' stok menipis',
          noteClass: this.lowStockCount ? 'note-danger' : 'note-ok',
          icon: 'mdi-noodles',
          iconClass: 'icon-green'
        }
      ]
    },
    topProducts() {
      const map = {}
      this.reportTopRows.forEach(row => {
        const name = row.nama_menu || 'Menu'
        if (!map[name]) map[name] = { nama: name, kategori: this.menuCategoryByName(name), qty: 0, omzet: 0 }
        map[name].qty += Number(row.qty || 0)
        map[name].omzet += Number(row.subtotal || 0)
      })

      let products = Object.keys(map).map(key => map[key]).sort((a, b) => b.qty - a.qty)
      if (!products.length) {
        products = this.menus.map(menu => ({
          nama: menu.nama || menu.nama_menu,
          kategori: menu.kategori,
          qty: Number(menu.stok || 0),
          omzet: Number(menu.harga || 0) * Number(menu.stok || 0)
        })).sort((a, b) => b.qty - a.qty)
      }
      return products.slice(0, 5)
    },
    recentOrders() {
      return this.groupOrders(this.orders).slice(0, 5)
    }
  },
  methods: {
    load() {
      this.loading = true
      const today = new Date()
      const todayKey = this.toLocalDateKey(today)
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      Promise.all([
        Api.getPesanan({}),
        Api.getMenu(),
        Api.getLaporan({ from: todayKey, to: todayKey }),
        Api.getLaporan({ from: this.toLocalDateKey(weekStart), to: todayKey }),
        Api.getLaporan({ from: this.toLocalDateKey(monthStart), to: todayKey })
      ]).then(([orders, menus, reportToday, reportWeek, reportTop]) => {
        this.orders = orders || []
        this.menus = menus || []
        this.reportTodaySummary = (reportToday && reportToday.summary) || { omzet: 0, modal: 0, laba: 0, qty: 0, transaksi: 0 }
        this.reportWeekRows = (reportWeek && reportWeek.rows) || []
        this.reportTopRows = (reportTop && reportTop.rows) || []
        this.lastFetched = new Date()
        this.loading = false
        this.$nextTick(() => this.drawChart())
      }).catch(err => {
        console.error('Dashboard load error:', err)
        this.loading = false
      })
    },
    groupOrders(items) {
      const map = {}
      const groups = []
      ;(items || []).forEach(item => {
        const key = item.kode_pesanan || item.id_pesanan || item.id
        if (!map[key]) {
          map[key] = {
            key,
            kode_pesanan: item.kode_pesanan || '-',
            nama_pelanggan: item.nama_pelanggan || 'Pelanggan Umum',
            no_meja: item.no_meja || '',
            tgl_pesanan: item.tgl_pesanan,
            total: 0,
            items: [],
            statuses: {}
          }
          groups.push(map[key])
        }
        const group = map[key]
        const subtotal = Number(item.subtotal || (item.harga * item.qty) || 0)
        group.total += subtotal
        group.items.push(item)
        group.statuses[item.status || 'baru'] = true
      })
      return groups.map(group => {
        const statuses = Object.keys(group.statuses)
        group.status = statuses.length === 1 ? statuses[0] : 'campuran'
        return group
      }).sort((a, b) => new Date(b.tgl_pesanan || 0) - new Date(a.tgl_pesanan || 0))
    },
    progressWidth(qty) {
      const top = this.topProducts[0] ? this.topProducts[0].qty : 1
      return Math.max(12, Math.round((qty / top) * 100)) + '%'
    },
    drawChart() {
      const canvas = document.getElementById('dashboard-chart')
      if (!canvas || !window.Chart) return
      const ctx = canvas.getContext('2d')
      if (window._dashChart) {
        try { window._dashChart.destroy() } catch (err) { }
      }

      const labels = []
      const data = []
      const now = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        const key = this.toLocalDateKey(date)
        labels.push(date.toLocaleDateString('id-ID', { weekday: 'short' }))
        data.push(
          this.reportWeekRows
            .filter(row => (row.tgl_transaksi || '').slice(0, 10) === key)
            .reduce((sum, row) => sum + Number(row.subtotal || 0), 0)
        )
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, 260)
      gradient.addColorStop(0, 'rgba(194, 55, 47, 0.28)')
      gradient.addColorStop(1, 'rgba(194, 55, 47, 0.02)')

      window._dashChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Pendapatan',
            data,
            borderColor: '#c2372f',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.38,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#c2372f',
            pointBorderWidth: 2,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#ececec' },
              ticks: { callback: value => this.formatCurrency(value, true) }
            },
            x: { grid: { display: false } }
          }
        }
      })
    },
    printDashboard() { window.print() },
    showAllProducts() {
      if (this.$root.setPage) this.$root.setPage('menu')
    },
    menuIcon(name, category) {
      const text = ((name || '') + ' ' + (category || '')).toLowerCase()
      if (text.includes('teh') || text.includes('jeruk') || text.includes('minum')) return 'mdi-cup'
      if (text.includes('mie')) return 'mdi-noodles'
      if (text.includes('kerupuk')) return 'mdi-cookie-outline'
      return 'mdi-bowl-mix'
    },
    menuCategoryByName(name) {
      const text = String(name || '').toLowerCase()
      if (text.includes('teh') || text.includes('jeruk') || text.includes('minum')) return 'Minuman'
      if (text.includes('mie')) return 'Mie'
      if (text.includes('kerupuk')) return 'Lainnya'
      return 'Bakso'
    },
    toLocalDateKey(date) {
      const d = new Date(date)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return y + '-' + m + '-' + day
    },
    statusLabel(status) {
      const map = { baru: 'Menunggu', diproses: 'Dikonfirmasi', selesai: 'Selesai', dibatalkan: 'Batal', campuran: 'Campuran' }
      return map[status] || status || '-'
    },
    statusClass(status) {
      const map = { baru: 'status-waiting', diproses: 'status-confirmed', selesai: 'status-done', dibatalkan: 'status-cancelled' }
      return map[status] || 'status-mixed'
    },
    formatCurrency(value, compact) {
      const n = Number(value || 0)
      if (compact && n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + 'jt'
      if (compact && n >= 1000) return 'Rp ' + Math.round(n / 1000) + 'k'
      return n.toLocaleString('id-ID')
    },
    formatTime(value) {
      if (!value) return '-'
      return new Date(value).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    }
  }
})

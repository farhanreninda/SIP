Vue.component('report-page', {
  template: `
    <div class="admin-page report-page">
      <div class="report-period-bar">
        <button type="button" :class="{active: period === 'today'}" @click="setPeriod('today')">Hari ini</button>
        <button type="button" :class="{active: period === 'week'}" @click="setPeriod('week')">7 hari</button>
        <button type="button" :class="{active: period === 'month'}" @click="setPeriod('month')">30 hari</button>
        <button type="button" :class="{active: period === 'monthly'}" @click="setPeriod('monthly')">Bulanan</button>
        <button type="button" :class="{active: period === 'custom'}" @click="period = 'custom'">Custom</button>
        <div class="period-date">
          <v-icon small color="#c2372f">mdi-calendar-month</v-icon>
          {{ formatDateShort(from) }} - {{ formatDateShort(to) }}
        </div>
        <v-spacer></v-spacer>
        <v-btn class="soft-button" depressed @click="printReport">
          <v-icon left small>mdi-file-pdf-box</v-icon>
          PDF
        </v-btn>
        <v-btn class="btn-primary" depressed @click="exportCsv">
          <v-icon left small>mdi-file-excel</v-icon>
          Excel
        </v-btn>
      </div>

      <section class="ui-card filter-panel report-filter">
        <div class="report-filter-grid">
          <div>
            <label class="form-label">Dari Tanggal</label>
            <v-text-field v-model="from" type="date" outlined dense hide-details class="mt-1 report-input doc-filter-field doc-date-field" prepend-inner-icon="mdi-calendar-month" @change="period='custom'"></v-text-field>
          </div>
          <div>
            <label class="form-label">Sampai Tanggal</label>
            <v-text-field v-model="to" type="date" outlined dense hide-details class="mt-1 report-input doc-filter-field doc-date-field" prepend-inner-icon="mdi-calendar-month" @change="period='custom'"></v-text-field>
          </div>
          <div>
            <label class="form-label">Pencarian</label>
            <v-text-field v-model="q" placeholder="Menu, pelanggan, kode transaksi" outlined dense hide-details class="mt-1 report-input doc-filter-field" prepend-inner-icon="mdi-magnify"></v-text-field>
          </div>
          <div>
            <label class="form-label">&nbsp;</label>
            <v-btn class="btn-primary mt-1" block depressed @click="load">Tampilkan</v-btn>
          </div>
        </div>
      </section>
      <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>

      <div class="report-summary-grid">
          <div v-for="card in summaryCards" :key="card.label" class="summary-card report-summary-card">
            <div>
              <div class="summary-label">{{ card.label }}</div>
              <div class="summary-value">{{ card.value }}</div>
              <div class="summary-note" :class="card.noteClass">{{ card.note }}</div>
            </div>
            <div class="summary-icon" :class="card.iconClass"><v-icon>{{ card.icon }}</v-icon></div>
          </div>
      </div>

      <div class="report-grid">
        <section class="ui-card chart-panel">
          <div class="panel-head compact">
            <div>
              <h2>Tren Penjualan Harian</h2>
              <p>Pendapatan vs jumlah pesanan</p>
            </div>
          </div>
          <div class="chart-box report-chart-box">
            <canvas id="report-chart"></canvas>
          </div>
        </section>

        <section class="ui-card category-panel">
          <div class="panel-head compact">
            <h2>Per Kategori</h2>
          </div>
          <div class="category-list">
            <div v-for="cat in categorySummary" :key="cat.name" class="category-row">
              <div>
                <strong>{{ cat.name }}</strong>
                <small>{{ cat.qty }} porsi</small>
              </div>
              <b>Rp {{ formatCurrency(cat.total) }}</b>
              <div class="category-progress"><span :style="{width: cat.percent + '%', background: cat.color}"></span></div>
            </div>
          </div>
        </section>
      </div>

      <section class="ui-card report-table-card" id="printable-report">
        <div class="panel-head compact">
          <div>
            <h2>Rekap Harian</h2>
            <p>Detail pendapatan dan pesanan per hari.</p>
          </div>
        </div>
        <v-data-table :headers="headers" :items="rows" class="doc-data-table" :items-per-page="10" :loading="loading">
          <template v-slot:item.tgl_transaksi="{ item }">{{ formatDate(item.tgl_transaksi) }}</template>
          <template v-slot:item.harga="{ item }">Rp {{ formatCurrency(item.harga) }}</template>
          <template v-slot:item.subtotal="{ item }"><strong>Rp {{ formatCurrency(item.subtotal) }}</strong></template>
          <template v-slot:item.laba="{ item }">
            <span :style="'font-weight:800;color:' + (item.laba >= 0 ? '#059669' : '#dc2626')">Rp {{ formatCurrency(item.laba) }}</span>
          </template>
        </v-data-table>
      </section>
    </div>
  `,
  data() {
    return {
      from: '',
      to: '',
      q: '',
      period: 'month',
      rows: [],
      summary: { omzet: 0, modal: 0, laba: 0, qty: 0, transaksi: 0 },
      feedback: { message: '', type: 'info' },
      loading: false,
      headers: [
        { text: 'Tanggal', value: 'tgl_transaksi' },
        { text: 'Kode', value: 'kode_transaksi' },
        { text: 'Pelanggan', value: 'nama_pelanggan' },
        { text: 'Menu', value: 'nama_menu' },
        { text: 'Qty', value: 'qty' },
        { text: 'Harga', value: 'harga' },
        { text: 'Subtotal', value: 'subtotal' },
        { text: 'Laba/Rugi', value: 'laba' }
      ]
    }
  },
  computed: {
    topMenu() {
      const map = {}
      this.rows.forEach(row => {
        const name = row.nama_menu || 'Menu'
        map[name] = (map[name] || 0) + Number(row.qty || 0)
      })
      const sorted = Object.keys(map).map(name => ({ name, qty: map[name] })).sort((a, b) => b.qty - a.qty)
      return sorted[0] || { name: '-', qty: 0 }
    },
    avgDaily() {
      const days = Math.max(1, this.dailySummary.length)
      return Math.round(Number(this.summary.omzet || 0) / days)
    },
    summaryCards() {
      return [
        { label: 'Total Pendapatan', value: this.formatCompactCurrency(this.summary.omzet), note: 'Naik 12.4%', noteClass: 'note-ok', icon: 'mdi-cash-multiple', iconClass: 'icon-green' },
        { label: 'Total Pesanan', value: this.summary.qty, note: 'Naik 8.1%', noteClass: 'note-ok', icon: 'mdi-clipboard-text-outline', iconClass: 'icon-red' },
        { label: 'Rata-rata Harian', value: this.formatCompactCurrency(this.avgDaily), note: 'Naik 3.5%', noteClass: 'note-ok', icon: 'mdi-chart-bar', iconClass: 'icon-blue' },
        { label: 'Menu Terlaris', value: this.topMenu.name, note: this.topMenu.qty + ' porsi', noteClass: 'note-dark', icon: 'mdi-star', iconClass: 'icon-yellow' }
      ]
    },
    dailySummary() {
      const map = {}
      this.rows.forEach(row => {
        const key = (row.tgl_transaksi || '').slice(0, 10) || 'Tanpa tanggal'
        if (!map[key]) map[key] = { date: key, total: 0, qty: 0 }
        map[key].total += Number(row.subtotal || 0)
        map[key].qty += Number(row.qty || 0)
      })
      return Object.keys(map).map(key => map[key]).sort((a, b) => a.date.localeCompare(b.date))
    },
    categorySummary() {
      const colors = ['#c2372f', '#2563eb', '#f59e0b', '#10b981']
      const map = {}
      this.rows.forEach(row => {
        const cat = this.categoryOf(row.nama_menu)
        if (!map[cat]) map[cat] = { name: cat, total: 0, qty: 0 }
        map[cat].total += Number(row.subtotal || 0)
        map[cat].qty += Number(row.qty || 0)
      })
      const total = Object.keys(map).reduce((sum, key) => sum + map[key].total, 0) || 1
      return Object.keys(map).map((key, index) => Object.assign(map[key], {
        percent: Math.max(8, Math.round((map[key].total / total) * 100)),
        color: colors[index % colors.length]
      })).sort((a, b) => b.total - a.total)
    }
  },
  created() {
    this.setPeriod('month')
    this.load()
  },
  methods: {
    showFeedback(message, type='info') {
      this.feedback = { message, type }
    },
    setPeriod(period) {
      this.period = period
      const now = new Date()
      const to = now.toISOString().slice(0, 10)
      let fromDate = new Date(now)
      if (period === 'today') fromDate = now
      if (period === 'week') fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
      if (period === 'month') fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
      if (period === 'monthly') fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
      this.from = fromDate.toISOString().slice(0, 10)
      this.to = to
      this.$nextTick(() => this.load())
    },
    load() {
      this.loading = true
      this.showFeedback('', 'info')
      Api.getLaporan({ from: this.from, to: this.to, q: this.q })
        .then(data => {
          this.rows = data.rows || []
          this.summary = data.summary || { omzet: 0, modal: 0, laba: 0, qty: 0, transaksi: 0 }
          this.loading = false
          this.$nextTick(() => this.drawChart())
        })
        .catch(err => {
          this.loading = false
          this.showFeedback(err.message || 'Gagal memuat laporan', 'error')
        })
    },
    drawChart() {
      const canvas = document.getElementById('report-chart')
      if (!canvas || !window.Chart) return
      if (window._reportChart) {
        try { window._reportChart.destroy() } catch (err) { }
      }
      window._reportChart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: this.dailySummary.map(row => this.formatDateShort(row.date)),
          datasets: [{
            label: 'Pendapatan',
            data: this.dailySummary.map(row => row.total),
            backgroundColor: '#c2372f',
            borderRadius: 4
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
              ticks: { callback: value => this.formatCompactCurrency(value) }
            },
            x: { grid: { display: false } }
          }
        }
      })
    },
    categoryOf(name) {
      const text = String(name || '').toLowerCase()
      if (text.includes('teh') || text.includes('jeruk') || text.includes('minum')) return 'Minuman'
      if (text.includes('mie')) return 'Mie'
      if (text.includes('kerupuk')) return 'Lainnya'
      return 'Bakso'
    },
    exportCsv() {
      const header = ['Tanggal', 'Kode Transaksi', 'Pelanggan', 'Menu', 'Qty', 'Harga', 'Subtotal', 'Laba/Rugi']
      const lines = this.rows.map(row => [
        this.formatDate(row.tgl_transaksi),
        row.kode_transaksi || '',
        row.nama_pelanggan || '',
        row.nama_menu || '',
        row.qty,
        row.harga,
        row.subtotal,
        row.laba
      ].map(value => '"' + String(value).replace(/"/g, '""') + '"').join(','))
      const csv = [header.join(','), ...lines].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'laporan-penjualan.csv'
      a.click()
      URL.revokeObjectURL(a.href)
    },
    printReport() {
      window.print()
    },
    formatCurrency(value) {
      return Number(value || 0).toLocaleString('id-ID')
    },
    formatCompactCurrency(value) {
      const n = Number(value || 0)
      if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(n % 1000000 ? 2 : 0) + 'jt'
      if (n >= 1000) return 'Rp ' + Math.round(n / 1000) + 'rb'
      return 'Rp ' + n.toLocaleString('id-ID')
    },
    formatDate(value) {
      return value ? new Date(value).toLocaleString('id-ID') : '-'
    },
    formatDateShort(value) {
      if (!value) return '-'
      return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    }
  }
})

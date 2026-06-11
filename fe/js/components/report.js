Vue.component('report-page', {
  template: `
    <div class="admin-page report-page">
      <div class="print-report-head">
        <div>
          <span>Warung Bakso Tulus</span>
          <h1>Laporan Penjualan</h1>
          <p>Periode {{ printPeriodText }}</p>
        </div>
        <div class="print-report-meta">
          <small>Omzet Kotor</small>
          <strong>{{ formatCompactCurrency(summary.omzet) }}</strong>
        </div>
      </div>

      <div class="report-period-bar">
        <button type="button" :class="{active: period === 'today'}" @click="setPeriod('today')">Hari ini</button>
        <button type="button" :class="{active: period === 'week'}" @click="setPeriod('week')">7 hari</button>
        <button type="button" :class="{active: period === 'month'}" @click="setPeriod('month')">30 hari</button>
        <button type="button" :class="{active: period === 'monthly'}" @click="setPeriod('monthly')">Bulanan</button>
        <div class="period-date">
          <v-icon small color="#c2372f">mdi-calendar-month</v-icon>
          {{ formatDateShort(from) }} - {{ formatDateShort(to) }}
        </div>
        <v-spacer></v-spacer>
        <v-btn class="soft-button" depressed @click="printReport">
          <v-icon left small>mdi-file-pdf-box</v-icon>
          Ekspor PDF
        </v-btn>
      </div>

      <section class="ui-card filter-panel report-filter">
        <div class="report-filter-grid">
          <div>
            <label class="form-label">Dari Tanggal</label>
            <v-menu
              v-model="fromMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="formatDateInput(from)"
                  outlined
                  dense
                  readonly
                  hide-details
                  class="mt-1 report-input doc-filter-field doc-date-field"
                  prepend-inner-icon="mdi-calendar-month"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="from"
                color="#c2372f"
                header-color="#c2372f"
                @input="fromMenu = false; period = 'manual'"
              ></v-date-picker>
            </v-menu>
          </div>
          <div>
            <label class="form-label">Sampai Tanggal</label>
            <v-menu
              v-model="toMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="formatDateInput(to)"
                  outlined
                  dense
                  readonly
                  hide-details
                  class="mt-1 report-input doc-filter-field doc-date-field"
                  prepend-inner-icon="mdi-calendar-month"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="to"
                color="#c2372f"
                header-color="#c2372f"
                @input="toMenu = false; period = 'manual'"
              ></v-date-picker>
            </v-menu>
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

      <section class="print-sales-detail">
        <div class="print-section-head">
          <h2>Detail Penjualan</h2>
          <p>{{ rows.length }} baris transaksi pada periode laporan.</p>
        </div>
        <table class="print-sales-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Kode</th>
              <th>Pelanggan</th>
              <th>Menu</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
              <th>Laba/Rugi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!rows.length">
              <td colspan="9" class="print-empty-row">Tidak ada data penjualan pada periode ini.</td>
            </tr>
            <tr v-for="(item, index) in rows" :key="(item.kode_transaksi || '-') + '-' + index">
              <td>{{ index + 1 }}</td>
              <td>{{ formatDate(item.tgl_transaksi) }}</td>
              <td>{{ item.kode_transaksi || '-' }}</td>
              <td>{{ item.nama_pelanggan || 'Pelanggan Umum' }}</td>
              <td>{{ item.nama_menu || '-' }}</td>
              <td>{{ item.qty }}</td>
              <td>Rp {{ formatCurrency(item.harga) }}</td>
              <td>Rp {{ formatCurrency(item.subtotal) }}</td>
              <td>Rp {{ formatCurrency(item.laba) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
  data() {
    return {
      from: '',
      to: '',
      fromMenu: false,
      toMenu: false,
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
    summaryCards() {
      return [
        { label: 'Omzet Kotor', value: this.formatCompactCurrency(this.summary.omzet), note: 'Total penjualan', noteClass: 'note-dark', icon: 'mdi-cash-multiple', iconClass: 'icon-green' },
        { label: 'Laba Bersih', value: this.formatCompactCurrency(this.summary.laba), note: 'Setelah dikurangi modal', noteClass: 'note-ok', icon: 'mdi-hand-coin-outline', iconClass: 'icon-blue' },
        { label: 'Total Modal', value: this.formatCompactCurrency(this.summary.modal), note: 'Modal bahan terjual', noteClass: 'note-dark', icon: 'mdi-swap-horizontal-bold', iconClass: 'icon-red' }
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
    },
    printPeriodText() {
      const from = this.formatDateInput(this.from) || '-'
      const to = this.formatDateInput(this.to) || '-'
      return from === to ? from : from + ' - ' + to
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
          const rows = this.normalizeReportRows(data.rows || [])
          this.rows = rows
          this.summary = this.buildSummary(rows)
          this.loading = false
          this.$nextTick(() => this.drawChart())
        })
        .catch(err => {
          this.loading = false
          this.showFeedback(err.message || 'Gagal memuat laporan', 'error')
        })
    },
    normalizeReportRows(rows) {
      return rows.map(row => {
        const qty = Number(row.qty || 0)
        const harga = Number(row.harga || 0)
        const modal = Number(row.modal || 0)
        const subtotal = Number(row.subtotal || harga * qty)
        const laba = Number(row.laba || ((harga - modal) * qty))

        return Object.assign({}, row, {
          qty,
          harga,
          modal,
          subtotal,
          laba
        })
      })
    },
    buildSummary(rows) {
      return rows.reduce((acc, row) => {
        acc.omzet += Number(row.subtotal || 0)
        acc.modal += Number(row.modal || 0) * Number(row.qty || 0)
        acc.laba += Number(row.laba || 0)
        acc.qty += Number(row.qty || 0)
        acc.transaksi += 1
        return acc
      }, { omzet: 0, modal: 0, laba: 0, qty: 0, transaksi: 0 })
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
    },
    formatDateInput(value) {
      if (!value) return ''
      return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  }
})

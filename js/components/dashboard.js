Vue.component('dashboard-page', {
  template: `
    <v-container fluid class="dashboard-page pa-0">
      
      <!-- FILTER HEADER -->
      <div class="d-flex justify-space-between align-center mb-6 animate-right">
          <div>
            <div class="greeting-text">{{ greeting.toUpperCase() }}!</div>
            <div class="welcome-text">Dashboard Utama</div>
          </div>
        
        <v-btn-toggle v-model="period" mandatory borderless class="filter-group">
          <v-btn value="today" small class="text-none px-4">Hari Ini</v-btn>
          <v-btn value="week" small class="text-none px-4">Minggu Ini</v-btn>
          <v-btn value="month" small class="text-none px-4">Bulan Ini</v-btn>
        </v-btn-toggle>
      </div>

      <v-fade-transition mode="out-in">
        <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center" style="height: 400px;">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <div class="mt-4 text-muted font-bold">Sinkronisasi Data...</div>
        </div>
        
        <div v-else key="content">
          <v-row class="mb-4">
            <!-- HIGHLIGHTED TODAY SALES -->
            <v-col cols="12" sm="6" md="3" class="animate-up delay-1">
              <v-card class="card-floating kpi-card highlight-kpi">
                <div class="kpi-info">
                  <span class="label white--text opacity-80">PENJUALAN {{ period === 'today' ? 'HARI INI' : (period === 'week' ? 'MINGGU INI' : 'BULAN INI') }}</span>
                  <span class="kpi-value white--text" style="font-size: 28px !important;">{{ formatCurrency(filteredTotal) }}</span>
                </div>
                <div class="kpi-icon highlight-icon">
                  <v-icon dark>mdi-chart-line</v-icon>
                </div>
                <div class="highlight-wave"></div>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3" class="animate-up delay-2" v-for="(kpi, i) in otherKpis" :key="i">
              <v-card class="card-floating kpi-card compact-kpi">
                <div class="kpi-info">
                  <span class="label">{{ kpi.label }}</span>
                  <span class="kpi-value compact-value">{{ kpi.value }}</span>
                </div>
                <div class="compact-icon-box" :style="'background: ' + kpi.color + '15; color: ' + kpi.color">
                  <v-icon color="inherit">{{ kpi.icon }}</v-icon>
                </div>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3" class="animate-up delay-4">
               <v-card class="card-floating kpi-card compact-kpi">
                <div class="kpi-info">
                  <span class="label">Produk Terlaris</span>
                  <span class="kpi-value compact-value" style="font-size: 14px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">{{ topProducts.length ? topProducts[0].nama : '-' }}</span>
                </div>
                <div class="compact-icon-box" style="background: #8b5cf615; color: #8b5cf6;">
                  <v-icon color="inherit">mdi-star</v-icon>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="8" class="animate-up delay-3">
              <v-card class="card-floating mb-4" style="height: 100%;">
                <div class="d-flex justify-space-between align-center mb-4">
                  <div class="chart-header mb-0">PRODUK TERLARIS ({{ periodText }})</div>
                  <div class="d-flex align-center">
                    <v-chip x-small color="success" class="mr-2 px-2" style="height: 18px;">LIVE</v-chip>
                    <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">{{ lastFetchedText }}</span>
                  </div>
                </div>
                <v-simple-table class="modern-table">
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left" style="width: 50px;">Rank</th>
                        <th class="text-left">Nama Produk</th>
                        <th class="text-left" style="width: 150px;">Performa Penjualan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, i) in topProducts" :key="p.nama" class="hover-row">
                        <td>
                          <div class="rank-badge" :class="'rank-'+(i+1)">{{ i + 1 }}</div>
                        </td>
                        <td>
                          <div class="font-bold" style="color: #0f172a;">{{ p.nama }}</div>
                          <div style="font-size: 11px; color: #94a3b8;">Kategori: Umum</div>
                        </td>
                        <td>
                          <div class="d-flex align-center">
                            <span class="font-bold mr-2" style="color: #2563eb;">{{ p.qty }}</span>
                            <v-progress-linear :value="(p.qty / (topProducts[0] ? topProducts[0].qty : 1)) * 100" color="#3b82f6" height="6" rounded></v-progress-linear>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" class="animate-up delay-4">
              <v-card class="card-floating dashboard-chart-card d-flex flex-column" style="height: 100%;">
                <div class="d-flex justify-space-between align-center mb-6">
                  <div class="chart-header mb-0">TREN PENJUALAN</div>
                  <v-icon small color="#94a3b8">mdi-dots-vertical</v-icon>
                </div>
                <div style="position:relative; flex: 1; min-height: 250px;">
                  <canvas id="dashboard-chart"></canvas>
                </div>
                <div class="mt-4 pt-4 border-top d-flex justify-space-between align-center" style="border-top: 1px solid #f1f5f9;">
                   <div class="text-center">
                      <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Rata-rata</div>
                      <div class="font-bold" style="color: #0f172a;">{{ formatCurrency(avgSales) }}</div>
                   </div>
                   <v-btn small text color="primary" class="text-none font-weight-bold">Detail Laporan</v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-fade-transition>
    </v-container>
  `,
  data() {
    return {
      transactions: [], loading: true,
      displayTotalNumeric: 0, displayTxCount: 0, displayItemsCount: 0, lastFetched: null,
      period: 'today',
      currentHour: new Date().getHours()
    }
  },
  mounted() { 
    this.render() 
    this.timer = setInterval(() => {
      this.currentHour = new Date().getHours()
    }, 60000)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  computed: {
    greeting() {
      const hour = this.currentHour
      if (hour >= 5 && hour < 11) return 'Selamat Pagi'
      if (hour >= 11 && hour < 15) return 'Selamat Siang'
      if (hour >= 15 && hour < 18) return 'Selamat Sore'
      return 'Selamat Malam'
    },
    periodText() {
      return this.period === 'today' ? 'Hari Ini' : (this.period === 'week' ? 'Minggu Ini' : 'Bulan Ini')
    },
    filteredTransactions() {
      const now = new Date()
      const today = now.toISOString().slice(0, 10)

      if (this.period === 'today') {
        return this.transactions.filter(t => t.date && t.date.slice(0, 10) === today)
      } else if (this.period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return this.transactions.filter(t => new Date(t.date) >= weekAgo)
      } else if (this.period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return this.transactions.filter(t => new Date(t.date) >= monthAgo)
      }
      return this.transactions
    },
    filteredTotal() {
      return this.filteredTransactions.reduce((s, t) => s + (t.total || 0), 0)
    },
    todayTotal() { return this.filteredTotal },
    txCount() { return this.filteredTransactions.length },
    totalItemsSold() {
      let total = 0
      this.filteredTransactions.forEach(tx => {
        if (Array.isArray(tx.items)) tx.items.forEach(it => total += Number(it.qty))
      })
      return total
    },
    topProducts() {
      const map = {}
      this.filteredTransactions.forEach(tx => { if (Array.isArray(tx.items)) tx.items.forEach(it => { map[it.nama] = (map[it.nama] || 0) + it.qty }) })
      const arr = Object.keys(map).map(k => ({ nama: k, qty: map[k] })).sort((a, b) => b.qty - a.qty)
      return arr.slice(0, 5)
    },

    otherKpis() {
      return [
        { label: 'Total Transaksi', value: this.txCount, icon: 'mdi-receipt', color: '#10b981' },
        { label: 'Item Terjual', value: this.totalItemsSold, icon: 'mdi-package-variant', color: '#f59e0b' }
      ]
    },
    avgSales() {
      if (!this.transactions.length) return 0
      const total = this.transactions.reduce((s, t) => s + (t.total || 0), 0)
      return total / this.transactions.length
    },
    lastFetchedText() {
      if (!this.lastFetched) return 'Menghitung...'
      return 'Update: ' + this.lastFetched.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  },
  methods: {
    setPeriod(p) { this.period = p; this.render() },
    render() {
      this.loading = true
      Api.getTransactions().then(r => {
        // Give enough time for the skeleton loader to show its purpose
        setTimeout(() => {
          this.transactions = r || []
          this.lastFetched = new Date()

          // Set values directly to avoid the laggy JS counting animation
          this.displayTotalNumeric = this.todayTotal
          this.displayTxCount = this.txCount
          this.displayItemsCount = this.totalItemsSold

          this.loading = false

          // CRITICAL: Wait for Vue to update the DOM (remove skeleton) 
          // then wait a bit more for the transition to settle before drawing the chart
          this.$nextTick(() => {
            setTimeout(() => {
              this.drawChart()
            }, 500)
          })
        }, 600)
      }).catch(err => {
        console.error('Dashboard load error:', err)
        this.loading = false
      })
    },
    formatCurrency(n) { if (!n) return 'Rp 0'; return 'Rp ' + Number(n).toLocaleString('id-ID') },
    drawChart() {
      const now = new Date(); const labels = []; const data = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        labels.push(d.toLocaleString('default', { month: 'short' }))
        const total = this.transactions.filter(tx => { const dt = new Date(tx.date); return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth() }).reduce((s, t) => s + (t.total || 0), 0)
        data.push(total)
      }

      const canvas = document.getElementById('dashboard-chart')
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (window._dashChart) try { window._dashChart.destroy() } catch (e) { }

      const gradient = ctx.createLinearGradient(0, 0, 0, 250)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)')
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)')

      window._dashChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Penjualan',
            data,
            borderColor: '#3b82f6',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#3b82f6',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1500, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#1e293b',
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              callbacks: { label(ctx) { return 'Total: Rp ' + Number(ctx.parsed.y).toLocaleString('id-ID') } }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: {
                font: { size: 10 },
                callback: v => 'Rp ' + (v >= 1000 ? (v / 1000) + 'k' : v)
              }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10, weight: 'bold' } }
            }
          }
        }
      })
    }
  }
})

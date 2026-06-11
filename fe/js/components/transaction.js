Vue.component('transaction-page', {
  template: `
    <div class="admin-page transaction-page">
      <div class="print-report-head">
        <div>
          <span>Warung Bakso Tulus</span>
          <h1>Laporan Transaksi</h1>
          <p>Periode {{ printPeriodText }} · {{ printMethodText }}</p>
        </div>
        <div class="print-report-meta">
          <small>Total Pendapatan</small>
          <strong>Rp {{ formatCurrency(totalRevenue) }}</strong>
        </div>
      </div>

      <div class="transaction-summary-grid">
        <div class="summary-card transaction-summary-card">
            <div>
              <div class="summary-label">Total Transaksi (Periode)</div>
              <div class="summary-value">{{ filteredTransactions.length }}</div>
              <div class="summary-note note-ok">Naik 12.3%</div>
            </div>
            <div class="summary-icon icon-blue"><v-icon>mdi-credit-card-outline</v-icon></div>
        </div>
        <div class="summary-card transaction-summary-card">
            <div>
              <div class="summary-label">Total Pendapatan</div>
              <div class="summary-value">Rp {{ formatCurrency(totalRevenue) }}</div>
              <div class="summary-note note-ok">Naik 18.5%</div>
            </div>
            <div class="summary-icon icon-green"><v-icon>mdi-cash-multiple</v-icon></div>
        </div>
        <div class="summary-card transaction-summary-card">
            <div>
              <div class="summary-label">Rata-rata / Transaksi</div>
              <div class="summary-value">Rp {{ formatCurrency(avgTransaction) }}</div>
              <div class="summary-note note-ok">Naik 4.1%</div>
            </div>
            <div class="summary-icon icon-red"><v-icon>mdi-chart-bar</v-icon></div>
        </div>
      </div>

      <section class="ui-card filter-panel">
        <div class="transaction-filter-grid">
          <div class="period-filter-group">
            <label class="form-label">Periode</label>
            <div class="period-buttons">
              <button type="button" :class="{active: period === 'today'}" @click="setPeriod('today')">Hari ini</button>
              <button type="button" :class="{active: period === 'week'}" @click="setPeriod('week')">7 hari</button>
              <button type="button" :class="{active: period === 'month'}" @click="setPeriod('month')">30 hari</button>
              <button type="button" :class="{active: period === 'monthly'}" @click="setPeriod('monthly')">Bulanan</button>
            </div>
          </div>

          <div>
            <label class="form-label">Dari</label>
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
                  class="mt-1 doc-filter-field doc-date-field"
                  prepend-inner-icon="mdi-calendar-month"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="from"
                color="#c2372f"
                header-color="#c2372f"
                @input="fromMenu = false; period = 'custom'"
              ></v-date-picker>
            </v-menu>
          </div>
          <div>
            <label class="form-label">Sampai</label>
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
                  class="mt-1 doc-filter-field doc-date-field"
                  prepend-inner-icon="mdi-calendar-month"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="to"
                color="#c2372f"
                header-color="#c2372f"
                @input="toMenu = false; period = 'custom'"
              ></v-date-picker>
            </v-menu>
          </div>
          <div>
            <label class="form-label">Metode</label>
            <v-select v-model="method" :items="methodOptions" outlined dense hide-details class="mt-1 doc-filter-field doc-select-field" prepend-inner-icon="mdi-tune-variant"></v-select>
          </div>
          <div class="transaction-filter-actions">
            <v-btn class="btn-primary" depressed @click="period = 'custom'">Terapkan</v-btn>
            <v-btn class="soft-button" depressed @click="exportPdf">
              <v-icon left small>mdi-file-pdf-box</v-icon>
              Ekspor PDF
            </v-btn>
          </div>
        </div>
      </section>

      <section class="ui-card transaction-history-card animate-up">
        <div class="panel-head compact">
          <div>
            <h2>Riwayat Transaksi</h2>
            <p>{{ filteredTransactions.length }} transaksi pada periode terpilih</p>
          </div>
          <div class="table-search compact-search">
            <v-icon small color="#c2372f">mdi-magnify</v-icon>
            <input v-model="q" type="search" placeholder="Cari ID / pelanggan">
          </div>
        </div>

        <v-data-table :headers="historyHeaders" :items="filteredTransactions" class="doc-data-table" :items-per-page="7">
          <template v-slot:item.kode_transaksi="{ item }">
            <strong>#{{ item.kode_transaksi || item.id }}</strong>
          </template>
          <template v-slot:item.date="{ item }">{{ formatDate(item.date || item.created_at) }}</template>
          <template v-slot:item.nama_pelanggan="{ item }">{{ item.nama_pelanggan || 'Pelanggan Umum' }}</template>
          <template v-slot:item.metode="{ item }">
            <span class="method-pill" :class="'method-' + methodSlug(methodForTx(item))">{{ methodForTx(item) }}</span>
          </template>
          <template v-slot:item.total="{ item }"><strong>Rp {{ formatCurrency(item.total) }}</strong></template>
          <template v-slot:item.kasir="{ item }">Admin01</template>
          <template v-slot:item.aksi="{ item }">
            <v-btn small outlined class="detail-button" @click="printReceipt(item)">
              <v-icon left small>mdi-printer</v-icon>
              Cetak
            </v-btn>
          </template>
        </v-data-table>
      </section>

      <section class="print-transaction-report">
        <div class="print-transaction-summary">
          <div>
            <span>Total Transaksi</span>
            <strong>{{ filteredTransactions.length }}</strong>
          </div>
          <div>
            <span>Total Pendapatan</span>
            <strong>Rp {{ formatCurrency(totalRevenue) }}</strong>
          </div>
          <div>
            <span>Rata-rata / Transaksi</span>
            <strong>Rp {{ formatCurrency(avgTransaction) }}</strong>
          </div>
          <div>
            <span>Periode</span>
            <strong>{{ printPeriodText }}</strong>
          </div>
        </div>

        <table class="print-transaction-table">
          <thead>
            <tr>
              <th>No</th>
              <th>ID Transaksi</th>
              <th>Tgl Bayar</th>
              <th>Pelanggan</th>
              <th>Metode</th>
              <th>Total</th>
              <th>Kasir</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredTransactions.length">
              <td colspan="7" class="print-empty-row">Tidak ada transaksi pada periode ini.</td>
            </tr>
            <tr v-for="(item, index) in filteredTransactions" :key="item.kode_transaksi || item.id || index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.kode_transaksi || item.id || '-' }}</td>
              <td>{{ formatDateLong(item.date || item.created_at) }}</td>
              <td>{{ item.nama_pelanggan || 'Pelanggan Umum' }}</td>
              <td>{{ methodForTx(item) }}</td>
              <td>Rp {{ formatCurrency(item.total) }}</td>
              <td>Admin01</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="ui-card cashier-card animate-up delay-2">
        <div class="panel-head compact">
          <div>
            <h2>Input Transaksi Kasir</h2>
            <p>Catat transaksi langsung dan cetak struk pembayaran.</p>
          </div>
          <strong>Total: Rp {{ formatCurrency(total) }}</strong>
        </div>

        <div class="cashier-grid">
          <div>
            <label class="form-label">Nama Pelanggan</label>
            <v-text-field v-model="namaPelanggan" outlined dense hide-details class="mt-1" placeholder="Pelanggan Umum"></v-text-field>
          </div>
          <div>
            <label class="form-label">Pilih Menu</label>
            <v-autocomplete
              :items="menus"
              item-text="nama"
              item-value="id_menu"
              v-model.number="selectedId"
              placeholder="Ketik nama menu..."
              outlined
              dense
              hide-details
              class="mt-1"
            ></v-autocomplete>
          </div>
          <div>
            <label class="form-label">Qty</label>
            <v-text-field v-model.number="qty" type="number" min="1" outlined dense hide-details class="mt-1"></v-text-field>
          </div>
          <div>
            <label class="form-label">Pembayaran</label>
            <v-select v-model="paymentMethod" :items="paymentOptions" outlined dense hide-details class="mt-1"></v-select>
          </div>
          <div class="cashier-add">
            <v-btn class="soft-button" depressed block @click="addToCart">
              <v-icon left small>mdi-plus</v-icon>
              Tambah
            </v-btn>
          </div>
        </div>

        <div class="manual-cart mt-4">
          <div v-if="!cart.length" class="empty-box">Belum ada menu di keranjang transaksi.</div>
          <div v-for="(item, index) in cart" :key="index" class="manual-cart-row">
            <div>
              <strong>{{ item.nama }}</strong>
              <small>{{ item.qty }} x Rp {{ formatCurrency(item.harga) }}</small>
            </div>
            <strong>Rp {{ formatCurrency(item.harga * item.qty) }}</strong>
            <v-btn icon small @click="removeFromCart(index)"><v-icon small>mdi-close</v-icon></v-btn>
          </div>
        </div>

        <div class="cashier-footer">
          <v-btn class="btn-primary" depressed :disabled="!cart.length" @click="checkout">
            <v-icon left small>mdi-cash-register</v-icon>
            Selesaikan Transaksi
          </v-btn>
        </div>
        <div class="cashier-feedback-wrap">
          <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>
        </div>
      </section>
    </div>
  `,
  data() {
    return {
      menus: [],
      transactions: [],
      selectedId: null,
      qty: 1,
      namaPelanggan: '',
      paymentMethod: 'Tunai',
      cart: [],
      period: 'month',
      from: '',
      to: '',
      fromMenu: false,
      toMenu: false,
      method: 'all',
      q: '',
      feedback: { message: '', type: 'info' },
      methodOptions: [
        { text: 'Semua', value: 'all' },
        { text: 'Tunai', value: 'Tunai' }
      ],
      paymentOptions: ['Tunai'],
      historyHeaders: [
        { text: 'ID Pesanan', value: 'kode_transaksi' },
        { text: 'Tgl Bayar', value: 'date' },
        { text: 'Pelanggan', value: 'nama_pelanggan' },
        { text: 'Metode', value: 'metode' },
        { text: 'Total', value: 'total' },
        { text: 'Kasir', value: 'kasir' },
        { text: 'Aksi', value: 'aksi', sortable: false }
      ]
    }
  },
  computed: {
    total() {
      return this.cart.reduce((sum, item) => sum + (item.harga * item.qty), 0)
    },
    filteredTransactions() {
      return (this.transactions || []).filter(tx => {
        const date = this.toLocalDateKey(tx.date || tx.created_at)
        if (this.from && date && date < this.from) return false
        if (this.to && date && date > this.to) return false
        if (this.method !== 'all' && this.methodForTx(tx) !== this.method) return false
        if (this.q) {
          const text = [tx.kode_transaksi, tx.nama_pelanggan, tx.total].join(' ').toLowerCase()
          if (!text.includes(this.q.toLowerCase())) return false
        }
        return true
      })
    },
    totalRevenue() {
      return this.filteredTransactions.reduce((sum, tx) => sum + Number(tx.total || 0), 0)
    },
    avgTransaction() {
      return this.filteredTransactions.length ? Math.round(this.totalRevenue / this.filteredTransactions.length) : 0
    },
    printPeriodText() {
      const from = this.formatDateInput(this.from) || '-'
      const to = this.formatDateInput(this.to) || '-'
      return from === to ? from : from + ' - ' + to
    },
    printMethodText() {
      return this.method === 'all' ? 'Semua metode' : this.method
    }
  },
  created() {
    this.setPeriod('month')
    this.loadAll()
  },
  methods: {
    showFeedback(message, type='info') {
      this.feedback = { message, type }
    },
    loadAll() {
      Api.getMenu().then(data => { this.menus = data || [] })
      Api.getTransactions().then(data => { this.transactions = data || [] })
    },
    setPeriod(period) {
      this.period = period
      const now = new Date()
      const to = this.toLocalDateKey(now)
      let fromDate = new Date(now)
      if (period === 'today') fromDate = now
      if (period === 'week') fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
      if (period === 'month') fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
      if (period === 'monthly') fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
      this.from = this.toLocalDateKey(fromDate)
      this.to = to
    },
    toLocalDateKey(value) {
      if (!value) return ''
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return ''
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return y + '-' + m + '-' + day
    },
    addToCart() {
      this.showFeedback('', 'info')
      if (!this.selectedId) { this.showFeedback('Pilih menu', 'error'); return }
      const menu = this.menus.find(item => Number(item.id_menu || item.id) === Number(this.selectedId))
      if (!menu) { this.showFeedback('Menu tidak ditemukan', 'error'); return }
      if (this.qty <= 0) { this.showFeedback('Jumlah harus lebih dari 0', 'error'); return }
      if (this.qty > Number(menu.stok || 0)) { this.showFeedback('Stok tidak cukup', 'error'); return }

      const existing = this.cart.find(item => Number(item.id_menu) === Number(menu.id_menu || menu.id))
      if (existing) {
        if (existing.qty + this.qty > Number(menu.stok || 0)) { this.showFeedback('Stok tidak cukup', 'error'); return }
        existing.qty += this.qty
      } else {
        this.cart.push({
          id: menu.id_menu || menu.id,
          id_menu: menu.id_menu || menu.id,
          nama: menu.nama || menu.nama_menu,
          nama_menu: menu.nama_menu || menu.nama,
          harga: Number(menu.harga || 0),
          qty: Number(this.qty)
        })
      }
      this.selectedId = null
      this.qty = 1
      this.showFeedback('Menu ditambahkan ke keranjang.', 'success')
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },
    checkout() {
      this.showFeedback('', 'info')
      if (!this.cart.length) { this.showFeedback('Cart kosong', 'error'); return }
      Api.checkout({
        items: this.cart,
        nama_pelanggan: this.namaPelanggan || 'Pelanggan Umum',
        total: this.total,
        metode_pembayaran: 'Tunai'
      }).then(tx => {
        this.showFeedback('Transaksi berhasil', 'success')
        tx.metode_pembayaran = 'Tunai'
        this.printReceipt(tx)
        this.cart = []
        this.namaPelanggan = ''
        this.paymentMethod = 'Tunai'
        this.loadAll()
      }).catch(err => this.showFeedback(err.message || 'Transaksi gagal', 'error'))
    },
    methodForTx(tx) {
      return 'Tunai'
    },
    methodSlug(value) {
      return String(value || '').toLowerCase()
    },
    exportPdf() {
      window.print()
    },
    printReceipt(tx) {
      const items = (tx.items || []).map(item => `
        <tr><td>${item.nama || item.nama_menu}</td><td>${item.qty}</td><td>Rp ${this.formatCurrency(item.harga)}</td><td>Rp ${this.formatCurrency(item.subtotal || item.harga * item.qty)}</td></tr>
      `).join('')
      const html = `
        <html><head><title>Struk ${tx.kode_transaksi || ''}</title>
        <style>body{font-family:Arial;padding:24px;color:#1f2937;}table{width:100%;border-collapse:collapse;margin-top:16px;}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}.total{font-size:20px;font-weight:bold;text-align:right;margin-top:20px}.brand{color:#c2372f;font-weight:800}</style>
        </head><body>
          <h2 class="brand">Warung Bakso Tulus</h2>
          <div>Kode: ${tx.kode_transaksi || tx.id || '-'}</div>
          <div>Pelanggan: ${tx.nama_pelanggan || 'Pelanggan Umum'}</div>
          <div>Metode: ${this.methodForTx(tx)}</div>
          <div>Tanggal: ${this.formatDate(tx.date || tx.created_at || new Date())}</div>
          <table><thead><tr><th>Menu</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead><tbody>${items}</tbody></table>
          <div class="total">Total: Rp ${this.formatCurrency(tx.total)}</div>
        </body></html>`
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
        win.focus()
        win.print()
      }
    },
    formatCurrency(value) {
      return Number(value || 0).toLocaleString('id-ID')
    },
    formatDate(value) {
      return value ? new Date(value).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'
    },
    formatDateLong(value) {
      return value ? new Date(value).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
    },
    formatDateInput(value) {
      if (!value) return ''
      return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  }
})

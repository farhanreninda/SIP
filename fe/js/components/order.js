Vue.component('order-page', {
  template: `
    <div class="admin-page order-page">
      <div class="order-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          :class="{active: filterStatus === tab.value}"
          @click="filterStatus = tab.value"
        >
          {{ tab.text }} <span>{{ tab.count }}</span>
        </button>
      </div>

      <div class="table-toolbar">
        <div class="toolbar-left">
          <div class="table-search">
            <v-icon small color="#c2372f">mdi-magnify</v-icon>
            <input v-model="q" type="search" placeholder="Cari ID pesanan / nama pelanggan">
          </div>
          <v-select
            v-model="dateFilter"
            :items="dateOptions"
            dense
            outlined
            hide-details
            prepend-inner-icon="mdi-calendar-range"
            class="doc-select doc-filter-field doc-select-field"
          ></v-select>
        </div>
        <div class="toolbar-actions">
          <v-btn class="soft-button" depressed @click="exportOrders">
            <v-icon left small>mdi-download</v-icon>
            Ekspor
          </v-btn>
          <v-btn class="btn-primary" depressed @click="openManualDialog">
            <v-icon left small>mdi-plus</v-icon>
            Tambah Manual
          </v-btn>
        </div>
      </div>
      <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>

      <section class="ui-card order-table-card animate-up">
        <v-data-table
          v-model="selectedRows"
          :headers="headers"
          :items="filteredGroups"
          :loading="loading"
          show-select
          item-key="key"
          class="doc-data-table"
          :items-per-page="8"
          loading-text="Memuat pesanan..."
          no-data-text="Belum ada pesanan untuk filter ini."
        >
          <template v-slot:item.no="{ item }">
            {{ filteredGroups.indexOf(item) + 1 }}
          </template>

          <template v-slot:item.kode_pesanan="{ item }">
            <strong>#{{ item.kode_pesanan }}</strong>
          </template>

          <template v-slot:item.nama_pelanggan="{ item }">
            <div class="customer-cell">
              <span>{{ initial(item.nama_pelanggan) }}</span>
              <div>
                <strong>{{ item.nama_pelanggan }}</strong>
                <small>Meja {{ item.no_meja || '-' }}</small>
              </div>
            </div>
          </template>

          <template v-slot:item.tgl_pesanan="{ item }">
            {{ formatDate(item.tgl_pesanan) }}
          </template>

          <template v-slot:item.total="{ item }">
            <strong>Rp {{ formatCurrency(item.total) }}</strong>
          </template>

          <template v-slot:item.status="{ item }">
            <span class="status-pill" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
          </template>

          <template v-slot:item.aksi="{ item }">
            <div class="row-actions">
              <v-btn v-if="item.status === 'baru'" small depressed class="btn-primary action-btn" :loading="isUpdating(item)" @click="setGroupStatus(item, 'diproses')">
                Konfirmasi
              </v-btn>
              <v-btn v-else-if="item.status === 'diproses'" small depressed class="success-button action-btn" :loading="isUpdating(item)" @click="setGroupStatus(item, 'selesai')">
                Tandai Selesai
              </v-btn>
              <v-btn small outlined class="detail-button" @click="openDetail(item)">Detail</v-btn>
              <v-btn icon small class="danger-icon-btn" :disabled="item.status === 'selesai' || isUpdating(item)" @click="removeGroup(item)">
                <v-icon small>mdi-trash-can-outline</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </section>

      <v-dialog v-model="manualDialog" max-width="760px" persistent>
        <v-card class="doc-dialog">
          <v-card-title>
            <div>
              <strong>Tambah Pesanan Manual</strong>
              <small>Input pesanan dari kasir/admin.</small>
            </div>
            <v-spacer></v-spacer>
            <v-btn icon @click="manualDialog=false"><v-icon>mdi-close</v-icon></v-btn>
          </v-card-title>

          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <label class="form-label">Nama Pelanggan</label>
                <v-text-field v-model="manual.nama_pelanggan" outlined dense hide-details class="mt-1"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <label class="form-label">Nomor Meja</label>
                <v-text-field v-model="manual.no_meja" outlined dense hide-details class="mt-1"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <label class="form-label">Menu</label>
                <v-autocomplete
                  v-model.number="manualMenuId"
                  :items="menus"
                  item-text="nama"
                  item-value="id_menu"
                  outlined
                  dense
                  hide-details
                  class="mt-1"
                  placeholder="Pilih menu"
                ></v-autocomplete>
              </v-col>
              <v-col cols="8" md="4">
                <label class="form-label">Keterangan</label>
                <v-text-field v-model="manualNote" outlined dense hide-details class="mt-1" placeholder="Opsional"></v-text-field>
              </v-col>
              <v-col cols="4" md="2">
                <label class="form-label">Qty</label>
                <v-text-field v-model.number="manualQty" type="number" min="1" outlined dense hide-details class="mt-1"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-btn class="soft-button" depressed @click="addManualItem">
                  <v-icon left small>mdi-plus</v-icon>
                  Tambah ke Pesanan
                </v-btn>
              </v-col>
            </v-row>

            <div class="manual-cart">
              <div v-if="!manual.items.length" class="empty-box">Belum ada menu yang dipilih.</div>
              <div v-for="(item, index) in manual.items" :key="index" class="manual-cart-row">
                <div>
                  <strong>{{ item.nama }}</strong>
                  <small>{{ item.qty }} x Rp {{ formatCurrency(item.harga) }} - {{ item.keterangan || 'Tanpa catatan' }}</small>
                </div>
                <strong>Rp {{ formatCurrency(item.harga * item.qty) }}</strong>
                <v-btn icon small @click="manual.items.splice(index,1)"><v-icon small>mdi-close</v-icon></v-btn>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text class="text-none font-weight-bold" @click="manualDialog=false">Batal</v-btn>
            <v-btn class="btn-primary" depressed :loading="manualSaving" @click="saveManualOrder">Simpan Pesanan</v-btn>
          </v-card-actions>
          <div class="dialog-feedback-wrap">
            <inline-feedback :message="manualFeedback.message" :type="manualFeedback.type"></inline-feedback>
          </div>
        </v-card>
      </v-dialog>

      <v-dialog v-model="detailDialog" max-width="680px">
        <v-card class="doc-dialog" v-if="detailOrder">
          <v-card-title>
            <div>
              <strong>#{{ detailOrder.kode_pesanan }}</strong>
              <small>{{ detailOrder.nama_pelanggan }} - Meja {{ detailOrder.no_meja || '-' }}</small>
            </div>
            <v-spacer></v-spacer>
            <span class="status-pill" :class="statusClass(detailOrder.status)">{{ statusLabel(detailOrder.status) }}</span>
          </v-card-title>
          <v-card-text>
            <div class="detail-general-note">
              <span>Catatan semua</span>
              <strong>{{ detailOrder.catatan_umum || 'Tidak ada catatan semua' }}</strong>
            </div>
            <div class="detail-list">
              <div v-for="item in detailOrder.items" :key="item.id_pesanan || item.id" class="detail-row">
                <div>
                  <strong>{{ item.nama_menu }}</strong>
                  <small>Catatan produk: {{ item.keterangan_produk || item.keterangan || 'Tidak ada' }}</small>
                </div>
                <span>{{ item.qty }} x Rp {{ formatCurrency(item.harga) }}</span>
                <strong>Rp {{ formatCurrency(item.subtotal) }}</strong>
              </div>
            </div>
            <div class="detail-total">
              <span>Total Harga</span>
              <strong>Rp {{ formatCurrency(detailOrder.total) }}</strong>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  `,
  data() {
    return {
      orders: [],
      menus: [],
      loading: false,
      updatingOrders: {},
      filterStatus: '',
      dateFilter: 'all',
      q: '',
      selectedRows: [],
      feedback: { message: '', type: 'info' },
      manualFeedback: { message: '', type: 'info' },
      manualDialog: false,
      manualSaving: false,
      manualMenuId: null,
      manualQty: 1,
      manualNote: '',
      manual: {
        nama_pelanggan: '',
        no_meja: '',
        items: []
      },
      detailDialog: false,
      detailOrder: null,
      dateOptions: [
        { text: 'Semua Tanggal', value: 'all' },
        { text: 'Hari Ini', value: 'today' },
        { text: '7 Hari', value: 'week' },
        { text: '30 Hari', value: 'month' }
      ],
      headers: [
        { text: 'No', value: 'no', sortable: false, width: 64 },
        { text: 'ID Pesanan', value: 'kode_pesanan' },
        { text: 'Nama Pelanggan', value: 'nama_pelanggan' },
        { text: 'Tgl Pesanan', value: 'tgl_pesanan' },
        { text: 'Total Harga', value: 'total' },
        { text: 'Status', value: 'status' },
        { text: 'Aksi', value: 'aksi', sortable: false, width: 260 }
      ]
    }
  },
  created() {
    this.load()
    Api.getMenu().then(data => { this.menus = data || [] })
  },
  computed: {
    groupedOrders() {
      const map = {}
      const groups = []
      ;(this.orders || []).forEach(item => {
        const key = item.kode_pesanan || item.id_pesanan || item.id
        if (!map[key]) {
          map[key] = {
            key,
            kode_pesanan: item.kode_pesanan || '-',
            nama_pelanggan: item.nama_pelanggan || 'Pelanggan Umum',
            no_meja: item.no_meja || '-',
            tgl_pesanan: item.tgl_pesanan,
            items: [],
            total: 0,
            statuses: {},
            deletable: false,
            catatan_umum: ''
          }
          groups.push(map[key])
        }

        const group = map[key]
        const qty = Number(item.qty || 0)
        const harga = Number(item.harga || 0)
        const subtotal = Number(item.subtotal || (qty * harga) || 0)
        group.total += subtotal
        group.statuses[item.status || 'baru'] = true
        group.deletable = group.deletable || item.status !== 'selesai'
        if (!group.catatan_umum && item.catatan_umum) group.catatan_umum = item.catatan_umum
        group.items.push(Object.assign({}, item, { subtotal }))
      })

      return groups.map(group => {
        const statuses = Object.keys(group.statuses).filter(Boolean)
        group.status = statuses.length === 1 ? statuses[0] : 'campuran'
        return group
      }).sort((a, b) => new Date(b.tgl_pesanan || 0) - new Date(a.tgl_pesanan || 0))
    },
    filteredGroups() {
      return this.groupedOrders.filter(order => {
        if (this.filterStatus && order.status !== this.filterStatus) return false
        if (!this.matchesDate(order.tgl_pesanan)) return false
        if (this.q) {
          const text = [order.kode_pesanan, order.nama_pelanggan, order.no_meja].join(' ').toLowerCase()
          if (!text.includes(this.q.toLowerCase())) return false
        }
        return true
      })
    },
    statusTabs() {
      const count = status => status ? this.groupedOrders.filter(order => order.status === status).length : this.groupedOrders.length
      return [
        { text: 'Semua', value: '', count: count('') },
        { text: 'Menunggu', value: 'baru', count: count('baru') },
        { text: 'Dikonfirmasi', value: 'diproses', count: count('diproses') },
        { text: 'Selesai', value: 'selesai', count: count('selesai') },
        { text: 'Batal', value: 'dibatalkan', count: count('dibatalkan') }
      ]
    }
  },
  methods: {
    showFeedback(message, type='info') {
      this.feedback = { message, type }
    },
    showManualFeedback(message, type='info') {
      this.manualFeedback = { message, type }
    },
    load() {
      this.loading = true
      Api.getPesanan({})
        .then(data => {
          this.orders = data || []
          this.loading = false
        })
        .catch(err => {
          this.loading = false
          this.showFeedback(err.message || 'Gagal memuat pesanan', 'error')
        })
    },
    matchesDate(value) {
      if (this.dateFilter === 'all') return true
      if (!value) return false
      const date = new Date(value)
      const now = new Date()
      const dayMs = 24 * 60 * 60 * 1000
      if (this.dateFilter === 'today') return value.slice(0, 10) === now.toISOString().slice(0, 10)
      if (this.dateFilter === 'week') return now - date <= 7 * dayMs
      if (this.dateFilter === 'month') return now - date <= 30 * dayMs
      return true
    },
    isUpdating(order) {
      return !!this.updatingOrders[order.key]
    },
    setGroupStatus(order, status) {
      if (!status) return
      const ids = order.items.map(item => item.id_pesanan || item.id).filter(Boolean)
      if (!ids.length) return

      this.$set(this.updatingOrders, order.key, true)
      Promise.all(ids.map(id => Api.updatePesananStatus(id, status))).then(() => {
        this.showFeedback('Status pesanan diperbarui', 'success')
        this.load()
      }).catch(err => {
        this.showFeedback(err.message || 'Gagal mengubah status', 'error')
      }).then(() => {
        this.$delete(this.updatingOrders, order.key)
      })
    },
    removeGroup(order) {
      const deletableItems = order.items.filter(item => item.status !== 'selesai')
      if (!deletableItems.length) return

      Confirm.show({ title: 'Hapus pesanan', message: 'Item pesanan yang sudah selesai tidak bisa dihapus. Lanjut hapus pesanan ini?' })
        .then(ok => {
          if (!ok) return
          this.$set(this.updatingOrders, order.key, true)
          return Promise.all(deletableItems.map(item => Api.deletePesanan(item.id_pesanan || item.id)))
            .then(() => { this.showFeedback('Pesanan dihapus', 'success'); this.load() })
            .catch(err => this.showFeedback(err.message || 'Gagal menghapus pesanan', 'error'))
            .then(() => this.$delete(this.updatingOrders, order.key))
        })
    },
    openManualDialog() {
      this.showFeedback('', 'info')
      this.showManualFeedback('', 'info')
      this.manual = { nama_pelanggan: '', no_meja: '', items: [] }
      this.manualMenuId = null
      this.manualQty = 1
      this.manualNote = ''
      this.manualDialog = true
    },
    addManualItem() {
      const menu = this.menus.find(item => Number(item.id_menu || item.id) === Number(this.manualMenuId))
      this.showManualFeedback('', 'info')
      if (!menu) { this.showManualFeedback('Pilih menu', 'error'); return }
      if (!this.manualQty || this.manualQty <= 0) { this.showManualFeedback('Qty harus lebih dari 0', 'error'); return }
      this.manual.items.push({
        id_menu: menu.id_menu || menu.id,
        nama: menu.nama || menu.nama_menu,
        harga: Number(menu.harga || 0),
        qty: Number(this.manualQty),
        keterangan: this.manualNote
      })
      this.manualMenuId = null
      this.manualQty = 1
      this.manualNote = ''
      this.showManualFeedback('Menu ditambahkan ke pesanan.', 'success')
    },
    saveManualOrder() {
      this.showManualFeedback('', 'info')
      if (!this.manual.nama_pelanggan) { this.showManualFeedback('Isi nama pelanggan', 'error'); return }
      if (!this.manual.items.length) { this.showManualFeedback('Tambahkan minimal satu menu', 'error'); return }
      this.manualSaving = true
      Api.createPublicOrder(this.manual).then(res => {
        this.showFeedback('Pesanan manual dibuat: ' + res.kode_pesanan, 'success')
        this.manualDialog = false
        this.load()
      }).catch(err => {
        this.showManualFeedback(err.message || 'Gagal menyimpan pesanan', 'error')
      }).then(() => { this.manualSaving = false })
    },
    openDetail(order) {
      this.detailOrder = order
      this.detailDialog = true
    },
    exportOrders() {
      const header = ['ID Pesanan', 'Pelanggan', 'Meja', 'Tanggal', 'Total', 'Status']
      const lines = this.filteredGroups.map(order => [
        order.kode_pesanan,
        order.nama_pelanggan,
        order.no_meja,
        this.formatDate(order.tgl_pesanan),
        order.total,
        this.statusLabel(order.status)
      ].map(value => '"' + String(value).replace(/"/g, '""') + '"').join(','))
      this.downloadCsv('pesanan.csv', [header.join(','), ...lines].join('\n'))
    },
    downloadCsv(filename, csv) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    },
    statusLabel(status) {
      const map = { baru: 'Menunggu', diproses: 'Dikonfirmasi', selesai: 'Selesai', dibatalkan: 'Batal', campuran: 'Campuran' }
      return map[status] || status || '-'
    },
    statusClass(status) {
      const map = { baru: 'status-waiting', diproses: 'status-confirmed', selesai: 'status-done', dibatalkan: 'status-cancelled' }
      return map[status] || 'status-mixed'
    },
    initial(value) {
      return String(value || 'P').trim().charAt(0).toUpperCase()
    },
    formatCurrency(value) {
      return Number(value || 0).toLocaleString('id-ID')
    },
    formatDate(value) {
      if (!value) return '-'
      return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
})

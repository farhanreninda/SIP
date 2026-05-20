Vue.component('menu-page', {
  template: `
    <div class="admin-page product-page">
      <div class="menu-category-row">
        <button
          v-for="cat in categoryTabs"
          :key="cat.value"
          type="button"
          :class="{active: activeCategory === cat.value}"
          @click="activeCategory = cat.value"
        >
          <v-icon small>{{ cat.icon }}</v-icon>
          {{ cat.text }} - {{ cat.count }}
        </button>
      </div>

      <div class="table-toolbar menu-toolbar">
        <div class="table-search">
          <v-icon small color="#c2372f">mdi-magnify</v-icon>
          <input v-model="q" type="search" placeholder="Cari nama menu...">
        </div>
        <v-btn class="btn-primary" depressed @click="openAdd">
          <v-icon left small>mdi-plus</v-icon>
          Tambah Menu
        </v-btn>
      </div>
      <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>

      <div class="menu-card-grid animate-up">
        <article v-for="menu in filteredMenus" :key="menu.id_menu || menu.id" class="doc-menu-card">
          <div class="doc-menu-media">
            <span class="menu-category-badge">{{ menu.kategori || 'Menu' }}</span>
            <img v-if="menu.gambar" :src="menu.gambar" :alt="menu.nama">
            <v-icon v-else size="52" color="#c2372f">{{ menuIcon(menu) }}</v-icon>
          </div>
          <div class="doc-menu-body">
            <h3>{{ menu.nama || menu.nama_menu }}</h3>
            <p>{{ menu.deskripsi || 'Menu tersedia di Warung Bakso Tulus.' }}</p>
            <div class="doc-menu-meta">
              <strong>Rp {{ formatCurrency(menu.harga) }}</strong>
              <span>Stok: {{ menu.stok }}</span>
            </div>
            <div class="doc-menu-status" :class="stockClass(menu)">
              <i></i>{{ stockLabel(menu) }}
            </div>
            <div class="doc-menu-actions">
              <v-btn outlined small class="detail-button" @click="startEdit(menu)">
                <v-icon left small>mdi-pencil</v-icon>
                Edit
              </v-btn>
              <v-btn outlined small class="delete-button" @click="remove(menu.id_menu || menu.id)">
                <v-icon left small>mdi-trash-can-outline</v-icon>
                Hapus
              </v-btn>
            </div>
          </div>
        </article>
      </div>

      <div v-if="!filteredMenus.length" class="empty-box mt-4">Tidak ada menu untuk filter ini.</div>

      <v-dialog v-model="dialog" max-width="680px" persistent>
        <v-card class="doc-dialog">
          <v-card-title>
            <div>
              <strong>{{ editId ? 'Edit Menu' : 'Tambah Menu Baru' }}</strong>
              <small>Lengkapi data menu, harga, modal, stok, dan deskripsi.</small>
            </div>
            <v-spacer></v-spacer>
            <v-btn icon @click="dialog=false"><v-icon>mdi-close</v-icon></v-btn>
          </v-card-title>

          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="7">
                <label class="form-label">Nama Menu</label>
                <v-text-field v-model="form.nama_menu" placeholder="Contoh: Bakso Urat Jumbo" outlined dense class="mt-1"></v-text-field>
              </v-col>
              <v-col cols="12" sm="5">
                <label class="form-label">Kategori</label>
                <v-select v-model="form.kategori" :items="categoryOptions" outlined dense class="mt-1"></v-select>
              </v-col>
              <v-col cols="12" sm="4">
                <label class="form-label">Harga Jual</label>
                <v-text-field v-model="displayHarga" outlined dense class="mt-1" prepend-inner-icon="mdi-cash"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <label class="form-label">Modal / HPP</label>
                <v-text-field v-model="displayModal" outlined dense class="mt-1" prepend-inner-icon="mdi-chart-line"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <label class="form-label">Stok</label>
                <v-text-field v-model.number="form.stok" type="number" outlined dense class="mt-1" prepend-inner-icon="mdi-package-variant"></v-text-field>
              </v-col>
              <v-col cols="12">
                <label class="form-label">URL Gambar</label>
                <v-text-field v-model="form.gambar" placeholder="Opsional" outlined dense class="mt-1" prepend-inner-icon="mdi-image"></v-text-field>
              </v-col>
              <v-col cols="12">
                <label class="form-label">Deskripsi</label>
                <v-textarea v-model="form.deskripsi" outlined dense rows="3" class="mt-1"></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text class="text-none font-weight-bold" @click="dialog=false">Batal</v-btn>
            <v-btn class="btn-primary" depressed @click="save">{{ editId ? 'Simpan Perubahan' : 'Tambah Menu' }}</v-btn>
          </v-card-actions>
          <div class="dialog-feedback-wrap">
            <inline-feedback :message="dialogFeedback.message" :type="dialogFeedback.type"></inline-feedback>
          </div>
        </v-card>
      </v-dialog>
    </div>
  `,
  data() {
    return {
      menus: [],
      dialog: false,
      editId: null,
      q: '',
      activeCategory: '',
      feedback: { message: '', type: 'info' },
      dialogFeedback: { message: '', type: 'info' },
      form: { nama_menu: '', kategori: 'Bakso', harga: '', modal: '', stok: '', gambar: '', deskripsi: '' },
      categoryOptions: ['Bakso', 'Mie', 'Minuman', 'Lainnya']
    }
  },
  computed: {
    filteredMenus() {
      return (this.menus || []).filter(menu => {
        if (this.activeCategory && String(menu.kategori || '').toLowerCase() !== this.activeCategory.toLowerCase()) return false
        if (this.q) {
          const text = [menu.nama, menu.nama_menu, menu.kategori, menu.deskripsi].join(' ').toLowerCase()
          if (!text.includes(this.q.toLowerCase())) return false
        }
        return true
      })
    },
    categoryTabs() {
      const count = category => category ? this.menus.filter(menu => String(menu.kategori || '').toLowerCase() === category.toLowerCase()).length : this.menus.length
      return [
        { text: 'Semua', value: '', icon: 'mdi-silverware-fork-knife', count: count('') },
        { text: 'Bakso', value: 'Bakso', icon: 'mdi-bowl-mix', count: count('Bakso') },
        { text: 'Mie', value: 'Mie', icon: 'mdi-noodles', count: count('Mie') },
        { text: 'Minuman', value: 'Minuman', icon: 'mdi-cup', count: count('Minuman') },
        { text: 'Lainnya', value: 'Lainnya', icon: 'mdi-cookie-outline', count: count('Lainnya') }
      ]
    },
    displayHarga: {
      get() { return this.form.harga || this.form.harga === 0 ? this.formatCurrency(this.form.harga) : '' },
      set(value) {
        const n = String(value).replace(/[^0-9]/g, '')
        this.form.harga = n ? parseInt(n, 10) : ''
      }
    },
    displayModal: {
      get() { return this.form.modal || this.form.modal === 0 ? this.formatCurrency(this.form.modal) : '' },
      set(value) {
        const n = String(value).replace(/[^0-9]/g, '')
        this.form.modal = n ? parseInt(n, 10) : ''
      }
    }
  },
  created() {
    this.load()
  },
  methods: {
    showFeedback(message, type='info') {
      this.feedback = { message, type }
    },
    showDialogFeedback(message, type='info') {
      this.dialogFeedback = { message, type }
    },
    load() {
      Api.getMenu().then(data => { this.menus = data || [] })
    },
    openAdd() {
      this.showFeedback('', 'info')
      this.showDialogFeedback('', 'info')
      this.editId = null
      this.form = { nama_menu: '', kategori: 'Bakso', harga: '', modal: '', stok: '', gambar: '', deskripsi: '' }
      this.dialog = true
    },
    startEdit(item) {
      this.showFeedback('', 'info')
      this.showDialogFeedback('', 'info')
      this.editId = item.id_menu || item.id
      this.form = {
        nama_menu: item.nama_menu || item.nama,
        kategori: item.kategori || 'Bakso',
        harga: item.harga,
        modal: item.modal,
        stok: item.stok,
        gambar: item.gambar || '',
        deskripsi: item.deskripsi || ''
      }
      this.dialog = true
    },
    save() {
      this.showDialogFeedback('', 'info')
      if (!this.form.nama_menu) { this.showDialogFeedback('Isi nama menu', 'error'); return }
      const payload = Object.assign({}, this.form, {
        harga: Number(this.form.harga) || 0,
        modal: Number(this.form.modal) || 0,
        stok: Number(this.form.stok) || 0
      })
      const req = this.editId ? Api.updateMenu(this.editId, payload) : Api.addMenu(payload)
      req.then(() => {
        this.showFeedback(this.editId ? 'Menu diperbarui' : 'Menu ditambahkan', 'success')
        this.dialog = false
        this.load()
      }).catch(err => this.showDialogFeedback(err.message || 'Gagal menyimpan menu', 'error'))
    },
    remove(id) {
      Confirm.show({ title: 'Hapus menu', message: 'Yakin ingin menghapus menu ini?' })
        .then(ok => {
          if (!ok) return
          Api.deleteMenu(id).then(() => { this.showFeedback('Menu dihapus', 'success'); this.load() })
            .catch(err => this.showFeedback(err.message || 'Menu tidak bisa dihapus', 'error'))
        })
    },
    menuIcon(menu) {
      const text = ((menu.nama || menu.nama_menu || '') + ' ' + (menu.kategori || '')).toLowerCase()
      if (text.includes('teh') || text.includes('jeruk') || text.includes('minum')) return 'mdi-cup'
      if (text.includes('mie')) return 'mdi-noodles'
      if (text.includes('kerupuk') || text.includes('lain')) return 'mdi-cookie-outline'
      return 'mdi-bowl-mix'
    },
    stockLabel(menu) {
      const stock = Number(menu.stok || 0)
      if (stock <= 0) return 'habis'
      if (stock <= 5) return 'stok menipis'
      return 'tersedia'
    },
    stockClass(menu) {
      const stock = Number(menu.stok || 0)
      if (stock <= 0) return 'is-empty'
      if (stock <= 5) return 'is-low'
      return 'is-ready'
    },
    formatCurrency(value) {
      return Number(value || 0).toLocaleString('id-ID')
    }
  }
})

Vue.component('product-page', Vue.options.components['menu-page'])

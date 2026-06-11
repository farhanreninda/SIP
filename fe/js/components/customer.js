Vue.component('customer-scan-page', {
  props: ['initialTable'],
  template: `
    <div class="customer-stage">
      <div class="scan-screen">
        <div class="phone-status-row">
          <span>9:41</span>
          <span>100%</span>
        </div>
        <div class="scan-hero-panel">
          <section class="scan-copy">
            <div class="scan-brand-row">
              <div class="brand-mark customer-logo">
                <v-icon color="white">mdi-noodles</v-icon>
              </div>
            </div>
            <h1>Warung Bakso Tulus</h1>
            <p>{{ detectedTable ? 'Meja ' + detectedTable + ' terdeteksi. Isi nama Anda untuk mulai pesan.' : 'Buka halaman ini dari QR meja untuk mendeteksi nomor meja.' }}</p>
          </section>

          <section class="scan-form-card">
            <div class="detected-table-card" :class="{'is-missing': !detectedTable}">
              <v-icon>{{ detectedTable ? 'mdi-table-chair' : 'mdi-alert-circle-outline' }}</v-icon>
              <div>
                <span>Nomor Meja</span>
                <strong>{{ detectedTable || '-' }}</strong>
              </div>
            </div>

            <div class="manual-divider" v-if="detectedTable">&mdash; meja otomatis dari QR &mdash;</div>
            <div class="manual-divider is-warning" v-else>&mdash; meja belum terdeteksi &mdash;</div>

            <v-text-field v-model="form.nama_pelanggan" outlined dense hide-details class="mobile-input mb-4" prepend-inner-icon="mdi-account" placeholder="Nama pelanggan"></v-text-field>

            <v-btn class="btn-primary mobile-main-btn" block depressed :disabled="!detectedTable" @click="start">
              Lanjutkan ke Menu &rarr;
            </v-btn>
            <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>
            <div class="mobile-note"><v-icon x-small>mdi-lightbulb-on-outline</v-icon> Nomor meja mengikuti QR yang dipindai.</div>
          </section>

          <section class="scan-extra-card">
            <div class="scan-extra-title">Pilihan menu</div>
            <div class="scan-extra-grid">
              <div><v-icon small>mdi-bowl-mix</v-icon><span>Bakso</span></div>
              <div><v-icon small>mdi-noodles</v-icon><span>Mie</span></div>
              <div><v-icon small>mdi-cup</v-icon><span>Minuman</span></div>
            </div>
          </section>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      form: { nama_pelanggan: '', no_meja: this.initialTable || '' },
      feedback: { message: '', type: 'info' }
    }
  },
  computed: {
    detectedTable() {
      return String((this.form && this.form.no_meja) || this.initialTable || '').trim()
    }
  },
  watch: {
    initialTable(value) {
      this.form.no_meja = value || ''
    }
  },
  methods: {
    showFeedback(message, type='info') {
      this.feedback = { message, type }
    },
    start() {
      this.showFeedback('', 'info')
      if (!this.form.nama_pelanggan) { this.showFeedback('Isi nama pelanggan', 'error'); return }
      if (!this.detectedTable) { this.showFeedback('Nomor meja belum terdeteksi dari QR', 'error'); return }
      this.$emit('customer-ready', {
        nama_pelanggan: this.form.nama_pelanggan,
        no_meja: this.detectedTable
      })
    }
  }
})

Vue.component('customer-menu-page', {
  props: ['customer', 'initialView'],
  template: `
    <div class="customer-stage">
      <div class="mobile-app-screen">
        <transition name="customer-view">
        <div v-if="view === 'menu'" key="menu" class="mobile-menu-view">
            <div class="mobile-top mobile-menu-head">
              <div class="mobile-greeting-block">
                <span class="table-chip">
                  <v-icon x-small>mdi-table-chair</v-icon>
                  Meja {{ customer.no_meja || '-' }}
                </span>
                <h1>Halo, {{ firstName }} <v-icon color="#c2372f" small>mdi-hand-wave-outline</v-icon></h1>
              </div>
            </div>
            <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>

            <div class="mobile-search">
              <v-icon small color="#c2372f">mdi-magnify</v-icon>
              <input v-model="q" type="search" placeholder="Cari menu favorit...">
            </div>

            <div class="mobile-category-scroll">
              <button
                v-for="cat in categoryTabs"
                :key="cat.value"
                type="button"
                :class="{active: activeCategory === cat.value}"
                @click="activeCategory = cat.value"
              >
                <v-icon small>{{ cat.icon }}</v-icon>
                {{ cat.text }}
              </button>
            </div>

            <div class="mobile-section-title menu-list-title">
              <span>Daftar Menu</span>
              <small>{{ filteredMenus.length }} item</small>
            </div>

            <div class="mobile-menu-grid">
              <article v-for="menu in filteredMenus" :key="menu.id_menu" class="mobile-menu-card" :class="{'is-disabled': menu.stok <= 0, 'is-added': isMenuAdded(menu)}">
                <div class="mobile-menu-media">
                  <span>{{ menu.kategori || 'Menu' }}</span>
                  <div class="menu-added-badge" :class="{visible: isMenuAdded(menu)}">
                    <v-icon x-small>mdi-check</v-icon>
                    Ditambahkan
                  </div>
                  <img v-if="menu.gambar" :src="menu.gambar" :alt="menu.nama">
                  <v-icon v-else color="#c2372f" size="38">{{ menuIcon(menu) }}</v-icon>
                </div>
                <div class="mobile-menu-body">
                  <h3>{{ menu.nama }}</h3>
                  <p>{{ menu.deskripsi || 'Menu favorit Warung Bakso Tulus.' }}</p>
                  <div class="mobile-menu-footer">
                    <strong>Rp {{ formatCurrency(menu.harga) }}</strong>
                    
                    <div v-if="cartQty(menu) > 0" class="menu-action-stepper">
                      <button type="button" class="btn-minus" @click="decrementMenu(menu)">
                        <v-icon>mdi-minus-circle-outline</v-icon>
                      </button>
                      <span>{{ cartQty(menu) }}</span>
                      <button type="button" class="btn-plus" :disabled="menu.stok <= cartQty(menu)" @click="add(menu)">
                        <v-icon>mdi-plus-circle-outline</v-icon>
                      </button>
                    </div>
                    
                    <button v-else type="button" class="menu-action-add" :class="{'is-added': isMenuAdded(menu)}" :disabled="menu.stok <= 0" @click="add(menu)">
                      <v-icon small>{{ menu.stok > 0 ? (isMenuAdded(menu) ? 'mdi-check' : 'mdi-plus') : 'mdi-lock-outline' }}</v-icon>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>

        <div v-else-if="view === 'cart'" key="cart" class="mobile-cart-view">
            <div class="mobile-page-head mobile-cart-head">
              <div class="cart-title-block">
                <h1>Pesanan Saya</h1>
                <small>Meja {{ customer.no_meja || '-' }}</small>
              </div>
            </div>
            <div v-if="cart.length" class="cart-count-line">{{ totalItem }} item dipilih</div>

            <div v-if="!cart.length" class="customer-empty-card cart-empty-state">
              <div class="empty-illustration cart-illustration">
                <span class="empty-plate"></span>
                <v-icon color="#c2372f" size="38">mdi-cart-outline</v-icon>
                <i></i>
              </div>
              <strong>Keranjang masih kosong</strong>
              <span>Pilih menu favorit dari daftar, nanti pesanan Anda muncul di sini.</span>
              <button type="button" class="empty-action" @click="view = 'menu'">
                Lihat menu
                <v-icon x-small>mdi-arrow-right</v-icon>
              </button>
            </div>

            <div v-else class="mobile-cart-list">
              <div v-for="(item, index) in cart" :key="item.id_menu" class="mobile-cart-item">
                <div class="cart-thumb"><v-icon color="#c2372f">{{ cartIcon(item) }}</v-icon></div>
                <div class="cart-item-main">
                  <strong>{{ item.nama }}</strong>
                  <span>Rp {{ formatCurrency(item.harga) }}</span>
                  <input v-model="item.keterangan" class="cart-item-note" type="text" placeholder="Catatan produk">
                </div>
                <div class="mobile-stepper">
                  <button type="button" @click="decrement(item, index)">-</button>
                  <b>{{ item.qty }}</b>
                  <button type="button" @click="increment(item)">+</button>
                </div>
              </div>
            </div>

            <div v-if="cart.length" class="cart-checkout-stack">
            <label class="mobile-label">Catatan Semua Pesanan</label>
            <v-textarea v-model="keterangan" outlined dense rows="2" hide-details class="mobile-input cart-note-input mb-3" placeholder="Contoh: semua tidak pedas"></v-textarea>

            <label class="mobile-label">Metode Pembayaran</label>
            <div class="payment-options">
              <button type="button" class="payment-method-card is-selected">
                <span class="payment-method-icon"><v-icon small>mdi-cash</v-icon></span>
                <span class="payment-method-copy">
                  <strong>Tunai</strong>
                  <small>Bayar langsung di kasir</small>
                </span>
                <v-icon small class="payment-check">mdi-check-circle</v-icon>
              </button>
            </div>

            <div class="mobile-total-bar">
              <div>
                <span>Total</span>
                <strong>Rp {{ formatCurrency(total) }}</strong>
              </div>
              <v-btn class="btn-primary mobile-confirm-btn" depressed :disabled="!cart.length" @click="sendOrder">Konfirmasi</v-btn>
            </div>
            <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>
            </div>
          </div>
        </transition>

        <mobile-bottom-nav :active="view" :count="totalItem" :bump="cartBump" @change="handleNav"></mobile-bottom-nav>
      </div>
    </div>
  `,
  data() {
    return {
      menus: [],
      cart: [],
      keterangan: '',
      paymentMethod: 'Tunai',
      view: ['menu', 'cart'].includes(this.initialView) ? this.initialView : 'menu',
      q: '',
      activeCategory: '',
      addedMenuId: null,
      cartBump: false,
      addAnimationTimer: null,
      cartBumpTimer: null,
      feedback: { message: '', type: 'info' }
    }
  },
  computed: {
    firstName() {
      return String((this.customer && this.customer.nama_pelanggan) || 'Pelanggan').split(' ')[0]
    },
    total() {
      return this.cart.reduce((sum, item) => sum + item.harga * item.qty, 0)
    },
    totalItem() {
      return this.cart.reduce((sum, item) => sum + item.qty, 0)
    },
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
      const tabs = [
        { text: 'Semua', value: '', icon: 'mdi-silverware-fork-knife' }
      ]
      
      if (!this.menus || this.menus.length === 0) {
        return [
          ...tabs,
          { text: 'Bakso', value: 'Bakso', icon: 'mdi-bowl-mix' },
          { text: 'Mie', value: 'Mie', icon: 'mdi-noodles' },
          { text: 'Minuman', value: 'Minuman', icon: 'mdi-cup' }
        ]
      }

      const uniqueCategories = [...new Set(this.menus.map(m => m.kategori).filter(Boolean))]
      
      const icons = {
        'Bakso': 'mdi-bowl-mix',
        'Mie': 'mdi-noodles',
        'Minuman': 'mdi-cup',
        'Dimsum': 'mdi-food-variant',
        'Snack': 'mdi-french-fries',
        'Dessert': 'mdi-ice-cream',
        'Gorengan': 'mdi-peanut'
      }

      uniqueCategories.forEach(cat => {
        // Find matching icon case-insensitively
        const iconKey = Object.keys(icons).find(k => k.toLowerCase() === cat.toLowerCase())
        tabs.push({
          text: cat,
          value: cat,
          icon: iconKey ? icons[iconKey] : 'mdi-tag-outline'
        })
      })

      return tabs
    }
  },
  created() {
    this.restoreCartState()
    this.applyInitialView()
    this.load()
  },
  watch: {
    initialView() { this.applyInitialView() },
    cart: {
      deep: true,
      handler() { this.saveCartState() }
    },
    keterangan() { this.saveCartState() },
    paymentMethod() { this.saveCartState() },
    view() { this.saveCartState() }
  },
  beforeDestroy() {
    clearTimeout(this.addAnimationTimer)
    clearTimeout(this.cartBumpTimer)
  },
  methods: {
    showFeedback(message, type='info') {
      this.feedback = { message, type }
    },
    normalizePaymentMethod() {
      return 'Tunai'
    },
    load() {
      Api.getPublicMenu().then(data => { this.menus = data || [] })
    },
    menuKey(menu) {
      return Number(menu.id_menu || menu.id)
    },
    isMenuAdded(menu) {
      return this.addedMenuId === this.menuKey(menu)
    },
    cartQty(menu) {
      const item = this.cart.find(i => Number(i.id_menu) === Number(menu.id_menu))
      return item ? item.qty : 0
    },
    decrementMenu(menu) {
      const index = this.cart.findIndex(i => Number(i.id_menu) === Number(menu.id_menu))
      if (index >= 0) {
        if (this.cart[index].qty <= 1) {
          this.cart.splice(index, 1)
        } else {
          this.cart[index].qty--
        }
        this.saveCartState()
      }
    },
    playAddAnimation(menu) {
      clearTimeout(this.addAnimationTimer)
      clearTimeout(this.cartBumpTimer)
      this.addedMenuId = null
      this.cartBump = false
      this.$nextTick(() => {
        this.addedMenuId = this.menuKey(menu)
        this.cartBump = true
        this.addAnimationTimer = setTimeout(() => { this.addedMenuId = null }, 900)
        this.cartBumpTimer = setTimeout(() => { this.cartBump = false }, 520)
      })
    },
    handleNav(target) {
      if (target === 'status') {
        this.$emit('track')
        return
      }
      this.view = target
    },
    applyInitialView() {
      if (['menu', 'cart'].includes(this.initialView)) this.view = this.initialView
    },
    add(menu) {
      if (menu.stok <= 0) return
      const found = this.cart.find(item => Number(item.id_menu) === Number(menu.id_menu))
      if (found) {
        if (found.qty >= Number(menu.stok || 0)) { this.showFeedback('Stok tidak cukup', 'error'); return }
        found.qty++
      } else {
        this.cart.push({ id_menu: menu.id_menu, nama: menu.nama, harga: Number(menu.harga || 0), qty: 1, kategori: menu.kategori, keterangan: '' })
      }
      this.playAddAnimation(menu)
      this.showFeedback('', 'info')
    },
    increment(item) {
      const menu = this.menus.find(menu => Number(menu.id_menu) === Number(item.id_menu))
      if (menu && item.qty >= Number(menu.stok || 0)) { this.showFeedback('Stok tidak cukup', 'error'); return }
      item.qty++
      this.showFeedback('', 'info')
    },
    decrement(item, index) {
      if (item.qty <= 1) {
        this.removeCart(index)
        return
      }
      item.qty--
    },
    removeCart(index) {
      this.cart.splice(index, 1)
    },
    sendOrder() {
      if (!this.cart.length) { this.showFeedback('Pesanan masih kosong', 'error'); return }
      const items = this.cart.map(item => Object.assign({}, item, {
        keterangan: item.keterangan || '',
        catatan_umum: this.keterangan || '',
        metode_pembayaran: 'Tunai'
      }))
      Api.createPublicOrder({
        nama_pelanggan: this.customer.nama_pelanggan,
        no_meja: this.customer.no_meja,
        keterangan: this.keterangan || '',
        catatan_umum: this.keterangan || '',
        items
      }).then(res => {
        this.cart = []
        this.keterangan = ''
        this.paymentMethod = 'Tunai'
        this.clearCartState()
        this.$emit('ordered', res.kode_pesanan)
      }).catch(err => this.showFeedback(err.message || 'Gagal mengirim pesanan', 'error'))
    },
    restoreCartState() {
      const raw = localStorage.getItem('sip_customer_cart_state')
      if (!raw) return
      try {
        const state = JSON.parse(raw)
        this.cart = Array.isArray(state.cart) ? state.cart.map(item => Object.assign({ keterangan: '' }, item)) : []
        this.keterangan = state.keterangan || ''
        this.paymentMethod = this.normalizePaymentMethod(state.paymentMethod)
        if (['menu', 'cart'].includes(state.view)) this.view = state.view
      } catch (err) {
        localStorage.removeItem('sip_customer_cart_state')
      }
    },
    saveCartState() {
      localStorage.setItem('sip_customer_cart_state', JSON.stringify({
        cart: this.cart,
        keterangan: this.keterangan,
        paymentMethod: 'Tunai',
        view: this.view
      }))
    },
    clearCartState() {
      localStorage.removeItem('sip_customer_cart_state')
    },
    menuIcon(menu) {
      const text = ((menu.nama || menu.nama_menu || '') + ' ' + (menu.kategori || '')).toLowerCase()
      if (text.includes('teh') || text.includes('jeruk') || text.includes('minum')) return 'mdi-cup'
      if (text.includes('mie')) return 'mdi-noodles'
      if (text.includes('kerupuk') || text.includes('lain')) return 'mdi-cookie-outline'
      return 'mdi-bowl-mix'
    },
    cartIcon(item) {
      return this.menuIcon(item)
    },
    formatCurrency(value) {
      return Number(value || 0).toLocaleString('id-ID')
    }
  }
})

Vue.component('customer-tracking-page', {
  props: ['initialCode', 'orderCodes', 'customer'],
  template: `
    <div class="customer-stage">
      <div class="mobile-app-screen tracking-screen" :class="statusClass(currentStatus)">
        <div class="mobile-page-head tracking-head">
          <div class="tracking-title-block">
            <h1>Status Pesanan</h1>
          </div>
        </div>
        <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>

        <div v-if="!knownCodes.length" class="customer-empty-card tracking-empty-state">
          <div class="empty-illustration status-illustration">
            <v-icon color="#c2372f" size="38">mdi-clipboard-text-clock-outline</v-icon>
            <span class="empty-dot one"></span>
            <span class="empty-dot two"></span>
          </div>
          <strong>Belum ada pesanan</strong>
          <span>Pesanan yang sudah dikirim akan muncul otomatis di halaman ini.</span>
        </div>

        <template v-else>
          <div v-if="showOrderList" class="tracking-order-list">
            <button
              v-for="summary in orderSummaries"
              :key="summary.kode"
              type="button"
              :class="[{active: selectedCode === summary.kode}, statusClass(summary.status)]"
              @click="selectOrder(summary.kode)"
            >
              <span class="tracking-order-icon" :class="statusClass(summary.status)">
                <v-icon>{{ summary.icon }}</v-icon>
                <em>{{ summary.count || 0 }}</em>
              </span>
              <span class="tracking-order-copy">
                <strong>{{ summary.title }}</strong>
                <small>{{ summary.count }} item - Meja {{ summary.meja || '-' }}</small>
              </span>
              <span class="tracking-order-status" :class="statusClass(summary.status)">{{ statusLabel(summary.status) }}</span>
            </button>
          </div>

          <div v-if="selectedCode" class="tracking-summary" :class="statusClass(currentStatus)">
            <div class="tracking-icon">
              <span class="tracking-pulse"></span>
              <v-icon size="36">{{ trackingIcon }}</v-icon>
            </div>
            <span class="tracking-hero-badge">{{ statusLabel(currentStatus) }}</span>
            <h2>{{ trackingTitle }}</h2>
            <p>{{ trackingSubtitle }}</p>
            <div class="tracking-code">
              <span>Pesanan</span>
              <strong>{{ selectedSummary.title }}</strong>
              <span>Meja</span>
              <strong>{{ selectedSummary.meja || '-' }}</strong>
            </div>
          </div>

          <div v-if="selectedOrders.length" class="tracking-items-card" :class="statusClass(currentStatus)">
            <div class="tracking-items-head">
              <span>Pesanan dibeli</span>
              <small>{{ selectedSummary.count }} item</small>
            </div>
            <div v-for="item in selectedOrders" :key="item.id_pesanan || item.id_menu || item.nama_menu" class="tracking-item-row">
              <span class="tracking-item-icon" :class="statusClass(currentStatus)"><v-icon small>{{ orderIcon([item]) }}</v-icon></span>
              <div>
                <strong>{{ orderItemName(item) }}</strong>
                <small v-if="orderItemNote(item)">Catatan: {{ orderItemNote(item) }}</small>
              </div>
              <b>x{{ Number(item.qty || 0) }}</b>
            </div>
          </div>

          <div v-if="!selectedCode" class="customer-empty-card tracking-select-empty">
            <div class="empty-illustration tap-illustration">
              <v-icon color="#c2372f" size="34">mdi-gesture-tap-button</v-icon>
              <span class="tap-ring"></span>
            </div>
            <strong>Pilih pesanan</strong>
            <span>Tekan salah satu kartu pesanan di atas untuk membuka progressnya.</span>
          </div>

          <div v-if="selectedCode" class="progress-card" :class="statusClass(currentStatus)">
            <div class="mobile-section-title">Progress</div>
            <div v-for="step in progressSteps" :key="step.key" class="progress-step" :class="{done: step.done, current: step.current}">
              <div class="progress-dot"><v-icon small>{{ step.icon }}</v-icon></div>
              <div>
                <strong>{{ step.label }}</strong>
                <span>{{ step.description }}</span>
              </div>
            </div>
          </div>
        </template>

        <mobile-bottom-nav active="status" :count="cartCount" @change="handleNav"></mobile-bottom-nav>
      </div>
    </div>
  `,
  data() {
    return {
      selectedCode: '',
      orderMap: {},
      loading: false,
      pollTimer: null,
      feedback: { message: '', type: 'info' },
      cartCount: 0
    }
  },
  computed: {
    knownCodes() {
      return [this.initialCode].concat(this.orderCodes || []).filter((value, index, list) => value && list.indexOf(value) === index)
    },
    showOrderList() {
      return this.knownCodes.length > 1
    },
    selectedOrders() {
      return this.selectedCode ? (this.orderMap[this.selectedCode] || []) : []
    },
    selectedSummary() {
      return this.summaryFor(this.selectedCode, this.selectedOrders, this.knownCodes.indexOf(this.selectedCode))
    },
    orderSummaries() {
      return this.knownCodes.map((code, index) => this.summaryFor(code, this.orderMap[code] || [], index))
    },
    currentStatus() {
      return this.statusForOrders(this.selectedOrders)
    },
    trackingTitle() {
      const map = { baru: 'Menunggu Konfirmasi', diproses: 'Sedang Disiapkan', selesai: 'Pesanan Selesai', dibatalkan: 'Pesanan Dibatalkan' }
      return map[this.currentStatus] || 'Status Pesanan'
    },
    trackingSubtitle() {
      const map = {
        baru: 'Pesanan masuk ke sistem.',
        diproses: 'Pesanan sedang disiapkan.',
        selesai: 'Pesanan sudah selesai diproses.',
        dibatalkan: 'Pesanan dibatalkan oleh admin.'
      }
      return map[this.currentStatus] || ''
    },
    trackingIcon() {
      const map = {
        baru: 'mdi-timer-sand',
        diproses: 'mdi-chef-hat',
        selesai: 'mdi-check-circle-outline',
        dibatalkan: 'mdi-close-circle-outline'
      }
      return map[this.currentStatus] || 'mdi-pot-steam-outline'
    },
    progressSteps() {
      const order = ['baru', 'diproses', 'selesai']
      const index = Math.max(0, order.indexOf(this.currentStatus))
      const cancelled = this.currentStatus === 'dibatalkan'
      if (cancelled) {
        return [
          { key: 'baru', label: 'Pesanan Diterima', description: 'Pesanan masuk ke sistem', icon: 'mdi-check', done: true, current: false },
          { key: 'dibatalkan', label: 'Pesanan Dibatalkan', description: 'Dibatalkan oleh admin', icon: 'mdi-close', done: true, current: true }
        ]
      }
      return [
        { key: 'baru', label: 'Pesanan Diterima', description: 'Pesanan masuk ke sistem', icon: 'mdi-check', done: index >= 0, current: this.currentStatus === 'baru' },
        { key: 'diproses', label: 'Dikonfirmasi Admin', description: 'Diterima oleh kasir', icon: 'mdi-check', done: index >= 1, current: this.currentStatus === 'diproses' },
        { key: 'selesai', label: this.currentStatus === 'selesai' ? 'Pesanan Selesai' : 'Sedang Disiapkan', description: this.currentStatus === 'selesai' ? 'Pesanan siap diambil' : 'Dapur sedang memproses', icon: this.currentStatus === 'selesai' ? 'mdi-check-all' : 'mdi-pot-steam-outline', done: index >= 2, current: this.currentStatus === 'selesai' }
      ]
    }
  },
  watch: {
    knownCodes() {
      this.prepareSelection()
      this.refreshOrders(true)
    }
  },
  mounted() {
    this.restoreCartCount()
    this.prepareSelection()
    this.refreshOrders()
    this.pollTimer = setInterval(() => this.refreshOrders(true), 3000)
  },
  beforeDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer)
  },
  methods: {
    showFeedback(message, type='info') {
      this.feedback = { message, type }
    },
    restoreCartCount() {
      const raw = localStorage.getItem('sip_customer_cart_state')
      if (!raw) return
      try {
        const state = JSON.parse(raw)
        const cart = Array.isArray(state.cart) ? state.cart : []
        this.cartCount = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
      } catch (err) {
        this.cartCount = 0
      }
    },
    prepareSelection() {
      if (this.knownCodes.length === 1) this.selectedCode = this.knownCodes[0]
      else if (this.selectedCode && !this.knownCodes.includes(this.selectedCode)) this.selectedCode = ''
    },
    refreshOrders(silent=false) {
      if (!this.knownCodes.length) return
      if (!silent) this.loading = true
      Promise.all(this.knownCodes.map(code => {
        return Api.trackPesanan(code)
          .then(res => ({ code, orders: res.pesanan || [] }))
          .catch(() => ({ code, orders: [] }))
      })).then(results => {
        results.forEach(result => this.$set(this.orderMap, result.code, result.orders))
        if (!this.selectedCode && this.knownCodes.length === 1) this.selectedCode = this.knownCodes[0]
        this.showFeedback('', 'info')
      }).catch(() => {
        if (!silent) this.showFeedback('Gagal memuat status pesanan', 'error')
      }).then(() => { this.loading = false })
    },
    selectOrder(code) {
      this.selectedCode = code
    },
    orderItemName(item) {
      return item.nama_menu || item.nama || 'Menu'
    },
    orderItemNote(item) {
      return item.keterangan_produk || item.catatan_produk || item.keterangan || ''
    },
    summaryFor(code, orders, index) {
      const status = this.statusForOrders(orders)
      const qty = (orders || []).reduce((sum, item) => sum + Number(item.qty || 0), 0)
      const orderNumber = Number(index || 0) + 1
      return {
        kode: code,
        title: this.knownCodes.length > 1 ? 'Pesanan ' + orderNumber : 'Pesanan aktif',
        icon: this.orderIcon(orders),
        status,
        count: qty || (orders || []).length || 0,
        meja: (orders && orders[0] && orders[0].no_meja) || (this.customer && this.customer.no_meja) || '-'
      }
    },
    orderIcon(orders) {
      const text = (orders || []).map(item => [item.nama_menu, item.nama, item.kategori].join(' ')).join(' ').toLowerCase()
      if (text.includes('teh') || text.includes('jeruk') || text.includes('minum')) return 'mdi-cup'
      if (text.includes('mie')) return 'mdi-noodles'
      if (text.includes('kerupuk') || text.includes('lain')) return 'mdi-cookie-outline'
      return 'mdi-bowl-mix'
    },
    statusForOrders(orders) {
      if (!orders || !orders.length) return 'baru'
      if (orders.some(item => item.status === 'dibatalkan')) return 'dibatalkan'
      if (orders.every(item => item.status === 'selesai')) return 'selesai'
      if (orders.some(item => item.status === 'diproses')) return 'diproses'
      return 'baru'
    },
    statusLabel(status) {
      const map = { baru: 'Menunggu', diproses: 'Diproses', selesai: 'Selesai', dibatalkan: 'Batal' }
      return map[status] || 'Menunggu'
    },
    statusClass(status) {
      const map = { baru: 'is-waiting', diproses: 'is-process', selesai: 'is-done', dibatalkan: 'is-cancelled' }
      return map[status] || 'is-waiting'
    },
    handleNav(target) {
      if (target === 'menu' || target === 'cart') this.$emit('back-menu', target)
    }
  }
})

Vue.component('mobile-bottom-nav', {
  props: ['active', 'count', 'bump'],
  template: `
    <div class="mobile-bottom-nav">
      <button type="button" :class="{active: active === 'menu'}" @click="$emit('change', 'menu')">
        <v-icon small>mdi-silverware-fork-knife</v-icon>
        Menu
      </button>
      <button type="button" :class="{active: active === 'cart', 'is-bumping': bump}" @click="$emit('change', 'cart')">
        <span class="nav-icon-wrap">
          <v-icon small>mdi-cart-outline</v-icon>
          <span v-if="count" class="nav-count-badge">{{ count }}</span>
        </span>
        Pesanan
      </button>
      <button type="button" :class="{active: active === 'status'}" @click="$emit('change', 'status')">
        <v-icon small>mdi-clock-check-outline</v-icon>
        Status
      </button>
    </div>
  `
})

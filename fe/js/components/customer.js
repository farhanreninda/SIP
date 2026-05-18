Vue.component('customer-scan-page',{
  template:`
    <v-container fluid class="login-wrapper">
      <div class="login-card-blue animate-up" style="max-width:520px;">
        <div class="text-center mb-6">
          <div class="d-inline-flex align-center justify-center mb-4" style="background:white;color:#2563eb;width:64px;height:64px;border-radius:50%;font-weight:bold;font-size:20px;border:2px dashed #2563eb;">
            QR
          </div>
          <h1 style="color:#1e3a8a;font-size:24px;font-weight:800;margin-bottom:8px;">Scan Barcode Menu</h1>
          <p style="color:#64748b;font-size:14px;">Masukkan data meja untuk membuka menu digital Warung Bakso Tulus</p>
        </div>
        <v-form @submit.prevent="start">
          <label class="form-label">Nama Pelanggan</label>
          <v-text-field v-model="form.nama_pelanggan" outlined dense class="mt-1 mb-3" prepend-inner-icon="mdi-account"></v-text-field>
          <label class="form-label">Nomor Meja</label>
          <v-text-field v-model="form.no_meja" outlined dense class="mt-1 mb-6" prepend-inner-icon="mdi-table-chair"></v-text-field>
          <v-btn class="btn-primary" block large @click="start"><v-icon left>mdi-qrcode-scan</v-icon>Lihat Menu</v-btn>
          <v-btn text block class="mt-3 text-none font-weight-bold" color="primary" @click="$emit('admin-login')">Login Admin</v-btn>
        </v-form>
      </div>
    </v-container>
  `,
  data(){return{form:{nama_pelanggan:'',no_meja:''}}},
  methods:{
    start(){
      if(!this.form.nama_pelanggan){ notify('Isi nama pelanggan','error'); return }
      this.$emit('customer-ready', Object.assign({},this.form))
    }
  }
})

Vue.component('customer-menu-page',{
  props:['customer'],
  template:`
    <div class="app-layout customer-layout">
      <div class="main-content" style="width:100%;">
        <div class="bg-hero"></div>
        <div class="page-content-wrapper">
          <div class="topbar customer-topbar animate-up">
            <div class="customer-brand-block">
              <div class="breadcrumb-item">Warung Bakso Tulus</div>
              <div class="customer-table-pill">
                <v-icon small color="inherit">mdi-table-chair</v-icon>
                <span>Meja {{ customer.no_meja || '-' }}</span>
              </div>
            </div>
            <v-spacer></v-spacer>
            <div class="customer-top-actions">
              <v-btn class="customer-track-btn" @click="$emit('track')"><v-icon left small>mdi-map-marker-path</v-icon>Tracking</v-btn>
            </div>
          </div>

          <div class="customer-hero-row d-flex justify-space-between align-center mb-6 animate-right">
            <div>
              <div class="greeting-text">MENU DIGITAL</div>
              <div class="welcome-text">Lihat Menu</div>
              <div class="customer-hero-copy">Pilih menu favorit, cek ringkasan pesanan, lalu kirim ke dapur.</div>
            </div>
            <div class="customer-order-summary-pill">
              <v-icon color="#2563eb">mdi-cart-outline</v-icon>
              <div>
                <span>{{ totalItem }} item dipilih</span>
                <strong>Rp {{ formatCurrency(total) }}</strong>
              </div>
            </div>
          </div>

          <div class="customer-shop-layout">
            <section class="customer-menu-section">
              <div class="customer-menu-grid">
                <article v-for="m in menus" :key="m.id_menu" class="customer-menu-card" :class="{'is-unavailable':m.stok<=0}">
                  <div class="customer-menu-media">
                    <img v-if="m.gambar" :src="m.gambar" :alt="m.nama">
                    <v-icon v-else size="58" color="#2563eb">mdi-food</v-icon>
                    <span class="customer-stock-badge" :class="m.stok > 0 ? 'stock-ready' : 'stock-empty'">
                      {{ m.stok > 0 ? 'Stok ' + m.stok : 'Habis' }}
                    </span>
                  </div>
                  <div class="customer-menu-content">
                    <div class="customer-menu-name">{{ m.nama }}</div>
                    <div class="customer-menu-desc">{{ m.deskripsi || 'Menu tersedia di Warung Bakso Tulus' }}</div>
                    <div class="customer-menu-footer">
                      <div class="customer-menu-price">Rp {{ formatCurrency(m.harga) }}</div>
                      <v-btn icon class="customer-add-menu-btn" :disabled="m.stok<=0" @click="add(m)">
                        <v-icon>{{ m.stok > 0 ? 'mdi-plus' : 'mdi-lock-outline' }}</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <aside class="customer-order-panel">
              <div class="customer-order-head">
                <div>
                  <div class="customer-order-eyebrow">Pesanan Meja {{ customer.no_meja || '-' }}</div>
                  <div class="customer-order-title">Tambah Pesanan</div>
                </div>
                <v-chip small class="customer-order-count">{{ totalItem }} item</v-chip>
              </div>

              <div v-if="!cart.length" class="customer-cart-empty">
                <v-icon size="54" color="#cbd5e1">mdi-cart-outline</v-icon>
                <strong>Keranjang masih kosong</strong>
                <span>Tekan tombol tambah pada menu yang tersedia.</span>
              </div>

              <div v-else class="customer-cart-list">
                <div v-for="(item,index) in cart" :key="item.id_menu" class="customer-cart-item">
                  <div class="customer-cart-info">
                    <div class="customer-cart-name">{{ item.nama }}</div>
                    <div class="customer-cart-price">Rp {{ formatCurrency(item.harga * item.qty) }}</div>
                  </div>
                  <div class="customer-cart-controls">
                    <v-btn icon x-small class="customer-step-btn" @click="decrement(item)"><v-icon small>mdi-minus</v-icon></v-btn>
                    <span>{{ item.qty }}</span>
                    <v-btn icon x-small class="customer-step-btn" @click="increment(item)"><v-icon small>mdi-plus</v-icon></v-btn>
                    <v-btn icon x-small class="customer-remove-btn" @click="removeCart(index)"><v-icon small>mdi-close</v-icon></v-btn>
                  </div>
                </div>
              </div>

              <v-textarea v-model="keterangan" class="customer-note-field" outlined dense rows="2" label="Keterangan pesanan"></v-textarea>

              <div class="customer-total-box">
                <div>
                  <span>Total</span>
                  <strong>Rp {{ formatCurrency(total) }}</strong>
                </div>
                <v-btn block class="btn-primary customer-send-order-btn" :disabled="!cart.length" @click="sendOrder">
                  <v-icon left small>mdi-send</v-icon>Kirim Pesanan
                </v-btn>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  `,
  data(){return{menus:[],cart:[],keterangan:''}},
  computed:{
    total(){ return this.cart.reduce((s,i)=>s+i.harga*i.qty,0) },
    totalItem(){ return this.cart.reduce((s,i)=>s+i.qty,0) }
  },
  created(){
    this.restoreCartState()
    this.load()
  },
  watch:{
    cart:{
      deep:true,
      handler(){ this.saveCartState() }
    },
    keterangan(){ this.saveCartState() }
  },
  methods:{
    load(){ Api.getPublicMenu().then(r=>this.menus=r || []) },
    add(menu){
      if(menu.stok <= 0) return
      const found=this.cart.find(i=>i.id_menu===menu.id_menu)
      if(found){
        if(found.qty >= menu.stok){ notify('Stok tidak cukup','error'); return }
        found.qty++
      }else{
        this.cart.push({id_menu:menu.id_menu,nama:menu.nama,harga:menu.harga,qty:1})
      }
    },
    increment(item){
      const menu=this.menus.find(m=>m.id_menu===item.id_menu)
      if(menu && item.qty >= menu.stok){ notify('Stok tidak cukup','error'); return }
      item.qty++
    },
    decrement(item){
      item.qty=Math.max(1,item.qty-1)
    },
    removeCart(index){
      this.cart.splice(index,1)
    },
    sendOrder(){
      if(!this.cart.length){ notify('Pesanan masih kosong','error'); return }
      const items=this.cart.map(i=>Object.assign({},i,{keterangan:this.keterangan}))
      Api.createPublicOrder({nama_pelanggan:this.customer.nama_pelanggan,no_meja:this.customer.no_meja,items})
        .then(res=>{
          notify('Pesanan dikirim. Kode: '+res.kode_pesanan,'success',5000)
          this.cart=[]
          this.keterangan=''
          this.clearCartState()
          this.$emit('ordered',res.kode_pesanan)
        }).catch(err=>notify(err.message || 'Gagal mengirim pesanan','error'))
    },
    restoreCartState(){
      const raw=localStorage.getItem('sip_customer_cart_state')
      if(!raw) return
      try{
        const state=JSON.parse(raw)
        this.cart=Array.isArray(state.cart) ? state.cart : []
        this.keterangan=state.keterangan || ''
      }catch(e){
        localStorage.removeItem('sip_customer_cart_state')
      }
    },
    saveCartState(){
      localStorage.setItem('sip_customer_cart_state', JSON.stringify({
        cart:this.cart,
        keterangan:this.keterangan
      }))
    },
    clearCartState(){
      localStorage.removeItem('sip_customer_cart_state')
    },
    formatCurrency(v){ return Number(v || 0).toLocaleString('id-ID') }
  }
})

Vue.component('customer-tracking-page',{
  props:['initialCode'],
  template:`
    <v-container fluid class="login-wrapper">
      <div class="login-card-blue animate-up" style="max-width:760px;">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 style="color:#1e3a8a;font-size:24px;font-weight:800;margin-bottom:4px;">Tracking Pesanan</h1>
            <p style="color:#64748b;font-size:14px;margin:0;">Cek status pesanan berdasarkan kode pesanan</p>
          </div>
          <v-btn icon @click="$emit('back-menu')"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-row align="center">
          <v-col cols="12" md="9">
            <v-text-field v-model="code" outlined dense hide-details label="Kode Pesanan" prepend-inner-icon="mdi-ticket-confirmation"></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn class="btn-primary" block @click="track">Cek Status</v-btn>
          </v-col>
        </v-row>
        <v-divider class="my-5"></v-divider>
        <v-data-table :headers="headers" :items="orders" class="modern-table" hide-default-footer>
          <template v-slot:item.status="{item}">
            <v-chip small :color="statusColor(item.status)" text-color="white">{{ item.status }}</v-chip>
          </template>
        </v-data-table>
      </div>
    </v-container>
  `,
  data(){return{code:this.initialCode || '',orders:[],headers:[{text:'Menu',value:'nama_menu'},{text:'Qty',value:'qty'},{text:'Status',value:'status'},{text:'Keterangan',value:'keterangan'}]}},
  mounted(){ if(this.code) this.track() },
  methods:{
    track(){
      if(!this.code){ notify('Isi kode pesanan','error'); return }
      Api.trackPesanan(this.code).then(r=>{ this.orders=r.pesanan || [] })
        .catch(()=>{ this.orders=[]; notify('Kode pesanan tidak ditemukan','error') })
    },
    statusColor(s){ return s==='selesai' ? 'success' : (s==='diproses' ? 'primary' : (s==='dibatalkan' ? 'error' : 'warning')) }
  }
})

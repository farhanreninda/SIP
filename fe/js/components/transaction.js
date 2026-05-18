Vue.component('transaction-page',{
  template:`
    <div class="transaction-page">
      <div class="transaction-page-header d-flex justify-space-between align-center mb-6 animate-right">
        <div>
          <div class="greeting-text">TRANSAKSI</div>
          <div class="welcome-text">Kelola Transaksi</div>
        </div>
      </div>

      <div class="transaction-workspace animate-up delay-1">
        <section class="transaction-cashier-panel">
          <div class="transaction-section-header">
            <div class="transaction-section-icon">
              <v-icon color="#2563eb">mdi-cart-plus</v-icon>
            </div>
            <div>
              <div class="transaction-section-title">Tambah Transaksi Kasir</div>
              <div class="transaction-section-subtitle">Pilih pelanggan dan menu, lalu masukkan ke keranjang.</div>
            </div>
          </div>

          <div class="transaction-form-grid">
            <div class="transaction-field">
              <label class="form-label">Nama Pelanggan</label>
              <v-text-field v-model="namaPelanggan" outlined dense hide-details class="transaction-input mt-1" placeholder="Pelanggan Umum"></v-text-field>
            </div>
            <div class="transaction-field transaction-menu-field">
              <label class="form-label">Pilih Menu</label>
              <v-autocomplete :items="menus" item-text="nama" item-value="id_menu" v-model.number="selectedId" placeholder="Ketik nama menu..." outlined dense hide-details class="transaction-input mt-1" prepend-inner-icon="mdi-magnify">
                <template v-slot:item="{item}">
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-bold">{{ item.nama }}</v-list-item-title>
                    <v-list-item-subtitle>Rp {{ formatCurrency(item.harga) }} | Stok: {{ item.stok }}</v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </div>
            <div class="transaction-field transaction-qty-field">
              <label class="form-label">Qty</label>
              <v-text-field v-model.number="qty" type="number" min="1" outlined dense hide-details class="transaction-input qty-field mt-1"></v-text-field>
            </div>
            <div class="transaction-field transaction-add-field">
              <label class="form-label">&nbsp;</label>
              <v-btn color="primary" depressed block class="transaction-add-btn mt-1" @click="addToCart">
                <v-icon left small>mdi-plus</v-icon>Tambah
              </v-btn>
            </div>
          </div>

          <div class="transaction-cart-block">
            <div class="transaction-cart-header">
              <div>
                <div class="transaction-cart-title">Keranjang Transaksi</div>
                <div class="transaction-cart-subtitle">{{ cart.length ? cart.length + ' menu siap diproses' : 'Belum ada menu yang dipilih' }}</div>
              </div>
              <v-chip small outlined class="transaction-cart-chip">
                {{ cart.reduce((s,i)=>s+i.qty,0) }} pcs
              </v-chip>
            </div>

            <v-data-table :headers="cartHeaders" :items="cart" class="modern-table transaction-cart-table" hide-default-footer>
              <template v-slot:item.harga="{item}">Rp {{ formatCurrency(item.harga) }}</template>
              <template v-slot:item.subtotal="{item}">
                <span class="transaction-cart-subtotal">Rp {{ formatCurrency(item.harga * item.qty) }}</span>
              </template>
              <template v-slot:item.qty="{item}">
                <v-chip small color="#eff6ff" text-color="#2563eb" class="font-weight-bold">{{ item.qty }}</v-chip>
              </template>
              <template v-slot:item.aksi="{index}">
                <v-btn icon small class="transaction-remove-btn" @click="removeFromCart(index)">
                  <v-icon small>mdi-trash-can-outline</v-icon>
                </v-btn>
              </template>
              <template v-slot:no-data>
                <div class="transaction-empty-cart">
                  <v-icon size="58" color="#dbe4f0">mdi-cart-outline</v-icon>
                  <div>Belum ada menu di keranjang</div>
                </div>
              </template>
            </v-data-table>
          </div>
        </section>

        <aside class="transaction-payment-panel">
          <div>
            <div class="transaction-payment-label">Total Pembayaran</div>
            <div class="transaction-payment-total">
              <span>Rp</span>
              <strong>{{ formatCurrency(total) }}</strong>
            </div>
          </div>

          <div class="transaction-payment-stats">
            <div>
              <span>Jumlah Item</span>
              <strong>{{ cart.reduce((s,i)=>s+i.qty,0) }} pcs</strong>
            </div>
            <div>
              <span>Total Menu</span>
              <strong>{{ cart.length }} jenis</strong>
            </div>
          </div>

          <div class="transaction-payment-customer">
            <v-icon color="rgba(255,255,255,.9)">mdi-account-circle-outline</v-icon>
            <div>
              <span>Pelanggan</span>
              <strong>{{ namaPelanggan || 'Pelanggan Umum' }}</strong>
            </div>
          </div>

          <v-btn block depressed class="transaction-side-checkout" :disabled="!cart.length" @click="checkout">
            <v-icon left small>mdi-cash-register</v-icon>
            Selesaikan Transaksi
          </v-btn>
        </aside>
      </div>

      <v-card class="card-floating transaction-history-card mt-5 animate-up delay-4">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="chart-header mb-1">RIWAYAT TRANSAKSI</div>
            <div class="text-muted" style="font-size:12px;">Data transaksi yang sudah tercatat di MySQL</div>
          </div>
          <v-btn text color="primary" class="font-weight-bold text-none" @click="loadAll"><v-icon left small>mdi-refresh</v-icon>Refresh</v-btn>
        </div>
        <v-data-table :headers="historyHeaders" :items="transactions" class="modern-table" :items-per-page="5">
          <template v-slot:item.kode_transaksi="{item}">
            <div class="font-weight-bold">{{ item.kode_transaksi || item.id }}</div>
            <div class="text-muted" style="font-size:12px;">{{ formatDate(item.date || item.created_at) }}</div>
          </template>
          <template v-slot:item.total="{item}">
            <span class="font-weight-bold" style="color:#2563eb;">Rp {{ formatCurrency(item.total) }}</span>
          </template>
          <template v-slot:item.aksi="{item}">
            <v-btn small text color="primary" class="text-none font-weight-bold" @click="printReceipt(item)">
              <v-icon left small>mdi-printer</v-icon>Cetak Struk
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
  `,
  data(){return{
    menus:[],
    transactions:[],
    selectedId:null,
    qty:1,
    namaPelanggan:'',
    cart:[],
    cartHeaders:[
      {text:'Menu',value:'nama'},
      {text:'Harga',value:'harga'},
      {text:'Qty',value:'qty'},
      {text:'Subtotal',value:'subtotal'},
      {text:'Aksi',value:'aksi',sortable:false}
    ],
    historyHeaders:[
      {text:'Kode',value:'kode_transaksi'},
      {text:'Pelanggan',value:'nama_pelanggan'},
      {text:'Total',value:'total'},
      {text:'Aksi',value:'aksi',sortable:false}
    ]
  }},
  computed:{
    total(){ return this.cart.reduce((t,i)=>t+(i.harga*i.qty),0) }
  },
  created(){ this.loadAll() },
  methods:{
    loadAll(){
      Api.getMenu().then(r=>this.menus=r || [])
      Api.getTransactions().then(r=>this.transactions=r || [])
    },
    addToCart(){
      if(!this.selectedId){ notify('Pilih menu','error'); return }
      const p=this.menus.find(x=>(x.id_menu || x.id)===this.selectedId)
      if(!p){ notify('Menu tidak ditemukan','error'); return }
      if(this.qty <= 0){ notify('Jumlah harus lebih dari 0','error'); return }
      if(this.qty > p.stok){ notify('Stok tidak cukup','error'); return }
      const existing=this.cart.find(x=>x.id_menu===p.id_menu)
      if(existing){
        if(existing.qty + this.qty > p.stok){ notify('Stok tidak cukup','error'); return }
        existing.qty += this.qty
      }else{
        this.cart.push({id:p.id_menu,id_menu:p.id_menu,nama:p.nama,nama_menu:p.nama_menu,harga:p.harga,qty:this.qty})
      }
      notify('Menu ditambahkan','success')
      this.selectedId=null
      this.qty=1
    },
    removeFromCart(i){ this.cart.splice(i,1) },
    checkout(){
      if(!this.cart.length){ notify('Cart kosong','error'); return }
      Api.checkout({items:this.cart,nama_pelanggan:this.namaPelanggan || 'Pelanggan Umum',total:this.total})
        .then(tx=>{
          notify('Transaksi berhasil','success')
          this.printReceipt(tx)
          this.cart=[]
          this.namaPelanggan=''
          this.loadAll()
        }).catch(err=>notify(err.message || 'Transaksi gagal','error'))
    },
    printReceipt(tx){
      const items=(tx.items || []).map(it=>`
        <tr><td>${it.nama || it.nama_menu}</td><td>${it.qty}</td><td>Rp ${this.formatCurrency(it.harga)}</td><td>Rp ${this.formatCurrency(it.subtotal || it.harga*it.qty)}</td></tr>
      `).join('')
      const html=`
        <html><head><title>Struk ${tx.kode_transaksi || ''}</title>
        <style>body{font-family:Arial;padding:24px;}table{width:100%;border-collapse:collapse;}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}.total{font-size:20px;font-weight:bold;text-align:right;margin-top:20px}</style>
        </head><body>
          <h2>Warung Bakso Tulus</h2>
          <div>Kode: ${tx.kode_transaksi || tx.id || '-'}</div>
          <div>Pelanggan: ${tx.nama_pelanggan || 'Pelanggan Umum'}</div>
          <div>Tanggal: ${this.formatDate(tx.date || tx.created_at || new Date())}</div>
          <table><thead><tr><th>Menu</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead><tbody>${items}</tbody></table>
          <div class="total">Total: Rp ${this.formatCurrency(tx.total)}</div>
        </body></html>`
      const win=window.open('', '_blank')
      if(win){ win.document.write(html); win.document.close(); win.focus(); win.print() }
    },
    formatCurrency(v){ return Number(v || 0).toLocaleString('id-ID') },
    formatDate(v){ return v ? new Date(v).toLocaleString('id-ID') : '-' }
  }
})

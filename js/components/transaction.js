Vue.component('transaction-page',{
  template:`
    <div class="transaction-page">
      <div class="d-flex justify-space-between align-center mb-6 animate-right">
        <div>
          <div class="greeting-text">KASIR</div>
          <div class="welcome-text">Transaksi Baru</div>
        </div>
        <v-btn class="btn-primary px-8" :disabled="!cart.length" @click="checkout" x-large>
          <v-icon left>mdi-cash-register</v-icon>
          Selesaikan Transaksi
        </v-btn>
      </div>

      <v-row>
        <v-col cols="12" md="8">
          <!-- INPUT SECTION -->
          <v-card class="card-floating mb-4 animate-up delay-1">
            <v-card-title class="pb-4">
              <v-icon color="primary" class="mr-2">mdi-cart-plus</v-icon>
              <span class="headline font-bold" style="color: #1e3a8a; font-size: 18px !important;">Pilih Produk</span>
            </v-card-title>
            
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" md="7">
                  <label class="form-label">Cari Nama Produk</label>
                  <v-autocomplete
                    :items="products"
                    item-text="nama"
                    item-value="id"
                    v-model.number="selectedId"
                    placeholder="Ketik nama produk..."
                    outlined dense
                    hide-details
                    class="mt-1"
                    prepend-inner-icon="mdi-magnify"
                  >
                    <template v-slot:item="{item}">
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-bold">{{ item.nama }}</v-list-item-title>
                        <v-list-item-subtitle>Rp {{ formatCurrency(item.harga) }} | Stok: {{ item.stok }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-autocomplete>
                </v-col>

                <v-col cols="12" md="2">
                  <label class="form-label">Jumlah</label>
                  <v-text-field
                    v-model.number="qty"
                    type="number"
                    outlined dense
                    hide-details
                    class="mt-1"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="3">
                  <label class="form-label">&nbsp;</label>
                  <v-btn color="primary" block depressed style="border-radius: 12px; height: 40px; text-transform: none; font-weight: 700; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);" class="mt-1" @click="addToCart">
                    <v-icon left small>mdi-plus</v-icon>
                    Tambah ke Cart
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- CART TABLE -->
          <v-card class="card-floating animate-up delay-2">
            <v-data-table
              :headers="headers"
              :items="cart"
              class="modern-table"
              hide-default-footer
            >
              <template v-slot:item.nama="{item}">
                <div class="font-weight-bold" style="color: #0f172a;">{{ item.nama }}</div>
              </template>

              <template v-slot:item.harga="{item}">
                <span class="text-muted">Rp {{formatCurrency(item.harga)}}</span>
              </template>

              <template v-slot:item.subtotal="{item}">
                <span class="font-weight-bold" style="color: #2563eb;">
                  Rp {{formatCurrency(item.harga * item.qty)}}
                </span>
              </template>

              <template v-slot:item.qty="{item}">
                <v-chip small color="#eff6ff" text-color="#2563eb" class="font-weight-bold">{{item.qty}}</v-chip>
              </template>

              <template v-slot:item.aksi="{index}">
                <v-btn icon small color="red lighten-2" @click="removeFromCart(index)">
                  <v-icon small>mdi-trash-can-outline</v-icon>
                </v-btn>
              </template>

              <template v-slot:no-data>
                <div class="pa-10 text-center">
                  <v-icon size="64" color="#e2e8f0">mdi-cart-outline</v-icon>
                  <div class="mt-2 text-muted">Belum ada produk di keranjang</div>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- SUMMARY -->
          <v-card class="card-floating animate-up delay-3" style="background: var(--primary-gradient); color: white;">
            <div class="white--text mb-2" style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Total Pembayaran</div>
            <div class="d-flex align-end">
              <span style="font-size: 20px; font-weight: 600; margin-bottom: 8px; margin-right: 4px;">Rp</span>
              <span style="font-size: 42px; font-weight: 800; line-height: 1;">{{formatCurrency(total)}}</span>
            </div>
            
            <v-divider dark class="my-6" style="opacity: 0.2;"></v-divider>
            
            <div class="d-flex justify-space-between mb-2" style="opacity: 0.9; font-size: 14px;">
              <span>Jumlah Item</span>
              <span class="font-weight-bold">{{ cart.reduce((s,i)=>s+i.qty, 0) }} pcs</span>
            </div>
            <div class="d-flex justify-space-between" style="opacity: 0.9; font-size: 14px;">
              <span>Total Produk</span>
              <span class="font-weight-bold">{{ cart.length }} jenis</span>
            </div>
          </v-card>

          <v-card class="card-floating mt-4 animate-up delay-4" outlined style="background: #f8fafc; border-style: dashed !important; border-width: 2px !important;">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="#cbd5e1">mdi-information-outline</v-icon>
              <p class="mt-4 text-muted" style="font-size: 13px;">Pastikan semua produk dan jumlah sudah benar sebelum melakukan checkout.</p>
              <v-btn text color="red" class="text-none font-weight-bold" @click="cart=[]" :disabled="!cart.length">Kosongkan Keranjang</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  `,

  data(){return{
    products:[],
    selectedId:null,
    qty:1,
    cart:[],
    headers:[
      {text:'Nama',value:'nama'},
      {text:'Harga',value:'harga'},
      {text:'Qty',value:'qty'},
      {text:'Subtotal',value:'subtotal'},
      {text:'Aksi',value:'aksi',sortable:false}
    ]
  }},

  computed:{
    total(){
      return this.cart.reduce((t,i)=>t+(i.harga*i.qty),0)
    }
  },

  created(){ this.load() },

  methods:{
    load(){ Api.getProducts().then(r=>this.products=r) },

    addToCart(){
      if(!this.selectedId){ notify('Pilih produk','error'); return }

      const p = this.products.find(x=>x.id===this.selectedId)
      if(!p){ notify('Produk tidak ditemukan','error'); return }

      if(this.qty <=0){ notify('Jumlah harus > 0','error'); return }
      if(this.qty > p.stok){ notify('Stok tidak cukup','error'); return }

      const existing = this.cart.find(x=>x.id===p.id)

      if(existing){
        if(existing.qty + this.qty > p.stok){
          notify('Stok tidak cukup','error'); return
        }
        existing.qty += this.qty
      }else{
        this.cart.push({
          id:p.id,
          nama:p.nama,
          harga:p.harga,
          qty:this.qty
        })
      }

      notify('Ditambahkan ke cart','success')
      this.selectedId=null
      this.qty=1
    },

    removeFromCart(i){
      this.cart.splice(i,1)
    },

    checkout(){
      if(!this.cart.length){ notify('Cart kosong','error'); return }

      Api.checkout({items:this.cart,total:this.total})
        .then(()=>{
          notify('Transaksi berhasil','success')
          this.cart=[]
          this.load()
        })
    },

    formatCurrency(v){
      return Number(v).toLocaleString('id-ID')
    }
  }
})
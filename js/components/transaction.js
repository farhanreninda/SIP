Vue.component('transaction-page',{
  template:`
    <div class="transaction-page">

      <!-- HEADER -->
      <div class="transaction-header">
        <div>
          <div class="page-title">Transaksi</div>
          <div class="muted">Input penjualan / kasir</div>
        </div>

        <v-btn class="btn-primary" :disabled="!cart.length" @click="checkout">
          <v-icon left small>mdi-cash-register</v-icon>
          Checkout
        </v-btn>
      </div>

      <!-- INPUT -->
      <v-card class="input-card">

        <v-row align="center">
          <v-col cols="12" md="6">
            <v-select
              :items="products"
              item-text="nama"
              item-value="id"
              v-model.number="selectedId"
              label="Pilih Produk"
              outlined dense
            ></v-select>
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model.number="qty"
              label="Jumlah"
              type="number"
              outlined dense
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="2">
            <v-btn class="btn-primary full-height" @click="addToCart">
              <v-icon left small>mdi-plus</v-icon>
              Tambah
            </v-btn>
          </v-col>
        </v-row>

      </v-card>

      <!-- CART -->
      <v-card class="table-card mt-4">

        <v-data-table
          :headers="headers"
          :items="cart"
          class="modern-table"
        >

          <template v-slot:item.harga="{item}">
            <span class="price">Rp {{formatCurrency(item.harga)}}</span>
          </template>

          <template v-slot:item.subtotal="{item}">
            <span class="price">
              Rp {{formatCurrency(item.harga * item.qty)}}
            </span>
          </template>

          <template v-slot:item.qty="{item}">
            <span class="qty-badge">{{item.qty}}</span>
          </template>

          <template v-slot:item.aksi="{index}">
            <v-btn icon small @click="removeFromCart(index)">
              <v-icon small color="red">mdi-delete</v-icon>
            </v-btn>
          </template>

        </v-data-table>

      </v-card>

      <!-- TOTAL -->
      <div class="total-box">
        <div>Total</div>
        <div class="total-value">
          Rp {{formatCurrency(total)}}
        </div>
      </div>

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
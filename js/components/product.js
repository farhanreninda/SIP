Vue.component('product-page',{
  template:`
    <div class="product-page">
      <div class="d-flex justify-space-between align-center mb-6 animate-right">
        <div>
          <div class="greeting-text">KATALOG</div>
          <div class="welcome-text">Data Produk</div>
        </div>
        <v-btn class="btn-primary" @click="openAdd">
          <v-icon left small>mdi-plus</v-icon>
          Tambah Produk
        </v-btn>
      </div>

      <!-- TABLE -->
      <v-card class="card-floating animate-up delay-1">

        <v-data-table
          :headers="headers"
          :items="products"
          class="modern-table"
          :items-per-page="8"
        >

          <template v-slot:item.nama="{item}">
            <div class="product-name">{{ item.nama }}</div>
          </template>

          <template v-slot:item.harga="{item}">
            <span class="price">Rp {{ formatCurrency(item.harga) }}</span>
          </template>

          <template v-slot:item.stok="{item}">
            <span class="stock">{{ item.stok }}</span>
          </template>

          <template v-slot:item.aksi="{item}">
            <v-btn icon small @click="startEdit(item)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>

            <v-btn icon small @click="remove(item.id)">
              <v-icon small color="red">mdi-delete</v-icon>
            </v-btn>
          </template>

        </v-data-table>

      </v-card>

      <!-- DIALOG -->
      <v-dialog v-model="dialog" max-width="500px" persistent>
        <v-card class="card-floating pa-4">
          <v-card-title class="d-flex align-center pb-4">
            <v-icon color="primary" class="mr-3">mdi-package-variant-plus</v-icon>
            <span class="headline font-bold" style="color: #1e3a8a;">
              {{ editId ? 'Edit Produk' : 'Tambah Produk Baru' }}
            </span>
          </v-card-title>

          <v-card-text class="pt-4">
            <v-row dense>
              <v-col cols="12">
                <label class="form-label">Nama Produk</label>
                <v-text-field v-model="form.nama" placeholder="Masukkan nama produk" outlined dense class="mt-1"></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <label class="form-label">Kategori</label>
                <v-text-field v-model="form.kategori" placeholder="Contoh: Makanan, Minuman" outlined dense class="mt-1"></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <label class="form-label">Harga (Rp)</label>
                <v-text-field 
                  v-model="displayHarga" 
                  placeholder="0" 
                  outlined dense 
                  class="mt-1"
                  prepend-inner-icon="mdi-cash"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <label class="form-label">Stok</label>
                <v-text-field 
                  v-model.number="form.stok" 
                  placeholder="0" 
                  outlined dense 
                  class="mt-1"
                  type="number"
                  prepend-inner-icon="mdi-box-variant"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pb-2 px-6">
            <v-spacer></v-spacer>
            <v-btn text color="grey darken-1" class="text-none font-weight-bold" @click="dialog=false">Batal</v-btn>
            <v-btn class="btn-primary px-8" @click="save">
              {{ editId ? 'Simpan Perubahan' : 'Tambah Produk' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </div>
  `,
  data(){return{
    products:[],
    dialog:false,
    editId:null,
    form:{nama:'',kategori:'',harga:'',stok:''},
    headers:[
      {text:'Nama',value:'nama'},
      {text:'Kategori',value:'kategori'},
      {text:'Harga',value:'harga'},
      {text:'Stok',value:'stok'},
      {text:'Aksi',value:'aksi',sortable:false}
    ]
  }},
  computed: {
    displayHarga: {
      get() {
        if (!this.form.harga && this.form.harga !== 0) return '';
        return this.formatCurrency(this.form.harga);
      },
      set(val) {
        // Remove non-numeric characters to store as number
        const numeric = val.replace(/[^0-9]/g, '');
        this.form.harga = numeric ? parseInt(numeric) : '';
      }
    }
  },
  created(){this.load()},
  methods:{
    load(){ Api.getProducts().then(r=>{ this.products = r }) },
    openAdd(){ this.editId=null; this.form={nama:'',kategori:'',harga:'',stok:''}; this.dialog=true },
    startEdit(item){ this.editId=item.id; this.form={nama:item.nama,kategori:item.kategori,harga:item.harga,stok:item.stok}; this.dialog=true },
    save(){
      if(!this.form.nama){ notify('Isi nama produk','error'); return }
      
      // Ensure numeric values for API
      const payload = {
        ...this.form,
        harga: Number(this.form.harga) || 0,
        stok: Number(this.form.stok) || 0
      }

      const req = this.editId ? Api.updateProduct(this.editId, payload) : Api.addProduct(payload)
      req.then(()=>{
        notify(this.editId? 'Perubahan tersimpan':'Produk ditambahkan','success')
        this.dialog=false
        this.load()
      })
    },
    remove(id){
      Confirm.show({title:'Hapus produk', message:'Yakin ingin menghapus produk ini?'})
      .then(ok=>{
        if(!ok) return
        Api.deleteProduct(id).then(()=>{
          notify('Produk dihapus','success')
          this.load()
        })
      })
    },
    formatCurrency(v){ 
      if (!v && v !== 0) return '';
      return Number(v).toLocaleString('id-ID') 
    }
  }
})
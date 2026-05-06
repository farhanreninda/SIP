Vue.component('product-page',{
  template:`
    <div class="product-page">

      <!-- HEADER -->
      <div class="product-header">
        <div>
          <div class="page-title">Produk</div>
          <div class="muted">Kelola data produk</div>
        </div>

        <div class="actions">
          <v-btn class="btn-primary mr-2" @click="openAdd">
            <v-icon left small>mdi-plus</v-icon>
            Tambah
          </v-btn>

          <v-btn class="btn-secondary" @click="load">
            <v-icon left small>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </div>
      </div>

      <!-- TABLE -->
      <v-card class="table-card">

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
      <v-dialog v-model="dialog" max-width="500px">
        <v-card class="form-card">
          <v-card-title>
            {{ editId ? 'Edit Produk' : 'Tambah Produk' }}
          </v-card-title>

          <v-card-text>
            <v-text-field v-model="form.nama" label="Nama"></v-text-field>
            <v-text-field v-model="form.kategori" label="Kategori"></v-text-field>
            <v-text-field v-model.number="form.harga" label="Harga" type="number"></v-text-field>
            <v-text-field v-model.number="form.stok" label="Stok" type="number"></v-text-field>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog=false">Batal</v-btn>
            <v-btn class="btn-primary" @click="save">Simpan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </div>
  `,
  data(){return{
    products:[],
    dialog:false,
    editId:null,
    form:{nama:'',kategori:'',harga:0,stok:0},
    headers:[
      {text:'Nama',value:'nama'},
      {text:'Kategori',value:'kategori'},
      {text:'Harga',value:'harga'},
      {text:'Stok',value:'stok'},
      {text:'Aksi',value:'aksi',sortable:false}
    ]
  }},
  created(){this.load()},
  methods:{
    load(){ Api.getProducts().then(r=>{ this.products = r }) },
    openAdd(){ this.editId=null; this.form={nama:'',kategori:'',harga:0,stok:0}; this.dialog=true },
    startEdit(item){ this.editId=item.id; this.form={nama:item.nama,kategori:item.kategori,harga:item.harga,stok:item.stok}; this.dialog=true },
    save(){
      if(!this.form.nama){ notify('Isi nama produk','error'); return }
      const req = this.editId ? Api.updateProduct(this.editId,this.form) : Api.addProduct(this.form)
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
    formatCurrency(v){ return Number(v).toLocaleString('id-ID') }
  }
})
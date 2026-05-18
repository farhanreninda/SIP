Vue.component('menu-page',{
  template:`
    <div class="product-page">
      <div class="d-flex justify-space-between align-center mb-6 animate-right">
        <div>
          <div class="greeting-text">MENU</div>
          <div class="welcome-text">Kelola Menu</div>
        </div>
        <v-btn class="btn-primary" @click="openAdd">
          <v-icon left small>mdi-plus</v-icon>
          Tambah Menu
        </v-btn>
      </div>

      <v-card class="card-floating animate-up delay-1">
        <v-data-table :headers="headers" :items="menus" class="modern-table" :items-per-page="8">
          <template v-slot:item.nama="{item}">
            <div class="product-name">{{ item.nama }}</div>
            <div class="text-muted" style="font-size:12px;">{{ item.deskripsi || '-' }}</div>
          </template>

          <template v-slot:item.harga="{item}">
            <span class="price">Rp {{ formatCurrency(item.harga) }}</span>
          </template>

          <template v-slot:item.modal="{item}">
            <span class="text-muted">Rp {{ formatCurrency(item.modal) }}</span>
          </template>

          <template v-slot:item.stok="{item}">
            <v-chip small :color="item.stok > 0 ? '#eff6ff' : '#fee2e2'" :text-color="item.stok > 0 ? '#2563eb' : '#dc2626'" class="font-weight-bold">
              {{ item.stok }}
            </v-chip>
          </template>

          <template v-slot:item.aksi="{item}">
            <v-btn icon small @click="startEdit(item)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small @click="remove(item.id_menu)">
              <v-icon small color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="dialog" max-width="640px" persistent>
        <v-card class="card-floating pa-4">
          <v-card-title class="d-flex align-center pb-4">
            <v-icon color="primary" class="mr-3">mdi-silverware-fork-knife</v-icon>
            <span class="headline font-bold" style="color: #1e3a8a;">
              {{ editId ? 'Edit Menu' : 'Tambah Menu Baru' }}
            </span>
          </v-card-title>

          <v-card-text class="pt-4">
            <v-row dense>
              <v-col cols="12" sm="7">
                <label class="form-label">Nama Menu</label>
                <v-text-field v-model="form.nama_menu" placeholder="Contoh: Bakso Besar" outlined dense class="mt-1"></v-text-field>
              </v-col>
              <v-col cols="12" sm="5">
                <label class="form-label">Kategori</label>
                <v-text-field v-model="form.kategori" placeholder="Makanan, Minuman" outlined dense class="mt-1"></v-text-field>
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
                <v-text-field v-model.number="form.stok" type="number" outlined dense class="mt-1" prepend-inner-icon="mdi-box-variant"></v-text-field>
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

          <v-card-actions class="pb-2 px-6">
            <v-spacer></v-spacer>
            <v-btn text color="grey darken-1" class="text-none font-weight-bold" @click="dialog=false">Batal</v-btn>
            <v-btn class="btn-primary px-8" @click="save">{{ editId ? 'Simpan Perubahan' : 'Tambah Menu' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  `,
  data(){return{
    menus:[],
    dialog:false,
    editId:null,
    form:{nama_menu:'',kategori:'Makanan',harga:'',modal:'',stok:'',gambar:'',deskripsi:''},
    headers:[
      {text:'Nama Menu',value:'nama'},
      {text:'Kategori',value:'kategori'},
      {text:'Harga',value:'harga'},
      {text:'Modal',value:'modal'},
      {text:'Stok',value:'stok'},
      {text:'Aksi',value:'aksi',sortable:false}
    ]
  }},
  computed:{
    displayHarga:{
      get(){ return this.form.harga || this.form.harga === 0 ? this.formatCurrency(this.form.harga) : '' },
      set(val){ const n=String(val).replace(/[^0-9]/g,''); this.form.harga=n ? parseInt(n) : '' }
    },
    displayModal:{
      get(){ return this.form.modal || this.form.modal === 0 ? this.formatCurrency(this.form.modal) : '' },
      set(val){ const n=String(val).replace(/[^0-9]/g,''); this.form.modal=n ? parseInt(n) : '' }
    }
  },
  created(){this.load()},
  methods:{
    load(){ Api.getMenu().then(r=>{ this.menus = r || [] }) },
    openAdd(){ this.editId=null; this.form={nama_menu:'',kategori:'Makanan',harga:'',modal:'',stok:'',gambar:'',deskripsi:''}; this.dialog=true },
    startEdit(item){
      this.editId=item.id_menu || item.id
      this.form={nama_menu:item.nama_menu || item.nama,kategori:item.kategori,harga:item.harga,modal:item.modal,stok:item.stok,gambar:item.gambar || '',deskripsi:item.deskripsi || ''}
      this.dialog=true
    },
    save(){
      if(!this.form.nama_menu){ notify('Isi nama menu','error'); return }
      const payload=Object.assign({},this.form,{harga:Number(this.form.harga)||0,modal:Number(this.form.modal)||0,stok:Number(this.form.stok)||0})
      const req=this.editId ? Api.updateMenu(this.editId,payload) : Api.addMenu(payload)
      req.then(()=>{
        notify(this.editId ? 'Menu diperbarui' : 'Menu ditambahkan','success')
        this.dialog=false
        this.load()
      }).catch(err=>notify(err.message || 'Gagal menyimpan menu','error'))
    },
    remove(id){
      Confirm.show({title:'Hapus menu', message:'Yakin ingin menghapus menu ini?'})
      .then(ok=>{
        if(!ok) return
        Api.deleteMenu(id).then(()=>{ notify('Menu dihapus','success'); this.load() })
          .catch(err=>notify(err.message || 'Menu tidak bisa dihapus','error'))
      })
    },
    formatCurrency(v){ return Number(v || 0).toLocaleString('id-ID') }
  }
})

Vue.component('product-page', Vue.options.components['menu-page'])

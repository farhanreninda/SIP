Vue.component('order-page',{
  template:`
    <div class="order-page">
      <div class="order-page-header d-flex justify-space-between align-center mb-6 animate-right">
        <div>
          <div class="greeting-text">PESANAN</div>
          <div class="welcome-text">Kelola Pesanan</div>
        </div>
        <div class="order-page-actions d-flex align-center">
          <v-select
            v-model="filterStatus"
            :items="statusOptions"
            dense outlined hide-details
            prepend-inner-icon="mdi-filter-variant"
            class="order-filter-select"
            @change="load"
          ></v-select>
          <v-btn class="btn-primary order-refresh-btn" @click="load">
            <v-icon left small>mdi-refresh</v-icon>Refresh
          </v-btn>
        </div>
      </div>

      <v-card class="card-floating order-list-card animate-up delay-1">
        <div class="order-list-summary">
          <div>
            <div class="order-list-title">Daftar Pesanan</div>
            <div class="order-list-subtitle">{{ groupedOrders.length }} pesanan ditampilkan</div>
          </div>
          <v-chip small outlined class="order-count-chip">
            {{ orders.length }} item menu
          </v-chip>
        </div>

        <div v-if="loading" class="order-state">
          <v-progress-circular indeterminate color="primary" size="28"></v-progress-circular>
          <span>Memuat pesanan...</span>
        </div>

        <div v-else-if="!groupedOrders.length" class="order-state order-empty">
          <v-icon color="#94a3b8">mdi-clipboard-text-outline</v-icon>
          <span>Belum ada pesanan untuk filter ini.</span>
        </div>

        <div v-else class="order-list">
          <div v-for="order in groupedOrders" :key="order.key" class="order-list-item">
            <div class="order-main">
              <div class="order-item-head">
                <div class="order-code-block">
                  <span class="order-code">{{ order.kode_pesanan }}</span>
                  <span class="order-date">{{ formatDate(order.tgl_pesanan) }}</span>
                </div>
                <span class="order-status-badge" :class="statusClass(order.status)">
                  {{ statusLabel(order.status) }}
                </span>
              </div>

              <div class="order-meta">
                <div>
                  <v-icon small color="#64748b">mdi-account-outline</v-icon>
                  <span>{{ order.nama_pelanggan || 'Pelanggan Umum' }}</span>
                </div>
                <div>
                  <v-icon small color="#64748b">mdi-table-chair</v-icon>
                  <span>Meja {{ order.no_meja || '-' }}</span>
                </div>
                <div>
                  <v-icon small color="#64748b">mdi-silverware-fork-knife</v-icon>
                  <span>{{ order.items.length }} menu</span>
                </div>
              </div>

              <div class="order-menu-list">
                <div v-for="item in order.items" :key="item.id_pesanan || item.id" class="order-menu-row">
                  <div class="order-menu-info">
                    <div class="order-menu-name">{{ item.nama_menu }}</div>
                    <div class="order-menu-note" v-if="item.keterangan">{{ item.keterangan }}</div>
                  </div>
                  <div class="order-menu-qty">{{ item.qty }} x Rp {{ formatCurrency(item.harga) }}</div>
                  <div class="order-menu-subtotal">Rp {{ formatCurrency(item.subtotal) }}</div>
                </div>
              </div>
            </div>

            <div class="order-side">
              <div class="order-total-label">Total</div>
              <div class="order-total-value">Rp {{ formatCurrency(order.total) }}</div>
              <v-select
                :value="order.status"
                :items="statusUpdateOptions"
                dense outlined hide-details
                class="order-status-select"
                :loading="isUpdating(order)"
                :disabled="isUpdating(order)"
                @change="setGroupStatus(order,$event)"
              ></v-select>
              <v-btn
                icon small
                class="order-delete-btn"
                :disabled="!order.deletable || isUpdating(order)"
                @click="removeGroup(order)"
              >
                <v-icon small>mdi-delete-outline</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>
    </div>
  `,
  data(){return{
    orders:[],
    loading:false,
    updatingOrders:{},
    filterStatus:'',
    statusOptions:[
      {text:'Semua Status',value:''},
      {text:'Baru',value:'baru'},
      {text:'Diproses',value:'diproses'},
      {text:'Selesai',value:'selesai'},
      {text:'Dibatalkan',value:'dibatalkan'}
    ],
    statusUpdateOptions:[
      {text:'Baru',value:'baru'},
      {text:'Diproses',value:'diproses'},
      {text:'Selesai',value:'selesai'},
      {text:'Dibatalkan',value:'dibatalkan'}
    ]
  }},
  created(){ this.load() },
  computed:{
    groupedOrders(){
      const groups=[]
      const map={}

      ;(this.orders || []).forEach(item=>{
        const key=item.kode_pesanan || item.id_pesanan || item.id
        if(!map[key]){
          map[key]={
            key,
            kode_pesanan:item.kode_pesanan || '-',
            nama_pelanggan:item.nama_pelanggan || 'Pelanggan Umum',
            no_meja:item.no_meja || '-',
            tgl_pesanan:item.tgl_pesanan,
            items:[],
            total:0,
            statuses:{},
            deletable:false
          }
          groups.push(map[key])
        }

        const group=map[key]
        const qty=Number(item.qty || 0)
        const harga=Number(item.harga || 0)
        const subtotal=Number(item.subtotal || (qty * harga) || 0)
        group.total += subtotal
        group.statuses[item.status || ''] = true
        group.deletable = group.deletable || item.status !== 'selesai'
        group.items.push(Object.assign({}, item, { subtotal }))

        if(!group.tgl_pesanan && item.tgl_pesanan) group.tgl_pesanan=item.tgl_pesanan
      })

      return groups.map(group=>{
        const statuses=Object.keys(group.statuses).filter(Boolean)
        group.status=statuses.length === 1 ? statuses[0] : ''
        return group
      }).sort((a,b)=>new Date(b.tgl_pesanan || 0) - new Date(a.tgl_pesanan || 0))
    }
  },
  methods:{
    load(){
      this.loading=true
      const params={}
      if(this.filterStatus) params.status=this.filterStatus
      Api.getPesanan(params)
        .then(r=>{
          this.orders=r || []
          this.loading=false
        })
        .catch(err=>{
          this.loading=false
          notify(err.message || 'Gagal memuat pesanan','error')
        })
    },
    isUpdating(order){
      return !!this.updatingOrders[order.key]
    },
    setGroupStatus(order,status){
      if(!status) return
      const ids=order.items.map(item=>item.id_pesanan || item.id).filter(Boolean)
      if(!ids.length) return

      this.$set(this.updatingOrders,order.key,true)
      Promise.all(ids.map(id=>Api.updatePesananStatus(id,status))).then(()=>{
        notify('Status pesanan diperbarui','success')
        this.load()
      }).catch(err=>{
        notify(err.message || 'Gagal mengubah status','error')
      }).then(()=>{
        this.$delete(this.updatingOrders,order.key)
      })
    },
    removeGroup(order){
      const deletableItems=order.items.filter(item=>item.status !== 'selesai')
      if(!deletableItems.length) return

      Confirm.show({title:'Hapus pesanan',message:'Item pesanan yang sudah selesai tidak bisa dihapus. Lanjut hapus pesanan ini?'})
      .then(ok=>{
        if(!ok) return
        this.$set(this.updatingOrders,order.key,true)
        return Promise.all(deletableItems.map(item=>Api.deletePesanan(item.id_pesanan || item.id)))
          .then(()=>{ notify('Pesanan dihapus','success'); this.load() })
          .catch(err=>notify(err.message || 'Gagal menghapus pesanan','error'))
          .then(()=>this.$delete(this.updatingOrders,order.key))
      })
    },
    statusLabel(status){
      const found=this.statusUpdateOptions.find(option=>option.value===status)
      return found ? found.text : 'Campuran'
    },
    statusClass(status){
      return 'status-' + (status || 'campuran')
    },
    formatCurrency(v){ return Number(v || 0).toLocaleString('id-ID') },
    formatDate(v){
      if(!v) return '-'
      return new Date(v).toLocaleString('id-ID',{
        day:'2-digit',
        month:'short',
        year:'numeric',
        hour:'2-digit',
        minute:'2-digit'
      })
    }
  }
})

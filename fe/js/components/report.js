Vue.component('report-page',{
  template:`
    <div class="report-page">
      <div class="d-flex justify-space-between align-center mb-6 animate-right">
        <div>
          <div class="greeting-text">LAPORAN</div>
          <div class="welcome-text">Laporan Penjualan</div>
        </div>
        <div class="d-flex align-center" style="gap:10px;">
          <v-btn class="btn-primary" @click="exportCsv"><v-icon left small>mdi-file-excel</v-icon>Export Excel</v-btn>
          <v-btn color="white" light class="text-none font-weight-bold" @click="printReport"><v-icon left small>mdi-file-pdf-box</v-icon>Cetak PDF</v-btn>
        </div>
      </div>

      <v-card class="card-floating mb-4 animate-up delay-1">
        <v-row align="center">
          <v-col cols="12" md="3">
            <label class="form-label">Dari Tanggal</label>
            <v-text-field v-model="from" type="date" outlined dense hide-details class="mt-1"></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <label class="form-label">Sampai Tanggal</label>
            <v-text-field v-model="to" type="date" outlined dense hide-details class="mt-1"></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <label class="form-label">Pencarian</label>
            <v-text-field v-model="q" placeholder="Menu, pelanggan, kode transaksi" outlined dense hide-details class="mt-1" prepend-inner-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <label class="form-label">&nbsp;</label>
            <v-btn color="primary" block depressed class="mt-1 text-none font-weight-bold" style="height:40px;border-radius:12px;" @click="load">Tampilkan</v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3" v-for="card in summaryCards" :key="card.label">
          <v-card class="card-floating compact-kpi">
            <div class="kpi-info">
              <span class="label">{{ card.label }}</span>
              <span class="kpi-value compact-value">{{ card.value }}</span>
            </div>
            <div class="compact-icon-box" :style="'background:'+card.color+'15;color:'+card.color">
              <v-icon color="inherit">{{ card.icon }}</v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="card-floating animate-up delay-2" id="printable-report">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="chart-header mb-1">DATA LAPORAN PENJUALAN</div>
            <div class="text-muted" style="font-size:12px;">Periode {{ from }} s/d {{ to }}</div>
          </div>
        </div>
        <v-data-table :headers="headers" :items="rows" class="modern-table" :items-per-page="10" :loading="loading">
          <template v-slot:item.tgl_transaksi="{item}">{{ formatDate(item.tgl_transaksi) }}</template>
          <template v-slot:item.harga="{item}">Rp {{ formatCurrency(item.harga) }}</template>
          <template v-slot:item.subtotal="{item}"><span class="font-weight-bold">Rp {{ formatCurrency(item.subtotal) }}</span></template>
          <template v-slot:item.laba="{item}">
            <span :style="'font-weight:700;color:' + (item.laba >= 0 ? '#059669' : '#dc2626')">Rp {{ formatCurrency(item.laba) }}</span>
          </template>
        </v-data-table>
      </v-card>
    </div>
  `,
  data(){return{
    from:'',
    to:'',
    q:'',
    rows:[],
    summary:{omzet:0,modal:0,laba:0,qty:0,transaksi:0},
    loading:false,
    headers:[
      {text:'Tanggal',value:'tgl_transaksi'},
      {text:'Kode',value:'kode_transaksi'},
      {text:'Pelanggan',value:'nama_pelanggan'},
      {text:'Menu',value:'nama_menu'},
      {text:'Qty',value:'qty'},
      {text:'Harga',value:'harga'},
      {text:'Subtotal',value:'subtotal'},
      {text:'Laba/Rugi',value:'laba'}
    ]
  }},
  computed:{
    summaryCards(){
      return [
        {label:'Omzet',value:'Rp '+this.formatCurrency(this.summary.omzet),icon:'mdi-cash-multiple',color:'#2563eb'},
        {label:'Modal',value:'Rp '+this.formatCurrency(this.summary.modal),icon:'mdi-wallet-outline',color:'#f59e0b'},
        {label:'Laba/Rugi',value:'Rp '+this.formatCurrency(this.summary.laba),icon:'mdi-chart-line',color:this.summary.laba >= 0 ? '#10b981' : '#ef4444'},
        {label:'Item Terjual',value:this.summary.qty + ' pcs',icon:'mdi-package-variant',color:'#8b5cf6'}
      ]
    }
  },
  created(){
    const now=new Date()
    const first=new Date(now.getFullYear(),now.getMonth(),1)
    this.from=first.toISOString().slice(0,10)
    this.to=now.toISOString().slice(0,10)
    this.load()
  },
  methods:{
    load(){
      this.loading=true
      Api.getLaporan({from:this.from,to:this.to,q:this.q})
        .then(data=>{
          this.rows=data.rows || []
          this.summary=data.summary || {omzet:0,modal:0,laba:0,qty:0,transaksi:0}
          this.loading=false
        })
        .catch(err=>{
          this.loading=false
          notify(err.message || 'Gagal memuat laporan','error')
        })
    },
    exportCsv(){
      const header=['Tanggal','Kode Transaksi','Pelanggan','Menu','Qty','Harga','Subtotal','Laba/Rugi']
      const lines=this.rows.map(r=>[
        this.formatDate(r.tgl_transaksi),r.kode_transaksi || '',r.nama_pelanggan || '',r.nama_menu || '',r.qty,r.harga,r.subtotal,r.laba
      ].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(','))
      const csv=[header.join(','),...lines].join('\\n')
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
      const a=document.createElement('a')
      a.href=URL.createObjectURL(blob)
      a.download='laporan-penjualan.csv'
      a.click()
      URL.revokeObjectURL(a.href)
    },
    printReport(){ window.print() },
    formatCurrency(v){ return Number(v || 0).toLocaleString('id-ID') },
    formatDate(v){ return v ? new Date(v).toLocaleString('id-ID') : '-' }
  }
})

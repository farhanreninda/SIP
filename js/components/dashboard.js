Vue.component('dashboard-page',{
  template:`
    <v-container fluid class="dashboard-page">
      <v-row class="mb-4 align-center">
        <v-col cols="12" class="d-flex align-center justify-space-between px-0">
          <div class="d-flex align-center">
            <v-avatar size="44" class="mr-3" color="indigo">
              <v-icon dark>mdi-view-dashboard</v-icon>
            </v-avatar>
            <div>
              <div class="page-title">Dashboard</div>
              <div class="muted">Ringkasan penjualan dan produk</div>
            </div>
          </div>

          <div class="d-flex align-center">
            <v-chip-group v-model="period" mandatory class="mr-4" active-class="primary--text">
              <v-chip v-for="p in periods" :key="p.value" :value="p.value" small outlined @click="setPeriod(p.value)">{{p.label}}</v-chip>
            </v-chip-group>

            <div class="mr-3 muted small-text">Last updated: {{ lastUpdated }}</div>
            <v-btn icon @click="render" :loading="loading" :disabled="loading" title="Refresh" class="refresh-btn">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn small text @click="exportReport" :disabled="loading">Export</v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="3" sm="6">
          <v-card class="kpi-card pa-4 fade-in">
            <div class="d-flex align-center">
              <div class="kpi-icon kpi-icon--yellow">
                <v-icon small dark>mdi-cash</v-icon>
              </div>
              <div style="flex:1;margin-left:12px">
                <div class="label">Penjualan Hari Ini</div>
                <div class="kpi-value">{{ displayTotalDisplay }}</div>
              </div>
            </div>
            <span v-if="todayChange !== null" :class="['kpi-trend', todayChange.startsWith('+') ? 'up' : (todayChange.startsWith('-') ? 'down' : '')]">{{ todayChange }}</span>
          </v-card>
        </v-col>

        <v-col cols="12" md="3" sm="6">
          <v-card class="kpi-card pa-4 fade-in" >
            <div class="d-flex align-center">
              <div class="kpi-icon kpi-icon--green">
                <v-icon small dark>mdi-receipt</v-icon>
              </div>
              <div style="flex:1;margin-left:12px">
                <div class="label">Total Transaksi</div>
                <div class="kpi-value">{{ displayTxCount }}</div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" sm="12">
          <v-card class="pa-4 fade-in">
            <div class="label">Produk Terlaris</div>
            <div class="kpi-value" v-if="topProducts.length">{{ topProducts[0].nama }} — {{ topProducts[0].qty }} pcs</div>
            <div v-else class="muted">Belum ada data</div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12" md="4">
          <v-card class="pa-4 fade-in">
            <div class="label mb-3">Ringkasan Produk Terlaris</div>
            <v-list dense>
              <v-list-item v-for="p in topProducts" :key="p.nama">
                <v-list-item-content>
                  <v-list-item-title>{{ p.nama }}</v-list-item-title>
                  <v-list-item-subtitle class="muted">{{ p.qty }} pcs</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip small color="primary" text-color="white">{{ p.qty }}</v-chip>
                </v-list-item-action>
              </v-list-item>
              <v-list-item v-if="!topProducts.length">
                <v-list-item-content>
                  <v-list-item-title class="muted">Belum ada transaksi</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="dashboard-chart-card pa-4 fade-in">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="label">Grafik Penjualan (6 bulan)</div>
              <div class="muted small-text">Periode: {{ periodLabel }}</div>
            </div>
            <div style="position:relative; height:360px;">
              <canvas id="dashboard-chart"></canvas>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  `,
  data(){return{
    transactions:[], loading:false,
    displayTotalNumeric:0, displayTxCount:0, lastFetched:null,
    periods:[{label:'7 Hari',value:'7D'},{label:'30 Hari',value:'30D'},{label:'6 Bulan',value:'6M'},{label:'1 Tahun',value:'1Y'}],
    period:'6M'
  }},
  mounted(){ this.render() },
  computed:{
    txCount(){return this.transactions.length},
    todayTotal(){
      const today = new Date().toISOString().slice(0,10)
      return this.transactions.filter(t=>t.date && t.date.slice(0,10)===today).reduce((s,t)=>s+(t.total||0),0)
    },
    yesterdayTotal(){
      const d = new Date(); d.setDate(d.getDate()-1)
      const day = d.toISOString().slice(0,10)
      return this.transactions.filter(t=>t.date && t.date.slice(0,10)===day).reduce((s,t)=>s+(t.total||0),0)
    },
    todayChange(){
      const a = this.yesterdayTotal || 0
      const b = this.todayTotal || 0
      if(!a && !b) return null
      if(a===0) return b>0?'+100%':'0%'
      const pct = Math.round((b - a) / a * 100)
      return (pct>0?'+':'') + pct + '%'
    },
    topProducts(){
      const map = {}
      this.transactions.forEach(tx=>{ if(Array.isArray(tx.items)) tx.items.forEach(it=>{ map[it.nama]=(map[it.nama]||0)+it.qty }) })
      const arr = Object.keys(map).map(k=>({nama:k,qty:map[k]})).sort((a,b)=>b.qty-a.qty)
      return arr.slice(0,5)
    },
    displayTotalDisplay(){ return this.formatCurrency(this.displayTotalNumeric) },
    displayTxCount(){ return Math.round(this.displayTxCount||0) },
    lastUpdated(){ return this.lastFetched ? new Date(this.lastFetched).toLocaleString('id-ID') : '-' },
    periodLabel(){ const p=this.period; return p==='7D'?'7 Hari':p==='30D'?'30 Hari':p==='6M'?'6 Bulan':'1 Tahun' }
  },
  methods:{
    setPeriod(p){ this.period = p; this.render() },
    render(){
      this.loading = true
      Api.getTransactions().then(r=>{
        this.transactions = r || []
        this.lastFetched = new Date()
        this.loading = false
        this.animateValue('displayTotalNumeric', this.todayTotal)
        this.animateValue('displayTxCount', this.txCount)
        this.$nextTick(()=>this.drawChart())
      }).catch(err=>{ console.error(err); this.loading = false })
    },
    animateValue(field, to, duration=700){
      const start = Number(this[field]) || 0
      const change = to - start
      const startTime = performance.now()
      const step = (now)=>{
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const val = Math.round(start + change * progress)
        this.$set(this, field, val)
        if(progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    },
    formatCurrency(n){ if(!n) return 'Rp 0'; return 'Rp '+Number(n).toLocaleString('id-ID') },
    drawChart(){
      const now=new Date(); const labels=[]; const data=[]
      for(let i=5;i>=0;i--){
        const d=new Date(now.getFullYear(),now.getMonth()-i,1)
        labels.push(d.toLocaleString('default',{month:'short'}))
        const total = this.transactions.filter(tx=>{ const dt=new Date(tx.date); return dt.getFullYear()===d.getFullYear() && dt.getMonth()===d.getMonth() }).reduce((s,t)=>s+(t.total||0),0)
        data.push(total)
      }

      const canvas = document.getElementById('dashboard-chart')
      if(!canvas) return
      const ctx = canvas.getContext('2d')
      if(window._dashChart) try{ window._dashChart.destroy() }catch(e){}

      // create vertical gradient for bars
      const gradient = ctx.createLinearGradient(0,0,0,canvas.height)
      gradient.addColorStop(0, 'rgba(99,102,241,0.96)')
      gradient.addColorStop(1, 'rgba(59,130,246,0.6)')

      window._dashChart = new Chart(ctx,{
        type:'bar',
        data:{ labels, datasets:[{ label:'Penjualan', data, backgroundColor: gradient, borderRadius:12, borderSkipped:false }] },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          animation: { duration: 700, easing: 'easeOutQuart' },
          plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label(ctx){ return 'Rp '+(ctx.parsed && ctx.parsed.y ? ctx.parsed.y : ctx.raw) } } } },
          scales:{ y:{ beginAtZero:true, ticks:{ callback: v => v } }, x:{ grid:{ display:false } }, yAxes:[] }
        }
      })
    },
    exportReport(){ notify('Export belum diimplementasikan','info') }
  }
})

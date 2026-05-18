// API wrapper that prefers BE HTTP endpoints and falls back to localStorage.
const Api = (function(){
  const LS_KEY = 'penjualan_v1'
  const TOKEN_KEY = 'token'
  const BACKEND_BASE = (window.API_BASE_URL) ? window.API_BASE_URL : 'http://localhost:3000'
  const API_PREFIX = '/v1'

  function _loadLocal(){
    const raw = localStorage.getItem(LS_KEY)
    if(raw) return JSON.parse(raw)
    const initial = {
      users:[
        {id:1,username:'admin',password:'admin',role:'admin'}
      ],
      products:[
        {id:1,id_menu:1,nama:'Baso Besar',nama_menu:'Baso Besar',kategori:'Makanan',harga:17000,modal:10000,stok:20,deskripsi:'Bakso ukuran besar',gambar:''},
        {id:2,id_menu:2,nama:'Baso Kecil',nama_menu:'Baso Kecil',kategori:'Makanan',harga:10000,modal:6000,stok:20,deskripsi:'Bakso ukuran kecil',gambar:''}
      ],
      pelanggan:[],
      pesanan:[],
      transactions:[]
    }
    localStorage.setItem(LS_KEY,JSON.stringify(initial))
    return initial
  }

  function _saveLocal(state){ localStorage.setItem(LS_KEY,JSON.stringify(state)) }
  function _genId(list,key='id'){ return list.length? Math.max(...list.map(i=>Number(i[key] || i.id || 0)))+1:1 }
  function _kode(prefix){ return prefix + '-' + Date.now().toString(36).toUpperCase() }
  function _normalizeMenu(m){
    return {
      id: m.id || m.id_menu,
      id_menu: m.id_menu || m.id,
      nama: m.nama || m.nama_menu,
      nama_menu: m.nama_menu || m.nama,
      kategori: m.kategori || 'Umum',
      harga: Number(m.harga) || 0,
      modal: Number(m.modal) || 0,
      stok: Number(m.stok) || 0,
      gambar: m.gambar || '',
      deskripsi: m.deskripsi || ''
    }
  }

  const localApi = {
    init(){ _loadLocal() },
    login({username,password}){
      return new Promise(resolve=>{
        const s=_loadLocal()
        const u=s.users.find(x=>x.username===username && x.password===password)
        resolve(u ? {success:true,user:{id:u.id,username:u.username,role:u.role}} : {success:false})
      })
    },
    getMenu(){ return Promise.resolve(_loadLocal().products.map(_normalizeMenu)) },
    addMenu(data){
      return new Promise(resolve=>{
        const s=_loadLocal()
        const id=_genId(s.products)
        const p=_normalizeMenu(Object.assign({},data,{id,id_menu:id}))
        s.products.push(p); _saveLocal(s); resolve(p)
      })
    },
    updateMenu(id,data){
      return new Promise(resolve=>{
        const s=_loadLocal()
        const idx=s.products.findIndex(x=>(x.id || x.id_menu)===id)
        if(idx>=0){ s.products[idx]=_normalizeMenu(Object.assign({},s.products[idx],data,{id,id_menu:id})); _saveLocal(s); resolve(s.products[idx]) }
        else resolve(null)
      })
    },
    deleteMenu(id){
      return new Promise(resolve=>{ const s=_loadLocal(); s.products=s.products.filter(x=>(x.id || x.id_menu)!==id); _saveLocal(s); resolve(true) })
    },
    getPesanan(){ return Promise.resolve(_loadLocal().pesanan || []) },
    createPublicOrder(data){
      return new Promise(resolve=>{
        const s=_loadLocal()
        const kode=_kode('PSN')
        const idPelanggan=_genId(s.pelanggan || [])
        const pel={id_pelanggan:idPelanggan,nama_pelanggan:data.nama_pelanggan,no_meja:data.no_meja || ''}
        s.pelanggan=s.pelanggan || []; s.pelanggan.push(pel)
        s.pesanan=s.pesanan || []
        data.items.forEach(item=>{
          const menu=s.products.find(p=>(p.id || p.id_menu)===(item.id || item.id_menu))
          if(!menu) return
          s.pesanan.push({
            id_pesanan:_genId(s.pesanan,'id_pesanan'),
            kode_pesanan:kode,
            id_pelanggan:idPelanggan,
            nama_pelanggan:pel.nama_pelanggan,
            no_meja:pel.no_meja,
            id_menu:menu.id || menu.id_menu,
            nama_menu:menu.nama || menu.nama_menu,
            harga:Number(menu.harga)||0,
            qty:Number(item.qty)||1,
            subtotal:(Number(menu.harga)||0)*(Number(item.qty)||1),
            keterangan:item.keterangan || '',
            status:'baru',
            tgl_pesanan:new Date().toISOString()
          })
        })
        _saveLocal(s)
        resolve({kode_pesanan:kode,pesanan:s.pesanan.filter(p=>p.kode_pesanan===kode)})
      })
    },
    trackPesanan(kode){
      const list=(_loadLocal().pesanan || []).filter(p=>p.kode_pesanan===kode)
      return list.length ? Promise.resolve({kode_pesanan:kode,pesanan:list}) : Promise.reject(new Error('not found'))
    },
    updatePesananStatus(id,status){
      return new Promise(resolve=>{
        const s=_loadLocal()
        const p=(s.pesanan || []).find(x=>x.id_pesanan===id)
        if(p) p.status=status
        _saveLocal(s)
        resolve(p)
      })
    },
    deletePesanan(id){
      return new Promise(resolve=>{ const s=_loadLocal(); s.pesanan=(s.pesanan || []).filter(p=>p.id_pesanan!==id); _saveLocal(s); resolve(true) })
    },
    getTransactions(){ return Promise.resolve(_loadLocal().transactions || []) },
    checkout(data){
      return new Promise(resolve=>{
        const s=_loadLocal()
        const kode=_kode('TRX')
        const tx={id:_genId(s.transactions),kode_transaksi:kode,nama_pelanggan:data.nama_pelanggan || 'Pelanggan Umum',items:[],total:0,laba:0,date:new Date().toISOString()}
        data.items.forEach(i=>{
          const p=s.products.find(x=>(x.id || x.id_menu)===(i.id || i.id_menu))
          if(!p) return
          const qty=Number(i.qty)||1
          p.stok=Math.max(0,Number(p.stok)-qty)
          const harga=Number(p.harga)||0
          const modal=Number(p.modal)||0
          tx.items.push({id:p.id || p.id_menu,id_menu:p.id || p.id_menu,nama:p.nama || p.nama_menu,nama_menu:p.nama || p.nama_menu,harga,modal,qty,subtotal:harga*qty,laba:(harga-modal)*qty})
          tx.total += harga*qty
          tx.laba += (harga-modal)*qty
        })
        s.transactions.push(tx); _saveLocal(s); resolve(tx)
      })
    },
    getReport({from,to,q}){
      const rows=[]
      ;(_loadLocal().transactions || []).forEach(tx=>{
        if(from && to){
          const d=(tx.date || tx.created_at || '').slice(0,10)
          if(d < from || d > to) return
        }
        ;(tx.items || []).forEach(it=>{
          const row={kode_transaksi:tx.kode_transaksi,nama_pelanggan:tx.nama_pelanggan,nama_menu:it.nama || it.nama_menu,qty:it.qty,harga:it.harga,modal:it.modal || 0,subtotal:it.subtotal || it.harga*it.qty,laba:it.laba || ((it.harga-(it.modal||0))*it.qty),tgl_transaksi:tx.date}
          if(q && JSON.stringify(row).toLowerCase().indexOf(q.toLowerCase())===-1) return
          rows.push(row)
        })
      })
      const summary=rows.reduce((a,r)=>{ a.omzet+=r.subtotal; a.modal+=r.modal*r.qty; a.laba+=r.laba; a.qty+=r.qty; a.transaksi+=1; return a },{omzet:0,modal:0,laba:0,qty:0,transaksi:0})
      return Promise.resolve({summary,rows})
    }
  }

  async function _authFetch(path, opts={}){
    const url = path.startsWith('http') ? path : (BACKEND_BASE + path)
    const headers = Object.assign({}, opts.headers || {})
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    const token = localStorage.getItem(TOKEN_KEY)
    if(token) headers['Authorization'] = 'Bearer ' + token
    return _fetchWithTimeout(url, Object.assign({}, opts, {headers}))
  }

  function _fetchWithTimeout(url, opts={}, timeout=8000){
    if(!window.AbortController){
      return fetch(url, opts)
    }
    const controller = new AbortController()
    const timer = setTimeout(()=>controller.abort(), timeout)
    return fetch(url, Object.assign({}, opts, {signal:controller.signal}))
      .finally(()=>clearTimeout(timer))
  }

  async function _json(res){
    const data = await res.json().catch(()=>({}))
    if(!res.ok) throw new Error(data.error || data.message || 'request failed')
    return data
  }

  const httpApi = {
    init(){},
    async login({username,password}){
      const res = await _fetchWithTimeout(BACKEND_BASE + API_PREFIX + '/auth/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})})
      if(!res.ok) return {success:false}
      const data = await res.json()
      if(data.token) localStorage.setItem(TOKEN_KEY, data.token)
      return {success:true, user:data.user}
    },
    async getMenu(){ return (await _json(await _authFetch(API_PREFIX + '/menu',{method:'GET'}))).map(_normalizeMenu) },
    async getPublicMenu(){ return (await _json(await _fetchWithTimeout(BACKEND_BASE + API_PREFIX + '/menu/public'))).map(_normalizeMenu) },
    async addMenu(data){ return _normalizeMenu(await _json(await _authFetch(API_PREFIX + '/menu',{method:'POST',body:JSON.stringify(data)}))) },
    async updateMenu(id,data){ return _normalizeMenu(await _json(await _authFetch(API_PREFIX + '/menu/'+id,{method:'PUT',body:JSON.stringify(data)}))) },
    async deleteMenu(id){ await _json(await _authFetch(API_PREFIX + '/menu/'+id,{method:'DELETE'})); return true },
    async getPesanan(params={}){
      const qs = new URLSearchParams(params).toString()
      return _json(await _authFetch(API_PREFIX + '/pesanan' + (qs ? '?' + qs : ''), {method:'GET'}))
    },
    async createPublicOrder(data){ return _json(await _fetchWithTimeout(BACKEND_BASE + API_PREFIX + '/pesanan/public',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})) },
    async trackPesanan(kode){ return _json(await _fetchWithTimeout(BACKEND_BASE + API_PREFIX + '/pesanan/tracking/' + encodeURIComponent(kode))) },
    async updatePesananStatus(id,status){ return _json(await _authFetch(API_PREFIX + '/pesanan/'+id+'/status',{method:'PUT',body:JSON.stringify({status})})) },
    async deletePesanan(id){ await _json(await _authFetch(API_PREFIX + '/pesanan/'+id,{method:'DELETE'})); return true },
    async getTransactions(){ return _json(await _authFetch(API_PREFIX + '/transaksi',{method:'GET'})) },
    async checkout(data){ return _json(await _authFetch(API_PREFIX + '/transaksi/checkout',{method:'POST',body:JSON.stringify(data)})) },
    async getReport(params){
      const qs = new URLSearchParams(params).toString()
      return _json(await _authFetch(API_PREFIX + '/laporan' + (qs ? '?' + qs : ''), {method:'GET'}))
    }
  }

  function _tryHttp(httpFn, localFn){
    return new Promise((resolve,reject)=>{
      httpFn().then(resolve).catch(err=>{
        console.warn('HTTP API failed, falling back to local storage:', err)
        try{ localFn().then(resolve).catch(reject) }catch(e){ reject(e) }
      })
    })
  }

  return {
    init(){ localApi.init(); httpApi.init() },
    logout(){ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem('currentUser') },
    login(creds){ return _tryHttp(()=>httpApi.login(creds), ()=>localApi.login(creds)) },
    getMenu(){ return _tryHttp(()=>httpApi.getMenu(), ()=>localApi.getMenu()) },
    getPublicMenu(){ return _tryHttp(()=>httpApi.getPublicMenu(), ()=>localApi.getMenu()) },
    addMenu(data){ return _tryHttp(()=>httpApi.addMenu(data), ()=>localApi.addMenu(data)) },
    updateMenu(id,data){ return _tryHttp(()=>httpApi.updateMenu(id,data), ()=>localApi.updateMenu(id,data)) },
    deleteMenu(id){ return _tryHttp(()=>httpApi.deleteMenu(id), ()=>localApi.deleteMenu(id)) },
    getProducts(){ return this.getMenu() },
    addProduct(data){ return this.addMenu(data) },
    updateProduct(id,data){ return this.updateMenu(id,data) },
    deleteProduct(id){ return this.deleteMenu(id) },
    getPesanan(params){ return _tryHttp(()=>httpApi.getPesanan(params), ()=>localApi.getPesanan(params)) },
    createPublicOrder(data){ return _tryHttp(()=>httpApi.createPublicOrder(data), ()=>localApi.createPublicOrder(data)) },
    trackPesanan(kode){ return _tryHttp(()=>httpApi.trackPesanan(kode), ()=>localApi.trackPesanan(kode)) },
    updatePesananStatus(id,status){ return _tryHttp(()=>httpApi.updatePesananStatus(id,status), ()=>localApi.updatePesananStatus(id,status)) },
    deletePesanan(id){ return _tryHttp(()=>httpApi.deletePesanan(id), ()=>localApi.deletePesanan(id)) },
    getTransactions(){ return _tryHttp(()=>httpApi.getTransactions(), ()=>localApi.getTransactions()) },
    checkout(data){ return _tryHttp(()=>httpApi.checkout(data), ()=>localApi.checkout(data)) },
    getReport(params){ return _tryHttp(()=>httpApi.getReport(params), ()=>localApi.getReport(params)) },
    getLaporan(params){ return this.getReport(params) }
  }
})()

Api.init()
window.Api = Api

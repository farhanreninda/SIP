// API wrapper that prefers backend HTTP endpoints and falls back to localStorage
const Api = (function(){
  const LS_KEY = 'penjualan_v1'
  const TOKEN_KEY = 'token'
  const BACKEND_BASE = (window.API_BASE_URL) ? window.API_BASE_URL : 'http://localhost:3000'

  /* ----- LocalStorage fallback (original) ----- */
  function _loadLocal(){
    const raw = localStorage.getItem(LS_KEY)
    if(raw) return JSON.parse(raw)
    const initial = {
      users:[
        {id:1,username:'admin',password:'admin',role:'admin'},
        {id:2,username:'kasir',password:'kasir',role:'kasir'}
      ],
      products:[
        {id:1,nama:'Contoh Produk A',kategori:'Umum',harga:10000,stok:20},
        {id:2,nama:'Contoh Produk B',kategori:'Umum',harga:15000,stok:10}
      ],
      transactions:[]
    }
    localStorage.setItem(LS_KEY,JSON.stringify(initial))
    return initial
  }
  function _saveLocal(state){ localStorage.setItem(LS_KEY,JSON.stringify(state)) }
  function _genId(list){ return list.length? Math.max(...list.map(i=>i.id))+1:1 }
  const localApi = {
    init(){ _loadLocal() },
    login({username,password}){ return new Promise(resolve=>{ const s=_loadLocal(); const u=s.users.find(x=>x.username===username && x.password===password); if(u) resolve({success:true,user:{id:u.id,username:u.username,role:u.role}}); else resolve({success:false}) }) },
    getProducts(){ return new Promise(resolve=>{ const s=_loadLocal(); resolve(s.products) }) },
    addProduct(data){ return new Promise(resolve=>{ const s=_loadLocal(); const p={id:_genId(s.products),nama:data.nama||'Untitled',kategori:data.kategori||'Umum',harga:Number(data.harga)||0,stok:Number(data.stok)||0}; s.products.push(p); _saveLocal(s); resolve(p) }) },
    updateProduct(id,data){ return new Promise(resolve=>{ const s=_loadLocal(); const p=s.products.find(x=>x.id===id); if(p){ p.nama=data.nama; p.kategori=data.kategori; p.harga=Number(data.harga); p.stok=Number(data.stok); _saveLocal(s); resolve(p) } else resolve(null) }) },
    deleteProduct(id){ return new Promise(resolve=>{ const s=_loadLocal(); s.products=s.products.filter(x=>x.id!==id); _saveLocal(s); resolve(true) }) },
    getTransactions(){ return new Promise(resolve=>{ const s=_loadLocal(); resolve(s.transactions) }) },
    checkout(data){ return new Promise(resolve=>{ const s=_loadLocal(); const tx={id:_genId(s.transactions),items:data.items.map(i=>({id:i.id,nama:i.nama,harga:i.harga,qty:i.qty})),total:data.total,date:new Date().toISOString()}; tx.items.forEach(it=>{ const p=s.products.find(x=>x.id===it.id); if(p) p.stok = Math.max(0, p.stok - it.qty) }); s.transactions.push(tx); _saveLocal(s); resolve(tx) }) },
    getReport({from,to}){ return new Promise(resolve=>{ const s=_loadLocal(); const f=new Date(from), t=new Date(to); const list = s.transactions.filter(tx=>{ const d=new Date(tx.date); return d>=f && d<=t }); resolve(list) }) }
  }

  /* ----- HTTP backend API ----- */
  async function _authFetch(path, opts={}){
    const url = (path.startsWith('http')) ? path : (BACKEND_BASE + path)
    const headers = opts.headers || {}
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    const token = localStorage.getItem(TOKEN_KEY)
    if(token) headers['Authorization'] = 'Bearer ' + token
    const res = await fetch(url, Object.assign({}, opts, {headers}))
    return res
  }

  const httpApi = {
    init(){ /* nothing to init on backend */ },
    async login({username,password}){
      const res = await fetch(BACKEND_BASE + '/api/auth/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})})
      if(!res.ok) return {success:false}
      const data = await res.json()
      if(data.token) localStorage.setItem(TOKEN_KEY, data.token)
      return {success:true, user: data.user}
    },
    async getProducts(){
      const res = await _authFetch('/api/products',{method:'GET'})
      if(!res.ok) throw new Error('unauthorized')
      const rows = await res.json()
      return rows.map(r=>({id:r.id,nama:r.nama,kategori:r.kategori,harga: Number(r.harga),stok: Number(r.stok)}))
    },
    async addProduct(data){
      const res = await _authFetch('/api/products',{method:'POST',body:JSON.stringify(data)})
      if(!res.ok) throw new Error('failed')
      const r = await res.json()
      return {id:r.id,nama:r.nama,kategori:r.kategori,harga:Number(r.harga),stok:Number(r.stok)}
    },
    async updateProduct(id,data){
      const res = await _authFetch('/api/products/'+id,{method:'PUT',body:JSON.stringify(data)})
      if(!res.ok) throw new Error('failed')
      const r = await res.json()
      return {id:r.id,nama:r.nama,kategori:r.kategori,harga:Number(r.harga),stok:Number(r.stok)}
    },
    async deleteProduct(id){ const res = await _authFetch('/api/products/'+id,{method:'DELETE'}); if(!res.ok) throw new Error('failed'); return true },
    async getTransactions(){ const res = await _authFetch('/api/transactions',{method:'GET'}); if(!res.ok) throw new Error('unauthorized'); const rows = await res.json(); return rows.map(tx=>({ id:tx.id, total:Number(tx.total), date: tx.created_at || tx.date, items: (tx.items||[]).map(it=>({ id: it.product_id || it.id, nama: it.nama, harga: Number(it.harga), qty: it.qty })) })) },
    async checkout(data){ const res = await _authFetch('/api/transactions/checkout',{method:'POST',body:JSON.stringify(data)}); if(!res.ok) throw new Error('failed'); const tx = await res.json(); return { id:tx.id, total:Number(tx.total), date: tx.created_at || tx.date, items: (tx.items||[]).map(it=>({ id: it.product_id || it.id, nama: it.nama, harga: Number(it.harga), qty: it.qty })) } },
    async getReport({from,to}){ const res = await _authFetch('/api/transactions/report?from='+encodeURIComponent(from)+'&to='+encodeURIComponent(to),{method:'GET'}); if(!res.ok) throw new Error('failed'); const rows = await res.json(); return rows.map(tx=>({ id:tx.id, total:Number(tx.total), date: tx.created_at || tx.date, items:(tx.items||[]).map(it=>({ id: it.product_id || it.id, nama: it.nama, harga: Number(it.harga), qty: it.qty })) })) }
  }

  /* ----- helper to try HTTP then fallback to local ----- */
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
    login(creds){ return _tryHttp(()=>httpApi.login(creds), ()=>localApi.login(creds)) },
    getProducts(){ return _tryHttp(()=>httpApi.getProducts(), ()=>localApi.getProducts()) },
    addProduct(data){ return _tryHttp(()=>httpApi.addProduct(data), ()=>localApi.addProduct(data)) },
    updateProduct(id,data){ return _tryHttp(()=>httpApi.updateProduct(id,data), ()=>localApi.updateProduct(id,data)) },
    deleteProduct(id){ return _tryHttp(()=>httpApi.deleteProduct(id), ()=>localApi.deleteProduct(id)) },
    getTransactions(){ return _tryHttp(()=>httpApi.getTransactions(), ()=>localApi.getTransactions()) },
    checkout(data){ return _tryHttp(()=>httpApi.checkout(data), ()=>localApi.checkout(data)) },
    getReport(params){ return _tryHttp(()=>httpApi.getReport(params), ()=>localApi.getReport(params)) }
  }
})()

// Initialize storage if empty and make Api available
Api.init()
window.Api = Api

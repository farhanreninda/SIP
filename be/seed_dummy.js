#!/usr/bin/env node
const bcrypt = require('bcrypt')
const pool = require('./config/mysql')

async function upsertMenu(conn, data){
  const [rows] = await conn.query('SELECT id_menu FROM menu WHERE nama_menu=? LIMIT 1', [data.nama_menu])
  if(rows.length){
    await conn.query(
      'UPDATE menu SET kategori=?,harga=?,modal=?,stok=?,gambar=?,deskripsi=? WHERE id_menu=?',
      [data.kategori,data.harga,data.modal,data.stok,data.gambar || '',data.deskripsi || '',rows[0].id_menu]
    )
    return rows[0].id_menu
  }
  const [r] = await conn.query(
    'INSERT INTO menu (nama_menu,kategori,harga,modal,stok,gambar,deskripsi) VALUES (?,?,?,?,?,?,?)',
    [data.nama_menu,data.kategori,data.harga,data.modal,data.stok,data.gambar || '',data.deskripsi || '']
  )
  return r.insertId
}

async function getPelanggan(conn, data){
  const [rows] = await conn.query('SELECT id_pelanggan FROM pelanggan WHERE kode_pelanggan=? LIMIT 1', [data.kode_pelanggan])
  if(rows.length){
    await conn.query(
      'UPDATE pelanggan SET nama_pelanggan=?, no_meja=? WHERE id_pelanggan=?',
      [data.nama_pelanggan,data.no_meja,rows[0].id_pelanggan]
    )
    return rows[0].id_pelanggan
  }
  const [r] = await conn.query(
    'INSERT INTO pelanggan (nama_pelanggan,no_meja,kode_pelanggan) VALUES (?,?,?)',
    [data.nama_pelanggan,data.no_meja,data.kode_pelanggan]
  )
  return r.insertId
}

async function addPesanan(conn, data){
  const [r] = await conn.query(
    'INSERT INTO pesanan (kode_pesanan,id_pelanggan,id_menu,qty,keterangan,status,tgl_pesanan) VALUES (?,?,?,?,?,?,?)',
    [data.kode_pesanan,data.id_pelanggan,data.id_menu,data.qty,data.keterangan || '',data.status,data.tgl_pesanan]
  )
  return r.insertId
}

async function addTransaksi(conn, data){
  const [menuRows] = await conn.query('SELECT nama_menu,harga,modal FROM menu WHERE id_menu=?', [data.id_menu])
  const [pelRows] = await conn.query('SELECT nama_pelanggan FROM pelanggan WHERE id_pelanggan=?', [data.id_pelanggan])
  const menu = menuRows[0]
  const pelanggan = pelRows[0]
  const harga = Number(menu.harga || 0)
  const modal = Number(menu.modal || 0)
  const qty = Number(data.qty || 1)
  const subtotal = harga * qty
  const laba = (harga - modal) * qty

  await conn.query(`
    INSERT INTO transaksi
      (kode_transaksi,id_user,id_pesanan,id_pelanggan,id_menu,nama_menu,nama_pelanggan,qty,harga,modal,subtotal,laba,tgl_transaksi)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `, [
    data.kode_transaksi,
    data.id_user,
    data.id_pesanan,
    data.id_pelanggan,
    data.id_menu,
    menu.nama_menu,
    pelanggan.nama_pelanggan,
    qty,
    harga,
    modal,
    subtotal,
    laba,
    data.tgl_transaksi
  ])
}

async function main(){
  const conn = await pool.getConnection()
  try{
    await conn.beginTransaction()

    const password = await bcrypt.hash('admin', 10)
    await conn.query(`
      INSERT INTO admin (id_user,nama_user,username,password,role)
      VALUES (1,'Administrator','admin',?,'admin')
      ON DUPLICATE KEY UPDATE
        nama_user=VALUES(nama_user),
        username=VALUES(username),
        password=VALUES(password),
        role=VALUES(role)
    `, [password])

    await conn.query('DELETE FROM transaksi WHERE kode_transaksi LIKE "DEMO-%"')
    await conn.query('DELETE FROM pesanan WHERE kode_pesanan LIKE "DEMO-%"')

    const menus = [
      {nama_menu:'Bakso Urat',kategori:'Makanan',harga:18000,modal:10000,stok:35,deskripsi:'Bakso urat dengan kuah kaldu gurih.'},
      {nama_menu:'Bakso Halus',kategori:'Makanan',harga:15000,modal:8500,stok:40,deskripsi:'Bakso halus porsi reguler.'},
      {nama_menu:'Mie Ayam Bakso',kategori:'Makanan',harga:22000,modal:13000,stok:30,deskripsi:'Mie ayam dengan tambahan bakso.'},
      {nama_menu:'Es Teh Manis',kategori:'Minuman',harga:5000,modal:2000,stok:80,deskripsi:'Es teh manis segar.'},
      {nama_menu:'Es Jeruk',kategori:'Minuman',harga:7000,modal:3000,stok:60,deskripsi:'Es jeruk segar.'}
    ]

    const menuIds = {}
    for(const menu of menus){
      const id = await upsertMenu(conn, menu)
      menuIds[menu.nama_menu] = id
    }

    const pelangganDemo = await getPelanggan(conn, {
      nama_pelanggan:'Budi Santoso',
      no_meja:'A1',
      kode_pelanggan:'PLG-DEMO'
    })
    const pelangganSiti = await getPelanggan(conn, {
      nama_pelanggan:'Siti Aminah',
      no_meja:'B2',
      kode_pelanggan:'PLG-DEMO-2'
    })
    await getPelanggan(conn, {
      nama_pelanggan:'Farhan Reninda B',
      no_meja:'C3',
      kode_pelanggan:'PLG-FARHAN'
    })

    const p1 = await addPesanan(conn, {
      kode_pesanan:'DEMO-PSN-001',
      id_pelanggan:pelangganDemo,
      id_menu:menuIds['Bakso Urat'],
      qty:2,
      keterangan:'Tidak pakai sambal',
      status:'baru',
      tgl_pesanan:'2026-05-17 09:10:00'
    })
    const p2 = await addPesanan(conn, {
      kode_pesanan:'DEMO-PSN-002',
      id_pelanggan:pelangganSiti,
      id_menu:menuIds['Mie Ayam Bakso'],
      qty:1,
      keterangan:'Mie agak lembek',
      status:'diproses',
      tgl_pesanan:'2026-05-17 10:05:00'
    })
    const p3 = await addPesanan(conn, {
      kode_pesanan:'DEMO-PSN-003',
      id_pelanggan:pelangganDemo,
      id_menu:menuIds['Bakso Halus'],
      qty:3,
      keterangan:'',
      status:'selesai',
      tgl_pesanan:'2026-05-17 11:25:00'
    })
    const p4 = await addPesanan(conn, {
      kode_pesanan:'DEMO-PSN-003',
      id_pelanggan:pelangganDemo,
      id_menu:menuIds['Es Teh Manis'],
      qty:3,
      keterangan:'',
      status:'selesai',
      tgl_pesanan:'2026-05-17 11:25:00'
    })
    const p5 = await addPesanan(conn, {
      kode_pesanan:'DEMO-PSN-004',
      id_pelanggan:pelangganSiti,
      id_menu:menuIds['Es Jeruk'],
      qty:2,
      keterangan:'Tanpa gula',
      status:'dibatalkan',
      tgl_pesanan:'2026-05-16 13:15:00'
    })
    const p6 = await addPesanan(conn, {
      kode_pesanan:'DEMO-PSN-005',
      id_pelanggan:pelangganSiti,
      id_menu:menuIds['Mie Ayam Bakso'],
      qty:1,
      keterangan:'',
      status:'selesai',
      tgl_pesanan:'2026-05-16 14:20:00'
    })
    const p7 = await addPesanan(conn, {
      kode_pesanan:'DEMO-PSN-005',
      id_pelanggan:pelangganSiti,
      id_menu:menuIds['Es Jeruk'],
      qty:2,
      keterangan:'Tanpa gula',
      status:'selesai',
      tgl_pesanan:'2026-05-16 14:20:00'
    })

    await addTransaksi(conn, {
      kode_transaksi:'DEMO-TRX-001',
      id_user:1,
      id_pesanan:p3,
      id_pelanggan:pelangganDemo,
      id_menu:menuIds['Bakso Halus'],
      qty:3,
      tgl_transaksi:'2026-05-17 11:40:00'
    })
    await addTransaksi(conn, {
      kode_transaksi:'DEMO-TRX-001',
      id_user:1,
      id_pesanan:p4,
      id_pelanggan:pelangganDemo,
      id_menu:menuIds['Es Teh Manis'],
      qty:3,
      tgl_transaksi:'2026-05-17 11:40:00'
    })
    await addTransaksi(conn, {
      kode_transaksi:'DEMO-TRX-002',
      id_user:1,
      id_pesanan:p6,
      id_pelanggan:pelangganSiti,
      id_menu:menuIds['Mie Ayam Bakso'],
      qty:1,
      tgl_transaksi:'2026-05-16 14:30:00'
    })
    await addTransaksi(conn, {
      kode_transaksi:'DEMO-TRX-002',
      id_user:1,
      id_pesanan:p7,
      id_pelanggan:pelangganSiti,
      id_menu:menuIds['Es Jeruk'],
      qty:2,
      tgl_transaksi:'2026-05-16 14:30:00'
    })

    await conn.commit()

    const [counts] = await conn.query(`
      SELECT
        (SELECT COUNT(*) FROM admin) AS admin,
        (SELECT COUNT(*) FROM pelanggan) AS pelanggan,
        (SELECT COUNT(*) FROM menu) AS menu,
        (SELECT COUNT(*) FROM pesanan) AS pesanan,
        (SELECT COUNT(*) FROM transaksi) AS transaksi
    `)
    console.log(JSON.stringify(counts[0], null, 2))
  }catch(err){
    await conn.rollback()
    console.error(err)
    process.exitCode = 1
  }finally{
    conn.release()
    pool.end()
  }
}

main()

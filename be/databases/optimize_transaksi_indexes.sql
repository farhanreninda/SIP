USE penjualan;

ALTER TABLE transaksi
  ADD INDEX idx_transaksi_tgl_kode (tgl_transaksi, kode_transaksi),
  ADD INDEX idx_transaksi_tgl_pelanggan (tgl_transaksi, nama_pelanggan);


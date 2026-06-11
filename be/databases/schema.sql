-- MySQL schema for Aplikasi Penjualan Warung Bakso Tulus
CREATE DATABASE IF NOT EXISTS penjualan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE penjualan;

CREATE TABLE IF NOT EXISTS admin (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  nama_user VARCHAR(150) DEFAULT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pelanggan (
  id_pelanggan INT AUTO_INCREMENT PRIMARY KEY,
  nama_pelanggan VARCHAR(150) NOT NULL,
  no_meja VARCHAR(50) DEFAULT NULL,
  kode_pelanggan VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_kode_pelanggan (kode_pelanggan)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS menu (
  id_menu INT AUTO_INCREMENT PRIMARY KEY,
  nama_menu VARCHAR(255) NOT NULL,
  stok INT DEFAULT 0,
  harga INT UNSIGNED DEFAULT 0,
  modal INT UNSIGNED DEFAULT 0,
  gambar LONGTEXT,
  deskripsi TEXT,
  kategori VARCHAR(100) DEFAULT 'Umum',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pesanan (
  id_pesanan INT AUTO_INCREMENT PRIMARY KEY,
  kode_pesanan VARCHAR(64) NOT NULL,
  id_pelanggan INT NOT NULL,
  id_menu INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  keterangan TEXT,
  status ENUM('baru','diproses','selesai','dibatalkan') NOT NULL DEFAULT 'baru',
  tgl_pesanan DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pesanan_kode (kode_pesanan),
  INDEX idx_pesanan_status (status),
  FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
  FOREIGN KEY (id_menu) REFERENCES menu(id_menu) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transaksi (
  id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
  kode_transaksi VARCHAR(64) DEFAULT NULL,
  id_user INT DEFAULT NULL,
  id_pesanan INT DEFAULT NULL,
  id_pelanggan INT DEFAULT NULL,
  id_menu INT DEFAULT NULL,
  nama_menu VARCHAR(255),
  nama_pelanggan VARCHAR(150),
  qty INT DEFAULT 0,
  harga INT UNSIGNED DEFAULT 0,
  modal INT UNSIGNED DEFAULT 0,
  subtotal INT UNSIGNED DEFAULT 0,
  laba INT DEFAULT 0,
  tgl_transaksi DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_transaksi_kode (kode_transaksi),
  INDEX idx_transaksi_tgl (tgl_transaksi),
  INDEX idx_transaksi_tgl_kode (tgl_transaksi, kode_transaksi),
  INDEX idx_transaksi_tgl_pelanggan (tgl_transaksi, nama_pelanggan),
  FOREIGN KEY (id_user) REFERENCES admin(id_user) ON DELETE SET NULL,
  FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan) ON DELETE SET NULL,
  FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan) ON DELETE SET NULL,
  FOREIGN KEY (id_menu) REFERENCES menu(id_menu) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Note: create an admin user using the provided API or use the following SQL
-- INSERT INTO admin (nama_user,username,password,role) VALUES ('Admin','admin','<hashed_password>','admin');

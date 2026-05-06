-- MySQL schema for Sistem Penjualan
CREATE DATABASE IF NOT EXISTS penjualan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE penjualan;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','kasir') NOT NULL DEFAULT 'kasir',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) DEFAULT 'Umum',
  harga DECIMAL(12,2) DEFAULT 0,
  stok INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(12,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT,
  nama VARCHAR(255),
  harga DECIMAL(12,2),
  qty INT,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Note: create an admin user using the provided API or use the following SQL
-- INSERT INTO users (username,password,role) VALUES ('admin','<hashed_password>','admin');

-- Create database
CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

-- -------------------------
-- Drop old tables if they exist
-- -------------------------
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;

-- -------------------------
-- Users Table
-- -------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(400) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user'
);

-- Default Admin
INSERT INTO users (name, email, address, password, role) 
VALUES ('Admin', 'admin123@gmail.com', 'HQ Pune', 'Admin@123', 'admin');

-- -------------------------
-- Stores Table
-- -------------------------
CREATE TABLE stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- -------------------------
-- Ratings Table
-- -------------------------
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  store_id INT NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  UNIQUE KEY unique_rating (user_email, store_id)
);

-- -------------------------
-- Insert 10 Users
-- -------------------------
INSERT INTO users (name, email, address, password, role) VALUES 
('User One', 'user1@gmail.com', 'Address 1', 'User@1234', 'user'),
('User Two', 'user2@gmail.com', 'Address 2', 'User@1234', 'user'),
('User Three', 'user3@gmail.com', 'Address 3', 'User@1234', 'user'),
('User Four', 'user4@gmail.com', 'Address 4', 'User@1234', 'user'),
('User Five', 'user5@gmail.com', 'Address 5', 'User@1234', 'user'),
('User Six', 'user6@gmail.com', 'Address 6', 'User@1234', 'user'),
('User Seven', 'user7@gmail.com', 'Address 7', 'User@1234', 'user'),
('User Eight', 'user8@gmail.com', 'Address 8', 'User@1234', 'user'),
('User Nine', 'user9@gmail.com', 'Address 9', 'User@1234', 'user'),
('User Ten', 'user10@gmail.com', 'Address 10', 'User@1234', 'user');

-- -------------------------
-- Insert 10 Store Owners
-- -------------------------
INSERT INTO stores (name, purpose, address, email, password) VALUES
('Store One', 'Grocery', 'Store Address 1', 'store1@gmail.com', 'Store@1234'),
('Store Two', 'Clothing', 'Store Address 2', 'store2@gmail.com', 'Store@1234'),
('Store Three', 'Electronics', 'Store Address 3', 'store3@gmail.com', 'Store@1234'),
('Store Four', 'Bakery', 'Store Address 4', 'store4@gmail.com', 'Store@1234'),
('Store Five', 'Books', 'Store Address 5', 'store5@gmail.com', 'Store@1234'),
('Store Six', 'Stationery', 'Store Address 6', 'store6@gmail.com', 'Store@1234'),
('Store Seven', 'Sports', 'Store Address 7', 'store7@gmail.com', 'Store@1234'),
('Store Eight', 'Furniture', 'Store Address 8', 'store8@gmail.com', 'Store@1234'),
('Store Nine', 'Toys', 'Store Address 9', 'store9@gmail.com', 'Store@1234'),
('Store Ten', 'Hardware', 'Store Address 10', 'store10@gmail.com', 'Store@1234');

SELECT email, password, role FROM users WHERE role='store-owner';

INSERT INTO users (name, email, password, address, role) VALUES
('StoreOwner1', 'store1@gmail.com', 'Store1@123', 'Address1', 'store-owner'),
('StoreOwner2', 'store2@gmail.com', 'Store2@123', 'Address2', 'store-owner'),
('StoreOwner3', 'store3@gmail.com', 'Store3@123', 'Address3', 'store-owner'),
('StoreOwner4', 'store4@gmail.com', 'Store4@123', 'Address4', 'store-owner'),
('StoreOwner5', 'store5@gmail.com', 'Store5@123', 'Address5', 'store-owner'),
('StoreOwner6', 'store6@gmail.com', 'Store6@123', 'Address6', 'store-owner'),
('StoreOwner7', 'store7@gmail.com', 'Store7@123', 'Address7', 'store-owner'),
('StoreOwner8', 'store8@gmail.com', 'Store8@123', 'Address8', 'store-owner'),
('StoreOwner9', 'store9@gmail.com', 'Store9@123', 'Address9', 'store-owner'),
('StoreOwner10', 'store10@gmail.com', 'Store10@123', 'Address10', 'store-owner');




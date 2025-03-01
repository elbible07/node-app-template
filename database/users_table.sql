-- User management table for Sports Social App
CREATE DATABASE IF NOT EXISTS sports_social_app;
USE sports_social_app;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  profile_picture VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample admin user (password will need to be hashed when inserted through the app)
-- INSERT INTO users (username, email, password, full_name)
-- VALUES ('admin', 'admin@sportssocial.com', 'admin_password_to_be_hashed', 'Admin User');
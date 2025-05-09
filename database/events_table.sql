USE sports_social_app;

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  sport_type VARCHAR(50) NOT NULL,
  event_date DATETIME NOT NULL,
  city VARCHAR(100) NOT NULL,
  player_list TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE
);
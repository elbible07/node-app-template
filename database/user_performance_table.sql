USE sports_social_app;

-- Event Participants Junction Table
CREATE TABLE IF NOT EXISTS user_performance (
  performance_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT,
  performance_date DATE NOT NULL,
  sport_type VARCHAR(50) NOT NULL,
  metrics JSON NOT NULL, -- Flexible storage for different sport metrics
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL
);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createConnection } = require('../config/db');

// Register a new user
exports.register = async (req, res) => {
  const { username, email, password, full_name } = req.body;
  
  // Validate input
  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide username, email, password and full name' 
    });
  }
  
  const connection = await createConnection();
  
  try {
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, full_name]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during registration' 
    });
  } finally {
    await connection.end();
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide email and password' 
    });
  }
  
  const connection = await createConnection();
  
  try {
    // Find user
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const user = users[0];
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during login' 
    });
  } finally {
    await connection.end();
  }
};

// Protect routes middleware
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const connection = await createConnection();
    
    // Get user from token
    const [users] = await connection.execute(
      'SELECT user_id, username, email, full_name FROM users WHERE user_id = ?',
      [decoded.id]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
    
    // Attach user to request object
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};
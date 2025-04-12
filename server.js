require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import database connection
const { createConnection } = require('./server/config/db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static('public'));

//////////////////////////////////////
// ROUTES TO SERVE HTML FILES
//////////////////////////////////////
// Default route to serve logon.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/logon.html'));
});

// Route to serve dashboard.html
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/dashboard.html'));
});

// Add routes for other HTML pages
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/register.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/profile.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/events.html'));
});

app.get('/create-event', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/create-event.html'));
});
//////////////////////////////////////
// END ROUTES TO SERVE HTML FILES
//////////////////////////////////////


/////////////////////////////////////////////////
// AUTHENTICATION MIDDLEWARE
/////////////////////////////////////////////////
// Authentication Middleware: Verify JWT Token and Check User in Database
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }

        try {
            const connection = await createConnection();

            // Query the database to verify that the user exists
            const [rows] = await connection.execute(
                'SELECT user_id, username, email FROM users WHERE email = ?',
                [decoded.email]
            );

            await connection.end();  // Close connection

            if (rows.length === 0) {
                return res.status(403).json({ message: 'User not found or deactivated.' });
            }

            // Add user information to the request
            req.user = {
                userId: rows[0].user_id,
                username: rows[0].username,
                email: rows[0].email
            };
            
            next();  // Proceed to the next middleware or route handler
        } catch (dbError) {
            console.error(dbError);
            res.status(500).json({ message: 'Database error during authentication.' });
        }
    });
}
/////////////////////////////////////////////////
// END AUTHENTICATION MIDDLEWARE
/////////////////////////////////////////////////


//////////////////////////////////////
// API ROUTES
//////////////////////////////////////
// Import event routes
const eventRoutes = require('./server/routes/eventRoutes');
// Import team routes
const teamRoutes = require('./server/routes/teamRoutes');

// Use event routes with authentication middleware
app.use('/api/events', authenticateToken, eventRoutes);
// Use team routes with authentication middleware
app.use('/api/teams', authenticateToken, teamRoutes);

// Route: Create Account (Register)
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, full_name, city } = req.body;

    if (!username || !email || !password || !full_name) {
        return res.status(400).json({ message: 'Username, email, password, and full name are required.' });
    }

    try {
        const connection = await createConnection();
        const hashedPassword = await bcrypt.hash(password, 10);  // Hash password

        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password, full_name, city) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name, city || null]
        );

        await connection.end();  // Close connection

        // Generate JWT token for immediate login
        const token = jwt.sign(
            { userId: result.insertId, username, email },
            process.env.JWT_SECRET
        );

        res.status(201).json({ 
            message: 'Account created successfully!',
            token
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'An account with this username or email already exists.' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Error creating account.' });
        }
    }
});

// Route: Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const connection = await createConnection();

        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        await connection.end();  // Close connection

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const user = rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign(
            { userId: user.user_id, username: user.username, email: user.email },
            process.env.JWT_SECRET
        );

        res.status(200).json({ 
            token,
            user: {
                userId: user.user_id, 
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in.' });
    }
});

// Route: Get Current User
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const connection = await createConnection();

        const [rows] = await connection.execute(
            'SELECT user_id, username, email, full_name, city, bio, profile_picture FROM users WHERE user_id = ?',
            [req.user.userId]
        );

        await connection.end();  // Close connection

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = rows[0];
        
        res.status(200).json({
            userId: user.user_id, 
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            city: user.city,
            bio: user.bio,
            profilePicture: user.profile_picture
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving user data.' });
    }
});

// Route: Get All Users (Protected)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const connection = await createConnection();

        const [rows] = await connection.execute(
            'SELECT user_id, username, email, full_name, city FROM users'
        );

        await connection.end();  // Close connection

        res.status(200).json({ users: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving users.' });
    }
});

// Route: Update User Profile
app.put('/api/users/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { full_name, city, bio } = req.body;
    
    // Ensure users can only update their own profile
    if (parseInt(userId) !== req.user.userId) {
        return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    try {
        const connection = await createConnection();
        
        const [result] = await connection.execute(
            'UPDATE users SET full_name = ?, city = ?, bio = ? WHERE user_id = ?',
            [full_name, city || null, bio || null, userId]
        );

        await connection.end();  // Close connection

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile.' });
    }
});

// Route: Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.status(200).json({ valid: true, user: req.user });
});
//////////////////////////////////////
// END API ROUTES
//////////////////////////////////////

// Database connection test when starting the server
const testDbConnection = async () => {
    try {
        const connection = await createConnection();
        console.log('Database connection established successfully.');
        await connection.end();
        return true;
    } catch (error) {
        console.error('Database connection error:', error.message);
        return false;
    }
};

// Start the server
app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    await testDbConnection();
});

// Export the database connection helper
module.exports = {
    createConnection
};
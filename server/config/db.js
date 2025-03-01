const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Helper function to create a MySQL connection
 * @returns {Promise<mysql.Connection>} MySQL connection
 */
async function createConnection() {
    return await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sports_social_app',
    });
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection success status
 */
const testConnection = async () => {
    try {
        const connection = await createConnection();
        console.log('Database connection established successfully.');
        await connection.end();
        return true;
    } catch (error) {
        console.error('Error connecting to database:', error.message);
        return false;
    }
};

module.exports = {
    createConnection,
    testConnection
};
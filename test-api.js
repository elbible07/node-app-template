const axios = require('axios');

// Base URL for your API
const API_URL = 'http://localhost:3306';

// Test user information
const testUser = {
  username: 'testuser123',
  email: 'testuser123@example.com',
  password: 'Password123!',
  full_name: 'Test User'
};

let authToken;

// Test registration
async function testRegistration() {
  try {
    console.log('Testing user registration...');
    const response = await axios.post(`${API_URL}/api/auth/register`, testUser);
    console.log('Registration successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      
      // If user already exists, we can try to log in instead
      if (error.response.status === 409) {
        console.log('User already exists, trying login instead...');
        return await testLogin();
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    console.error('Error config:', error.config);
    throw error;
  }
}

// Test login
async function testLogin() {
  try {
    console.log('Testing user login...');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('Login successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
}

// Rest of the code remains the same
async function testGetUserInfo(token) {
  try {
    console.log('Testing get user info...');
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('User info retrieved successfully:', response.data);
  } catch (error) {
    console.error('Failed to get user info:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
}

async function runTests() {
  try {
    // Check if server is running first
    try {
      await axios.get(`${API_URL}`);
      console.log('Server is running!');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('ERROR: Server is not running. Please start your server with "node server.js" in another terminal.');
        return;
      }
      // If we got a response but with an error code, the server is still running
      console.log('Server is running (returned error response)');
    }
    
    // First register or login
    authToken = await testRegistration();
    
    // Then get user info using the token
    if (authToken) {
      await testGetUserInfo(authToken);
    } else {
      console.error('No auth token received, skipping user info test');
    }
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test suite failed:', error.message);
  }
}

runTests();
const { createConnection } = require('../config/db');

// Create a new event
exports.createEvent = async (req, res) => {
  const { event_name, sport_type, event_date, city, player_list } = req.body;
  const creator_id = req.user.userId; // From the authentication middleware
  
  // Validate input
  if (!event_name || !sport_type || !event_date || !city) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide event name, sport type, date, and city' 
    });
  }
  
  const connection = await createConnection();
  
  try {
    // Insert the new event
    const [result] = await connection.execute(
      'INSERT INTO events (creator_id, event_name, sport_type, event_date, city, player_list) VALUES (?, ?, ?, ?, ?, ?)',
      [creator_id, event_name, sport_type, event_date, city, player_list || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while creating the event' 
    });
  } finally {
    await connection.end();
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  const connection = await createConnection();
  
  try {
    // Join with users table to get creator's username
    const [events] = await connection.execute(`
      SELECT e.*, u.username as creator_name 
      FROM events e
      JOIN users u ON e.creator_id = u.user_id
      ORDER BY e.event_date ASC
    `);
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching events' 
    });
  } finally {
    await connection.end();
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  const { eventId } = req.params;
  
  const connection = await createConnection();
  
  try {
    const [events] = await connection.execute(`
      SELECT e.*, u.username as creator_name 
      FROM events e
      JOIN users u ON e.creator_id = u.user_id
      WHERE e.event_id = ?
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      event: events[0]
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching the event' 
    });
  } finally {
    await connection.end();
  }
};

// Get events created by the current user
exports.getMyEvents = async (req, res) => {
  const creator_id = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE creator_id = ? ORDER BY event_date ASC',
      [creator_id]
    );
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching your events' 
    });
  } finally {
    await connection.end();
  }
};

// Add this to your eventController.js file

// Join an event
exports.joinEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    // Check if the event exists
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE event_id = ?',
      [eventId]
    );
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is already participating
    const [participants] = await connection.execute(
      'SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    
    if (participants.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this event'
      });
    }
    
    // Add user to participants
    await connection.execute(
      'INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)',
      [eventId, userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'You have successfully joined the event'
    });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while joining the event'
    });
  } finally {
    await connection.end();
  }
};

// Get events the current user has joined
exports.getJoinedEvents = async (req, res) => {
  const userId = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    const [events] = await connection.execute(`
      SELECT e.*, u.username as creator_name,
      ep.joined_at as date_joined
      FROM events e
      JOIN users u ON e.creator_id = u.user_id
      JOIN event_participants ep ON e.event_id = ep.event_id
      WHERE ep.user_id = ?
      ORDER BY e.event_date ASC
    `, [userId]);
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching joined events:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching joined events'
    });
  } finally {
    await connection.end();
  }
};

// Check if user has joined a specific event
exports.checkEventJoined = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    const [participants] = await connection.execute(
      'SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    
    res.status(200).json({
      success: true,
      joined: participants.length > 0
    });
  } catch (error) {
    console.error('Error checking event participation:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking event participation'
    });
  } finally {
    await connection.end();
  }
};
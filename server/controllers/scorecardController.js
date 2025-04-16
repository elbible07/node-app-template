const { createConnection } = require('../config/db');

/**
 * Get user performance data
 */
exports.getUserPerformance = async (req, res) => {
  const userId = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    // Join with events and users tables to get related data
    const [performances] = await connection.execute(`
      SELECT p.*, e.event_name, e.sport_type as event_sport_type
      FROM user_performance p
      LEFT JOIN events e ON p.event_id = e.event_id
      WHERE p.user_id = ?
      ORDER BY p.performance_date DESC
    `, [userId]);
    
    // Process and format the performance data
    const formattedPerformances = performances.map(performance => {
      // Parse the JSON metrics
      let metrics;
      try {
        metrics = JSON.parse(performance.metrics);
      } catch (e) {
        metrics = {};
      }
      
      return {
        performance_id: performance.performance_id,
        user_id: performance.user_id,
        event_id: performance.event_id,
        event_name: performance.event_name,
        performance_date: performance.performance_date,
        sport_type: performance.sport_type,
        metrics: metrics,
        notes: performance.notes,
        created_at: performance.created_at
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedPerformances.length,
      performance: formattedPerformances
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching performance data' 
    });
  } finally {
    await connection.end();
  }
};

/**
 * Log a new performance entry
 */
exports.logPerformance = async (req, res) => {
  const userId = req.user.userId;
  const { performance_date, sport_type, event_id, metrics, notes } = req.body;
  
  // Validate input
  if (!performance_date || !sport_type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide performance date and sport type' 
    });
  }
  
  // Validate metrics is an object
  if (typeof metrics !== 'object' || metrics === null) {
    return res.status(400).json({ 
      success: false, 
      message: 'Metrics must be an object' 
    });
  }
  
  const connection = await createConnection();
  
  try {
    // Convert metrics to JSON string
    const metricsJson = JSON.stringify(metrics);
    
    // Insert the new performance entry
    const [result] = await connection.execute(
      'INSERT INTO user_performance (user_id, event_id, performance_date, sport_type, metrics, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, event_id || null, performance_date, sport_type, metricsJson, notes || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Performance logged successfully',
      performanceId: result.insertId
    });
  } catch (error) {
    console.error('Error logging performance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while logging performance' 
    });
  } finally {
    await connection.end();
  }
};

/**
 * Get performance data for a specific event
 */
exports.getEventPerformance = async (req, res) => {
  const { eventId } = req.params;
  
  const connection = await createConnection();
  
  try {
    // Join with users table to get user details
    const [performances] = await connection.execute(`
      SELECT p.*, u.username, u.full_name
      FROM user_performance p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.event_id = ?
      ORDER BY p.created_at DESC
    `, [eventId]);
    
    // Process and format the performance data
    const formattedPerformances = performances.map(performance => {
      // Parse the JSON metrics
      let metrics;
      try {
        metrics = JSON.parse(performance.metrics);
      } catch (e) {
        metrics = {};
      }
      
      return {
        performance_id: performance.performance_id,
        user_id: performance.user_id,
        username: performance.username,
        full_name: performance.full_name,
        performance_date: performance.performance_date,
        sport_type: performance.sport_type,
        metrics: metrics,
        notes: performance.notes,
        created_at: performance.created_at
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedPerformances.length,
      performance: formattedPerformances
    });
  } catch (error) {
    console.error('Error fetching event performance data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching event performance data' 
    });
  } finally {
    await connection.end();
  }
};

/**
 * Delete a performance entry
 */
exports.deletePerformance = async (req, res) => {
  const userId = req.user.userId;
  const { performanceId } = req.params;
  
  const connection = await createConnection();
  
  try {
    // Check if the performance entry exists and belongs to the user
    const [performances] = await connection.execute(
      'SELECT * FROM user_performance WHERE performance_id = ? AND user_id = ?',
      [performanceId, userId]
    );
    
    if (performances.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Performance entry not found or you do not have permission to delete it'
      });
    }
    
    // Delete the performance entry
    await connection.execute(
      'DELETE FROM user_performance WHERE performance_id = ?',
      [performanceId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Performance entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting performance entry:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while deleting the performance entry' 
    });
  } finally {
    await connection.end();
  }
};
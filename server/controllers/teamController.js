const { createConnection } = require('../config/db');

// Create a new team
exports.createTeam = async (req, res) => {
  const { team_name, sport_type, description, city } = req.body;
  const creator_id = req.user.userId; // From the authentication middleware
  
  // Validate input
  if (!team_name || !sport_type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide team name and sport type' 
    });
  }
  
  const connection = await createConnection();
  
  try {
    // Insert the new team
    const [result] = await connection.execute(
      'INSERT INTO teams (creator_id, team_name, sport_type, description, city) VALUES (?, ?, ?, ?, ?)',
      [creator_id, team_name, sport_type, description || null, city || null]
    );
    
    // Automatically add creator as a team admin
    await connection.execute(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, creator_id, 'admin']
    );
    
    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      teamId: result.insertId
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while creating the team' 
    });
  } finally {
    await connection.end();
  }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
  const connection = await createConnection();
  
  try {
    // Join with users table to get creator's username
    const [teams] = await connection.execute(`
      SELECT t.*, u.username as creator_name,
      (SELECT COUNT(*) FROM team_members WHERE team_id = t.team_id) as member_count
      FROM teams t
      JOIN users u ON t.creator_id = u.user_id
      ORDER BY t.created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      count: teams.length,
      teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching teams' 
    });
  } finally {
    await connection.end();
  }
};

// Get a single team by ID
exports.getTeamById = async (req, res) => {
  const { teamId } = req.params;
  
  const connection = await createConnection();
  
  try {
    const [teams] = await connection.execute(`
      SELECT t.*, u.username as creator_name,
      (SELECT COUNT(*) FROM team_members WHERE team_id = t.team_id) as member_count
      FROM teams t
      JOIN users u ON t.creator_id = u.user_id
      WHERE t.team_id = ?
    `, [teamId]);
    
    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    res.status(200).json({
      success: true,
      team: teams[0]
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching the team' 
    });
  } finally {
    await connection.end();
  }
};

// Get teams created by the current user
exports.getMyTeams = async (req, res) => {
  const userId = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    const [teams] = await connection.execute(`
      SELECT t.*, u.username as creator_name,
      (SELECT COUNT(*) FROM team_members WHERE team_id = t.team_id) as member_count,
      tm.role as user_role
      FROM teams t
      JOIN users u ON t.creator_id = u.user_id
      JOIN team_members tm ON t.team_id = tm.team_id
      WHERE tm.user_id = ?
      ORDER BY t.created_at DESC
    `, [userId]);
    
    res.status(200).json({
      success: true,
      count: teams.length,
      teams
    });
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching your teams' 
    });
  } finally {
    await connection.end();
  }
};

// Join a team
exports.joinTeam = async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    // Check if the team exists
    const [teams] = await connection.execute(
      'SELECT * FROM teams WHERE team_id = ?',
      [teamId]
    );
    
    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user is already a member
    const [members] = await connection.execute(
      'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );
    
    if (members.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }
    
    // Add user to team members
    await connection.execute(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [teamId, userId, 'member']
    );
    
    res.status(200).json({
      success: true,
      message: 'You have successfully joined the team'
    });
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while joining the team'
    });
  } finally {
    await connection.end();
  }
};

// Leave a team
exports.leaveTeam = async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    // Check if the team exists
    const [teams] = await connection.execute(
      'SELECT * FROM teams WHERE team_id = ?',
      [teamId]
    );
    
    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user is a member
    const [members] = await connection.execute(
      'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );
    
    if (members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }
    
    // Check if user is the creator (admin role)
    if (teams[0].creator_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot leave a team you created. You must delete the team instead.'
      });
    }
    
    // Remove user from team members
    await connection.execute(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'You have successfully left the team'
    });
  } catch (error) {
    console.error('Error leaving team:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while leaving the team'
    });
  } finally {
    await connection.end();
  }
};

// Get all members for a team
exports.getTeamMembers = async (req, res) => {
  const { teamId } = req.params;
  
  const connection = await createConnection();
  
  try {
    // Join with users table to get member details
    const [members] = await connection.execute(`
      SELECT u.user_id, u.username, u.full_name, u.city, tm.role, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.user_id
      WHERE tm.team_id = ?
      ORDER BY tm.role = 'admin' DESC, tm.joined_at ASC
    `, [teamId]);
    
    res.status(200).json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching team members'
    });
  } finally {
    await connection.end();
  }
};

// Check if user is a member of a specific team
exports.checkTeamMembership = async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.userId;
  
  const connection = await createConnection();
  
  try {
    const [members] = await connection.execute(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );
    
    res.status(200).json({
      success: true,
      isMember: members.length > 0,
      role: members.length > 0 ? members[0].role : null
    });
  } catch (error) {
    console.error('Error checking team membership:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking team membership'
    });
  } finally {
    await connection.end();
  }
};
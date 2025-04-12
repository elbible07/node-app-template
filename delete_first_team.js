const { createConnection } = require('./server/config/db');

async function deleteFirstTeam() {
  const connection = await createConnection();
  
  try {
    console.log('Connecting to database...');
    
    // First, delete from team_members table to handle foreign key constraints
    console.log('Deleting team members for team_id = 1...');
    const [memberResult] = await connection.execute('DELETE FROM team_members WHERE team_id = 1');
    console.log(`Deleted ${memberResult.affectedRows} team members`);
    
    // Then delete the team itself
    console.log('Deleting team with team_id = 1...');
    const [teamResult] = await connection.execute('DELETE FROM teams WHERE team_id = 1');
    
    if (teamResult.affectedRows > 0) {
      console.log('Team 1 successfully deleted!');
    } else {
      console.log('No team found with team_id = 1');
    }
  } catch (error) {
    console.error('Error deleting team:', error.message);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Run the function
deleteFirstTeam().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
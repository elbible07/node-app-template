const { createConnection } = require('./server/config/db');

async function deleteAllUserPerformanceData() {
  const connection = await createConnection();
  
  try {
    console.log('Connecting to database...');
    
    // Delete all records from user_performance table
    console.log('Deleting all records from user_performance table...');
    const [result] = await connection.execute('DELETE FROM user_performance');
    
    console.log(`Deleted ${result.affectedRows} performance records`);
    
  } catch (error) {
    console.error('Error deleting performance data:', error.message);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Run the function
deleteAllUserPerformanceData().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
const { createConnection } = require('./server/config/db.js');

async function exploreDatabase() {
  const connection = await createConnection();
  
  try {
    // Get all tables in the database
    console.log('Fetching all tables in the database...');
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      console.log('Tables in the database:');
      for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0]; // Extract table name
        console.log(`- ${tableName}`);
        
        // Get table structure
        const [columns] = await connection.query(`DESCRIBE ${tableName}`);
        console.log(`  Columns in ${tableName}:`);
        columns.forEach(col => {
          console.log(`    ${col.Field} (${col.Type}) ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
        });
        
        // Get row count
        const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const rowCount = countResult[0].count;
        console.log(`  Total rows: ${rowCount}`);
        
        // Show data sample (first 5 rows)
        if (rowCount > 0) {
          const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 5`);
          console.log(`  Data sample (up to 5 rows):`);
          console.log(JSON.stringify(rows, null, 2));
        }
        
        console.log('\n');
      }
    }
  } catch (error) {
    console.error('Error exploring database:', error.message);
  } finally {
    await connection.end();
  }
}

// Run the function
exploreDatabase().catch(console.error);
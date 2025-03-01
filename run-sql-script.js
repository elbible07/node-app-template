const fs = require('fs');
const path = require('path');
const { createConnection } = require('./server/config/db.js');

async function runSQLScript() {
  const connection = await createConnection();
  
  try {
    // Read SQL file
    const filePath = path.join(__dirname, 'database', 'users_table.sql');
    let sqlScript = fs.readFileSync(filePath, 'utf8');
    
    // Remove the CREATE DATABASE and USE statements
    sqlScript = sqlScript.replace(/CREATE DATABASE.*?;/s, '');
    sqlScript = sqlScript.replace(/USE.*?;/s, '');
    
    // Split script into individual commands
    const commands = sqlScript
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .filter(cmd => cmd.trim()); // Remove empty commands
    
    console.log(`Found ${commands.length} SQL commands to execute`);
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        console.log(`Executing command ${i+1}/${commands.length}:`);
        console.log(command.substring(0, 150) + (command.length > 150 ? '...' : ''));
        
        await connection.query(command);
        console.log('Command executed successfully');
      }
    }
    
    console.log('All SQL commands executed successfully');
  } catch (error) {
    console.error('Error executing SQL script:', error.message);
  } finally {
    await connection.end();
  }
}

// Run the function
runSQLScript().catch(console.error);
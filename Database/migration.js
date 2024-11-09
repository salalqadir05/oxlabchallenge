const fs = require('fs');
const path = require('path');
const pool = require('./db');  // Import the pool instance from db.js

const runMigrations = async () => {
    const migrationFolder = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationFolder); 
    migrationFiles.sort();

    // Start a client from the pool
    const client = await pool.connect();  // Get a client from the pool

    try {
        // Start a transaction
        await client.query('BEGIN');

        for (const file of migrationFiles) {
            if (file.endsWith('.sql')) { 
                const filePath = path.join(migrationFolder, file);
                const sqlQuery = fs.readFileSync(filePath, 'utf-8'); 

                console.log(`Running migration: ${file}`);
                try {
                    // Execute the query using the client
                    await client.query(sqlQuery);
                    console.log(`Migration ${file} completed successfully.`);
                } catch (err) {
                    console.error(`Error running migration ${file}:`, err.message);
                    // If there is an error, rollback the transaction and exit
                    await client.query('ROLLBACK');
                    return;
                }
            }
        }

        // Commit the transaction if all migrations succeed
        await client.query('COMMIT');
    } catch (err) {
        console.error('Error in migrations:', err.message);
    } finally {
        // Release the client back to the pool
        client.release();
    }
};

module.exports = runMigrations;

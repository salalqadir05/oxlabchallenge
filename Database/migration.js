const fs = require('fs');
const path = require('path');
const pool = require('./db'); 

const runMigrations = async () => {
    const migrationFolder = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationFolder); 
    migrationFiles.sort();

    const client = await pool.connect(); 

    try {
        await client.query('BEGIN');
        for (const file of migrationFiles) {
            if (file.endsWith('.sql')) { 
                const filePath = path.join(migrationFolder, file);
                const sqlQuery = fs.readFileSync(filePath, 'utf-8'); 

                console.log(`Running migration: ${file}`);
                try {
                    await client.query(sqlQuery);
                    console.log(`Migration ${file} completed successfully.`);
                } catch (err) {
                    console.error(`Error running migration ${file}:`, err.message);
                    await client.query('ROLLBACK');
                    return;
                }
            }
        }

        await client.query('COMMIT');
    } catch (err) {
        console.error('Error in migrations:', err.message);
    } finally {
        client.release();
    }
};

module.exports = runMigrations;

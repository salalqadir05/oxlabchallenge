const pg = require('pg');

require('dotenv').config();
    const config = {
        user: 'salal',
        host: 'localhost',
        database: 'oxlabchallenge',
        password: 'salal123',
        port: 5432
    }
const pool = new  pg.Pool(config);
module.exports = pool;
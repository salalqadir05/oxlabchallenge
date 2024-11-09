const express = require('express');
const dotenv = require('dotenv');
const pool = require('./Database/db');
const runMigrations = require('./Database/migration');
const customer = require('./Routes/customer');
const product = require('./Routes/product');
dotenv.config();


const app = express();
app.use(express.json());

// database connection
pool.connect().then(()=>{
    console.log('database Connected!');
}
).catch(err => {
    console.error(`Error connecting to database ${err}`);
  });
// running all migrations 

runMigrations();




// api callings


app.use('/api', customer);
app.use('/api', product);


const port = process.env.PORT || 7000;
app.listen(port, ()=>{
    console.log(`BACKEND LISTENING PORT IS ${port}`);
    
})
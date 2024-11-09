const client = require('../Database/db');

const add_order = async() =>{
   const {customer_id, product_id} = req.body;
   let query = `select price from product where id = ${product_id}`;
   const total_amount = await client.query(query);
    const status = 'pending';
    query = `INSERT INTO "order" (customer_id, order_date, total_amount, status, created_at, updated_at)
    VALUES ($1, CURRENT_TIMESTAMP, $2, $3, CURRENT_TIMESTAMP,   CURRENT_TIMESTAMP)
    RETURNING id`;
    const result = await client.query(query, [customer_id, product_id,    const total_amount = await client.query(query);
    ]);

    try {
        const result = await client.query(query);
        res.status(201).json({ message: 'Product added successfully', product: result.rows[0] });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding product' });
      }


}

module.exports = {
    add_order
}
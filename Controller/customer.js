const client = require('../Database/db');

const add_customer = async (req, res) => {
  const { first_name, last_name, email, phone_number, address } = req.body;
  const query = `INSERT INTO customer (first_name, last_name, email, phone_number, address)
                 VALUES ('${first_name}', '${last_name}', '${email}', '${phone_number}', '${address}')`;

  try {
    const result = await client.query(query);
    res.status(201).json({ message: 'Customer added successfully', customer: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding customer' });
  }
};
const get_all_customers = async (req, res) => {
  const query = 'SELECT * FROM customer';

  try {
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};


const delete_customer = async (req, res) => {
  const { id } = req.params; // Assuming the customer ID is passed as a URL parameter

  const query = 'DELETE FROM customer WHERE id = $1 RETURNING *';

  try {
    const result = await client.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer deleted successfully', customer: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};


const update_customer = async (req, res) => {
  const { id } = req.params; // Assuming the customer ID is passed as a URL parameter
  const { first_name, last_name, email, phone_number, address } = req.body;

  const query = `
    UPDATE customer
    SET first_name = $1, last_name = $2, email = $3, phone_number = $4, address = $5
    WHERE id = $6
    RETURNING *
  `;

  try {
    const result = await client.query(query, [first_name, last_name, email, phone_number, address, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer updated successfully', customer: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating customer' });
  }
};



module.exports = 
{ 
  add_customer,
  get_all_customers,
  delete_customer,
  update_customer
};

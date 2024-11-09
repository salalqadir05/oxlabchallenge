const client = require('../Database/db');

const add_product = async (req, res) => {
  const { name, description, price, quantity, product_count } = req.body;

  const query = `
    INSERT INTO product (name, description, price, stock_quantity)
    VALUES ('${name}', '${description}', ${price}, ${quantity})
    RETURNING *
  `;

  try {
    const result = await client.query(query);
    res.status(201).json({ message: 'Product added successfully', product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding product' });
  }
};

// Get all products
const get_all_products = async (req, res) => {
  const query = 'SELECT * FROM product';

  try {
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Delete a product
const delete_product = async (req, res) => {
  const { id } = req.params; // Assuming the product ID is passed as a URL parameter

  const query = 'DELETE FROM product WHERE id = $1 RETURNING *';

  try {
    const result = await client.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Update a product
const update_product = async (req, res) => {
  const { id } = req.params; // Assuming the product ID is passed as a URL parameter
  const { name, description, price, quantity, product_count } = req.body;

  const query = `
    UPDATE product
    SET name = $1, description = $2, price = $3, quantity = $4, product_count = $5
    WHERE id = $6
    RETURNING *
  `;

  try {
    const result = await client.query(query, [name, description, price, quantity, product_count, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

module.exports = { 
  add_product,
  get_all_products,
  delete_product,
  update_product
};

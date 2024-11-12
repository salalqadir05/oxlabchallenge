const pool = require('../Database/db');

const add_order = async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, total_amount, status, order_items } = req.body;
    
    if (!customer_id || !total_amount || !status || !order_items || order_items.length === 0) {
      return res.status(400).json({ error: 'Missing required order information' });
    }

    await client.query('BEGIN');
    for (const item of order_items) {
      const { product_id } = item;
      const productCheck = await client.query('SELECT 1 FROM product WHERE id = $1', [product_id]);
      if (productCheck.rowCount === 0) {
        throw new Error(`Product with ID ${product_id} does not exist`);
      }
    }

    const orderQuery = `
      INSERT INTO "order" (customer_id, total_amount, status, order_date)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING id;
    `;
    const orderResult = await client.query(orderQuery, [customer_id, total_amount, status]);
    const orderId = orderResult.rows[0].id;

    const orderItemQuery = `
      INSERT INTO order_item (order_id, product_id, quantity, price, total, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
    for (const item of order_items) {
      const { product_id, quantity, price } = item;
      const total = quantity * price;
      await client.query(orderItemQuery, [orderId, product_id, quantity, price, total]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order created successfully', orderId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'An error occurred while creating the order' });
  } finally {
    client.release();
  }
};

const get_recent_orders = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: 'Invalid limit' });
  }

  try {
    const recentOrdersQuery = `
      SELECT id, customer_id, total_amount, order_date
      FROM "order"
      ORDER BY order_date DESC
      LIMIT $1
    `;

    const result = await pool.query(recentOrdersQuery, [limit]);
    res.status(200).json({ recentOrders: result.rows });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Error fetching recent orders' });
  }
};

const get_frequent_products = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; 

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: 'Invalid limit' });
  }

  try {
    const frequentProductsQuery = `
      SELECT p.id, p.name, SUM(oi.quantity) AS total_quantity_ordered
      FROM product p
      JOIN order_item oi ON p.id = oi.product_id
      GROUP BY p.id, p.name
      ORDER BY total_quantity_ordered DESC
      LIMIT $1
    `;

    const result = await pool.query(frequentProductsQuery, [limit]);
    res.status(200).json({ frequentProducts: result.rows });
  } catch (error) {
    console.error('Error fetching frequent products:', error);
    res.status(500).json({ message: 'Error fetching frequent products' });
  }
};

const get_order_status = async (req, res) => {
  const { orderId } = req.params;

  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid or missing order ID' });
  }

  try {
    const orderStatusQuery = `
      SELECT status
      FROM "order"
      WHERE id = $1;
    `;

    const result = await pool.query(orderStatusQuery, [orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = result.rows[0];
    res.status(200).json({ orderId, status });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ message: 'Error fetching order status' });
  }
};

const edit_order = async (req, res) => {
    const client = await pool.connect();
    try {
      const { order_id } = req.params; 
      const { total_amount, status, order_items } = req.body;
      
      if (!total_amount || !status || !order_items || order_items.length === 0) {
        return res.status(400).json({ error: 'Missing required order information' });
      }
  
      const orderCheck = await client.query('SELECT 1 FROM "order" WHERE id = $1', [order_id]);
      if (orderCheck.rowCount === 0) {
        return res.status(404).json({ error: `Order with ID ${order_id} does not exist` });
      }
  
      await client.query('BEGIN');
  
      const updateOrderQuery = `
        UPDATE "order"
        SET total_amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id;
      `;
      const updateOrderResult = await client.query(updateOrderQuery, [total_amount, status, order_id]);
      const updatedOrderId = updateOrderResult.rows[0].id;
  
      await client.query('DELETE FROM order_item WHERE order_id = $1', [order_id]);
      const orderItemQuery = `
        INSERT INTO order_item (order_id, product_id, quantity, price, total, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `;
      for (const item of order_items) {
        const { product_id, quantity, price } = item;
        const total = quantity * price;
        await client.query(orderItemQuery, [order_id, product_id, quantity, price, total]);
      }
  
      await client.query('COMMIT');
      res.status(200).json({ message: 'Order updated successfully', orderId: updatedOrderId });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating order:', error);
      res.status(500).json({ error: error.message || 'An error occurred while updating the order' });
    } finally {
      client.release();
    }
  };
  const delete_order = async (req, res) => {
    const client = await pool.connect();
    try {
      const { order_id } = req.params; // Get the order ID from params
  
      // Check if the order exists
      const orderCheck = await client.query('SELECT 1 FROM "order" WHERE id = $1', [order_id]);
      if (orderCheck.rowCount === 0) {
        return res.status(404).json({ error: `Order with ID ${order_id} does not exist` });
      }
  
      await client.query('BEGIN');
  
      // Delete related order items
      await client.query('DELETE FROM order_item WHERE order_id = $1', [order_id]);
  
      // Delete the order
      const deleteOrderQuery = `
        DELETE FROM "order" WHERE id = $1 RETURNING id;
      `;
      const deleteOrderResult = await client.query(deleteOrderQuery, [order_id]);
  
      if (deleteOrderResult.rowCount === 0) {
        return res.status(404).json({ error: `Failed to delete order with ID ${order_id}` });
      }
  
      await client.query('COMMIT');
      res.status(200).json({ message: 'Order deleted successfully', orderId: deleteOrderResult.rows[0].id });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting order:', error);
      res.status(500).json({ error: error.message || 'An error occurred while deleting the order' });
    } finally {
      client.release();
    }
  };
  


module.exports = { add_order, get_recent_orders, get_frequent_products, get_order_status , edit_order, delete_order};

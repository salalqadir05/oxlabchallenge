const router = require('express').Router();
const { add_order, get_recent_orders, get_frequent_products, get_order_status, delete_order, edit_order } = require('../Controller/order');
const { authenticateJWT, checkPermissions } = require('../Middleware/authmiddleware');

router.post('/addorder', authenticateJWT, checkPermissions(['create_orders']), add_order);
router.get('/recentorder', authenticateJWT, checkPermissions(['view_orders']), get_recent_orders);
router.get('/frequentproduct', authenticateJWT, checkPermissions(['view_orders']), get_frequent_products);
router.get('/orders/:orderId/status', authenticateJWT, checkPermissions(['view_orders']), get_order_status);
router.put('/order/:order_id', authenticateJWT, checkPermissions(['edit_orders']), edit_order);
router.delete('/order/:order_id', authenticateJWT, checkPermissions(['delete_orders']), delete_order);


module.exports = router;

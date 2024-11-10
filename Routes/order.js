const router = require('express').Router();
const { add_order } = require('../Controller/order');


router.post('/addorder', add_order);

module.exports = router;

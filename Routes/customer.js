const router = require('express').Router();
const {add_customer, get_all_customers , delete_customer , update_customer} = require('../Controller/customer');


router.post('/addcustomer', add_customer);
router.get('/customers', get_all_customers);
router.delete('/customers/:id', delete_customer);
router.put('/customers/:id',update_customer);




module.exports = router;
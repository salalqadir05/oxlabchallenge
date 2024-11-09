const router = require('express').Router();
const {  add_product, get_all_products , delete_product ,   update_product
} = require('../Controller/product');


router.post('/addproduct', add_product);
router.get('/products', get_all_products);
router.delete('/products/:id', delete_product);
router.put('/products/:id',update_product);




module.exports = router;
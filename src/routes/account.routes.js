const express = require('express');
const authmiddleware = require('../middleware/auth.middleware');
const accountController = require('../controller/account.controller');



const router = express.Router();




/**
 * POST /API/accounts
 * create a new account
 * access: private
 */
router.post('/', authmiddleware.authMiddleware,accountController.createAccountController)




module.exports = router;
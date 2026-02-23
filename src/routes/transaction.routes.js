const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controller/transaction.controller');

const transactionRoutes = Router();

/**
 * - POST /api/transactions: Create a new transaction
 * - 
 */

transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);

/**
 * - POST /api/transactions/System/Initial fund
 * - Cerate initial fund transaction for system user
 */

transactionRoutes.post('/System/Initial-fund', authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundTransaction);

module.exports = transactionRoutes;
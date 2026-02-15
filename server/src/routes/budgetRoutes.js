const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  getTransactionsByCategory,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgetSummary,
  // New month-based functions
  getMonthTransactions,
  createTemplate,
  createMonthTransaction,
  deleteMonthTransaction,
  deleteTemplateFromMonth
} = require('../controllers/budgetController');

// ============================================
// NEW MONTH-BASED ROUTES
// ============================================

// Month transactions
router.get('/month/:monthKey', getMonthTransactions);
router.post('/month/:monthKey/transaction', createMonthTransaction);
router.delete('/month/:monthKey/transaction/:transactionId', deleteMonthTransaction);

// Template routes
router.post('/template', createTemplate);
router.delete('/template/:templateId/from/:monthKey', deleteTemplateFromMonth);

// ============================================
// LEGACY ROUTES (backward compatibility)
// ============================================

router.get('/', getAllTransactions);
router.get('/summary', getBudgetSummary);
router.get('/category/:category', getTransactionsByCategory);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;

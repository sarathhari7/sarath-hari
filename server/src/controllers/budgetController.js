const admin = require('firebase-admin');
const { initializeFirebase } = require('../config/firebase');
const { VALID_CATEGORIES } = require('../constants/budgetConstants');
const {
  getCurrentMonthKey,
  getNextMonthKey
} = require('../models/budgetModel');
const { PRIORITY, REPEAT_TYPE, SOURCE_TYPE } = require('../constants/common');
const {
  createNotificationData,
  deleteNotificationDataBySource
} = require('./notificationDataController');
const {
  createEventData,
  deleteEventDataBySource
} = require('./eventDataController');
const { calculateActualDueDate } = require('../utils/dateUtils');

// Get Firestore instance
const db = initializeFirebase();
const budgetCollection = db.collection('budgetTransactions');

// Get all budget transactions
const getAllTransactions = async (req, res) => {
  try {
    const snapshot = await budgetCollection.orderBy('dueDate', 'asc').get();
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Database Error [getAllTransactions]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get single transaction
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await budgetCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
        errorType: 'NOT_FOUND',
        details: `No transaction found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Database Error [getTransactionById]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get transactions by category
const getTransactionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        errorType: 'VALIDATION_ERROR',
        details: `Category must be one of: ${VALID_CATEGORIES.join(', ')}. Received: ${category}`,
        timestamp: new Date().toISOString()
      });
    }

    const snapshot = await budgetCollection
      .where('category', '==', category)
      .orderBy('dueDate', 'asc')
      .get();

    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Database Error [getTransactionsByCategory]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions by category',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Create new budget transaction
const createTransaction = async (req, res) => {
  try {
    const {
      source,
      category,
      purpose,
      target,
      currentAmount,
      stepupDate,
      stepupAmount,
      dueDate,
      expectedAmount,
      amount
    } = req.body;

    // Validation
    if (!source || !category || !purpose || !dueDate || amount === undefined) {
      const missingFields = [];
      if (!source) missingFields.push('source');
      if (!category) missingFields.push('category');
      if (!purpose) missingFields.push('purpose');
      if (!dueDate) missingFields.push('dueDate');
      if (amount === undefined) missingFields.push('amount');

      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        errorType: 'VALIDATION_ERROR',
        details: `Required fields: ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        errorType: 'VALIDATION_ERROR',
        details: `Category must be one of: ${VALID_CATEGORIES.join(', ')}. Received: ${category}`,
        timestamp: new Date().toISOString()
      });
    }

    const newTransaction = {
      source,
      category,
      purpose,
      dueDate,
      amount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add optional fields if provided
    if (target !== undefined) newTransaction.target = target;
    if (currentAmount !== undefined) newTransaction.currentAmount = currentAmount;
    if (stepupDate) newTransaction.stepupDate = stepupDate;
    if (stepupAmount !== undefined) newTransaction.stepupAmount = stepupAmount;
    if (expectedAmount !== undefined) newTransaction.expectedAmount = expectedAmount;

    const docRef = await budgetCollection.add(newTransaction);
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newTransaction }
    });
  } catch (error) {
    console.error('Database Error [createTransaction]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Update budget transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      source,
      category,
      purpose,
      target,
      currentAmount,
      stepupDate,
      stepupAmount,
      dueDate,
      expectedAmount,
      amount
    } = req.body;

    const docRef = budgetCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
        errorType: 'NOT_FOUND',
        details: `No transaction found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    // Update fields if provided
    if (source !== undefined) updateData.source = source;
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category',
          errorType: 'VALIDATION_ERROR',
          details: `Category must be one of: ${VALID_CATEGORIES.join(', ')}. Received: ${category}`,
          timestamp: new Date().toISOString()
        });
      }
      updateData.category = category;
    }
    if (purpose !== undefined) updateData.purpose = purpose;
    if (target !== undefined) updateData.target = target;
    if (currentAmount !== undefined) updateData.currentAmount = currentAmount;
    if (stepupDate !== undefined) updateData.stepupDate = stepupDate;
    if (stepupAmount !== undefined) updateData.stepupAmount = stepupAmount;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (expectedAmount !== undefined) updateData.expectedAmount = expectedAmount;
    if (amount !== undefined) updateData.amount = amount;

    await docRef.update(updateData);
    const updatedDoc = await docRef.get();

    res.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('Database Error [updateTransaction]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Delete budget transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = budgetCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
        errorType: 'NOT_FOUND',
        details: `No transaction found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Database Error [deleteTransaction]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get budget summary (totals by category)
const getBudgetSummary = async (req, res) => {
  try {
    const snapshot = await budgetCollection.get();

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.category === 'Income') {
        totalIncome += data.amount || 0;
      } else if (data.category === 'Expense') {
        totalExpense += data.amount || 0;
      } else if (data.category === 'Savings') {
        totalSavings += data.amount || 0;
      }
    });

    const balance = totalIncome - totalExpense - totalSavings;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        totalSavings,
        balance
      }
    });
  } catch (error) {
    console.error('Database Error [getBudgetSummary]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget summary',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// ============================================
// NEW MONTH-BASED FUNCTIONS
// ============================================

/**
 * Initialize month from templates if doesn't exist
 */
const initializeMonthIfNeeded = async (userId, monthKey) => {
  const monthDocRef = db.collection('budgetData')
    .doc(userId)
    .collection('monthlyBudgets')
    .doc(monthKey);

  const monthDoc = await monthDocRef.get();

  if (!monthDoc.exists) {
    const templatesSnapshot = await db.collection('budgetData')
      .doc(userId)
      .collection('templates')
      .get();

    const transactions = [];
    templatesSnapshot.forEach(doc => {
      const template = doc.data();
      transactions.push({
        id: `${doc.id}-${monthKey}`,
        templateId: doc.id,
        source: template.source,
        category: template.category,
        purpose: template.purpose,
        dueDate: template.dueDate,
        amount: template.amount,
        expectedAmount: template.expectedAmount || 0,
        target: template.target || null,
        currentAmount: template.currentAmount || null,
        stepupDate: template.stepupDate || null,
        stepupAmount: template.stepupAmount || null,
        isCustomized: false,
        updatedAt: new Date()
      });
    });

    await monthDocRef.set({
      transactions,
      createdAt: new Date()
    });
  }
};

/**
 * GET /api/budget/month/:monthKey
 * Get all transactions for a specific month
 */
const getMonthTransactions = async (req, res) => {
  try {
    const { monthKey } = req.params;
    const userId = 'default-user';

    // Initialize month if needed
    await initializeMonthIfNeeded(userId, monthKey);

    const monthDoc = await db.collection('budgetData')
      .doc(userId)
      .collection('monthlyBudgets')
      .doc(monthKey)
      .get();

    if (!monthDoc.exists) {
      return res.json({ success: true, data: [] });
    }

    const data = monthDoc.data();
    res.json({ success: true, data: data.transactions || [] });
  } catch (error) {
    console.error('Database Error [getMonthTransactions]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch month transactions',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /api/budget/template
 * Create new template (recurring transaction)
 */
const createTemplate = async (req, res) => {
  try {
    const userId = 'default-user';
    const templateData = req.body;

    // Validation
    if (!templateData.source || !templateData.category || !templateData.purpose ||
        !templateData.dueDate || templateData.amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        errorType: 'VALIDATION_ERROR',
        details: 'Required fields: source, category, purpose, dueDate, amount',
        timestamp: new Date().toISOString()
      });
    }

    if (!VALID_CATEGORIES.includes(templateData.category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        errorType: 'VALIDATION_ERROR',
        details: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Create template
    const templateRef = db.collection('budgetData')
      .doc(userId)
      .collection('templates')
      .doc();

    const templateDoc = {
      source: templateData.source,
      category: templateData.category,
      purpose: templateData.purpose,
      dueDate: String(templateData.dueDate),
      dateType: templateData.dateType || 'fixed', // 'fixed' or 'dynamic'
      dynamicDateRule: templateData.dynamicDateRule || 'next', // 'next' or 'previous' (only applicable if dateType is 'dynamic')
      amount: templateData.amount,
      expectedAmount: templateData.expectedAmount || 0,
      target: templateData.target || null,
      currentAmount: templateData.currentAmount || null,
      stepupDate: templateData.stepupDate || null,
      stepupAmount: templateData.stepupAmount || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await templateRef.set(templateDoc);

    const template = { id: templateRef.id, ...templateDoc };

    // Apply to current and future months (next 12 months)
    const currentMonth = getCurrentMonthKey();
    let monthKey = currentMonth;
    const monthsToInitialize = [];

    for (let i = 0; i < 13; i++) {
      monthsToInitialize.push(monthKey);
      monthKey = getNextMonthKey(monthKey);
    }

    // Add to each month
    for (const month of monthsToInitialize) {
      const monthRef = db.collection('budgetData')
        .doc(userId)
        .collection('monthlyBudgets')
        .doc(month);

      const monthDoc = await monthRef.get();
      const existingTransactions = monthDoc.exists ? monthDoc.data().transactions || [] : [];

      existingTransactions.push({
        id: `${templateRef.id}-${month}`,
        templateId: templateRef.id,
        source: templateDoc.source,
        category: templateDoc.category,
        purpose: templateDoc.purpose,
        dueDate: templateDoc.dueDate,
        dateType: templateDoc.dateType,
        dynamicDateRule: templateDoc.dynamicDateRule,
        amount: templateDoc.amount,
        expectedAmount: templateDoc.expectedAmount,
        target: templateDoc.target,
        currentAmount: templateDoc.currentAmount,
        stepupDate: templateDoc.stepupDate,
        stepupAmount: templateDoc.stepupAmount,
        isCustomized: false,
        updatedAt: new Date()
      });

      await monthRef.set({ transactions: existingTransactions });

      // Create notification and event for this month
      try {
        const [year, monthNum] = month.split('-').map(Number);
        const day = parseInt(templateDoc.dueDate);

        // Calculate actual due date based on date type and rule
        const actualDueDate = calculateActualDueDate(
          day,
          year,
          monthNum,
          templateDoc.dateType,
          templateDoc.dynamicDateRule
        );

        // Determine priority based on category
        let priority = PRIORITY.MEDIUM;
        if (templateDoc.category === 'income') {
          priority = PRIORITY.HIGH;
        } else if (templateDoc.category === 'expense' && templateDoc.amount > 1000) {
          priority = PRIORITY.HIGH;
        } else if (templateDoc.category === 'savings' || templateDoc.category === 'investment') {
          priority = PRIORITY.LOW;
        }

        // Create notification
        await createNotificationData({
          title: templateDoc.source,
          dueDate: actualDueDate,
          priority: priority,
          repeatType: REPEAT_TYPE.MONTHLY,
          sourceType: SOURCE_TYPE.BUDGET,
          sourceId: templateRef.id,
          userId: userId,
          monthKey: month
        });

        // Create event
        await createEventData({
          title: `${templateDoc.source} - ${templateDoc.purpose}`,
          date: actualDueDate,
          repeatType: REPEAT_TYPE.MONTHLY,
          priority: priority,
          sourceType: SOURCE_TYPE.BUDGET,
          sourceId: templateRef.id,
          userId: userId,
          monthKey: month,
          description: `Category: ${templateDoc.category}, Amount: ${templateDoc.amount}`
        });
      } catch (notifError) {
        console.error(`Failed to create notification/event for month ${month}:`, notifError);
        // Don't fail the whole operation if notification/event creation fails
      }
    }

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error('Database Error [createTemplate]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /api/budget/month/:monthKey/transaction
 * Create transaction for specific month only (non-recurring)
 */
const createMonthTransaction = async (req, res) => {
  try {
    const { monthKey } = req.params;
    const userId = 'default-user';
    const transactionData = req.body;

    // Validation
    if (!transactionData.source || !transactionData.category || !transactionData.purpose ||
        !transactionData.dueDate || transactionData.amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        errorType: 'VALIDATION_ERROR',
        details: 'Required fields: source, category, purpose, dueDate, amount',
        timestamp: new Date().toISOString()
      });
    }

    if (!VALID_CATEGORIES.includes(transactionData.category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        errorType: 'VALIDATION_ERROR',
        details: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const monthRef = db.collection('budgetData')
      .doc(userId)
      .collection('monthlyBudgets')
      .doc(monthKey);

    const monthDoc = await monthRef.get();
    const existingTransactions = monthDoc.exists ? monthDoc.data().transactions || [] : [];

    const newTransaction = {
      id: `custom-${Date.now()}`,
      templateId: null,
      source: transactionData.source,
      category: transactionData.category,
      purpose: transactionData.purpose,
      dueDate: String(transactionData.dueDate),
      dateType: transactionData.dateType || 'fixed',
      dynamicDateRule: transactionData.dynamicDateRule || 'next',
      amount: transactionData.amount,
      expectedAmount: transactionData.expectedAmount || 0,
      target: transactionData.target || null,
      currentAmount: transactionData.currentAmount || null,
      stepupDate: transactionData.stepupDate || null,
      stepupAmount: transactionData.stepupAmount || null,
      isCustomized: true,
      updatedAt: new Date()
    };

    existingTransactions.push(newTransaction);
    await monthRef.set({ transactions: existingTransactions });

    // Create notification and event for this month-only transaction
    try {
      const [year, monthNum] = monthKey.split('-').map(Number);
      const day = parseInt(transactionData.dueDate);

      // Calculate actual due date based on date type and rule
      const actualDueDate = calculateActualDueDate(
        day,
        year,
        monthNum,
        transactionData.dateType || 'fixed',
        transactionData.dynamicDateRule || 'next'
      );

      // Determine priority based on category
      let priority = PRIORITY.MEDIUM;
      if (transactionData.category === 'income') {
        priority = PRIORITY.HIGH;
      } else if (transactionData.category === 'expense' && transactionData.amount > 1000) {
        priority = PRIORITY.HIGH;
      } else if (transactionData.category === 'savings' || transactionData.category === 'investment') {
        priority = PRIORITY.LOW;
      }

      // Create notification (one-time, not recurring)
      await createNotificationData({
        title: transactionData.source,
        dueDate: actualDueDate,
        priority: priority,
        repeatType: REPEAT_TYPE.NONE,
        sourceType: SOURCE_TYPE.BUDGET,
        sourceId: newTransaction.id,
        userId: userId,
        monthKey: monthKey
      });

      // Create event (one-time, not recurring)
      await createEventData({
        title: `${transactionData.source} - ${transactionData.purpose}`,
        date: actualDueDate,
        repeatType: REPEAT_TYPE.NONE,
        priority: priority,
        sourceType: SOURCE_TYPE.BUDGET,
        sourceId: newTransaction.id,
        userId: userId,
        monthKey: monthKey,
        description: `Category: ${transactionData.category}, Amount: ${transactionData.amount}`
      });
    } catch (notifError) {
      console.error('Failed to create notification/event:', notifError);
      // Don't fail the whole operation if notification/event creation fails
    }

    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    console.error('Database Error [createMonthTransaction]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create month transaction',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * DELETE /api/budget/month/:monthKey/transaction/:transactionId
 * Delete transaction from specific month only
 */
const deleteMonthTransaction = async (req, res) => {
  try {
    const { monthKey, transactionId } = req.params;
    const userId = 'default-user';

    const monthRef = db.collection('budgetData')
      .doc(userId)
      .collection('monthlyBudgets')
      .doc(monthKey);

    const monthDoc = await monthRef.get();
    if (!monthDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Month not found',
        errorType: 'NOT_FOUND',
        details: `No budget data found for month: ${monthKey}`,
        timestamp: new Date().toISOString()
      });
    }

    const transactions = monthDoc.data().transactions || [];
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);

    if (transactions.length === updatedTransactions.length) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
        errorType: 'NOT_FOUND',
        details: `No transaction found with ID: ${transactionId}`,
        timestamp: new Date().toISOString()
      });
    }

    await monthRef.update({ transactions: updatedTransactions });

    // Delete associated notification and event for this specific month
    if (transactionToDelete && transactionToDelete.templateId) {
      try {
        await deleteNotificationDataBySource(SOURCE_TYPE.BUDGET, transactionToDelete.templateId, monthKey);
        await deleteEventDataBySource(SOURCE_TYPE.BUDGET, transactionToDelete.templateId, monthKey);
      } catch (deleteError) {
        console.error('Failed to delete associated notifications/events:', deleteError);
        // Don't fail the whole operation
      }
    }

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Database Error [deleteMonthTransaction]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete month transaction',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * DELETE /api/budget/template/:templateId/from/:monthKey
 * Delete template and all instances from specified month onwards
 */
const deleteTemplateFromMonth = async (req, res) => {
  try {
    const { templateId, monthKey } = req.params;
    const userId = 'default-user';

    // Check if template exists and delete it if found
    const templateRef = db.collection('budgetData')
      .doc(userId)
      .collection('templates')
      .doc(templateId);

    const templateDoc = await templateRef.get();
    let templateDeleted = false;

    if (templateDoc.exists) {
      await templateRef.delete();
      templateDeleted = true;
    } else {
      console.warn(`Template ${templateId} not found, but will clean up orphaned instances`);
    }

    // Delete transaction instances from all months >= monthKey
    // This works even if the template doesn't exist (handles orphaned data)
    const monthsSnapshot = await db.collection('budgetData')
      .doc(userId)
      .collection('monthlyBudgets')
      .where(admin.firestore.FieldPath.documentId(), '>=', monthKey)
      .get();

    const batch = db.batch();
    let instancesRemoved = 0;

    monthsSnapshot.forEach(doc => {
      const transactions = doc.data().transactions || [];
      const filtered = transactions.filter(t => t.templateId !== templateId);
      if (filtered.length < transactions.length) {
        instancesRemoved += transactions.length - filtered.length;
        batch.update(doc.ref, { transactions: filtered });
      }
    });

    await batch.commit();

    // Delete associated notifications and events from all months
    try {
      await deleteNotificationDataBySource(SOURCE_TYPE.BUDGET, templateId, null); // null means delete all
      await deleteEventDataBySource(SOURCE_TYPE.BUDGET, templateId, null);
    } catch (deleteError) {
      console.error('Failed to delete associated notifications/events:', deleteError);
      // Don't fail the whole operation
    }

    const message = templateDeleted
      ? `Template and ${instancesRemoved} future instances deleted successfully`
      : `${instancesRemoved} orphaned transaction instances removed successfully (template was already deleted)`;

    res.json({ success: true, message });
  } catch (error) {
    console.error('Database Error [deleteTemplateFromMonth]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete template from month onwards',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  // Legacy endpoints (keep for backward compatibility)
  getAllTransactions,
  getTransactionById,
  getTransactionsByCategory,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgetSummary,
  // New month-based endpoints
  getMonthTransactions,
  createTemplate,
  createMonthTransaction,
  deleteMonthTransaction,
  deleteTemplateFromMonth
};

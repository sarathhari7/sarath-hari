/**
 * Migration script for budget data
 * Migrates from flat budgetTransactions collection to month-based structure
 *
 * Run with: node server/src/scripts/migrateBudgetData.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const admin = require('firebase-admin');
const { getCurrentMonthKey } = require('../models/budgetModel');

// Initialize Firebase Admin
const initializeFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('Firebase Admin initialized for migration');
  }
  return admin.firestore();
};

async function migrateBudgetData() {
  try {
    console.log('========================================');
    console.log('Starting Budget Data Migration');
    console.log('========================================\n');

    const db = initializeFirebaseAdmin();
    const currentMonth = getCurrentMonthKey();

    console.log('Current month:', currentMonth);
    console.log('Timestamp:', new Date().toISOString());
    console.log('\n');

    // Read all existing transactions
    console.log('Step 1: Reading existing transactions...');
    const transactionsRef = db.collection('budgetTransactions');
    const snapshot = await transactionsRef.get();

    if (snapshot.empty) {
      console.log('✓ No transactions to migrate');
      console.log('\n========================================');
      console.log('Migration completed (nothing to migrate)');
      console.log('========================================');
      return;
    }

    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✓ Found ${transactions.length} transactions to migrate`);
    console.log('\n');

    // Create new structure
    console.log('Step 2: Creating new data structure...');
    const budgetDataRef = db.collection('budgetData').doc('default-user');

    // Use batched writes for better performance and atomicity
    const batch = db.batch();
    let operationCount = 0;

    // Create templates
    console.log('  - Creating templates...');
    transactions.forEach(transaction => {
      const templateId = transaction.id;
      const templateRef = budgetDataRef.collection('templates').doc(templateId);

      batch.set(templateRef, {
        source: transaction.source,
        category: transaction.category,
        purpose: transaction.purpose,
        dueDate: String(transaction.dueDate),
        amount: transaction.amount,
        expectedAmount: transaction.expectedAmount || 0,
        target: transaction.target || null,
        currentAmount: transaction.currentAmount || null,
        stepupDate: transaction.stepupDate || null,
        stepupAmount: transaction.stepupAmount || null,
        createdAt: transaction.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      operationCount++;
    });

    console.log(`✓ Prepared ${transactions.length} templates`);

    // Create current month document with all transaction instances
    console.log('  - Creating current month budget document...');
    const monthlyBudgetRef = budgetDataRef.collection('monthlyBudgets').doc(currentMonth);
    const monthTransactions = transactions.map(t => ({
      id: t.id + '-instance',
      templateId: t.id,
      source: t.source,
      category: t.category,
      purpose: t.purpose,
      dueDate: String(t.dueDate),
      amount: t.amount,
      expectedAmount: t.expectedAmount || 0,
      target: t.target || null,
      currentAmount: t.currentAmount || null,
      stepupDate: t.stepupDate || null,
      stepupAmount: t.stepupAmount || null,
      isCustomized: false,
      updatedAt: new Date()
    }));

    batch.set(monthlyBudgetRef, {
      transactions: monthTransactions,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    operationCount++;

    console.log(`✓ Prepared month document with ${monthTransactions.length} transaction instances`);
    console.log('\n');

    // Commit the batch
    console.log('Step 3: Writing to Firestore...');
    await batch.commit();
    console.log(`✓ Successfully wrote ${operationCount} documents to Firestore`);
    console.log('\n');

    // Summary
    console.log('========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Templates created: ${transactions.length}`);
    console.log(`Month documents created: 1 (${currentMonth})`);
    console.log(`Transaction instances: ${monthTransactions.length}`);
    console.log('\nNew structure:');
    console.log(`  budgetData/default-user/templates/ (${transactions.length} documents)`);
    console.log(`  budgetData/default-user/monthlyBudgets/${currentMonth} (1 document)`);
    console.log('\n** IMPORTANT **');
    console.log('Old collection "budgetTransactions" has been preserved for rollback.');
    console.log('You can safely delete it after verifying the migration.');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('Migration Failed');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
    throw error;
  } finally {
    // Close Firebase connection
    if (admin.apps.length > 0) {
      await admin.app().delete();
      console.log('Firebase connection closed');
    }
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateBudgetData()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateBudgetData };

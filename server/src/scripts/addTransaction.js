require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { initializeFirebase } = require('../config/firebase');

// Add your custom transaction data here
const newTransactions = [
  {
    source: 'Bonus',
    category: 'Income',
    purpose: 'Annual performance bonus',
    dueDate: '15',
    expectedAmount: 50000,
    amount: 50000
  },
  {
    source: 'Investment Returns',
    category: 'Income',
    purpose: 'Dividend income',
    dueDate: '20',
    expectedAmount: 15000,
    amount: 18000
  },
  {
    source: 'Insurance Premium',
    category: 'Expense',
    purpose: 'Life insurance',
    dueDate: '12',
    expectedAmount: 5000,
    amount: 5000
  },
  // Add more transactions here...
];

const addTransactions = async () => {
  try {
    console.log('🚀 Starting to add transactions...\n');

    const db = initializeFirebase();
    const budgetCollection = db.collection('budgetTransactions');

    const now = new Date().toISOString();
    let successCount = 0;
    let failCount = 0;

    for (const transaction of newTransactions) {
      try {
        const transactionWithTimestamps = {
          ...transaction,
          createdAt: now,
          updatedAt: now
        };

        await budgetCollection.add(transactionWithTimestamps);
        console.log(`✅ Added: ${transaction.source} (${transaction.category})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add: ${transaction.source}`, error.message);
        failCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total: ${newTransactions.length}`);
    console.log('\n✨ Done!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
addTransactions();

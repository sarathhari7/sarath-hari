require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { initializeFirebase } = require('../config/firebase');

// Sample budget data matching the frontend
const sampleBudgetData = [
  {
    source: 'Monthly Salary',
    category: 'Income',
    purpose: 'Primary income source',
    dueDate: '01',
    expectedAmount: 75000,
    amount: 75000
  },
  {
    source: 'Freelance Work',
    category: 'Income',
    purpose: 'Side projects and consulting',
    dueDate: '05',
    expectedAmount: 20000,
    amount: 25000
  },
  {
    source: 'House Rent',
    category: 'Expense',
    purpose: 'Monthly rent payment',
    dueDate: '05',
    expectedAmount: 18000,
    amount: 18000
  },
  {
    source: 'Groceries & Food',
    category: 'Expense',
    purpose: 'Monthly food expenses',
    dueDate: '15',
    expectedAmount: 7000,
    amount: 8000
  },
  {
    source: 'Utilities',
    category: 'Expense',
    purpose: 'Electricity, water, internet',
    dueDate: '10',
    expectedAmount: 3500,
    amount: 3500
  },
  {
    source: 'Car Loan EMI',
    category: 'Expense',
    purpose: 'Auto loan payment',
    dueDate: '07',
    expectedAmount: 12000,
    amount: 12000
  },
  {
    source: 'SIP - Equity Fund',
    category: 'Savings',
    purpose: 'Long-term wealth creation',
    target: 500000,
    currentAmount: 85000,
    stepupDate: 'March',
    stepupAmount: 500,
    dueDate: '10',
    expectedAmount: 5000,
    amount: 5000
  },
  {
    source: 'SIP - Debt Fund',
    category: 'Savings',
    purpose: 'Stable returns investment',
    target: 300000,
    currentAmount: 45000,
    stepupDate: 'June',
    stepupAmount: 300,
    dueDate: '15',
    expectedAmount: 3000,
    amount: 3000
  },
  {
    source: 'PPF',
    category: 'Savings',
    purpose: 'Retirement planning',
    target: 1500000,
    currentAmount: 280000,
    dueDate: '20',
    expectedAmount: 12500,
    amount: 12500
  },
  {
    source: 'Emergency Fund',
    category: 'Savings',
    purpose: 'Contingency savings',
    target: 300000,
    currentAmount: 125000,
    dueDate: '25',
    expectedAmount: 10000,
    amount: 10000
  }
];

const seedBudget = async () => {
  try {
    console.log('Starting budget data seeding...');

    const db = initializeFirebase();
    const budgetCollection = db.collection('budgetTransactions');

    // Check if collection already has data
    const snapshot = await budgetCollection.limit(1).get();
    if (!snapshot.empty) {
      console.log('⚠️  Budget collection already has data!');
      console.log('Do you want to:');
      console.log('1. Skip seeding (default)');
      console.log('2. Clear existing data and reseed');
      console.log('\nTo clear and reseed, run: npm run seed:budget --force');

      if (!process.argv.includes('--force')) {
        console.log('\n✅ Skipping seed. Existing data preserved.');
        process.exit(0);
      }

      // Clear existing data
      console.log('\n🗑️  Clearing existing budget data...');
      const allDocs = await budgetCollection.get();
      const deletePromises = [];
      allDocs.forEach(doc => {
        deletePromises.push(doc.ref.delete());
      });
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${allDocs.size} existing transactions`);
    }

    // Add timestamp to each transaction
    const now = new Date().toISOString();
    const transactionsWithTimestamps = sampleBudgetData.map(transaction => ({
      ...transaction,
      createdAt: now,
      updatedAt: now
    }));

    // Insert sample data
    console.log('\n📝 Adding sample budget transactions...');
    const addPromises = transactionsWithTimestamps.map(transaction =>
      budgetCollection.add(transaction)
    );

    await Promise.all(addPromises);

    console.log(`\n✅ Successfully seeded ${sampleBudgetData.length} budget transactions!`);
    console.log('\nBudget Summary:');

    // Calculate summary
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    sampleBudgetData.forEach(transaction => {
      if (transaction.category === 'Income') totalIncome += transaction.amount;
      else if (transaction.category === 'Expense') totalExpense += transaction.amount;
      else if (transaction.category === 'Savings') totalSavings += transaction.amount;
    });

    const balance = totalIncome - totalExpense - totalSavings;

    console.log(`  Income:   ₹${totalIncome.toLocaleString('en-IN')}`);
    console.log(`  Expense:  ₹${totalExpense.toLocaleString('en-IN')}`);
    console.log(`  Savings:  ₹${totalSavings.toLocaleString('en-IN')}`);
    console.log(`  Balance:  ₹${balance.toLocaleString('en-IN')}`);

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedBudget();

require('dotenv').config();
const { initializeFirebase } = require('./src/config/firebase');

async function testConnection() {
  try {
    console.log('🔍 Testing Firebase connection...\n');

    // Initialize Firebase
    const db = initializeFirebase();
    console.log('✅ Firebase initialized successfully\n');

    // Try to read from budgetTransactions collection
    console.log('📊 Fetching budget transactions...');
    const snapshot = await db.collection('budgetTransactions').limit(5).get();

    if (snapshot.empty) {
      console.log('⚠️  Collection exists but no documents found');
      console.log('   Run: npm run seed:budget to add data\n');
    } else {
      console.log(`✅ Found ${snapshot.size} transactions\n`);
      console.log('Sample data:');
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.source} (${data.category}) - ₹${data.amount}`);
      });
    }

    // Test write capability
    console.log('\n📝 Testing write capability...');
    const testDoc = {
      source: 'Connection Test',
      category: 'Income',
      purpose: 'Testing database write',
      dueDate: '01',
      amount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTest: true
    };

    const docRef = await db.collection('budgetTransactions').add(testDoc);
    console.log(`✅ Write successful (Doc ID: ${docRef.id})`);

    // Delete the test document
    await docRef.delete();
    console.log('✅ Test document cleaned up\n');

    console.log('✨ Database connection test completed successfully!');
    console.log('\nYour Firebase configuration is working correctly.');
    console.log('Backend can read from and write to Firestore.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check .env file has correct Firebase credentials');
    console.error('2. Verify Firebase project exists: sarath-hari-89727');
    console.error('3. Ensure Firestore is enabled in Firebase console');
    console.error('4. Check private key format (needs \\n for line breaks)\n');
    process.exit(1);
  }
}

testConnection();

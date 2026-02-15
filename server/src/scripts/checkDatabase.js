/**
 * Check database structure and contents
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const admin = require('firebase-admin');

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
    console.log('Firebase Admin initialized');
  }
  return admin.firestore();
};

async function checkDatabase() {
  try {
    console.log('========================================');
    console.log('Checking Database Structure');
    console.log('========================================\n');

    const db = initializeFirebaseAdmin();
    const userId = 'default-user';

    // Check templates
    console.log('📋 Templates:');
    const templatesSnapshot = await db.collection('budgetData')
      .doc(userId)
      .collection('templates')
      .get();

    if (templatesSnapshot.empty) {
      console.log('  ⚠️  No templates found');
    } else {
      templatesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  ✓ Template ID: ${doc.id}`);
        console.log(`    - Source: ${data.source}`);
        console.log(`    - Category: ${data.category}`);
      });
    }

    console.log('\n📅 Monthly Budgets:');
    const monthsSnapshot = await db.collection('budgetData')
      .doc(userId)
      .collection('monthlyBudgets')
      .get();

    if (monthsSnapshot.empty) {
      console.log('  ⚠️  No monthly budgets found');
    } else {
      monthsSnapshot.forEach(monthDoc => {
        const data = monthDoc.data();
        const transactions = data.transactions || [];
        console.log(`\n  Month: ${monthDoc.id}`);
        console.log(`  Transactions: ${transactions.length}`);

        transactions.forEach((t, idx) => {
          console.log(`    ${idx + 1}. ID: ${t.id}`);
          console.log(`       Template ID: ${t.templateId || 'none'}`);
          console.log(`       Source: ${t.source}`);
          console.log(`       Customized: ${t.isCustomized}`);
        });
      });
    }

    console.log('\n========================================');
    console.log('Check Complete');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error checking database:', error);
    throw error;
  } finally {
    if (admin.apps.length > 0) {
      await admin.app().delete();
      console.log('Firebase connection closed');
    }
  }
}

if (require.main === module) {
  checkDatabase()
    .then(() => {
      console.log('Check completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDatabase };

/**
 * Clean up orphaned transaction instances that reference non-existent templates
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

async function cleanupOrphanedTransactions() {
  try {
    console.log('========================================');
    console.log('Cleaning Up Orphaned Transactions');
    console.log('========================================\n');

    const db = initializeFirebaseAdmin();
    const userId = 'default-user';

    // Get all templates
    const templatesSnapshot = await db.collection('budgetData')
      .doc(userId)
      .collection('templates')
      .get();

    const validTemplateIds = new Set();
    templatesSnapshot.forEach(doc => {
      validTemplateIds.add(doc.id);
    });

    console.log(`Found ${validTemplateIds.size} valid templates:`, Array.from(validTemplateIds));

    // Get all monthly budgets
    const monthsSnapshot = await db.collection('budgetData')
      .doc(userId)
      .collection('monthlyBudgets')
      .get();

    let totalOrphaned = 0;
    let totalFixed = 0;
    const batch = db.batch();

    for (const monthDoc of monthsSnapshot.docs) {
      const monthKey = monthDoc.id;
      const data = monthDoc.data();
      const transactions = data.transactions || [];

      const orphanedTransactions = transactions.filter(t =>
        t.templateId && !validTemplateIds.has(t.templateId)
      );

      if (orphanedTransactions.length > 0) {
        console.log(`\n📅 Month: ${monthKey}`);
        console.log(`   Found ${orphanedTransactions.length} orphaned transactions:`);

        orphanedTransactions.forEach(t => {
          console.log(`   - ID: ${t.id}, Source: ${t.source}, Template: ${t.templateId}`);
          totalOrphaned++;
        });

        // Remove orphaned transactions
        const cleanedTransactions = transactions.filter(t =>
          !t.templateId || validTemplateIds.has(t.templateId)
        );

        batch.update(monthDoc.ref, { transactions: cleanedTransactions });
        totalFixed += orphanedTransactions.length;
      }
    }

    if (totalOrphaned > 0) {
      console.log('\n========================================');
      console.log(`Committing cleanup: ${totalFixed} orphaned transactions to be removed`);
      await batch.commit();
      console.log('✅ Cleanup completed successfully!');
    } else {
      console.log('\n✅ No orphaned transactions found. Database is clean.');
    }

    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error cleaning up orphaned transactions:', error);
    throw error;
  } finally {
    if (admin.apps.length > 0) {
      await admin.app().delete();
      console.log('Firebase connection closed');
    }
  }
}

if (require.main === module) {
  cleanupOrphanedTransactions()
    .then(() => {
      console.log('Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOrphanedTransactions };

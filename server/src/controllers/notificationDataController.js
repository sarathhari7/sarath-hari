const admin = require('firebase-admin');
const db = admin.firestore();
const { PRIORITY, REPEAT_TYPE, SOURCE_TYPE, isValidPriority, isValidRepeatType, isValidSourceType } = require('../constants/common');

// Helper function to validate source exists
const validateSource = async (sourceType, sourceId) => {
  try {
    let collectionName;
    switch (sourceType) {
      case SOURCE_TYPE.BUDGET:
        // For budget, check if template exists
        const templateDoc = await db.collection('budgetData')
          .doc('default-user')
          .collection('templates')
          .doc(sourceId)
          .get();
        return templateDoc.exists;
      case SOURCE_TYPE.TODO:
        collectionName = 'todos';
        break;
      case SOURCE_TYPE.RECIPE:
        collectionName = 'recipes';
        break;
      default:
        return false;
    }

    if (collectionName) {
      const doc = await db.collection(collectionName).doc(sourceId).get();
      return doc.exists;
    }
    return false;
  } catch (error) {
    console.error('Error validating source:', error);
    return false;
  }
};

// GET all notifications for a user
const getAllNotificationData = async (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';

    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('dueDate', 'asc')
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET upcoming notifications (within next 7 days)
const getUpcomingNotificationData = async (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('dueDate', '>=', now)
      .where('dueDate', '<=', sevenDaysLater)
      .orderBy('dueDate', 'asc')
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error getting upcoming notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE notification (INTERNAL USE ONLY - called from budget/todo controllers)
const createNotificationData = async (data) => {
  try {
    // Validate required fields
    if (!data.title || !data.dueDate || !data.priority || !data.repeatType || !data.sourceType || !data.sourceId) {
      throw new Error('Missing required fields: title, dueDate, priority, repeatType, sourceType, sourceId');
    }

    // Validate enum values
    if (!isValidPriority(data.priority)) {
      throw new Error(`Invalid priority. Must be one of: ${Object.values(PRIORITY).join(', ')}`);
    }

    if (!isValidRepeatType(data.repeatType)) {
      throw new Error(`Invalid repeatType. Must be one of: ${Object.values(REPEAT_TYPE).join(', ')}`);
    }

    if (!isValidSourceType(data.sourceType)) {
      throw new Error(`Invalid sourceType. Must be one of: ${Object.values(SOURCE_TYPE).join(', ')}`);
    }

    // Validate source exists
    const sourceExists = await validateSource(data.sourceType, data.sourceId);
    if (!sourceExists) {
      throw new Error(`Source ${data.sourceType} with ID ${data.sourceId} does not exist`);
    }

    const notificationData = {
      title: data.title,
      dueDate: data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate),
      priority: data.priority,
      repeatType: data.repeatType,
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      category: data.sourceType, // Category derived from sourceType (budget, todo, recipe)
      userId: data.userId || 'default-user',
      monthKey: data.monthKey || null, // For tracking which month instance this belongs to
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('notifications').add(notificationData);

    return { success: true, id: docRef.id, data: notificationData };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// DELETE notification by source (INTERNAL USE ONLY)
const deleteNotificationDataBySource = async (sourceType, sourceId, monthKey = null) => {
  try {
    let query = db.collection('notifications')
      .where('sourceType', '==', sourceType)
      .where('sourceId', '==', sourceId);

    // If monthKey is provided, only delete that specific month's notification
    if (monthKey) {
      query = query.where('monthKey', '==', monthKey);
    }

    const snapshot = await query.get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { success: true, deletedCount: snapshot.size };
  } catch (error) {
    console.error('Error deleting notifications:', error);
    throw error;
  }
};

// UPDATE notification (INTERNAL USE ONLY)
const updateNotificationData = async (notificationId, updates) => {
  try {
    const updateData = {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Remove fields that shouldn't be updated
    delete updateData.sourceType;
    delete updateData.sourceId;
    delete updateData.userId;
    delete updateData.createdAt;

    await db.collection('notifications').doc(notificationId).update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

// Public endpoint to prevent manual creation
const createNotificationPublic = async (req, res) => {
  res.status(403).json({
    success: false,
    error: 'Direct creation of notifications is not allowed. Notifications are automatically created when you add budget items, todos, or recipes.'
  });
};

// Public endpoint to prevent manual deletion
const deleteNotificationPublic = async (req, res) => {
  res.status(403).json({
    success: false,
    error: 'Direct deletion of notifications is not allowed. Notifications are automatically deleted when you remove their source items.'
  });
};

module.exports = {
  getAllNotificationData,
  getUpcomingNotificationData,
  createNotificationData,
  deleteNotificationDataBySource,
  updateNotificationData,
  createNotificationPublic,
  deleteNotificationPublic
};

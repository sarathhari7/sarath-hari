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

// GET all events for a user
const getAllEventData = async (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';

    const snapshot = await db.collection('events')
      .where('userId', '==', userId)
      .orderBy('date', 'asc')
      .get();

    const events = [];
    snapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET events for a specific month
const getEventsByMonth = async (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';
    const { year, month } = req.params;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // Fetch all events for user and filter in code to avoid needing composite index
    const snapshot = await db.collection('events')
      .where('userId', '==', userId)
      .get();

    const events = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const eventDate = data.date.toDate ? data.date.toDate() : new Date(data.date);

      // Filter by month in application code
      if (eventDate >= startDate && eventDate <= endDate) {
        events.push({
          id: doc.id,
          ...data,
          date: eventDate.toISOString()
        });
      }
    });

    // Sort by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error getting events by month:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE event (INTERNAL USE ONLY - called from budget/todo controllers)
const createEventData = async (data) => {
  try {
    // Validate required fields
    if (!data.title || !data.date || !data.repeatType || !data.priority || !data.sourceType || !data.sourceId) {
      throw new Error('Missing required fields: title, date, repeatType, priority, sourceType, sourceId');
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

    const eventData = {
      title: data.title,
      date: data.date instanceof Date ? data.date : new Date(data.date),
      repeatType: data.repeatType,
      priority: data.priority,
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      category: data.sourceType, // Category derived from sourceType (budget, todo, recipe)
      userId: data.userId || 'default-user',
      monthKey: data.monthKey || null, // For tracking which month instance this belongs to
      description: data.description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('events').add(eventData);

    return { success: true, id: docRef.id, data: eventData };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// DELETE event by source (INTERNAL USE ONLY)
const deleteEventDataBySource = async (sourceType, sourceId, monthKey = null) => {
  try {
    let query = db.collection('events')
      .where('sourceType', '==', sourceType)
      .where('sourceId', '==', sourceId);

    // If monthKey is provided, only delete that specific month's event
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
    console.error('Error deleting events:', error);
    throw error;
  }
};

// UPDATE event (INTERNAL USE ONLY)
const updateEventData = async (eventId, updates) => {
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

    await db.collection('events').doc(eventId).update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Public endpoint to prevent manual creation
const createEventPublic = async (req, res) => {
  res.status(403).json({
    success: false,
    error: 'Direct creation of events is not allowed. Events are automatically created when you add budget items, todos, or recipes.'
  });
};

// Public endpoint to prevent manual deletion
const deleteEventPublic = async (req, res) => {
  res.status(403).json({
    success: false,
    error: 'Direct deletion of events is not allowed. Events are automatically deleted when you remove their source items.'
  });
};

module.exports = {
  getAllEventData,
  getEventsByMonth,
  createEventData,
  deleteEventDataBySource,
  updateEventData,
  createEventPublic,
  deleteEventPublic
};

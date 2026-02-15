const { initializeFirebase } = require('../config/firebase');

// Get Firestore instance
const db = initializeFirebase();
const notificationsCollection = db.collection('notifications');

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const snapshot = await notificationsCollection
      .orderBy('createdAt', 'desc')
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const snapshot = await notificationsCollection
      .where('isRead', '==', false)
      .get();

    res.json({ success: true, count: snapshot.size });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new notification
const createNotification = async (req, res) => {
  try {
    const { title, message, type, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }

    const newNotification = {
      title,
      message,
      type: type || 'info', // info, success, warning, error
      link: link || null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const docRef = await notificationsCollection.add(newNotification);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newNotification }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = notificationsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await docRef.update({ isRead: true });
    const updatedDoc = await docRef.get();

    res.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const snapshot = await notificationsCollection
      .where('isRead', '==', false)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `Marked ${snapshot.size} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = notificationsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await docRef.delete();

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete all read notifications
const deleteAllRead = async (req, res) => {
  try {
    const snapshot = await notificationsCollection
      .where('isRead', '==', true)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.json({
      success: true,
      message: `Deleted ${snapshot.size} read notifications`
    });
  } catch (error) {
    console.error('Error deleting all read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
};

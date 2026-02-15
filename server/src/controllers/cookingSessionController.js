const admin = require('firebase-admin');
const db = admin.firestore();

// Get active cooking session for a recipe
const getCookingSession = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = 'default-user'; // Update when auth is implemented

    const sessionDoc = await db
      .collection('cookingSessions')
      .doc(`${userId}_${recipeId}`)
      .get();

    if (!sessionDoc.exists) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: sessionDoc.data() });
  } catch (error) {
    console.error('Error getting cooking session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save or update cooking session
const saveCookingSession = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = 'default-user'; // Update when auth is implemented
    const sessionData = req.body;

    const sessionRef = db
      .collection('cookingSessions')
      .doc(`${userId}_${recipeId}`);

    const dataToSave = {
      recipeId,
      userId,
      isPlaying: sessionData.isPlaying || false,
      isPaused: sessionData.isPaused || false,
      startTime: sessionData.startTime || null,
      pauseTime: sessionData.pauseTime || null,
      totalPauseDuration: sessionData.totalPauseDuration || 0,
      checkedSteps: sessionData.checkedSteps || [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await sessionRef.set(dataToSave, { merge: true });

    res.json({ success: true, data: dataToSave });
  } catch (error) {
    console.error('Error saving cooking session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete cooking session (when user stops or completes recipe)
const deleteCookingSession = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = 'default-user'; // Update when auth is implemented

    await db
      .collection('cookingSessions')
      .doc(`${userId}_${recipeId}`)
      .delete();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cooking session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getCookingSession,
  saveCookingSession,
  deleteCookingSession,
};

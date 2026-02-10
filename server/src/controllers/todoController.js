const { initializeFirebase } = require('../config/firebase');

// Get Firestore instance
const db = initializeFirebase();
const todosCollection = db.collection('todos');

// Get all todos
const getAllTodos = async (req, res) => {
  try {
    const snapshot = await todosCollection.orderBy('createdAt', 'desc').get();
    const todos = [];
    snapshot.forEach(doc => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, data: todos });
  } catch (error) {
    console.error('Error getting todos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single todo
const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await todosCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error getting todo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new todo
const createTodo = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const newTodo = {
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await todosCollection.add(newTodo);
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newTodo }
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update todo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, completed } = req.body;

    const docRef = todosCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) updateData.completed = completed;

    await docRef.update(updateData);
    const updatedDoc = await docRef.get();

    res.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = todosCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};

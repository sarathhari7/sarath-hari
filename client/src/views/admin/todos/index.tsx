import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdDelete, MdEdit, MdCheckCircle, MdRadioButtonUnchecked, MdArchive } from "react-icons/md";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "components/ui/accordion";
import {
  Todo,
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo as deleteTodoService,
  toggleTodoComplete,
} from "services/todo";

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium"
  });

  // Fetch all todos
  const fetchTodos = async () => {
    const response = await getAllTodos();
    if (response.success && response.data) {
      setTodos(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = editingTodo
      ? await updateTodo(editingTodo.id, formData)
      : await createTodo(formData);

    if (response.success) {
      fetchTodos();
      setShowAddModal(false);
      setEditingTodo(null);
      setFormData({ title: "", description: "", priority: "medium" });
    }
  };

  // Toggle todo completion
  const toggleComplete = async (todo: Todo) => {
    const response = await toggleTodoComplete(todo.id, todo.completed);
    if (response.success) {
      fetchTodos();
    }
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this todo?")) return;

    const response = await deleteTodoService(id);
    if (response.success) {
      fetchTodos();
    }
  };

  // Open edit modal
  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority
    });
    setShowAddModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowAddModal(false);
    setEditingTodo(null);
    setFormData({ title: "", description: "", priority: "medium" });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl">Loading todos...</p>
      </div>
    );
  }

  // Separate active and archived todos
  const activeTodos = todos.filter(todo => !todo.completed);
  const archivedTodos = todos.filter(todo => todo.completed);

  const renderTodoCard = (todo: Todo) => (
    <Card key={todo.id} extra="p-5">
      <div className="flex flex-col gap-3">
        {/* Header with priority and actions */}
        <div className="flex items-start justify-between">
          <span className={`text-sm font-semibold uppercase ${getPriorityColor(todo.priority)}`}>
            {todo.priority}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(todo)}
              className="text-gray-600 hover:text-brand-500 dark:text-gray-400"
            >
              <MdEdit className="h-5 w-5" />
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-gray-600 hover:text-red-500 dark:text-gray-400"
            >
              <MdDelete className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Title with completion checkbox */}
        <div className="flex items-start gap-3">
          <button onClick={() => toggleComplete(todo)} className="mt-1">
            {todo.completed ? (
              <MdCheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <MdRadioButtonUnchecked className="h-6 w-6 text-gray-400" />
            )}
          </button>
          <div className="flex-1">
            <h3
              className={`text-lg font-bold ${
                todo.completed
                  ? "text-gray-400 line-through dark:text-gray-600"
                  : "text-navy-700 dark:text-white"
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p className={`mt-1 text-sm ${
                todo.completed
                  ? "text-gray-400 line-through dark:text-gray-600"
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                {todo.description}
              </p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="rounded-lg bg-gray-100 px-2 py-1 dark:bg-navy-700">
            {todo.status}
          </span>
          <span>
            {new Date(todo.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="mt-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy-700 dark:text-white">
          My Todos
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-base font-medium text-white transition hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdAdd className="h-5 w-5" />
          Add Todo
        </button>
      </div>

      {/* Active Todos Grid */}
      {activeTodos.length > 0 && (
        <>
          <h2 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
            Active Todos ({activeTodos.length})
          </h2>
          <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activeTodos.map(renderTodoCard)}
          </div>
        </>
      )}

      {/* Archived Todos Accordion */}
      <Card extra="p-5 mb-5">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="archive">
            <AccordionTrigger className="text-navy-700 dark:text-white hover:no-underline">
              <div className="flex items-center gap-2">
                <MdArchive className="h-5 w-5" />
                <span className="text-lg font-bold">Archive ({archivedTodos.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {archivedTodos.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 pt-4">
                  {archivedTodos.map(renderTodoCard)}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No archived todos yet. Completed todos will appear here.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Empty state */}
      {todos.length === 0 && (
        <Card extra="p-10 text-center">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            No todos yet. Click "Add Todo" to create one!
          </p>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: '#00000099' }}>
          <Card extra="w-full max-w-md p-6 m-4" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
            <h2 className="mb-5 text-2xl font-bold text-navy-700 dark:text-white">
              {editingTodo ? "Edit Todo" : "Add New Todo"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  placeholder="Enter todo title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
                >
                  {editingTodo ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-base font-medium text-navy-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Todos;

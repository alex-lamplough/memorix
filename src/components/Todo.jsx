import { useState, useEffect } from 'react'
import { todoService } from '../services/todo-service'

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import SortIcon from '@mui/icons-material/Sort'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import FilterListIcon from '@mui/icons-material/FilterList'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

function Todo() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [sortOrder, setSortOrder] = useState('dueDate:asc'); // e.g. 'dueDate:asc', 'priority:desc'
  const [editingTodo, setEditingTodo] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [newTodoPriority, setNewTodoPriority] = useState('medium');
  
  // Fetch todos from API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const queryParams = {
          sort: sortOrder
        };
        
        // Add status filter if not "all"
        if (filter === 'active') {
          queryParams.status = 'pending,in-progress';
          console.log('Fetching active todos with filter:', queryParams);
        } else if (filter === 'completed') {
          queryParams.status = 'completed';
          console.log('Fetching completed todos with filter:', queryParams);
        } else {
          console.log('Fetching all todos with filter:', queryParams);
        }
        
        const response = await todoService.getAllTodos(queryParams);
        console.log('API response:', response);
        setTodos(response.todos);
      } catch (err) {
        console.error('Error fetching todos:', err);
        setError('Failed to load your todo items');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTodos();
  }, [filter, sortOrder]);
  
  const handleAddTodo = async () => {
    if (newTodo.trim() === '') return;
    
    try {
      setIsAdding(true);
      
      const todoData = {
        title: newTodo,
        status: 'pending',
        priority: newTodoPriority
      };
      
      const createdTodo = await todoService.createTodo(todoData);
      
      // Update the local state
      setTodos(prevTodos => [...prevTodos, createdTodo]);
      setNewTodo('');
      // Reset priority to medium after adding
      setNewTodoPriority('medium');
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo');
    } finally {
      setIsAdding(false);
    }
  };
  
  const toggleTodo = async (id) => {
    try {
      // Optimistically update UI
      setTodos(todos.map(todo => 
        todo._id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      ));
      
      // Make API call
      await todoService.toggleTodoCompletion(id);
    } catch (err) {
      console.error('Error toggling todo:', err);
      // Revert the optimistic update
      setTodos(prevTodos => [...prevTodos]);
    }
  };
  
  const deleteTodo = async (id) => {
    try {
      // Optimistically update UI
      setTodos(todos.filter(todo => todo._id !== id));
      
      // Make API call
      await todoService.deleteTodo(id);
    } catch (err) {
      console.error('Error deleting todo:', err);
      // Fetch todos again in case the delete failed
      const response = await todoService.getAllTodos();
      setTodos(response.todos);
    }
  };
  
  const startEditingTodo = (todo) => {
    setEditingTodo({
      ...todo,
      title: todo.title,
      priority: todo.priority || 'medium'
    });
  };
  
  const cancelEditing = () => {
    setEditingTodo(null);
  };
  
  const saveEditedTodo = async () => {
    if (!editingTodo || editingTodo.title.trim() === '') return;
    
    try {
      // Make API call
      const updatedTodo = await todoService.updateTodo(editingTodo._id, {
        title: editingTodo.title,
        description: editingTodo.description,
        priority: editingTodo.priority
      });
      
      // Update local state
      setTodos(todos.map(todo => 
        todo._id === updatedTodo._id ? updatedTodo : todo
      ));
      
      // Exit edit mode
      setEditingTodo(null);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
  };
  
  const deleteCompletedTodos = async () => {
    try {
      // Optimistically update UI
      setTodos(todos.filter(todo => !todo.isCompleted));
      
      // Make API call
      await todoService.deleteCompletedTodos();
    } catch (err) {
      console.error('Error deleting completed todos:', err);
      // Fetch todos again in case the delete failed
      const response = await todoService.getAllTodos();
      setTodos(response.todos);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  return (
    <div className="w-full bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Todo List</h2>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <button 
              className="flex items-center gap-1 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <FilterListIcon fontSize="small" />
              <span className="text-sm hidden sm:inline">
                {filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Completed'}
              </span>
              <ArrowDropDownIcon fontSize="small" />
            </button>
            
            {/* Dropdown menu */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 bg-[#18092a] rounded-lg border border-gray-800/30 shadow-lg p-2 z-10">
                <button 
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${filter === 'all' ? 'bg-[#00ff94]/10 text-[#00ff94]' : 'hover:bg-white/5'}`}
                  onClick={() => {
                    handleFilterChange('all');
                    setShowFilterDropdown(false);
                  }}
                >
                  All
                </button>
                <button 
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${filter === 'active' ? 'bg-[#00ff94]/10 text-[#00ff94]' : 'hover:bg-white/5'}`}
                  onClick={() => {
                    handleFilterChange('active');
                    setShowFilterDropdown(false);
                  }}
                >
                  Active
                </button>
                <button 
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${filter === 'completed' ? 'bg-[#00ff94]/10 text-[#00ff94]' : 'hover:bg-white/5'}`}
                  onClick={() => {
                    handleFilterChange('completed');
                    setShowFilterDropdown(false);
                  }}
                >
                  Completed
                </button>
              </div>
            )}
          </div>
          
          {/* Sort button */}
          <button 
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => handleSortChange(sortOrder === 'dueDate:asc' ? 'priority:desc' : 'dueDate:asc')}
          >
            <SortIcon fontSize="small" />
          </button>
          
          {/* Clear completed (conditionally rendered) */}
          {todos.some(todo => todo.isCompleted) && (
            <button 
              className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              onClick={deleteCompletedTodos}
            >
              <HighlightOffIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>
      
      {/* Add todo input */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-[#18092a]/80 text-white rounded-lg px-4 py-2.5 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
            disabled={isAdding}
          />
          <button 
            onClick={handleAddTodo}
            disabled={isAdding || newTodo.trim() === ''}
            className={`px-3 py-2 rounded-lg border ${
              isAdding || newTodo.trim() === '' 
                ? 'bg-gray-700/20 text-white/40 border-gray-800/30 cursor-not-allowed' 
                : 'bg-[#00ff94]/10 text-[#00ff94] hover:bg-[#00ff94]/20 border-[#00ff94]/30'
            } transition-colors`}
          >
            {isAdding ? (
              <AutorenewIcon fontSize="small" className="animate-spin" />
            ) : (
              <AddIcon fontSize="small" />
            )}
          </button>
        </div>
        
        {/* Priority selector for new todo */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Priority:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setNewTodoPriority('low')}
              className={`px-2 py-0.5 text-xs rounded-full ${
                newTodoPriority === 'low' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' 
                  : 'bg-[#18092a]/80 text-white/50 border border-gray-800/30 hover:bg-blue-500/10'
              }`}
              disabled={isAdding}
            >
              Low
            </button>
            <button
              onClick={() => setNewTodoPriority('medium')}
              className={`px-2 py-0.5 text-xs rounded-full ${
                newTodoPriority === 'medium' 
                  ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                  : 'bg-[#18092a]/80 text-white/50 border border-gray-800/30 hover:bg-green-500/10'
              }`}
              disabled={isAdding}
            >
              Medium
            </button>
            <button
              onClick={() => setNewTodoPriority('high')}
              className={`px-2 py-0.5 text-xs rounded-full ${
                newTodoPriority === 'high' 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30' 
                  : 'bg-[#18092a]/80 text-white/50 border border-gray-800/30 hover:bg-orange-500/10'
              }`}
              disabled={isAdding}
            >
              High
            </button>
            <button
              onClick={() => setNewTodoPriority('urgent')}
              className={`px-2 py-0.5 text-xs rounded-full ${
                newTodoPriority === 'urgent' 
                  ? 'bg-red-500/20 text-red-400 border border-red-400/30' 
                  : 'bg-[#18092a]/80 text-white/50 border border-gray-800/30 hover:bg-red-500/10'
              }`}
              disabled={isAdding}
            >
              Urgent
            </button>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <HourglassEmptyIcon className="animate-pulse text-[#00ff94]" />
          <span className="ml-2 text-white/70">Loading todos...</span>
        </div>
      )}
      
      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-4 text-red-400">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-white/70 hover:text-white underline text-sm"
          >
            Try again
          </button>
        </div>
      )}
      
      {/* Todos list */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {todos.length === 0 ? (
            <p className="text-white/50 text-center py-4">No tasks yet. Add one above!</p>
          ) : (
            todos.map(todo => (
              <div 
                key={todo._id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  todo.isCompleted 
                    ? 'border-gray-800/20 bg-white/5 text-white/50' 
                    : 'border-gray-800/30 bg-[#18092a]/80'
                }`}
              >
                {editingTodo && editingTodo._id === todo._id ? (
                  // Edit mode
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      value={editingTodo.title}
                      onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                      className="w-full bg-[#15052a]/80 text-white rounded-lg px-3 py-1.5 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 text-sm"
                      autoFocus
                    />
                    
                    {/* Priority selector */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/60">Priority:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingTodo({...editingTodo, priority: 'low'})}
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            editingTodo.priority === 'low' 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' 
                              : 'bg-[#18092a]/80 text-white/50 border border-gray-800/30 hover:bg-blue-500/10'
                          }`}
                        >
                          Low
                        </button>
                        <button
                          onClick={() => setEditingTodo({...editingTodo, priority: 'medium'})}
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            editingTodo.priority === 'medium' 
                              ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                              : 'bg-[#18092a]/80 text-white/50 border border-gray-800/30 hover:bg-green-500/10'
                          }`}
                        >
                          Medium
                        </button>
                        <button
                          onClick={() => setEditingTodo({...editingTodo, priority: 'high'})}
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            editingTodo.priority === 'high' 
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30' 
                              : 'bg-[#18092a]/80 text-white/50 border border-gray-800/30 hover:bg-orange-500/10'
                          }`}
                        >
                          High
                        </button>
                        <button
                          onClick={() => setEditingTodo({...editingTodo, priority: 'urgent'})}
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            editingTodo.priority === 'urgent' 
                              ? 'bg-red-500/20 text-red-400 border border-red-400/30' 
                              : 'bg-[#18092a]/80 text-white/50 border border-gray-800/30 hover:bg-red-500/10'
                          }`}
                        >
                          Urgent
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={cancelEditing}
                        className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <CloseIcon fontSize="small" />
                      </button>
                      <button 
                        onClick={saveEditedTodo}
                        className="text-[#00ff94] p-1 rounded-lg hover:bg-[#00ff94]/10 transition-colors"
                        disabled={editingTodo.title.trim() === ''}
                      >
                        <SaveIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleTodo(todo._id)}
                        className={`p-1 rounded-full ${
                          todo.isCompleted 
                            ? 'text-[#00ff94]' 
                            : 'text-white/50 hover:text-white/80'
                        }`}
                      >
                        <CheckCircleOutlineIcon fontSize="small" />
                      </button>
                      <div className="flex flex-col">
                        <span className={todo.isCompleted ? 'line-through' : ''}>{todo.title}</span>
                        
                        {/* Metadata row: priority + due date if exists */}
                        {(todo.priority || todo.dueDate) && (
                          <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                            {todo.priority && (
                              <span className={`
                                px-1.5 py-0.5 rounded-full text-xs
                                ${todo.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : ''}
                                ${todo.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : ''}
                                ${todo.priority === 'low' ? 'bg-blue-500/20 text-blue-400' : ''}
                                ${todo.priority === 'medium' ? 'bg-green-500/20 text-green-400' : ''}
                              `}>
                                {todo.priority}
                              </span>
                            )}
                            
                            {todo.dueDate && (
                              <span className="flex items-center gap-1">
                                <CalendarTodayIcon style={{ fontSize: 12 }} />
                                {formatDate(todo.dueDate)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button 
                        onClick={() => startEditingTodo(todo)}
                        className="text-white/50 hover:text-white/80 p-1 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      
                      <button 
                        onClick={() => deleteTodo(todo._id)}
                        className="text-white/50 hover:text-white/80 p-1 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Todo 
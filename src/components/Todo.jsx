import { useState, useEffect, useRef } from 'react'
import logger from '../utils/logger';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useToggleTodoComplete } from '../api/queries/todos'

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
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [sortOrder, setSortOrder] = useState('dueDate:asc'); // e.g. 'dueDate:asc', 'priority:desc'
  const [editingTodo, setEditingTodo] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [newTodoPriority, setNewTodoPriority] = useState('medium');
  const isMountedRef = useRef(true);
  
  // Use React Query hooks
  const { 
    data: todosData, 
    isLoading, 
    error 
  } = useTodos();
  
  // React Query mutations
  const { mutate: createTodo } = useCreateTodo();
  const { mutate: updateTodo } = useUpdateTodo();
  const { mutate: deleteTodo } = useDeleteTodo();
  const { mutate: toggleTodoComplete } = useToggleTodoComplete();
  
  // Extract todos from query data or use empty array
  const todos = todosData?.todos || [];
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const handleAddTodo = async () => {
    if (newTodo.trim() === '') return;
    
    try {
      setIsAdding(true);
      
      const todoData = {
        title: newTodo,
        status: 'pending',
        priority: newTodoPriority
      };
      
      // Use React Query mutation
      createTodo(todoData, {
        onSuccess: () => {
          setNewTodo('');
          // Reset priority to medium after adding
          setNewTodoPriority('medium');
        },
        onError: (err) => {
          logger.error('Error adding todo:', { value: err });
        },
        onSettled: () => {
          setIsAdding(false);
        }
      });
    } catch (err) {
      logger.error('Error adding todo:', { value: err });
      setIsAdding(false);
    }
  };
  
  const handleToggleTodo = async (id) => {
    try {
      // Find the current todo
      const todo = todos.find(todo => todo._id === id);
      if (!todo) return;
      
      // Use React Query mutation
      toggleTodoComplete({ 
        id, 
        isCompleted: !todo.isCompleted 
      });
    } catch (err) {
      logger.error('Error toggling todo:', { value: err });
    }
  };
  
  const handleDeleteTodo = async (id) => {
    try {
      // Use React Query mutation
      deleteTodo(id);
    } catch (err) {
      logger.error('Error deleting todo:', { value: err });
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
      // Use React Query mutation
      updateTodo({ 
        id: editingTodo._id, 
        todo: {
          title: editingTodo.title,
          description: editingTodo.description,
          priority: editingTodo.priority
        }
      }, {
        onSuccess: () => {
          // Exit edit mode
          setEditingTodo(null);
        },
        onError: (err) => {
          logger.error('Error updating todo:', { value: err });
        }
      });
    } catch (err) {
      logger.error('Error updating todo:', { value: err });
    }
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
  };
  
  // Filter and sort todos based on current settings
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'active') return !todo.isCompleted;
    if (filter === 'completed') return todo.isCompleted;
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'dueDate:asc') {
      return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
    } else if (sortOrder === 'dueDate:desc') {
      return new Date(b.dueDate || '1970-01-01') - new Date(a.dueDate || '1970-01-01');
    } else if (sortOrder === 'priority:high') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
    } else if (sortOrder === 'priority:low') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
    }
    return 0;
  });
  
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
            
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-[#18092a] border border-gray-800/50 rounded-lg shadow-xl w-40 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleFilterChange('all')
                      setShowFilterDropdown(false)
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${filter === 'all' ? 'text-[#00ff94]' : 'text-white/80'} hover:bg-white/5 text-left`}
                  >
                    <span>All</span>
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('active')
                      setShowFilterDropdown(false)
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${filter === 'active' ? 'text-[#00ff94]' : 'text-white/80'} hover:bg-white/5 text-left`}
                  >
                    <span>Active</span>
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('completed')
                      setShowFilterDropdown(false)
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${filter === 'completed' ? 'text-[#00ff94]' : 'text-white/80'} hover:bg-white/5 text-left`}
                  >
                    <span>Completed</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sort button */}
          <button 
            className="flex items-center gap-1 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => {
              const nextSort = 
                sortOrder === 'dueDate:asc' ? 'dueDate:desc' :
                sortOrder === 'dueDate:desc' ? 'priority:high' :
                sortOrder === 'priority:high' ? 'priority:low' : 'dueDate:asc';
              handleSortChange(nextSort);
            }}
          >
            <SortIcon fontSize="small" />
            <span className="text-sm hidden sm:inline">
              {sortOrder.includes('dueDate') ? 
                (sortOrder.includes(':asc') ? 'Date ↑' : 'Date ↓') : 
                (sortOrder.includes('high') ? 'Priority ↑' : 'Priority ↓')
              }
            </span>
          </button>
        </div>
      </div>
      
      {/* Add todo form */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-[#2E0033]/30 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        
        {/* Priority selector */}
        <select
          value={newTodoPriority}
          onChange={(e) => setNewTodoPriority(e.target.value)}
          className="bg-[#2E0033]/30 text-white rounded-lg px-3 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        
        <button
          onClick={handleAddTodo}
          disabled={isAdding || newTodo.trim() === ''}
          className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
            isAdding || newTodo.trim() === '' 
              ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
              : 'bg-[#00ff94]/10 text-[#00ff94] hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30'
          }`}
        >
          {isAdding ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-[#00ff94] rounded-full animate-spin"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <AddIcon fontSize="small" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
      
      {/* Todo list */}
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff94] mb-4"></div>
          <p className="text-white/70">Loading your todos...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center bg-red-500/10 rounded-xl border border-red-500/30">
          <p className="text-white/90 mb-2">Error loading todos</p>
          <p className="text-white/70 text-sm">{error?.message || 'Please try again later'}</p>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="py-8 text-center bg-[#2E0033]/30 rounded-xl border border-gray-800/50">
          <HourglassEmptyIcon className="text-white/40 text-4xl mb-3" />
          <p className="text-white/70">
            {filter === 'all' 
              ? 'No todos yet. Add your first task above!' 
              : filter === 'active' 
                ? 'No active todos. Great job!' 
                : 'No completed todos yet. Complete some tasks!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map(todo => (
            <div 
              key={todo._id} 
              className={`bg-[#2E0033]/30 rounded-lg p-4 border border-gray-800/50 ${
                todo.isCompleted ? 'opacity-60' : ''
              }`}
            >
              {editingTodo && editingTodo._id === todo._id ? (
                // Edit mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingTodo.title}
                    onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                    className="w-full bg-[#18092a]/60 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
                  />
                  
                  <div className="flex gap-2">
                    <select
                      value={editingTodo.priority || 'medium'}
                      onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value})}
                      className="bg-[#18092a]/60 text-white rounded-lg px-3 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    
                    <button
                      onClick={saveEditedTodo}
                      className="flex-1 bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center justify-center gap-1"
                    >
                      <SaveIcon fontSize="small" />
                      <span>Save</span>
                    </button>
                    
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors border border-gray-800/50 flex items-center justify-center"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTodo(todo._id)}
                    className={`p-1 rounded-full ${
                      todo.isCompleted 
                        ? 'text-[#00ff94] hover:text-[#00cc77] bg-[#00ff94]/10' 
                        : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                    }`}
                    aria-label={todo.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                  >
                    <CheckCircleOutlineIcon />
                  </button>
                  
                  <div className="flex-1">
                    <p className={`${
                      todo.isCompleted ? 'line-through text-white/50' : 'text-white'
                    }`}>
                      {todo.title}
                    </p>
                    
                    {todo.dueDate && (
                      <div className="text-white/60 text-xs flex items-center gap-1 mt-1">
                        <CalendarTodayIcon style={{ fontSize: 12 }} />
                        <span>{formatDate(todo.dueDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    {/* Priority indicator */}
                    {todo.priority && (
                      <span className={`inline-block w-2 h-2 rounded-full mr-3 ${
                        todo.priority === 'high' ? 'bg-red-500' :
                        todo.priority === 'medium' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`}></span>
                    )}
                    
                    <button
                      onClick={() => startEditingTodo(todo)}
                      className="p-1 text-white/40 hover:text-white/60 hover:bg-white/5 rounded"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTodo(todo._id)}
                      className="p-1 text-white/40 hover:text-red-400 hover:bg-white/5 rounded"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Todo 
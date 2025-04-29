import { useState } from 'react'

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import SortIcon from '@mui/icons-material/Sort'

function Todo() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Review Physics Flashcards', completed: false },
    { id: 2, text: 'Create Spanish Vocabulary Set', completed: true },
    { id: 3, text: 'Study IELTS materials', completed: false }
  ])
  const [newTodo, setNewTodo] = useState('')
  
  const handleAddTodo = () => {
    if (newTodo.trim() === '') return
    
    const newItem = {
      id: Date.now(),
      text: newTodo,
      completed: false
    }
    
    setTodos([...todos, newItem])
    setNewTodo('')
  }
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }
  
  return (
    <div className="w-full bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Todo List</h2>
        <button className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <SortIcon fontSize="small" />
        </button>
      </div>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-[#18092a]/80 text-white rounded-lg px-4 py-2.5 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <button 
          onClick={handleAddTodo}
          className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
        >
          <AddIcon fontSize="small" />
        </button>
      </div>
      
      <div className="space-y-3">
        {todos.length === 0 ? (
          <p className="text-white/50 text-center py-4">No tasks yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div 
              key={todo.id} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                todo.completed 
                  ? 'border-gray-800/20 bg-white/5 text-white/50' 
                  : 'border-gray-800/30 bg-[#18092a]/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`p-1 rounded-full ${
                    todo.completed 
                      ? 'text-[#00ff94]' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <CheckCircleOutlineIcon fontSize="small" />
                </button>
                <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
              </div>
              
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="text-white/50 hover:text-white/80 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <DeleteOutlineIcon fontSize="small" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Todo 
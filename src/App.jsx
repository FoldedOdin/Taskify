import TodoList from './components/TodoList';
import Navigation from './components/Navigation';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <TodoList />
    </div>
  );
}

export default App;

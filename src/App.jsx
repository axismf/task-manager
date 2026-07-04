import { useTasks } from './hooks/useTasks';
import TaskInput from './components/TaskInput';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import TaskFooter from './components/TaskFooter';

export default function App() {
  const {
    filter,
    filteredTasks,
    activeCount,
    addTask,
    toggleTask,
    deleteTask,
    setFilter,
  } = useTasks();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Task Manager</h1>

        <TaskInput onAdd={addTask} />
        <FilterBar filter={filter} onFilterChange={setFilter} />
        <TaskList
          tasks={filteredTasks}
          filter={filter}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
        <TaskFooter activeCount={activeCount} />
      </main>
    </div>
  );
}

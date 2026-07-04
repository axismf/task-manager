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
    <div className="min-h-screen bg-[#181616] text-[#c5c9c5]">
      <main className="max-w-md mx-auto mt-10 bg-[#282727] rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-[#c5c9c5]">Task Manager</h1>

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

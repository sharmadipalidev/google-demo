import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock, FileText, Trash2, X } from "lucide-react";

type TaskStatus = "In progress" | "Completed" | "Upcoming";

interface Task {
  id: string;
  title: string;
  time: string;
  status: TaskStatus;
}

const DEFAULT_TASKS: Task[] = [
  { id: "1", title: "Project Brief", time: "Today, 10:30 AM", status: "In progress" },
  { id: "2", title: "Client Feedback", time: "Yesterday, 12:45 PM", status: "Completed" },
  { id: "3", title: "Q3 Review Data", time: "Tomorrow, 11:00 AM", status: "Upcoming" }
];

export function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("neurosync_recent_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks(DEFAULT_TASKS);
      }
    } else {
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("neurosync_recent_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus: Record<TaskStatus, TaskStatus> = {
          "In progress": "Completed",
          "Completed": "Upcoming",
          "Upcoming": "In progress"
        };
        return { ...t, status: nextStatus[t.status] };
      }
      return t;
    }));
  };

  const removeTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      time: "Just now",
      status: "Upcoming"
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setShowAddForm(false);
  };

  if (!isClient) return null;

  return (
    <div className="col-span-1 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">Recent Tasks</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold shadow-sm hover:scale-105 transition-transform"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-5 h-5" strokeWidth={3} />}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addTask} className="bg-bg-elevated rounded-[1.25rem] p-4 shadow-sm border border-border mb-4 flex gap-2 shrink-0">
          <input 
            autoFocus
            type="text" 
            placeholder="Task title..." 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="flex-1 min-w-0 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-black/30 dark:focus:border-white/30"
          />
          <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 rounded-lg font-semibold text-sm shrink-0 hover:opacity-90">Add</button>
        </form>
      )}

      <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin flex-1 pb-4 max-h-[350px]">
        {tasks.length === 0 && (
          <div className="text-sm text-text-secondary text-center py-4">No tasks found. Click + to add one.</div>
        )}
        
        {tasks.map(task => {
          let Icon = FileText;
          let iconBg = "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10";
          let iconColor = "text-black dark:text-white";
          let statusBadge = "bg-purple-500/10 text-purple-600 dark:text-purple-400";
          
          if (task.status === "Completed") {
            Icon = CheckCircle2;
            statusBadge = "bg-[#d4ff63]/20 text-[#8aa640] dark:text-[#d4ff63]";
          } else if (task.status === "Upcoming") {
            Icon = Clock;
            statusBadge = "bg-orange-500/10 text-orange-600 dark:text-orange-400";
          }

          return (
            <div 
              key={task.id} 
              onClick={() => toggleStatus(task.id)}
              className="bg-bg-elevated rounded-[1.25rem] p-4 shadow-sm border border-border flex items-center justify-between group cursor-pointer hover:border-text-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold text-text-primary mb-0.5 truncate pr-2" title={task.title}>{task.title}</h4>
                  <p className="text-[11px] text-text-secondary truncate">{task.time}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pl-2">
                <span className={`${statusBadge} text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap select-none hover:opacity-80 shrink-0`}>
                  {task.status}
                </span>
                <button 
                  onClick={(e) => removeTask(task.id, e)}
                  className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-colors hover:!bg-red-500/20 hover:!text-red-500 hover:border-transparent shrink-0"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

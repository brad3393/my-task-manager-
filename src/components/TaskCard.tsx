import React from 'react';
import { Task, TaskStatus } from '../types';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  ChevronRight,
  ListTodo,
} from 'lucide-react';

interface Props {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDuplicate: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<Props> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSubtask,
}) => {
  const [showSubtasks, setShowSubtasks] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const isOverdue =
    task.dueDate &&
    task.status !== 'completed' &&
    new Date(task.dueDate + 'T23:59:59') < new Date();

  const priorityColor = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-rose-100 text-rose-700 border-rose-200',
  }[task.priority];

  return (
    <div
      className={`group relative bg-white rounded-xl border p-4.5 transition-all shadow-xs hover:shadow-md ${
        task.status === 'completed'
          ? 'border-slate-200/80 bg-slate-50/60 opacity-80'
          : isOverdue
          ? 'border-rose-300 ring-1 ring-rose-200'
          : 'border-slate-200 hover:border-indigo-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleStatus(task.id)}
          className="mt-0.5 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
          title={task.status === 'completed' ? 'Mark incomplete' : 'Mark completed'}
        >
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-50" />
          ) : (
            <Circle className="w-5 h-5 hover:text-indigo-500" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${priorityColor}`}
            >
              {task.priority.toUpperCase()}
            </span>
            {task.category && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1 border border-slate-200">
                <Tag className="w-3 h-3" />
                {task.category}
              </span>
            )}
            {task.status === 'in_progress' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                In Progress
              </span>
            )}
          </div>

          <h3
            className={`font-semibold text-slate-800 text-sm leading-snug break-words ${
              task.status === 'completed' ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`text-xs text-slate-500 mt-1 line-clamp-2 ${
                task.status === 'completed' ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Subtasks summary */}
          {task.subtasks.length > 0 && (
            <div className="mt-2.5">
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 bg-slate-100/70 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors"
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>
                  {completedSubtasks}/{task.subtasks.length} subtasks
                </span>
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${
                    showSubtasks ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Collapsible Subtasks List */}
              {showSubtasks && (
                <div className="mt-2 space-y-1 pl-2 border-l-2 border-slate-200 ml-1">
                  {task.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onToggleSubtask(task.id, sub.id)}
                      className="flex items-center gap-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        readOnly
                        className="rounded text-indigo-600 pointer-events-none w-3.5 h-3.5"
                      />
                      <span
                        className={sub.completed ? 'line-through text-slate-400' : ''}
                      >
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metadata Footer */}
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 font-medium ${
                  isOverdue
                    ? 'text-rose-600 font-semibold'
                    : task.status === 'completed'
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {task.dueDate} {isOverdue ? '(Overdue)' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-7 z-30 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(task);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task.id);
                  }}
                  className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

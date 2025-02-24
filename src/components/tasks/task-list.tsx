"use client";

import { useState } from "react";
import { Task, addTask, updateTask, deleteTask } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  currentTask?: Task;
  setCurrentTask: (task: Task | undefined) => void;
  onTasksUpdate: () => Promise<void>;
}

export function TaskList({
  tasks,
  currentTask,
  setCurrentTask,
  onTasksUpdate,
}: TaskListProps) {
  const [newTaskName, setNewTaskName] = useState("");

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;

    const newTask: Task = {
      name: newTaskName,
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: Date.now(),
      timerState: {}, // Initialize empty timer state
    };

    await addTask(newTask);
    setNewTaskName("");
    onTasksUpdate();
  };

  const handleCompleteTask = async (task: Task) => {
    const updatedTask = { ...task, isCompleted: true };
    await updateTask(updatedTask);
    if (currentTask?.id === task.id) {
      setCurrentTask(undefined);
    }
    onTasksUpdate();
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
    if (currentTask?.id === taskId) {
      setCurrentTask(undefined);
    }
    onTasksUpdate();
  };

  const handleEstimateChange = async (task: Task, change: number) => {
    const updatedTask = {
      ...task,
      estimatedPomodoros: Math.max(1, task.estimatedPomodoros + change),
    };
    await updateTask(updatedTask);
    onTasksUpdate();
  };

  const handleTaskClick = (task: Task) => {
    setCurrentTask(currentTask?.id === task.id ? undefined : task);
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="What are you working on?"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
        />
        <Button onClick={handleAddTask}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {tasks
          .filter((task) => !task.isCompleted)
          .map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer ${
                currentTask?.id === task.id ? "border-2 border-primary" : ""
              }`}
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteTask(task);
                  }}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <span>{task.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEstimateChange(task, -1);
                    }}
                  >
                    -
                  </Button>
                  <span className="mx-2">
                    {task.completedPomodoros}/{task.estimatedPomodoros}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEstimateChange(task, 1);
                    }}
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    task.id && handleDeleteTask(task.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

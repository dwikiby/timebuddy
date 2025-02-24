"use client";

import { useState, useEffect } from "react";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TaskList } from "@/components/tasks/task-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, initDB, getAllTasks, resetDatabase } from "@/lib/db";

export default function Home() {
  const [timerType, setTimerType] = useState<
    "pomodoro" | "countdown" | "stopwatch"
  >("pomodoro");
  const [currentTask, setCurrentTask] = useState<Task | undefined>();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB();
        await loadTasks();
      } catch (error) {
        console.error("Error initializing database:", error);
        await resetDatabase();
        await loadTasks();
      }
    };

    initializeDB();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await getAllTasks();
      setTasks(loadedTasks);
      // Update currentTask if it exists in the loaded tasks
      if (currentTask) {
        const updatedCurrentTask = loadedTasks.find(
          (t) => t.id === currentTask.id
        );
        setCurrentTask(updatedCurrentTask);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      await resetDatabase();
      const loadedTasks = await getAllTasks();
      setTasks(loadedTasks);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Timebuddy</h1>

      <Tabs defaultValue="pomodoro" className="max-w-md mx-auto mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="pomodoro"
            onClick={() => setTimerType("pomodoro")}
          >
            Pomodoro
          </TabsTrigger>
          <TabsTrigger
            value="countdown"
            onClick={() => setTimerType("countdown")}
          >
            Countdown
          </TabsTrigger>
          <TabsTrigger
            value="stopwatch"
            onClick={() => setTimerType("stopwatch")}
          >
            Stopwatch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pomodoro">
          <TimerDisplay
            initialTime={25 * 60}
            type="pomodoro"
            currentTask={currentTask}
            onComplete={loadTasks}
          />
        </TabsContent>
        <TabsContent value="countdown">
          <TimerDisplay
            initialTime={60 * 60}
            type="countdown"
            currentTask={currentTask}
          />
        </TabsContent>
        <TabsContent value="stopwatch">
          <TimerDisplay
            initialTime={0}
            type="stopwatch"
            currentTask={currentTask}
          />
        </TabsContent>
      </Tabs>

      {currentTask && (
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">Current Task</h2>
          <p>{currentTask.name}</p>
          <p className="text-sm text-gray-500">
            Pomodoros: {currentTask.completedPomodoros}/
            {currentTask.estimatedPomodoros}
          </p>
        </div>
      )}

      <TaskList
        tasks={tasks}
        currentTask={currentTask}
        setCurrentTask={setCurrentTask}
        onTasksUpdate={loadTasks}
      />
    </main>
  );
}

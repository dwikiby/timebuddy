"use client";

import { useState, useEffect } from "react";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TaskList } from "@/components/tasks/task-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, initDB, getAllTasks, resetDatabase } from "@/lib/db";
import { WaterBackground } from "@/components/water-background";

export default function Home() {
  const [timerType, setTimerType] = useState<
    "pomodoro" | "countdown" | "stopwatch"
  >("pomodoro");
  const [currentTask, setCurrentTask] = useState<Task | undefined>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTime, setCurrentTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    document.title = `${formatTime(currentTime)} - Your Time Starts Now`;
  }, [currentTime]);

  useEffect(() => {
    if (timerType === "pomodoro") {
      const totalTime = 25 * 60;
      const remainingTime = currentTime;
      const newProgress = ((totalTime - remainingTime) / totalTime) * 100;
      setProgress(newProgress);
    }
  }, [currentTime, timerType]);

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

  return (
    <>
      <WaterBackground isRunning={isRunning} progress={progress} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Timebuddy</h1>
        <Tabs defaultValue="pomodoro" className="max-w-md mx-auto mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="pomodoro"
              onClick={() => {
                setTimerType("pomodoro");
                setCurrentTime(25 * 60);
              }}
            >
              Pomodoro
            </TabsTrigger>
            <TabsTrigger
              value="countdown"
              onClick={() => {
                setTimerType("countdown");
                setCurrentTime(60 * 60);
              }}
            >
              Countdown
            </TabsTrigger>
            <TabsTrigger
              value="stopwatch"
              onClick={() => {
                setTimerType("stopwatch");
                setCurrentTime(0);
              }}
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
              onTimeChange={setCurrentTime}
            />
          </TabsContent>
          <TabsContent value="countdown">
            <TimerDisplay
              initialTime={60 * 60}
              type="countdown"
              currentTask={currentTask}
              onTimeChange={setCurrentTime}
            />
          </TabsContent>
          <TabsContent value="stopwatch">
            <TimerDisplay
              initialTime={0}
              type="stopwatch"
              currentTask={currentTask}
              onTimeChange={setCurrentTime}
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
    </>
  );
}

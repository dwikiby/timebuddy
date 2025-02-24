// src/components/timer/timer-display.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task, updateTask } from "@/lib/db";
import { Progress } from "@/components/ui/progress";
import {
  requestNotificationPermission,
  showNotification,
} from "@/lib/notification";

interface TimerDisplayProps {
  initialTime: number;
  type: "pomodoro" | "countdown" | "stopwatch";
  currentTask?: Task;
  onComplete?: () => void;
  onTimeChange?: (time: number) => void;
}

export function TimerDisplay({
  initialTime,
  type,
  currentTask,
  onComplete,
  onTimeChange,
}: TimerDisplayProps) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    onTimeChange?.(time);
  }, [time, onTimeChange]);

  useEffect(() => {
    if (currentTask?.timerState?.[type]) {
      setTime(currentTask.timerState[type]!.currentTime);
      setIsRunning(currentTask.timerState[type]!.isRunning);
    } else {
      setTime(initialTime);
      setIsRunning(false);
    }
    requestNotificationPermission();
  }, [currentTask, type, initialTime]);

  // Save timer state for specific task
  const saveTimerState = async () => {
    if (currentTask?.id) {
      const updatedTask = {
        ...currentTask,
        timerState: {
          ...currentTask.timerState,
          [type]: { currentTime: time, isRunning },
        },
      };
      await updateTask(updatedTask);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = type === "stopwatch" ? prevTime + 1 : prevTime - 1;

          if (type !== "stopwatch" && newTime <= 0) {
            setIsRunning(false);
            handleComplete();
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, type]);

  // Save timer state when it changes
  useEffect(() => {
    saveTimerState();
  }, [time, isRunning]);

  const handleComplete = async () => {
    if (type === "pomodoro" && currentTask?.id) {
      const updatedTask = {
        ...currentTask,
        completedPomodoros: currentTask.completedPomodoros + 1,
        timerState: {
          ...currentTask.timerState,
          [type]: { currentTime: initialTime, isRunning: false },
        },
      };
      await updateTask(updatedTask);
      onComplete?.();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const calculateProgress = () => {
    if (type === "stopwatch") {
      return (time / (initialTime + 3600)) * 100;
    }
    return ((initialTime - time) / initialTime) * 100;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center p-6">
        <div className="text-8xl font-bold mb-4">{formatTime(time)}</div>

        <div className="w-full mb-4">
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? "destructive" : "default"}
            className="w-24"
          >
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button
            onClick={async () => {
              setIsRunning(false);
              setTime(initialTime);
              if (currentTask?.id) {
                const updatedTask = {
                  ...currentTask,
                  timerState: {
                    ...currentTask.timerState,
                    [type]: { currentTime: initialTime, isRunning: false },
                  },
                };
                await updateTask(updatedTask);
              }
            }}
            variant="outline"
            className="w-24"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

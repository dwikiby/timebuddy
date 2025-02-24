import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "timebuddy-db";
const DB_VERSION = 1;

export interface Task {
  id?: number;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: number;
  timerState?: {
    pomodoro?: { currentTime: number; isRunning: boolean };
    countdown?: { currentTime: number; isRunning: boolean };
    stopwatch?: { currentTime: number; isRunning: boolean };
  };
}
let dbInstance: IDBPDatabase | null = null;

export const initDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion > 0) {
        const storeNames = [...db.objectStoreNames];
        storeNames.forEach((storeName) => {
          db.deleteObjectStore(storeName);
        });
      }

      // create new store
      db.createObjectStore("sessions", {
        keyPath: "id",
        autoIncrement: true,
      });

      db.createObjectStore("tasks", {
        keyPath: "id",
        autoIncrement: true,
      });
    },
  });

  return dbInstance;
};

// Task related functions
export const addTask = async (task: Task) => {
  const db = await initDB();
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");
  const result = await store.add(task);
  await tx.done;
  return result;
};

export const updateTask = async (task: Task) => {
  const db = await initDB();
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");
  const result = await store.put(task);
  await tx.done;
  return result;
};

export const deleteTask = async (id: number) => {
  const db = await initDB();
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");
  const result = await store.delete(id);
  await tx.done;
  return result;
};

export const getAllTasks = async () => {
  const db = await initDB();
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");
  const result = await store.getAll();
  await tx.done;
  return result;
};

export const getActiveTasks = async () => {
  const tasks = await getAllTasks();
  return tasks.filter((task) => !task.isCompleted);
};

// Fungsi untuk menghapus dan membuat ulang database
export const resetDatabase = async () => {
  dbInstance = null;
  await deleteDatabase();
  return initDB();
};

// Fungsi untuk menghapus database
export const deleteDatabase = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
};

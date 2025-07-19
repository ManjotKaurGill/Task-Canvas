import { createContext, useState, useEffect, useCallback } from "react";
import { auth } from "../firebase/firebaseConfig";
import { getTasksFromFirebase, updateTaskInFirebase } from "../firebase/firebaseTasks";
import { onAuthStateChanged } from "firebase/auth";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const handleCompletion = async (id, currentStatus, savedInFirestore) => {
    if (savedInFirestore) {
      await updateTaskInFirebase(id, { isComplete: !currentStatus });
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isComplete: !currentStatus } : task
      )
    );
  };


  const fetchTasks = useCallback(async (teamId = null) => {
    const fetchedTasks = await getTasksFromFirebase(teamId);
    setTasks(fetchedTasks);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTasks();
      }
    });
    return () => unsubscribe();
  }, [fetchTasks]);

  return (
    <TaskContext.Provider value={{ tasks, setTasks, handleCompletion, fetchTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

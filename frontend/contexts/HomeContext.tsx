import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useAuthContext } from "./AuthContext";
import { API_URL } from "./AuthContext";

export interface StudyTask {
  _id: string;
  subject: string;
  task: string;
  priority: "High" | "Medium" | "Low";
  time: string;
  color: string;
}

interface HomeContextType {
  studyTasks: StudyTask[];
  setStudyTasks: React.Dispatch<React.SetStateAction<StudyTask[]>>;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: ReactNode }) {
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user?.isAuthenticated) {
      fetchTasks();
    } else {
      setStudyTasks([]);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`);
      setStudyTasks(res.data);
    } catch (err) {
      console.log("Failed to fetch tasks", err);
    }
  };

  return (
    <HomeContext.Provider value={{ studyTasks, setStudyTasks }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHomeContext() {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useHomeContext must be used within a HomeProvider");
  }
  return context;
}

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
  generateStudyPlan: (subject: string, deadline: string) => Promise<any>;
  addManualTask: (subject: string, date: string, taskTitle: string, time: string, priority: string) => Promise<any>;
  fetchTasks: () => Promise<void>;
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

  const generateStudyPlan = async (subject: string, deadline: string) => {
    try {
      const response = await axios.post(`${API_URL}/planner/generate`, { subject, deadline });
      await fetchTasks();
      return response.data;
    } catch (error) {
      console.error('Failed to generate study plan:', error);
      throw error;
    }
  };

  const addManualTask = async (subject: string, date: string, taskTitle: string, time: string, priority: string) => {
    try {
      // Create a task manually via the general /tasks endpoint
      const response = await axios.post(`${API_URL}/tasks`, {
        subject,
        task: taskTitle,
        date,
        time,
        priority
      });
      await fetchTasks();
      return response.data;
    } catch (error) {
      console.error('Failed to add manual task:', error);
      throw error;
    }
  };

  return (
    <HomeContext.Provider value={{ studyTasks, setStudyTasks, generateStudyPlan, addManualTask, fetchTasks }}>
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

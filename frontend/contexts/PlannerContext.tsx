import React, { createContext, useContext, useState, ReactNode } from "react";

export interface PlannerTask {
  time: string;
  subject: string;
  title: string;
  duration: string;
  color: string;
}

export interface DaySchedule {
  day: string;
  date: number;
  isToday?: boolean;
  tasks: PlannerTask[];
}

export interface UpcomingTask {
  date: string;
  subject: string;
  title: string;
  time: string;
}

interface PlannerContextType {
  weekSchedule: DaySchedule[];
  upcomingTasks: UpcomingTask[];
  setWeekSchedule: React.Dispatch<React.SetStateAction<DaySchedule[]>>;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([
    {
      day: "Mon",
      date: 23,
      tasks: [
        { time: "9:00 AM", subject: "Mathematics", title: "Calculus Lecture", duration: "2h", color: "bg-blue-100 text-blue-700 border-blue-300" },
        { time: "2:00 PM", subject: "Physics", title: "Lab Work", duration: "3h", color: "bg-purple-100 text-purple-700 border-purple-300" },
      ],
    },
    {
      day: "Tue",
      date: 24,
      isToday: true,
      tasks: [
        { time: "10:00 AM", subject: "Chemistry", title: "Organic Chemistry", duration: "1.5h", color: "bg-green-100 text-green-700 border-green-300" },
        { time: "1:00 PM", subject: "CompSci", title: "React Contexts Refactor", duration: "2.5h", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
        { time: "4:00 PM", subject: "Study", title: "Math Practice", duration: "2h", color: "bg-orange-100 text-orange-700 border-orange-300" },
      ],
    },
    {
      day: "Wed",
      date: 25,
      tasks: [
        { time: "9:00 AM", subject: "Biology", title: "Cell Structure lab", duration: "3h", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
        { time: "1:00 PM", subject: "Computer Science", title: "Algorithms", duration: "2h", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
      ],
    },
    {
      day: "Thu",
      date: 26,
      tasks: [
        { time: "9:00 AM", subject: "Mathematics", title: "Problem Solving", duration: "2h", color: "bg-blue-100 text-blue-700 border-blue-300" },
        { time: "1:00 PM", subject: "Physics", title: "Theory Review", duration: "1.5h", color: "bg-purple-100 text-purple-700 border-purple-300" },
        { time: "3:30 PM", subject: "Chemistry", title: "Synthesis Review", duration: "1h", color: "bg-green-100 text-green-700 border-green-300" },
      ],
    },
    {
      day: "Fri",
      date: 27,
      tasks: [
        { time: "10:00 AM", subject: "Economics", title: "Microeconomics", duration: "2h", color: "bg-teal-100 text-teal-700 border-teal-300" },
        { time: "3:00 PM", subject: "Study Group", title: "Exam Prep", duration: "3h", color: "bg-pink-100 text-pink-700 border-pink-300" },
      ],
    },
    {
      day: "Sat",
      date: 28,
      tasks: [
        { time: "11:00 AM", subject: "Project", title: "Hackathon Prep", duration: "4h", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
      ],
    },
    {
      day: "Sun",
      date: 29,
      tasks: [
        { time: "10:00 AM", subject: "Review", title: "Weekly Revision", duration: "2h", color: "bg-gray-100 text-gray-700 border-gray-300" },
        { time: "2:00 PM", subject: "Planning", title: "Next Week Goals", duration: "1h", color: "bg-gray-100 text-gray-800 border-gray-400" },
      ],
    },
  ]);

  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([
    { date: "Tomorrow", subject: "Mathematics", title: "Chapter 4 Quiz", time: "10:00 AM" },
    { date: "Mar 26", subject: "Physics", title: "Lab Report Due", time: "11:59 PM" },
    { date: "Mar 28", subject: "Chemistry", title: "Midterm Exam", time: "2:00 PM" },
    { date: "Mar 30", subject: "Computer Science", title: "React Context Deployment", time: "10:00 AM" },
    { date: "Apr 2", subject: "Biology", title: "Research Paper Submission", time: "11:59 PM" },
  ]);

  return (
    <PlannerContext.Provider value={{ weekSchedule, upcomingTasks, setWeekSchedule }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlannerContext() {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error("usePlannerContext must be used within a PlannerProvider");
  }
  return context;
}

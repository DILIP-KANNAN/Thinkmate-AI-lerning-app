import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Step {
  id: number;
  title: string;
  status: "completed" | "in-progress" | "locked";
  duration: string;
  resources: number;
  score: number | null;
  topics: string[];
}

export interface RecommendedResource {
  title: string;
  type: string;
  duration: string;
  rating: number;
}

export interface LearningPath {
  subject: string;
  goal: string;
  startDate: string;
  endDate: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
}

interface LearningPathContextType {
  learningPath: LearningPath;
  steps: Step[];
  recommendedResources: RecommendedResource[];
  setLearningPath: React.Dispatch<React.SetStateAction<LearningPath>>;
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
}

const LearningPathContext = createContext<LearningPathContextType | undefined>(undefined);

export function LearningPathProvider({ children }: { children: ReactNode }) {
  const [learningPath, setLearningPath] = useState<LearningPath>({
    subject: "Calculus & Advanced Mathematics",
    goal: "Master Derivatives, Integration & Differential Equations",
    startDate: "March 15, 2026",
    endDate: "May 30, 2026",
    progress: 35,
    currentStep: 3,
    totalSteps: 10,
  });

  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: "Limits and Continuity",
      status: "completed",
      duration: "1 week",
      resources: 12,
      score: 95,
      topics: ["Definition of Limits", "Limit Laws", "Continuity"],
    },
    {
      id: 2,
      title: "Introduction to Derivatives",
      status: "completed",
      duration: "1 week",
      resources: 15,
      score: 88,
      topics: ["Rate of Change", "Derivative Definition", "Basic Rules"],
    },
    {
      id: 3,
      title: "Differentiation Techniques",
      status: "in-progress",
      duration: "2 weeks",
      resources: 18,
      score: null,
      topics: ["Chain Rule", "Product Rule", "Quotient Rule", "Implicit Differentiation"],
    },
    {
      id: 4,
      title: "Applications of Derivatives",
      status: "locked",
      duration: "1.5 weeks",
      resources: 14,
      score: null,
      topics: ["Optimization", "Related Rates", "Curve Sketching"],
    },
    {
      id: 5,
      title: "Integration Basics",
      status: "locked",
      duration: "1 week",
      resources: 16,
      score: null,
      topics: ["Antiderivatives", "Definite Integrals", "Fundamental Theorem"],
    },
    {
      id: 6,
      title: "Integration Techniques",
      status: "locked",
      duration: "2 weeks",
      resources: 20,
      score: null,
      topics: ["Substitution", "Integration by Parts", "Partial Fractions"],
    },
    {
      id: 7,
      title: "Applications of Integration",
      status: "locked",
      duration: "1.5 weeks",
      resources: 17,
      score: null,
      topics: ["Area Between Curves", "Volumes", "Work"],
    },
    {
      id: 8,
      title: "Differential Equations Intro",
      status: "locked",
      duration: "2 weeks",
      resources: 15,
      score: null,
      topics: ["Separable Equations", "Linear Equations", "Modeling"],
    },
    {
      id: 9,
      title: "Sequences and Series",
      status: "locked",
      duration: "2 weeks",
      resources: 22,
      score: null,
      topics: ["Convergence", "Taylor Series", "Maclaurin Series"],
    },
    {
      id: 10,
      title: "Final Review and Assessment",
      status: "locked",
      duration: "1 week",
      resources: 25,
      score: null,
      topics: ["Comprehensive Review", "Practice Problems", "Mock Exam"],
    },
  ]);

  const [recommendedResources, setRecommendedResources] = useState<RecommendedResource[]>([
    { title: "Chain Rule Explained", type: "Video", duration: "15 min", rating: 4.8 },
    { title: "Product Rule Practice", type: "Exercises", duration: "30 min", rating: 4.6 },
    { title: "Differentiation Summary", type: "Notes", duration: "10 min", rating: 4.9 },
    { title: "Visualizing Vectors in 3D", type: "Interactive", duration: "25 min", rating: 4.7 },
  ]);

  return (
    <LearningPathContext.Provider value={{ learningPath, steps, recommendedResources, setLearningPath, setSteps }}>
      {children}
    </LearningPathContext.Provider>
  );
}

export function useLearningPathContext() {
  const context = useContext(LearningPathContext);
  if (context === undefined) {
    throw new Error("useLearningPathContext must be used within a LearningPathProvider");
  }
  return context;
}

import React, { createContext, useContext, useState, ReactNode, FC } from "react";
import { Brain, FileQuestion, Lightbulb, TrendingUp, Sparkles, BookOpen } from "lucide-react-native";

export interface AIModule {
  id: number;
  title: string;
  description: string;
  iconName: "Brain" | "Lightbulb" | "FileQuestion" | "TrendingUp" | "Sparkles" | "BookOpen";
  color: string;
  bgColor: string;
  iconColor: string;
  link: string;
  features?: string[];
}

interface AILearnContextType {
  modules: AIModule[];
  setModules: React.Dispatch<React.SetStateAction<AIModule[]>>;
  selectedNotes: string[];
  setSelectedNotes: React.Dispatch<React.SetStateAction<string[]>>;
}

const AILearnContext = createContext<AILearnContextType | undefined>(undefined);

export function AILearnProvider({ children }: { children: ReactNode }) {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [modules, setModules] = useState<AIModule[]>([
    {
      id: 1,
      title: "Exam Assistance",
      description: "Get personalized help for exam preparation with topic-wise guidance",
      iconName: "Brain",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      link: "/home/ai-learn/exam-assistance",
      features: ["Smart topic breakdown", "Practice questions", "Time management"],
    },
    {
      id: 2,
      title: "Concept Explanation",
      description: "Understand complex topics with AI-powered clear explanations",
      iconName: "Lightbulb",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      link: "/home/ai-learn/concept-explanation",
      features: ["Step-by-step breakdown", "Visual examples", "Related concepts"],
    },
    {
      id: 3,
      title: "Question Generator",
      description: "Generate custom questions and structured answers for practice",
      iconName: "FileQuestion",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      link: "/home/ai-learn/question-generator",
      features: ["Multiple choice", "Short answer queries", "Detailed feedback"],
    },
    {
      id: 5,
      title: "Summary Creator",
      description: "Condense long articles and notes into bite-sized summaries",
      iconName: "BookOpen",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      link: "/home/ai-learn/summary-creator",
      features: ["Key points extraction", "Mind maps", "Flashcard ready"],
    }
  ]);

  return (
    <AILearnContext.Provider value={{ modules, setModules, selectedNotes, setSelectedNotes }}>
      {children}
    </AILearnContext.Provider>
  );
}

export function useAILearnContext() {
  const context = useContext(AILearnContext);
  if (context === undefined) {
    throw new Error("useAILearnContext must be used within an AILearnProvider");
  }
  return context;
}

// Helper to map icon names to Lucide components
export const getIconComponent = (iconName: string): FC<any> => {
  switch (iconName) {
    case "Brain": return Brain;
    case "Lightbulb": return Lightbulb;
    case "FileQuestion": return FileQuestion;
    case "TrendingUp": return TrendingUp;
    case "Sparkles": return Sparkles;
    case "BookOpen": return BookOpen;
    default: return Brain;
  }
};

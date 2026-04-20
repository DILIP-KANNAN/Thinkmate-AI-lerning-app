import React from 'react';
import RAGLayout from '../components/RAGLayout';
import { Target } from 'lucide-react-native';

export default function ExamAssistanceScreen() {
  return (
    <RAGLayout
      moduleName="exam-assistance"
      title="Exam Assistance"
      description="Get personalized exam preparation guidance"
      icon={Target}
      ragEndpoint="/exam"
    />
  );
}

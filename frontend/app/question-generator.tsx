import React from 'react';
import RAGLayout from '../components/RAGLayout';
import { FileQuestion } from 'lucide-react-native';

export default function QuestionGeneratorScreen() {
  return (
    <RAGLayout
      moduleName="question-generator"
      title="Question Generator"
      description="Generate custom questions and structured answers for practice"
      icon={FileQuestion}
      ragEndpoint="/questions"
    />
  );
}

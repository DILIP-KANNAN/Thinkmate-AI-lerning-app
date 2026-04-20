import React from 'react';
import RAGLayout from '../components/RAGLayout';
import { Lightbulb } from 'lucide-react-native';

export default function ConceptExplanationScreen() {
  return (
    <RAGLayout
      moduleName="concept-explanation"
      title="Concept Explanation"
      description="Understand complex topics with AI-powered clear explanations"
      icon={Lightbulb}
      ragEndpoint="/concept"
    />
  );
}

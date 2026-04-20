import React from 'react';
import RAGLayout from '../components/RAGLayout';
import { BookOpen } from 'lucide-react-native';

export default function SummaryCreatorScreen() {
  return (
    <RAGLayout
      moduleName="summary-creator"
      title="Summary Creator"
      description="Condense long articles and notes into bite-sized summaries"
      icon={BookOpen}
      ragEndpoint="/summary"
    />
  );
}

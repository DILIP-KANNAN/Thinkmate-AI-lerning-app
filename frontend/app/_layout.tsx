import '../global.css';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { HomeProvider } from '../contexts/HomeContext';
import { LearningPathProvider } from '../contexts/LearningPathContext';
import { PlannerProvider } from '../contexts/PlannerContext';
import { CommunitiesProvider } from '../contexts/CommunitiesContext';
import { MyNotesProvider } from '../contexts/MyNotesContext';
import { AILearnProvider } from '../contexts/AILearnContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <HomeProvider>
        <LearningPathProvider>
          <PlannerProvider>
            <CommunitiesProvider>
              <MyNotesProvider>
                <AILearnProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                  </Stack>
                </AILearnProvider>
              </MyNotesProvider>
            </CommunitiesProvider>
          </PlannerProvider>
        </LearningPathProvider>
      </HomeProvider>
    </AuthProvider>
  );
}

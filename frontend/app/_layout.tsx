import '../global.css';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { HomeProvider } from '../contexts/HomeContext';
import { LearningPathProvider } from '../contexts/LearningPathContext';
import { CommunitiesProvider } from '../contexts/CommunitiesContext';
import { MyNotesProvider } from '../contexts/MyNotesContext';
import { AILearnProvider } from '../contexts/AILearnContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function RootLayout() {
  usePushNotifications();

  return (
    <AuthProvider>
      <HomeProvider>
        <LearningPathProvider>
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
        </LearningPathProvider>
      </HomeProvider>
    </AuthProvider>
  );
}

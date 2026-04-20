import { Redirect } from 'expo-router';
import { useAuthContext } from '../contexts/AuthContext';

import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-indigo-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (user?.isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/Welcome" />;
  }
}

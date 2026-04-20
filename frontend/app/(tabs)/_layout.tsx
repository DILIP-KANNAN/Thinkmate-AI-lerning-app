import { Tabs, Redirect, Link } from 'expo-router';
import { Home, Compass, MessageSquare, BookOpen, User, Brain } from 'lucide-react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { ActivityIndicator, View, TouchableOpacity, Platform } from 'react-native';

export default function TabLayout() {
  const { user, loading } = useAuthContext();

  if (loading) {
     return (
       <View className="flex-1 items-center justify-center bg-indigo-50">
          <ActivityIndicator size="large" color="#4f46e5" />
       </View>
     );
  }

  if (!user?.isAuthenticated) {
     return <Redirect href="/(auth)/Welcome" />;
  }
  return (
    <View className="flex-1">
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#6366f1' }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="path"
          options={{
            title: 'Path',
            tabBarIcon: ({ color }) => <Compass color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="communities"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User color={color} size={24} />,
          }}
        />
      </Tabs>

      {/* Global AI Learn Floater Button */}
      <Link href="/ai-learn" asChild>
        <TouchableOpacity 
          className="absolute right-6 bottom-24 bg-indigo-600 rounded-full w-14 h-14 items-center justify-center elevation-5 shadow-lg border-2 border-white"
          style={{
            shadowColor: "#4f46e5",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
          }}
        >
          <Brain color="white" size={26} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

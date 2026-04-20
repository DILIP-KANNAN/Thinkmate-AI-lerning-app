import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Brain, BookOpen, Users, Zap } from "lucide-react-native";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-indigo-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 flex-col items-center justify-center px-6 py-12">
          {/* Logo/Icon */}
          <View className="bg-indigo-600 rounded-3xl p-6 mb-8 shadow-lg">
            <Brain size={64} color="#ffffff" />
          </View>

          {/* Title */}
          <Text className="text-4xl font-semibold mb-4 text-center text-gray-900">
            AI Learning
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-12 max-w-md">
            Your intelligent companion for academic excellence
          </Text>

          {/* Features */}
          <View className="w-full max-w-sm space-y-4 mb-12">
            <View className="flex-row items-center gap-4 bg-white/70 rounded-2xl p-4">
              <View className="bg-indigo-100 rounded-full p-3">
                <BookOpen size={24} color="#4f46e5" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-900">Smart Learning</Text>
                <Text className="text-xs text-gray-600">AI-powered study assistance</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4 bg-white/70 rounded-2xl p-4">
              <View className="bg-purple-100 rounded-full p-3">
                <Users size={24} color="#9333ea" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-900">Communities</Text>
                <Text className="text-xs text-gray-600">Collaborate with peers</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4 bg-white/70 rounded-2xl p-4">
              <View className="bg-pink-100 rounded-full p-3">
                <Zap size={24} color="#db2777" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-900">Personalized Plans</Text>
                <Text className="text-xs text-gray-600">Custom learning paths</Text>
              </View>
            </View>
          </View>

          {/* CTA Buttons */}
          <View className="w-full max-w-sm gap-y-3">
            <Link href="/(auth)/Signup" asChild>
              <TouchableOpacity className="w-full bg-indigo-600 py-4 rounded-2xl shadow-lg">
                <Text className="text-white text-center font-medium">Get Started</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/Login" asChild>
              <TouchableOpacity className="w-full bg-white py-4 rounded-2xl border border-indigo-200">
                <Text className="text-indigo-600 text-center font-medium">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View className="items-center pb-6">
          <Text className="text-xs text-gray-500">
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

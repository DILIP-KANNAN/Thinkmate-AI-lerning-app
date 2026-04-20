import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { Mail, Lock, User, Brain } from "lucide-react-native";
import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

export default function SignupScreen() {
  const router = useRouter();
  const { signup, error } = useAuthContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const success = await signup(name, email, password);
    if (success) {
      router.push("/(auth)/ProfileSetup");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-indigo-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-6 py-12">
        <View className="flex-1 flex-col justify-center">
          {/* Header */}
          <View className="flex-col items-center mb-12">
            <View className="bg-indigo-600 rounded-3xl p-5 mb-6 shadow-lg">
              <Brain size={48} color="#ffffff" />
            </View>
            <Text className="text-3xl font-semibold text-gray-900 mb-2">Create Account</Text>
            <Text className="text-gray-600">Join thousands of learners</Text>
          </View>

          {/* Form */}
          <View className="w-full max-w-md mx-auto">
            {error && (
              <View className="bg-red-100 p-3 rounded-xl mb-4 border border-red-300">
                <Text className="text-red-600 text-center">{error}</Text>
              </View>
            )}
            <View className="space-y-4 mb-6 gap-y-4">
              <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex-row items-center px-4">
                <User size={20} color="#9ca3af" />
                <TextInput
                  placeholder="Full name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  className="flex-1 h-12 ml-3 text-base text-gray-900"
                />
              </View>

              <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex-row items-center px-4">
                <Mail size={20} color="#9ca3af" />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 h-12 ml-3 text-base text-gray-900"
                />
              </View>

              <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex-row items-center px-4">
                <Lock size={20} color="#9ca3af" />
                <TextInput
                  placeholder="Password (min. 8 characters)"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="flex-1 h-12 ml-3 text-base text-gray-900"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              className="w-full bg-indigo-600 py-4 rounded-2xl shadow-lg mb-4 items-center mt-2"
            >
              <Text className="text-white font-medium text-base">Create Account</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-2">
              <Text className="text-sm text-gray-600">Already have an account? </Text>
              <Link href="/(auth)/Login" asChild>
                <TouchableOpacity>
                  <Text className="text-sm text-indigo-600 font-medium">Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>

        <View className="items-center pb-6 mt-8">
          <Link href="/(auth)/Welcome" asChild>
            <TouchableOpacity>
              <Text className="text-sm text-gray-500 font-medium">← Back to welcome</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

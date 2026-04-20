import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Building2, GraduationCap, Check } from "lucide-react-native";
import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthContext();
  const [step, setStep] = useState(1);
  const [institution, setInstitution] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English Literature",
    "History",
    "Economics",
    "Psychology",
    "Engineering",
  ];

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleComplete = () => {
    updateProfile(institution, selectedSubjects);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-indigo-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-6 py-12">
        {/* Progress */}
        <View className="w-full max-w-md mx-auto mb-8 mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">Step {step} of 2</Text>
            <Text className="text-sm text-gray-600">{Math.round((step / 2) * 100)}%</Text>
          </View>
          <View className="h-2 bg-white rounded-full overflow-hidden">
            <View
              className="h-full bg-indigo-600"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </View>
        </View>

        {/* Content */}
        <View className="w-full max-w-md mx-auto flex-1">
          {step === 1 && (
            <View className="flex-1">
              <Text className="text-3xl font-semibold text-gray-900 mb-2">Your Institution</Text>
              <Text className="text-gray-600 mb-8">
                Tell us where you study (optional)
              </Text>

              <View className="space-y-4 mb-8 gap-y-4">
                <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex-row items-center px-4">
                  <Building2 size={20} color="#9ca3af" />
                  <TextInput
                    placeholder="University or school name"
                    placeholderTextColor="#9ca3af"
                    value={institution}
                    onChangeText={setInstitution}
                    className="flex-1 h-12 ml-3 text-base text-gray-900"
                  />
                </View>

                <View className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex-row items-start">
                  <GraduationCap size={20} color="#4f46e5" style={{ marginTop: 2 }} />
                  <View className="ml-3 flex-1 flex-col">
                    <Text className="text-sm font-medium text-indigo-900 mb-1">
                      Optional Verification
                    </Text>
                    <Text className="text-xs text-indigo-700">
                      Verify with your institution email to access exclusive communities
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-auto">
                <TouchableOpacity
                  onPress={() => setStep(2)}
                  className="w-full bg-indigo-600 py-4 rounded-2xl shadow-lg mb-2 items-center"
                >
                  <Text className="text-white font-medium text-base">Continue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep(2)}
                  className="w-full py-3 items-center"
                >
                  <Text className="text-gray-600 font-medium">Skip for now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <View className="flex-1">
              <Text className="text-3xl font-semibold text-gray-900 mb-2">Your Subjects</Text>
              <Text className="text-gray-600 mb-8">
                Select subjects you're currently studying
              </Text>

              <View className="flex-row flex-wrap justify-between gap-y-3 mb-8">
                {subjects.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject);
                  return (
                    <TouchableOpacity
                      key={subject}
                      onPress={() => toggleSubject(subject)}
                      className={`w-[48%] p-4 rounded-xl items-start justify-center ${
                        isSelected
                          ? "bg-indigo-600 shadow-lg"
                          : "bg-white shadow-sm border border-gray-100"
                      }`}
                    >
                      <View className="flex-row items-center justify-between w-full">
                        <Text className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-700'}`}>
                          {subject}
                        </Text>
                        {isSelected && <Check size={20} color="#ffffff" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="mt-auto">
                <TouchableOpacity
                  onPress={handleComplete}
                  disabled={selectedSubjects.length === 0}
                  className={`w-full py-4 rounded-2xl shadow-lg mb-2 items-center ${
                    selectedSubjects.length > 0
                      ? "bg-indigo-600"
                      : "bg-gray-300"
                  }`}
                >
                  <Text className={`font-medium text-base ${selectedSubjects.length > 0 ? "text-white" : "text-gray-500"}`}>
                    Complete Setup
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep(1)}
                  className="w-full py-3 items-center"
                >
                  <Text className="text-gray-600 font-medium">← Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

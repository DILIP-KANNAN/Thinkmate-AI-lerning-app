import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Link } from "expo-router";
import { Users, BookOpen, Calendar, Brain, ChevronRight, Star, Clock, TrendingUp } from "lucide-react-native";
import { useHomeContext } from "../../contexts/HomeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useCommunitiesContext } from "../../contexts/CommunitiesContext";

export default function HomeScreen() {
  const { studyTasks } = useHomeContext();
  const { user } = useAuthContext();
  const { communities } = useCommunitiesContext();

  const getSubjectName = (id: string) => {
    const comm = communities.find((c: any) => c._id === id);
    return comm ? comm.name : id;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="bg-indigo-600 px-6 pt-16 pb-12 rounded-b-[32px]">
          <Text className="text-3xl font-semibold text-white mb-2">
            Good Morning, {user?.name ? user.name.split(' ')[0] : 'Student'}
          </Text>
          <Text className="text-indigo-100 text-base">
            Ready to achieve your learning goals?
          </Text>
        </View>

        {/* Study Period Card */}
        <View className="px-6 -mt-6 mb-6">
          <View className="bg-white rounded-2xl shadow-md p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm border-gray-600 text-gray-500 mb-1">Current Period</Text>
                <Text className="text-xl font-medium text-gray-900">Spring Semester 2026</Text>
              </View>
              <View className="bg-indigo-100 rounded-full p-3">
                <Calendar size={24} color="#4f46e5" />
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#4b5563" />
              <Text className="text-sm text-gray-600 ml-1">{user?.subjects?.length || 0} active subjects • 12 weeks remaining</Text>
            </View>
          </View>
        </View>

        {/* Quick Access Buttons */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-medium text-gray-900 mb-4">Quick Access</Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            <Link href="/(tabs)/communities" asChild>
              <TouchableOpacity className="w-[48%] bg-white rounded-2xl p-5 shadow-sm">
                <View className="bg-purple-100 rounded-full p-3 w-12 h-12 items-center justify-center mb-3">
                  <Users size={24} color="#9333ea" />
                </View>
                <Text className="text-sm font-medium text-gray-900 mb-1">Communities</Text>
                <Text className="text-xs text-gray-500">Join study groups</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(tabs)/notes" asChild>
              <TouchableOpacity className="w-[48%] bg-white rounded-2xl p-5 shadow-sm">
                <View className="bg-blue-100 rounded-full p-3 w-12 h-12 items-center justify-center mb-3">
                  <BookOpen size={24} color="#2563eb" />
                </View>
                <Text className="text-sm font-medium text-gray-900 mb-1">My Notes</Text>
                <Text className="text-xs text-gray-500">Access resources</Text>
              </TouchableOpacity>
            </Link>

            {/* Actually, Planner might have its own stack but let's assume it goes to notes or a planner screen. */}
            <TouchableOpacity className="w-[48%] bg-white rounded-2xl p-5 shadow-sm">
              <View className="bg-green-100 rounded-full p-3 w-12 h-12 items-center justify-center mb-3">
                <Calendar size={24} color="#16a34a" />
              </View>
              <Text className="text-sm font-medium text-gray-900 mb-1">Study Planner</Text>
              <Text className="text-xs text-gray-500">Organize schedule</Text>
            </TouchableOpacity>

            <Link href="/ai-learn" asChild>
              <TouchableOpacity className="w-[48%] bg-white rounded-2xl p-5 shadow-sm">
                <View className="bg-indigo-100 rounded-full p-3 w-12 h-12 items-center justify-center mb-3">
                  <Brain size={24} color="#4f46e5" />
                </View>
                <Text className="text-sm font-medium text-gray-900 mb-1">AI Learning</Text>
                <Text className="text-xs text-gray-500">Smart assistance</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Suggested Study Tasks */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-medium text-gray-900">Suggested Tasks</Text>
            <Link href="/(tabs)/path" asChild>
              <TouchableOpacity className="flex-row items-center gap-1">
                <Text className="text-sm text-indigo-600 font-medium">View Path</Text>
                <ChevronRight size={16} color="#4f46e5" />
              </TouchableOpacity>
            </Link>
          </View>

          <View className="space-y-3 gap-y-3">
            {studyTasks.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 shadow-sm items-center justify-center py-10">
                <View className="bg-indigo-100 rounded-full p-4 mb-4">
                  <Brain size={32} color="#4f46e5" />
                </View>
                <Text className="text-lg font-medium text-gray-900 mb-2">No active tasks</Text>
                <Text className="text-sm text-gray-500 text-center mb-6">You don't have any tasks scheduled. Join a community to get started with your learning journey.</Text>
                <Link href="/(tabs)/communities" asChild>
                  <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center gap-2">
                    <Users size={18} color="#ffffff" />
                    <Text className="text-white font-medium">Explore Communities</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            ) : (
              studyTasks.map((task: any) => (
                <View
                  key={task._id || task.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <View className="flex-row items-start justify-between mb-3 w-full">
                    <View className="flex-1">
                      <View className="self-start px-3 py-1 bg-gray-100 rounded-full mb-2">
                        <Text className="text-xs text-gray-700">{getSubjectName(task.subject)}</Text>
                      </View>
                      <Text className="text-sm font-medium text-gray-900">{task.task}</Text>
                    </View>
                    <TouchableOpacity className="p-1">
                      <Star size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <Clock size={14} color="#6b7280" />
                        <Text className="text-xs text-gray-600 ml-1">{task.time}</Text>
                      </View>
                      <View
                        className={`px-2 py-1 rounded-full ${
                          task.priority === "High"
                            ? "bg-red-100"
                            : task.priority === "Medium"
                            ? "bg-yellow-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <Text className={`text-xs ${
                          task.priority === "High" ? "text-red-700" : task.priority === "Medium" ? "text-yellow-700" : "text-gray-700"
                        }`}>
                          {task.priority}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity>
                      <Text className="text-sm font-medium text-indigo-600">Start</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Progress Overview */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-medium text-gray-900 mb-4">Your Progress</Text>
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="bg-indigo-500 rounded-full p-4">
                <TrendingUp size={32} color="#ffffff" />
              </View>
              <View className="flex-1 ml-4 border border-x-0 border-y-0">
                <Text className="text-sm text-gray-600 mb-1">Weekly Study Time</Text>
                <Text className="text-2xl font-semibold text-gray-900">18.5 hours</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-sm text-gray-600">Target: 20 hours</Text>
              <Text className="text-sm text-green-600 font-medium">+12% from last week</Text>
            </View>
            <View className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden w-full">
              <View className="h-full bg-indigo-500 w-[92%]" />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

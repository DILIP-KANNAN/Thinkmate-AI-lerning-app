import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Calendar, Plus, Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { usePlannerContext } from "../contexts/PlannerContext";

export default function PlannerScreen() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 24));
  const [view, setView] = useState<"week" | "month">("week");

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const { weekSchedule, upcomingTasks } = usePlannerContext();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-16 pb-6">
        <Text className="text-3xl font-semibold text-gray-900 mb-6">Study Planner</Text>

        {/* Calendar Navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity className="p-2 bg-gray-100 rounded-lg">
              <ChevronLeft size={20} color="#4b5563" />
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-base font-medium text-gray-900">March 2026</Text>
              <Text className="text-xs text-gray-600">Week 13</Text>
            </View>
            <TouchableOpacity className="p-2 bg-gray-100 rounded-lg">
              <ChevronRight size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setView("week")}
              className={`px-4 py-2 rounded-lg ${view === "week" ? "bg-indigo-600" : "bg-gray-100"}`}
            >
              <Text className={`text-sm font-medium ${view === "week" ? "text-white" : "text-gray-700"}`}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView("month")}
              className={`px-4 py-2 rounded-lg ${view === "month" ? "bg-indigo-600" : "bg-gray-100"}`}
            >
              <Text className={`text-sm font-medium ${view === "month" ? "text-white" : "text-gray-700"}`}>Month</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Event Button */}
        <TouchableOpacity className="w-full bg-indigo-600 rounded-2xl py-3 flex-row items-center justify-center gap-2">
          <Plus size={20} color="#ffffff" />
          <Text className="text-white font-medium">Add Study Session</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Week View */}
        {view === "week" && (
          <View className="px-6 py-6">
            <View className="flex-row justify-between mb-4">
              {weekSchedule.map((day: any) => (
                <View
                  key={day.date}
                  className={`items-center flex-1 pb-2 border-b-2 ${
                    day.isToday ? "border-indigo-600" : "border-transparent"
                  }`}
                >
                  <Text className="text-xs text-gray-600 mb-1">{day.day}</Text>
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      day.isToday ? "bg-indigo-600" : "bg-transparent"
                    }`}
                  >
                    <Text className={`text-sm font-medium ${day.isToday ? "text-white" : "text-gray-900"}`}>
                      {day.date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="flex-row justify-between">
              {weekSchedule.map((day: any) => (
                <View key={day.date} className="flex-1 px-1 space-y-2 gap-y-2">
                  {day.tasks.length === 0 ? (
                    <View className="bg-gray-50 rounded-lg p-2 items-center justify-center min-h-[100px]">
                      <Text className="text-xs text-gray-400 text-center">No events</Text>
                    </View>
                  ) : (
                    day.tasks.map((task: any, idx: number) => {
                      const colorMap: any = {
                        "bg-red-50 text-red-700 border-red-200": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "#b91c1c" },
                        "bg-blue-50 text-blue-700 border-blue-200": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "#1d4ed8" },
                        "bg-green-50 text-green-700 border-green-200": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "#15803d" },
                        "bg-purple-50 text-purple-700 border-purple-200": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "#7e22ce" },
                        "bg-yellow-50 text-yellow-700 border-yellow-200": { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: "#a16207" },
                      };
                      const styles = colorMap[task.color] || { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: "#374151" };
                      
                      return (
                        <View
                          key={idx}
                          className={`border rounded-lg p-2 ${styles.bg} ${styles.border}`}
                        >
                          <View className="flex-row items-center gap-1 mb-1">
                            <Clock size={10} color={styles.icon} />
                            <Text className={`text-[10px] ${styles.text}`}>{task.time}</Text>
                          </View>
                          <Text numberOfLines={2} className={`text-xs font-medium mb-1 ${styles.text}`}>
                            {task.title}
                          </Text>
                          <Text className={`text-[10px] opacity-75 ${styles.text}`}>{task.duration}</Text>
                        </View>
                      );
                    })
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Tasks */}
        <View className="px-6 py-6 bg-white border border-x-0 border-y-gray-200">
          <Text className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</Text>
          <View className="space-y-3 gap-y-3">
            {upcomingTasks.map((task: any, idx: number) => (
              <View
                key={idx}
                className="bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between border border-gray-100"
              >
                <View className="flex-row items-center gap-4 flex-1 pr-4">
                  <View className="bg-indigo-100 rounded-lg p-3">
                    <Calendar size={20} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900 mb-1">{task.title}</Text>
                    <View className="flex-row items-center flex-wrap gap-2 text-xs text-gray-600">
                      <Text className="text-indigo-600 font-medium">{task.subject}</Text>
                      <Text className="text-gray-400">•</Text>
                      <Text>{task.date}</Text>
                      <Text className="text-gray-400">•</Text>
                      <Text>{task.time}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity>
                  <Text className="text-sm font-medium text-indigo-600">View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Study Stats */}
        <View className="px-6 py-6">
          <Text className="text-lg font-medium text-gray-900 mb-4">This Week's Stats</Text>
          <View className="flex-row justify-between w-full">
            <View className="bg-white rounded-2xl p-5 shadow-sm items-center w-[31%]">
              <BookOpen size={32} color="#4f46e5" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-semibold text-gray-900 mb-1">14</Text>
              <Text className="text-xs text-gray-600 text-center">Study Sessions</Text>
            </View>
            <View className="bg-white rounded-2xl p-5 shadow-sm items-center w-[31%]">
              <Clock size={32} color="#9333ea" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-semibold text-gray-900 mb-1">18.5</Text>
              <Text className="text-xs text-gray-600 text-center">Hours Studied</Text>
            </View>
            <View className="bg-white rounded-2xl p-5 shadow-sm items-center w-[31%]">
              <Calendar size={32} color="#16a34a" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-semibold text-gray-900 mb-1">3</Text>
              <Text className="text-xs text-gray-600 text-center">Upcoming Exams</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { Target, CheckCircle2, ChevronRight, Calendar as CalendarIcon, Beaker, Zap, Plus, Clock } from "lucide-react-native";
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { useAuthContext } from "../../contexts/AuthContext";
import { useCommunitiesContext } from "../../contexts/CommunitiesContext";
import { useHomeContext } from "../../contexts/HomeContext";

export default function LearningPathScreen() {
  const { user } = useAuthContext();
  const { communities } = useCommunitiesContext();
  const { studyTasks, generateStudyPlan, addManualTask } = useHomeContext();
  
  // State for AI generation
  const [selectedSubject, setSelectedSubject] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  // State for manual task addition
  const [manualSubject, setManualSubject] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualTaskTitle, setManualTaskTitle] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const enrolledSubjects = user?.subjects || [];

  const getSubjectName = (id: string) => {
    const comm = communities.find((c: any) => c._id === id);
    return comm ? comm.name : id;
  };

  useEffect(() => {
    const dates: any = {};
    studyTasks.forEach((task: any) => {
      if (task.date && task.date !== 'TBD' && task.date !== 'Unscheduled') {
        const d = new Date(task.date);
        if (!isNaN(d.getTime())) {
          const dateStr = d.toISOString().split('T')[0];
          dates[dateStr] = { marked: true, dotColor: '#4f46e5' };
        }
      }
    });
    setMarkedDates(dates);
  }, [studyTasks]);

  const handleGenerateSchedule = async () => {
    if (!selectedSubject || !endDate) return;
    setIsGenerating(true);
    try {
      await generateStudyPlan(selectedSubject, endDate);
      setScheduleGenerated(true);
      Alert.alert('Success', 'Study plan generated and scheduled!');
      setSelectedSubject("");
      setEndDate("");
    } catch (e) {
      console.log('Failed to generate study plan', e);
      Alert.alert('Error', 'Failed to generate study plan. Ensure deadline is a future date (e.g. 2026-06-15).');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManualTask = async () => {
    if (!manualSubject || !manualDate || !manualTaskTitle) {
      Alert.alert('Error', 'Subject, Date, and Task Title are required.');
      return;
    }
    setIsAddingTask(true);
    try {
      const parsedDate = new Date(manualDate);
      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date format");
      
      await addManualTask(
        manualSubject,
        parsedDate.toDateString(),
        manualTaskTitle,
        manualTime || "1h",
        "Medium"
      );
      Alert.alert('Success', 'Task added successfully!');
      setManualTaskTitle("");
      setManualTime("");
      setManualDate("");
    } catch (error) {
      Alert.alert('Error', 'Failed to add task. Please check the date format (YYYY-MM-DD).');
    } finally {
      setIsAddingTask(false);
    }
  };

  // Group tasks by Date, then by Subject
  const groupedTasks = studyTasks.reduce((acc: any, task: any) => {
    const dStr = task.date || 'Unscheduled';
    if (!acc[dStr]) acc[dStr] = {};
    if (!acc[dStr][task.subject]) acc[dStr][task.subject] = [];
    acc[dStr][task.subject].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'Unscheduled') return 1;
    if (b === 'Unscheduled') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="bg-indigo-600 px-6 pt-16 pb-8 rounded-b-[32px]">
          <View className="flex-row items-center gap-3 mb-4">
            <Target size={32} color="#ffffff" />
            <View>
              <Text className="text-3xl font-semibold text-white mb-1">Learning Path</Text>
              <Text className="text-indigo-100">Schedule your goal with AI</Text>
            </View>
          </View>
        </View>

        {/* AI Configuration Panel */}
        <View className="px-6 py-6 -mt-4">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-medium text-gray-900 mb-4">Plan Your Course</Text>
            
            {enrolledSubjects.length === 0 ? (
              <View className="bg-orange-50 p-4 rounded-xl mb-4">
                <Text className="text-sm text-orange-800">You must join a community to select a subject for your learning path.</Text>
              </View>
            ) : (
              <>
                <Text className="text-sm font-medium text-gray-700 mb-2">Select Subject</Text>
                <View className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
                  <Picker
                    selectedValue={selectedSubject}
                    onValueChange={(itemValue: string) => setSelectedSubject(itemValue)}
                    style={{ height: 50, width: '100%', backgroundColor: 'transparent' }}
                  >
                    <Picker.Item label="-- Choose an Enrolled Subject --" value="" />
                    {enrolledSubjects.map((subject, idx) => (
                      <Picker.Item key={idx} label={getSubjectName(subject)} value={subject} />
                    ))}
                  </Picker>
                </View>

                <Text className="text-sm font-medium text-gray-700 mb-2">Expected End Date (YYYY-MM-DD)</Text>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="e.g. 2026-06-30"
                  className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 mb-6"
                />

                <TouchableOpacity 
                  onPress={handleGenerateSchedule}
                  disabled={!selectedSubject || !endDate || isGenerating}
                  className={`py-4 rounded-xl flex-row justify-center items-center gap-2 ${(!selectedSubject || !endDate || isGenerating) ? 'bg-gray-300' : 'bg-indigo-600'}`}
                >
                  <Zap size={20} color="#ffffff" />
                  <Text className="text-white font-medium text-base">{isGenerating ? 'Deploying...' : 'Generate Schedule'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Calendar View */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-medium text-gray-900 mb-4">Your Schedule Overview</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Calendar
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: '#4f46e5',
                todayTextColor: '#4f46e5',
                arrowColor: '#4f46e5',
              }}
            />
            {scheduleGenerated && (
              <View className="mt-4 p-4 bg-indigo-50 rounded-xl flex-row items-center gap-3">
                <CheckCircle2 size={24} color="#4f46e5" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-indigo-900">Schedule Active</Text>
                  <Text className="text-xs text-indigo-700 opacity-80 mt-1">
                    Your customized path is generated and synced with your calendar.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Grouped Tasks Display */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-medium text-gray-900 mb-4">Assigned Tasks</Text>
          {sortedDates.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl shadow-sm items-center justify-center min-h-[100px]">
              <Text className="text-sm text-gray-500">No tasks scheduled yet.</Text>
            </View>
          ) : (
            sortedDates.map((dateStr) => (
              <View key={dateStr} className="mb-6">
                <View className="flex-row items-center gap-2 mb-3">
                  <CalendarIcon size={18} color="#4b5563" />
                  <Text className="text-md font-semibold text-gray-800">{dateStr}</Text>
                </View>
                {Object.keys(groupedTasks[dateStr]).map((subject) => (
                  <View key={subject} className="mb-4 pl-4 border-l-2 border-indigo-200">
                    <Text className="text-sm font-bold text-indigo-600 mb-2">{getSubjectName(subject)}</Text>
                    <View className="space-y-2 gap-y-2">
                      {groupedTasks[dateStr][subject].map((task: any, idx: number) => (
                        <View key={idx} className="bg-white rounded-xl p-3 shadow-sm flex-row items-start justify-between border border-gray-100">
                          <View className="flex-1 pr-2">
                            <Text className="text-sm font-medium text-gray-900 mb-1">{task.task}</Text>
                            <View className="flex-row items-center gap-3 mt-1">
                              <View className="flex-row items-center">
                                <Clock size={12} color="#6b7280" />
                                <Text className="text-xs text-gray-500 ml-1">{task.time}</Text>
                              </View>
                              <View className={`px-2 py-[2px] rounded-full ${task.priority === 'High' ? 'bg-red-100' : 'bg-gray-100'}`}>
                                <Text className={`text-[10px] ${task.priority === 'High' ? 'text-red-700' : 'text-gray-700'}`}>{task.priority}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        {/* Manual Task Addition */}
        <View className="px-6 pb-8">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-4">
              <Plus size={20} color="#4f46e5" />
              <Text className="text-lg font-medium text-gray-900">Add Manual Task</Text>
            </View>
            
            <Text className="text-sm font-medium text-gray-700 mb-2">Subject</Text>
            <View className="border border-gray-200 rounded-xl mb-4 overflow-hidden bg-gray-50">
              <Picker
                selectedValue={manualSubject}
                onValueChange={(itemValue: string) => setManualSubject(itemValue)}
                style={{ height: 50, width: '100%', backgroundColor: 'transparent' }}
              >
                <Picker.Item label="-- Choose Subject --" value="" />
                {enrolledSubjects.map((subject, idx) => (
                  <Picker.Item key={idx} label={getSubjectName(subject)} value={subject} />
                ))}
              </Picker>
            </View>

            <Text className="text-sm font-medium text-gray-700 mb-2">Date (YYYY-MM-DD)</Text>
            <TextInput
              value={manualDate}
              onChangeText={setManualDate}
              placeholder="e.g. 2026-05-20"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 mb-4"
            />

            <Text className="text-sm font-medium text-gray-700 mb-2">Task Title</Text>
            <TextInput
              value={manualTaskTitle}
              onChangeText={setManualTaskTitle}
              placeholder="e.g. Read Chapter 5"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 mb-4"
            />

            <Text className="text-sm font-medium text-gray-700 mb-2">Duration (e.g. 1h 30m)</Text>
            <TextInput
              value={manualTime}
              onChangeText={setManualTime}
              placeholder="e.g. 45m"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 mb-6"
            />

            <TouchableOpacity 
              onPress={handleAddManualTask}
              disabled={isAddingTask || !manualSubject || !manualTaskTitle || !manualDate}
              className={`py-3 rounded-xl items-center ${isAddingTask || !manualSubject || !manualTaskTitle || !manualDate ? 'bg-indigo-300' : 'bg-indigo-600'}`}
            >
              <Text className="text-white font-medium">{isAddingTask ? 'Adding...' : 'Add Task'}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

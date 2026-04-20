import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { Target, CheckCircle2, ChevronRight, Calendar as CalendarIcon, Beaker, Zap } from "lucide-react-native";
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { useAuthContext, API_URL } from "../../contexts/AuthContext";
import { useCommunitiesContext } from "../../contexts/CommunitiesContext";
import { useHomeContext } from "../../contexts/HomeContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Assuming you have a communities context or user data with subjects

export default function LearningPathScreen() {
  const { user } = useAuthContext();
  const { communities } = useCommunitiesContext();
  const { setStudyTasks } = useHomeContext();
  
  // State for configuration
  const [selectedSubject, setSelectedSubject] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  // user.subjects are the enrolled communities subjects
  const enrolledSubjects = user?.subjects || [];

  const getSubjectName = (id: string) => {
    const comm = communities.find((c: any) => c._id === id);
    return comm ? comm.name : id;
  };

  const handleGenerateSchedule = async () => {
    if (!selectedSubject || !endDate) return;
    
    setIsGenerating(true);
    // Automation engine placeholder
    // Mark the end date
    // Create dummy dates between today and end date
    const dates: any = {};
    const today = new Date();
    const end = new Date(endDate);
    
    // Simple mock logic to highlight every other day
    let current = new Date(today);
    current.setDate(current.getDate() + 1); // start tomorrow

    while (current < end) {
      const dateString = current.toISOString().split('T')[0];
      dates[dateString] = { marked: true, dotColor: '#4f46e5' };
      current.setDate(current.getDate() + 2); // Every other day
    }

    dates[endDate] = { selected: true, selectedColor: '#ef4444', marked: true, dotColor: 'white' }; // Target Date

    setMarkedDates(dates);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const dummyTask = {
        subject: selectedSubject, 
        task: `AI Generated: Read materials for ${getSubjectName(selectedSubject)}`,
        priority: "High",
        time: "45m",
        color: "#4f46e5"
      };

      const resp = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dummyTask)
      });
      if (resp.ok) {
        const savedTask = await resp.json();
        setStudyTasks((prev: any) => [...prev, savedTask]);
      }
    } catch (e) {
      console.log('Failed to create dummy automation task', e);
    } finally {
      setIsGenerating(false);
      setScheduleGenerated(true);
    }
  };

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

        {/* Configuration Panel */}
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
                  placeholder="e.g. 2026-05-30"
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
              </  >
            )}
          </View>
        </View>

        {/* Calendar View */}
        <View className="px-6 pb-8">
          <Text className="text-lg font-medium text-gray-900 mb-4">AI Target Schedule</Text>
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
                    Your customized path is generated. The automation engine will assign daily tasks to these dates.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

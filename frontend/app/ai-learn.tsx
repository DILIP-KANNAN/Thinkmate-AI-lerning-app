import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Link, useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Brain, FileQuestion, Lightbulb, FileText, ChevronRight, Sparkles, Target, ArrowLeft, CheckSquare, Square, FolderOpen, Share2, Clock } from "lucide-react-native";
import { useAILearnContext } from "../contexts/AILearnContext";
import { useMyNotesContext } from "../contexts/MyNotesContext";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../contexts/AuthContext';

export default function AILearnScreen() {
  const { modules, selectedNotes, setSelectedNotes } = useAILearnContext();
  const { subjects, notesBySubject } = useMyNotesContext();
  const { autoStep } = useLocalSearchParams();
  const [step, setStep] = useState(autoStep ? parseInt(autoStep as string) : 1);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  const [chatHistory, setChatHistory] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
         try {
           const token = await AsyncStorage.getItem('userToken');
           const res = await fetch(`${API_URL}/chats`, {
             headers: { 'Authorization': `Bearer ${token}` }
           });
           if (res.ok) {
              const data = await res.json();
              setChatHistory(data);
           }
         } catch(e) {
           console.log("Failed bringing history down", e);
         }
      };
      fetchHistory();
    }, [])
  );

  useEffect(() => {
    if (autoStep) {
       setStep(parseInt(autoStep as string));
    }
  }, [autoStep]);

  const handleContinue = async () => {
    if (selectedNotes.length === 0) return;
    
    setSyncing(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/chats/sync-rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedNotes })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert("Success", `Successfully synced ${selectedNotes.length} documents (${data.chunks_processed || 0} chunks extracted)!`);
        setStep(2);
      } else {
        throw new Error(data.message || 'Failed to sync to RAG backend');
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Something went wrong syncing notes.");
    } finally {
      setSyncing(false);
    }
  };

  const toggleNote = (noteId: string) => {
    if (selectedNotes.includes(noteId)) {
       setSelectedNotes(prev => prev.filter(id => id !== noteId));
    } else {
       setSelectedNotes(prev => [...prev, noteId]);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileQuestion": return FileQuestion;
      case "Lightbulb": return Lightbulb;
      case "FileText": return FileText;
      case "Target": return Target;
      default: return Brain;
    }
  };

  const formatSessionDate = (isoString: string) => {
     if (!isoString) return "Unknown";
     const date = new Date(isoString);
     const diff = new Date().getTime() - date.getTime();
     const hours = Math.floor(diff / (1000 * 60 * 60));
     if (hours < 1) return `Just now`;
     if (hours < 24) return `${hours} hours ago`;
     if (hours < 48) return `Yesterday`;
     return `${Math.floor(hours / 24)} days ago`;
  };

  const getSessionTitle = (session: any) => {
    if (session.selectedNotes && session.selectedNotes.length > 0) {
       return `${session.selectedNotes[0].title}`;
    }
    return `AI Session`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="bg-indigo-600 px-6 pt-16 pb-8 rounded-b-[32px]">
          {step === 1 ? (
             <TouchableOpacity onPress={() => router.replace('/')} className="mb-4 bg-white/20 self-start p-2 rounded-full">
                <ArrowLeft size={24} color="#ffffff" />
             </TouchableOpacity>
          ) : (
             <TouchableOpacity onPress={() => setStep(1)} className="mb-4 bg-white/20 self-start p-2 rounded-full">
                <ArrowLeft size={24} color="#ffffff" />
             </TouchableOpacity>
          )}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="bg-white/20 rounded-2xl p-3">
              <Brain size={32} color="#ffffff" />
            </View>
            <View>
              <Text className="text-3xl font-semibold text-white mb-1">AI RAG Pipeline</Text>
              <Text className="text-indigo-100">{step === 1 ? "1. Select Context Source" : "2. Choose Generator Module"}</Text>
            </View>
          </View>
        </View>

        {/* Chat History Session */}
        <View className="px-6 py-6 bg-indigo-500 rounded-b-3xl -mt-6">
          <View className="flex-row items-center justify-between mb-4 mt-2">
             <Text className="text-white font-semibold text-lg">Recent AI Sessions</Text>
             <TouchableOpacity>
                <Text className="text-indigo-200 text-sm font-medium">View All</Text>
             </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row w-full -ml-2 px-2" contentContainerStyle={{ paddingRight: 24 }}>
             {chatHistory.length === 0 && (
                <View className="py-4 px-4">
                  <Text className="text-indigo-200">No active AI sessions found.</Text>
                </View>
             )}
             {chatHistory.map(session => {
                const routeMapping: any = {
                  "/home/ai-learn/question-generator": "/question-generator",
                  "/home/ai-learn/concept-explanation": "/concept-explanation",
                  "/home/ai-learn/exam-assistance": "/exam-assistance",
                  "/home/ai-learn/summary-creator": "/summary-creator"
                };
                const destRoute = routeMapping[session.module] || "/";
                
                return (
                 <Link 
                   key={session._id} 
                   href={{ pathname: destRoute, params: { chatId: session._id } }} 
                   asChild
                 >
                   <TouchableOpacity className="bg-white/10 border border-white/20 rounded-2xl p-4 w-60 mr-4">
                     <View className="flex-row justify-between items-start mb-2">
                        <View className="bg-indigo-400/30 px-2 py-1 rounded-md">
                           <Text className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider">{session.module.split('-').join(' ')}</Text>
                        </View>
                        <TouchableOpacity 
                           className="bg-white/10 p-1.5 rounded-full" 
                           onPress={() => Alert.alert("Share Session", "Session link successfully copied to clipboard!")}
                        >
                           <Share2 size={14} color="#e0e7ff" />
                        </TouchableOpacity>
                     </View>
                     <Text className="text-white font-semibold text-base mb-1" numberOfLines={1}>{getSessionTitle(session)}</Text>
                     <View className="flex-row items-center gap-1 mt-2">
                        <Clock size={12} color="#c7d2fe" />
                        <Text className="text-indigo-200 text-xs">{formatSessionDate(session.updatedAt)}</Text>
                     </View>
                   </TouchableOpacity>
                 </Link>
                );
             })}
          </ScrollView>
        </View>

        {/* Step Content */}
        {step === 1 ? (
          <View className="px-6 py-6">
             <Text className="text-lg font-medium text-gray-900 mb-4">Select Associated Notes</Text>
             <Text className="text-sm text-gray-500 mb-6">Choose one or more documents from your folders to serve as knowledge context for the AI generators.</Text>

             <View className="space-y-6 gap-y-6 mb-8">
               {subjects.filter(s => s !== "All").length === 0 ? (
                  <View className="items-center py-8">
                     <FolderOpen size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
                     <Text className="text-gray-500 text-center">No subjects or notes available. Enroll or upload materials in My Notes first.</Text>
                  </View>
               ) : subjects.filter(s => s !== "All").map(subjectName => {
                 const subjectNotes = notesBySubject[subjectName] || [];
                 if (subjectNotes.length === 0) return null;

                 return (
                   <View key={subjectName} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                     <View className="bg-indigo-50 px-4 py-3 flex-row items-center gap-2 border-b border-indigo-100">
                        <FolderOpen size={18} color="#4f46e5" />
                        <Text className="font-semibold text-indigo-900 text-base">{subjectName}</Text>
                     </View>
                     <View className="p-2">
                        {subjectNotes.map(note => {
                           const isSelected = selectedNotes.includes(note._id);
                           return (
                             <TouchableOpacity 
                               key={note._id}
                               onPress={() => toggleNote(note._id)}
                               className={`flex-row items-center justify-between p-3 rounded-xl mb-1 ${isSelected ? 'bg-indigo-50/50' : 'bg-transparent'}`}
                             >
                               <View className="flex-row items-center gap-3 flex-1 pr-4">
                                 {isSelected ? (
                                    <CheckSquare size={22} color="#4f46e5" />
                                 ) : (
                                    <Square size={22} color="#9ca3af" />
                                 )}
                                 <View>
                                    <Text className="font-medium text-gray-900" numberOfLines={1}>{note.title}</Text>
                                    <Text className="text-xs text-gray-500 uppercase">{note.topic || (note as any).fileType}</Text>
                                 </View>
                               </View>
                             </TouchableOpacity>
                           )
                        })}
                     </View>
                   </View>
                 )
               })}
             </View>

             <TouchableOpacity 
                disabled={selectedNotes.length === 0 || syncing}
                onPress={handleContinue}
                className={`w-full py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-sm ${selectedNotes.length > 0 ? 'bg-indigo-600' : 'bg-gray-300'}`}
             >
                {syncing && <ActivityIndicator color="#ffffff" />}
                <Text className="text-white font-semibold text-lg">{syncing ? 'Extracting chunks...' : `Continue to Generators (${selectedNotes.length})`}</Text>
             </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 py-8">
            <Text className="text-lg font-medium text-gray-900 mb-6">Learning Modules</Text>
            <View className="space-y-6 gap-y-6">
              {modules.map((module: any) => {
                const Icon = getIcon(module.iconName) as React.ElementType;
                const isPink = module.color.includes("pink");
                const isPurple = module.color.includes("purple");
                const isBlue = module.color.includes("blue");
                const bgColor = isPink ? "bg-pink-600" : isPurple ? "bg-purple-600" : isBlue ? "bg-blue-600" : "bg-indigo-600";
                const routeMapping: any = {
                  "/home/ai-learn/question-generator": "/question-generator",
                  "/home/ai-learn/concept-explanation": "/concept-explanation",
                  "/home/ai-learn/exam-assistance": "/exam-assistance",
                  "/home/ai-learn/summary-creator": "/summary-creator"
                };

                return (
                  <Link key={module.id} href={routeMapping[module.link] || "/"} asChild>
                    <TouchableOpacity className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                      <View className={`${bgColor} p-6 flex-row items-start justify-between`}>
                        <View className="flex-row items-center gap-4 flex-1">
                          <View className="bg-white/20 rounded-2xl p-4">
                            <Icon size={32} color="#ffffff" />
                          </View>
                          <View className="flex-1 pr-2">
                            <Text className="text-xl font-semibold text-white mb-1">{module.title}</Text>
                            <Text className="text-sm text-white/90">{module.description}</Text>
                          </View>
                        </View>
                        <ChevronRight size={24} color="#ffffff" />
                      </View>

                      <View className="p-6 flex-row flex-wrap gap-2">
                        {module.features?.map((feature: string, idx: number) => {
                           const pillBg = isPink ? "bg-pink-50" : isPurple ? "bg-purple-50" : isBlue ? "bg-blue-50" : "bg-indigo-50";
                           const pillText = isPink ? "text-pink-700" : isPurple ? "text-purple-700" : isBlue ? "text-blue-700" : "text-indigo-700";
                           return (
                            <View key={idx} className={`${pillBg} px-3 py-2 rounded-full`}>
                              <Text className={`text-xs font-medium ${pillText}`}>{feature}</Text>
                            </View>
                           );
                        })}
                      </View>
                    </TouchableOpacity>
                  </Link>
                );
              })}
            </View>
          </View>
        )}

        {/* Usage Tips */}
        <View className="px-6 pb-8">
          <View className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Sparkles size={20} color="#f97316" />
              <Text className="text-base font-semibold text-gray-900">Pro Tips</Text>
            </View>
            <View className="space-y-2 gap-y-3">
              <View className="flex-row items-start gap-2">
                <Text className="text-orange-500 font-bold">•</Text>
                <Text className="text-sm text-gray-700 pr-4">Upload your study materials for personalized AI assistance</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-orange-500 font-bold">•</Text>
                <Text className="text-sm text-gray-700 pr-4">Use specific questions to get more accurate answers</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-orange-500 font-bold">•</Text>
                <Text className="text-sm text-gray-700 pr-4">Save important responses to your personal workspace</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

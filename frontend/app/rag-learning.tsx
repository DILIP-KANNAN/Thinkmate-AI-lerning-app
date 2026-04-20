import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { Link } from "expo-router";
import { ArrowLeft, Upload, ZoomIn, ZoomOut, Send, Sparkles, ThumbsUp, Copy } from "lucide-react-native";
import { useState } from "react";

export default function RAGLearningScreen() {
  const [question, setQuestion] = useState("");
  const [zoom, setZoom] = useState(100);
  const [hasDocument, setHasDocument] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    {
      type: "ai",
      content: "Hello! I've analyzed your document. Feel free to ask me anything about the content, or select any section to get specific explanations.",
      confidence: 95,
      sources: [],
    },
  ]);

  const suggestedQuestions = [
    "Explain this concept in simple terms",
    "What are the key points in this section?",
    "Give me examples related to this topic",
    "How does this relate to other concepts?",
  ];

  const handleSendQuestion = () => {
    if (!question.trim()) return;

    setChatHistory([
      ...chatHistory,
      { type: "user", content: question, confidence: 0, sources: [] },
      {
        type: "ai",
        content: `Based on the selected content about derivatives, the chain rule is a fundamental technique used to differentiate composite functions. It states that if you have a function g(f(x)), the derivative is g'(f(x)) × f'(x). This is particularly useful when dealing with nested functions.`,
        confidence: 92,
        sources: ["Page 3, Section 2.4", "Page 5, Example 3"],
      },
    ]);
    setQuestion("");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50 flex-col"
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4 flex-row items-center justify-between z-10">
        <Link href="/ai-learn" asChild>
          <TouchableOpacity className="flex-row items-center gap-2">
            <ArrowLeft size={20} color="#4b5563" />
            <Text className="text-sm font-medium text-gray-600">Back</Text>
          </TouchableOpacity>
        </Link>
        <Text className="text-base font-semibold text-gray-900">Interactive Learning</Text>
        <TouchableOpacity>
          <Text className="text-sm font-medium text-indigo-600">Save Session</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-col overflow-hidden">
        {/* PDF Viewer Section - Top Half */}
        <View className="flex-1 bg-gray-800 border-b-4 border-indigo-600">
          {hasDocument ? (
            <View className="flex-1 flex-col">
              <View className="bg-gray-900 px-4 py-3 flex-row items-center justify-between">
                <Text className="text-sm text-gray-300">Calculus_Chapter3.pdf</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => setZoom(Math.max(50, zoom - 10))} className="p-2 bg-gray-800 rounded-lg">
                    <ZoomOut size={16} color="#d1d5db" />
                  </TouchableOpacity>
                  <Text className="text-sm text-gray-300 w-10 text-center">{zoom}%</Text>
                  <TouchableOpacity onPress={() => setZoom(Math.min(200, zoom + 10))} className="p-2 bg-gray-800 rounded-lg">
                    <ZoomIn size={16} color="#d1d5db" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24 }}>
                <View style={{ transform: [{ scale: zoom / 100 }] }}>
                  <Text className="text-2xl font-bold text-gray-900 mb-4">Chapter 3: Derivatives</Text>
                  
                  <View className="mb-6">
                    <Text className="text-xl font-semibold text-gray-900 mb-3">3.1 Introduction to Derivatives</Text>
                    <Text className="text-gray-700 leading-6 mb-3">
                      The derivative of a function represents the rate of change of that function with respect to one of its variables. In calculus, the derivative is a fundamental concept that describes how a function changes as its input changes.
                    </Text>
                    <View className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-3">
                      <Text className="text-gray-800 font-bold mb-1">Definition:</Text>
                      <Text className="text-gray-800">The derivative of f(x) at a point x is defined as: f'(x) = lim(h→0) [f(x+h) - f(x)] / h</Text>
                    </View>
                  </View>

                  <View className="mb-6">
                    <Text className="text-xl font-semibold text-gray-900 mb-3">3.2 The Chain Rule</Text>
                    <Text className="text-gray-700 leading-6 mb-3">
                      The chain rule is a formula for computing the derivative of the composition of two or more functions. If a variable z depends on the variable y, which itself depends on the variable x, then z depends on x as well.
                    </Text>
                    <View className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <Text className="text-gray-800 font-bold mb-1">Formula:</Text>
                      <Text className="text-gray-800">If h(x) = f(g(x)), then h'(x) = f'(g(x)) × g'(x)</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center p-6">
              <Upload size={64} color="#4b5563" style={{ marginBottom: 16 }} />
              <Text className="text-lg font-medium text-white mb-2">No Document Loaded</Text>
              <Text className="text-gray-400 text-center mb-6">Upload a PDF to start learning</Text>
              <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-xl">
                <Text className="text-white font-medium">Upload Document</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* AI Interaction Panel - Bottom Half */}
        <View className="flex-1 bg-white">
          <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 16 }}>
            {chatHistory.map((message, idx) => (
              <View key={idx} className={`flex-row mb-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                {message.type === "ai" && (
                  <View className="mr-3 mt-1">
                    <View className="bg-indigo-100 rounded-full p-2">
                      <Sparkles size={20} color="#4f46e5" />
                    </View>
                  </View>
                )}
                
                <View className={`max-w-[85%] rounded-2xl p-4 ${message.type === "user" ? "bg-indigo-600 rounded-tr-sm" : "bg-gray-100 rounded-tl-sm"}`}>
                  <Text className={`text-sm leading-5 ${message.type === "user" ? "text-white" : "text-gray-900"}`}>
                    {message.content}
                  </Text>
                  
                  {message.type === "ai" && message.sources && message.sources.length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-200">
                      <Text className="text-xs text-gray-600 mb-2">Sources:</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {message.sources.map((source, i) => (
                          <View key={i} className="bg-white px-2 py-1 rounded-lg border border-gray-200">
                            <Text className="text-xs text-gray-700">{source}</Text>
                          </View>
                        ))}
                      </View>
                      {message.confidence && (
                        <View className="mt-2">
                          <Text className="text-xs font-medium text-green-600">
                            Confidence: {message.confidence}%
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {message.type === "ai" && (
                    <View className="flex-row gap-4 mt-3 pt-3 border-t border-gray-200">
                      <TouchableOpacity className="p-1">
                        <ThumbsUp size={16} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity className="p-1">
                        <Copy size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Suggested Questions */}
          {chatHistory.length === 1 && (
            <View className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <Text className="text-xs font-medium text-gray-600 mb-2">Suggested questions:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                {suggestedQuestions.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setQuestion(q)}
                    className="bg-gray-200 px-3 py-2 rounded-full mr-2"
                  >
                    <Text className="text-xs font-medium text-gray-700">{q}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input Box */}
          <View className="p-4 border-t border-gray-200 bg-white">
            <View className="flex-row items-center gap-3 bg-gray-100 rounded-2xl p-2 px-3">
              <TextInput
                placeholder="Ask a question about the document..."
                placeholderTextColor="#9ca3af"
                value={question}
                onChangeText={setQuestion}
                className="flex-1 h-10 text-sm text-gray-900"
              />
              <TouchableOpacity
                onPress={handleSendQuestion}
                disabled={!question.trim()}
                className={`p-2 rounded-xl justify-center items-center ${
                  question.trim() ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <Send size={20} color={question.trim() ? "#ffffff" : "#6b7280"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

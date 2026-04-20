import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { ArrowLeft, Send, File as FileIcon, FileText, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useAILearnContext } from '../contexts/AILearnContext';
import { useMyNotesContext } from '../contexts/MyNotesContext';
import { useAuthContext, API_URL } from '../contexts/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamic config now handled via AuthContext

interface RAGLayoutProps {
  moduleName: string; // Express DB Enum: 'exam-assistance', 'concept-explanation', etc.
  title: string;
  description: string;
  icon: any;
  ragEndpoint: string; // e.g. '/exam', '/summary'
}

export default function RAGLayout({ moduleName, title, description, icon: Icon, ragEndpoint }: RAGLayoutProps) {
  const router = useRouter();
  const { user, ragApiUrl } = useAuthContext();
  const { selectedNotes } = useAILearnContext();
  const { subjects, notesBySubject } = useMyNotesContext();
  
  // Storage 
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  
  // Mobile UI state
  const [activeTab, setActiveTab] = useState<'notes' | 'chat'>('chat');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = Dimensions.get('window');
  const isDesktop = width >= 768; // Tailwind md breakpoint

  // Derive all active document objects
  const activeDocs = React.useMemo(() => {
     let docs: any[] = [];
     Object.values(notesBySubject).forEach(subjectList => {
       const matched = subjectList.filter(n => selectedNotes.includes(n._id));
       docs = [...docs, ...matched];
     });
     return docs;
  }, [selectedNotes, notesBySubject]);

  const [activePdfIndex, setActivePdfIndex] = useState(0);
  const activePdf = activeDocs[activePdfIndex];

  // Modify URL to use local IP for Android preview cleanly
  const resolvePdfUrl = (url: string) => {
    if (!url) return '';
    const baseUrl = API_URL.replace('/api', '');
    let finalUrl = url.replace('http://localhost:5000', baseUrl);
    if (Platform.OS === 'android' && finalUrl.includes('localhost')) {
      return finalUrl.replace('localhost', '192.168.29.57');
    }
    return finalUrl;
  };

  const getAndroidPdfHtml = (url: string) => `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
      <style>
        body { background-color: #f3f4f6; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; overflow-y: auto; overflow-x: hidden; }
        canvas { width: 100vw; margin-bottom: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        #loading { margin-top: 50vh; transform: translateY(-50%); font-family: sans-serif; color: #4f46e5; text-align: center; }
      </style>
    </head>
    <body>
      <h3 id="loading">Loading PDF Viewer...</h3>
      <div id="pdf-container"></div>
      <script>
        const url = '${url}';
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function(pdf) {
          document.getElementById('loading').style.display = 'none';
          const container = document.getElementById('pdf-container');
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(function(page) {
              const viewport = page.getViewport({scale: 1.5});
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              container.appendChild(canvas);
              page.render({ canvasContext: context, viewport: viewport });
            });
          }
        }, function (reason) {
          console.error(reason);
          document.getElementById('loading').innerText = "Failed to load document.";
        });
      </script>
    </body>
    </html>
  `;

  useEffect(() => {
     const initChatSession = async () => {
        try {
           const token = await AsyncStorage.getItem('userToken');
           // Attempt to load existing mapping for these exact selected notes and module!
           // For simplicity, we create a new session ID for every new entrance, ensuring unique storage strings.
           const response = await fetch(`${API_URL}/chats`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({
                module: moduleName,
                selectedNotes: selectedNotes,
                history: []
             })
           });
           if (response.ok) {
              const data = await response.json();
              setChatId(data._id);
           }
        } catch (e) {
           console.log("Session mapping err:", e);
        }
     };
     
     if (user) initChatSession();
  }, []);

  const persistMessages = async (updatedHistory: any[]) => {
      if (!chatId) return;
      try {
           const token = await AsyncStorage.getItem('userToken');
           await fetch(`${API_URL}/chats`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({
                chatId: chatId,
                module: moduleName,
                history: updatedHistory
             })
           });
      } catch(e) {
          console.log("Failed to persist", e);
      }
  };

  const handleSend = async () => {
     if (!inputText.trim() || loading) return;
     const userQuery = inputText;
     setInputText('');

     const newMessages = [...messages, { role: 'user' as const, text: userQuery }];
     setMessages(newMessages);
     persistMessages(newMessages);
     
     setLoading(true);
     // Auto scroll
     setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

     try {
       // Format request based on python models
       const reqBody: any = {
          user_id: user?._id || "anonymous",
          document_names: activeDocs.map(d => d.title)
       };
       // FastApi expects topic / document strings generally. 
       if (moduleName === 'summary-creator') {
          reqBody.document_name = activePdf?.title || "selected documents";
       } else {
          reqBody.topic = userQuery;
       }
       if (moduleName === 'question-generator') {
          reqBody.number_of_questions = 3;
          reqBody.marks_per_question = 5;
       }

       const response = await fetch(`${ragApiUrl || 'http://192.168.29.57:8000'}${ragEndpoint}`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(reqBody)
       });

       if (!response.ok) {
           throw new Error(`RAG API Error: ${response.status}`);
       }
       
       const data = await response.json();
       const aiResponse = data.response;

       const finalState = [...newMessages, { role: 'ai' as const, text: aiResponse }];
       setMessages(finalState);
       persistMessages(finalState);
     } catch (e: any) {
        setMessages([...newMessages, { role: 'ai', text: `Error: Could not connect to Python RAG Backend. \n\nEnsure FastAPI is running: '${e.message}'` }]);
     } finally {
        setLoading(false);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
     }
  };

  const renderNotesViewer = () => (
     <View className="flex-1 bg-white border-r border-gray-100 h-full">
        {/* Top Navbar for Switching PDFs */}
        {activeDocs.length > 0 ? (
          <View className="flex-col h-full">
             <View className="border-b border-gray-100 bg-gray-50 flex-row">
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}>
                 {activeDocs.map((doc, idx) => (
                    <TouchableOpacity 
                      key={doc._id} 
                      onPress={() => setActivePdfIndex(idx)}
                      className={`px-4 py-2 rounded-full mr-2 border ${activePdfIndex === idx ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-gray-200'} flex-row items-center`}
                    >
                      <FileIcon size={14} color={activePdfIndex === idx ? '#4f46e5' : '#6b7280'} />
                      <Text className={`ml-2 text-sm font-medium ${activePdfIndex === idx ? 'text-indigo-800' : 'text-gray-600'}`}>
                         {doc.title.length > 15 ? doc.title.substring(0, 15) + '...' : doc.title}
                      </Text>
                    </TouchableOpacity>
                 ))}
               </ScrollView>
             </View>
             <View className="flex-1 bg-gray-100 relative">
               {Platform.OS === 'web' ? (
                  <iframe 
                    src={resolvePdfUrl(activePdf?.url)} 
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
               ) : Platform.OS === 'android' ? (
                  <WebView 
                    originWhitelist={['*']}
                    source={{ html: getAndroidPdfHtml(resolvePdfUrl(activePdf?.url)) }}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View className="flex-1 items-center justify-center bg-gray-50">
                         <ActivityIndicator size="large" color="#4f46e5" />
                      </View>
                    )}
                  />
               ) : (
                  <WebView 
                    source={{ uri: resolvePdfUrl(activePdf?.url) }}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View className="flex-1 items-center justify-center bg-gray-50">
                         <ActivityIndicator size="large" color="#4f46e5" />
                      </View>
                    )}
                  />
               )}
             </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center p-8">
             <FileText size={48} color="#d1d5db" />
             <Text className="text-gray-500 mt-4 text-center">No reference documents selected.</Text>
          </View>
        )}
     </View>
  );

  const renderChatViewer = () => (
     <View className="flex-1 bg-gray-50 flex-col h-[100%] web:h-[calc(100vh-130px)]">
         <ScrollView 
            ref={scrollViewRef}
            className="flex-1 p-4" 
            contentContainerStyle={{ paddingBottom: 24 }}
         >
           {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center pt-24">
                <Icon size={48} color="#c7d2fe" />
                <Text className="text-gray-400 mt-4 mb-2">Start your interactive session in</Text>
                <Text className="text-indigo-500 font-semibold">{title}</Text>
              </View>
           ) : (
              messages.map((msg, idx) => (
                 <View key={idx} className={`mb-4 w-full flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <View className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 rounded-br-none' : 'bg-white border border-gray-100 rounded-bl-none'}`}>
                       {msg.role === 'ai' && <View className="flex-row items-center mb-2 gap-2"><Icon size={14} color="#6366f1"/><Text className="text-xs font-bold text-indigo-500 tracking-wider uppercase">AI Concept Agent</Text></View>}
                       <Text className={`text-sm leading-6 ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          {msg.text}
                       </Text>
                    </View>
                 </View>
              ))
           )}
           {loading && (
             <View className="mb-4 w-full flex-row justify-start">
               <View className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-5 shadow-sm">
                  <ActivityIndicator color="#4f46e5" size="small" />
               </View>
             </View>
           )}
         </ScrollView>
         <View className="bg-white border-t border-gray-100 p-4 pb-6 flex-row items-end">
            <TextInput
               className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 pt-4 pb-4 max-h-32 text-gray-800"
               placeholder="Chat continuously about the document..."
               multiline
               value={inputText}
               onChangeText={setInputText}
            />
            <TouchableOpacity 
               onPress={handleSend}
               className="bg-indigo-600 h-14 w-14 rounded-2xl items-center justify-center ml-3"
            >
               <Send size={24} color="#ffffff" style={{ marginLeft: -2 }} />
            </TouchableOpacity>
         </View>
     </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header Container */}
      <View className="bg-indigo-600 px-4 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
            <ArrowLeft size={24} color="#ffffff" />
            <Text className="text-white font-medium text-lg">{title}</Text>
        </TouchableOpacity>
        {/* Mobile Toggle Boundary */}
        {!isDesktop && (
           <View className="mt-6 flex-row bg-indigo-700 rounded-xl p-1 shadow-sm">
              <TouchableOpacity onPress={() => setActiveTab('notes')} className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'notes' ? 'bg-white' : ''}`}>
                 <Text className={`font-semibold ${activeTab === 'notes' ? 'text-indigo-600' : 'text-indigo-200'}`}>Reference Notes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('chat')} className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'chat' ? 'bg-white' : ''}`}>
                 <Text className={`font-semibold ${activeTab === 'chat' ? 'text-indigo-600' : 'text-indigo-200'}`}>AI Session Focus</Text>
              </TouchableOpacity>
           </View>
        )}
      </View>
      
      {/* Dynamic Layout Splitting Container */}
      {isDesktop ? (
         <View className="flex-1 flex-row h-[100%] web:h-[calc(100vh-80px)]">
             <View className="flex-1">{renderNotesViewer()}</View>
             <View className="flex-1 border-l border-gray-200">{renderChatViewer()}</View>
         </View>
      ) : (
         <View className="flex-1 h-full">
            {activeTab === 'notes' ? renderNotesViewer() : renderChatViewer()}
         </View>
      )}
    </View>
  );
}

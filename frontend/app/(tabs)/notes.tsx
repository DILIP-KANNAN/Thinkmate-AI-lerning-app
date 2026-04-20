import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert, Switch, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { Search, FolderOpen, FileText, Download, Star, Plus, UploadCloud, X, ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { useMyNotesContext, ActiveCommunity } from "../../contexts/MyNotesContext";
import { useCommunitiesContext } from "../../contexts/CommunitiesContext";
import { useAILearnContext } from "../../contexts/AILearnContext";
import { WebView } from "react-native-webview";
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useAuthContext, API_URL } from "../../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyNotesScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  
  const { subjects, notesBySubject, activeCommunities, loadPersonalNotes, loading } = useMyNotesContext();
  const { communities } = useCommunitiesContext(); // explicit fallback

  // Modals state
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommTitle, setNewCommTitle] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");
  const [makePublic, setMakePublic] = useState(false);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);

  const getResolvedPdfUrl = (url: string | null) => {
    if (!url) return null;
    const baseUrl = API_URL.replace('/api', '');
    return url.replace('http://localhost:5000', baseUrl);
  };
  const finalPdfUrl = getResolvedPdfUrl(viewingPdfUrl);

  const androidPdfHtml = `
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
        const url = '${finalPdfUrl}';
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

  const getAllNotes = () => {
    return Object.entries(notesBySubject).flatMap(([subject, notes]: [string, any]) =>
      notes.map((note: any) => ({ ...note, subject }))
    );
  };

  const filteredNotes = selectedSubject === "All"
    ? getAllNotes().filter((note: any) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notesBySubject[selectedSubject as keyof typeof notesBySubject]?.filter((note: any) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];

  const handleUploadNote = async () => {
    // Determine which community intelligently across native race conditions
    const targetComm = activeCommunities.find(c => c.subject === selectedSubject) || communities.find(c => c.subject === selectedSubject);
    if (!targetComm) {
      Alert.alert('System Default', 'Please create a formal community subject first to map this logic into.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return;
      const file = result.assets[0];

      setIsUploading(true);
      const formData = new FormData();
      if (Platform.OS === 'web' && file.file) {
        formData.append('document', file.file);
      } else {
        formData.append('document', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);
      }

      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/communities/${targetComm._id}/documents`, {
        method: 'POST',
        headers: { 
           'Accept': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errMsg = 'Network Error';
        try { const errData = await response.json(); errMsg = errData.message; } catch(e){}
        throw new Error(errMsg);
      }

      Alert.alert('Success', 'Note uploaded successfully!');
      loadPersonalNotes();
    } catch (error) {
      console.log('Upload error', error);
      Alert.alert('Error', 'Failed to upload note.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommTitle) return;
    try {
       const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (result.canceled) return;
      const file = result.assets[0];

      setIsUploading(true);
      const formData = new FormData();
      formData.append('name', newCommTitle);
      formData.append('subject', newCommTitle); // map standard name
      formData.append('description', newCommDesc);
      formData.append('isPrivate', (!makePublic).toString());
      
      if (Platform.OS === 'web' && file.file) {
        formData.append('document', file.file);
      } else {
        formData.append('document', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);
      }

      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/communities`, {
        method: 'POST',
        headers: { 
           'Accept': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errMsg = 'Network Error';
        try { const errData = await response.json(); errMsg = errData.message; } catch(e){}
        throw new Error(errMsg);
      }
      
      Alert.alert('Success', 'Community and Document created!');
      setShowCreateModal(false);
      setNewCommTitle("");
      setNewCommDesc("");
      loadPersonalNotes();
      // To strictly match RAG workflows, we could route them to /rag-learning immediately
    } catch (error) {
       console.log('Create community failed', error);
       Alert.alert('Error', 'Could not create community.');
    } finally {
       setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-16 pb-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
           <Text className="text-3xl font-semibold text-gray-900">My Notes</Text>
           <TouchableOpacity 
             onPress={() => setShowCreateModal(true)}
             className="bg-indigo-600 rounded-full px-4 py-2 flex-row items-center gap-2">
             <Plus size={16} color="#ffffff" />
             <Text className="text-white font-medium text-sm">Create Community</Text>
           </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="bg-gray-100 rounded-2xl p-2 mb-4 flex-row items-center px-4">
          <Search size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search notes..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 h-10 ml-3 text-base text-gray-900"
          />
        </View>

        {/* Conditional Breadcrumb / Filter */}
        {selectedSubject !== "All" && (
           <View className="flex-row items-center gap-2 mt-2 px-2">
              <TouchableOpacity onPress={() => setSelectedSubject("All")} className="flex-row items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                 <ArrowLeft size={16} color="#4f46e5" />
                 <Text className="text-sm font-semibold text-indigo-700">Back to Folders</Text>
              </TouchableOpacity>
           </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {selectedSubject === "All" && (
           <View className="px-6 py-6 bg-white border-b border-gray-200 shadow-sm mb-4">
             <View className="flex-row w-full justify-between">
               <View className="items-center flex-1 border-r border-gray-100">
                 <Text className="text-2xl font-semibold text-gray-900 mb-1">
                   {getAllNotes().length}
                 </Text>
                 <Text className="text-xs text-gray-600 uppercase tracking-wider">Total Notes</Text>
               </View>
               <View className="items-center flex-1 border-r border-gray-100">
                 <Text className="text-2xl font-semibold text-gray-900 mb-1">
                   {user?.subjects?.length || 0}
                 </Text>
                 <Text className="text-xs text-gray-600 uppercase tracking-wider">Enrolled</Text>
               </View>
               <View className="items-center flex-1">
                 <Text className="text-2xl font-semibold text-gray-900 mb-1">
                   {Math.floor(getAllNotes().length * 1.5)}h
                 </Text>
                 <Text className="text-xs text-gray-600 uppercase tracking-wider">Tracked Time</Text>
               </View>
             </View>
           </View>
        )}

        {/* Main Content Area */}
        <View className="px-6 py-2">
          {loading ? (
             <ActivityIndicator size="large" color="#4f46e5" />
          ) : selectedSubject === "All" ? (
             <View className="space-y-4 gap-y-4">
               {subjects.filter(s => s !== "All").map((subjectName) => {
                  const subjectNotes = notesBySubject[subjectName] || [];
                  const activeComm = activeCommunities.find(c => c.subject === subjectName);
                  const isMatch = subjectName.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!isMatch) return null;

                  return (
                     <TouchableOpacity 
                        key={subjectName} 
                        onPress={() => setSelectedSubject(subjectName)}
                        className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
                        <View className="flex-row items-start justify-between w-full">
                           <View className="flex-1 pr-4">
                              <View className="flex-row items-center gap-2 mb-2">
                                 <FolderOpen size={20} color="#4f46e5" />
                                 <Text className="text-xl font-semibold text-indigo-900">{subjectName}</Text>
                              </View>
                              <Text className="text-sm font-medium text-indigo-600 mb-2">Target Course Scope</Text>
                              <View className="bg-white/50 self-start px-2 py-1 rounded-md">
                                 <Text className="text-xs font-semibold text-indigo-800">{subjectNotes.length} Resourced Files</Text>
                              </View>
                           </View>
                        </View>
                     </TouchableOpacity>
                  );
               })}
               {subjects.filter(s => s !== "All").length === 0 && (
                  <View className="items-center py-12">
                     <FolderOpen size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                     <Text className="text-lg font-medium text-gray-900 mb-2">No folders generated</Text>
                     <Text className="text-sm text-gray-600 text-center px-4">You are not enrolled in any communities yet. Create one or enroll from global explore to initialize your environment!</Text>
                  </View>
               )}
             </View>
          ) : (
            // Formatted Single Subject Drill-Down View
            <View>
               <View className="mb-4 mt-2">
                  <TouchableOpacity 
                     disabled={isUploading}
                     onPress={handleUploadNote}
                     className="w-full bg-white border-2 border-dashed border-indigo-300 rounded-xl p-4 flex-row items-center justify-center gap-2">
                     {isUploading ? <ActivityIndicator size="small" color="#4f46e5" /> : <UploadCloud size={20} color="#4f46e5" />}
                     <Text className="text-indigo-700 font-semibold">{isUploading ? 'Uploading...' : 'Upload Personal Document'}</Text>
                  </TouchableOpacity>
               </View>

               <View className="space-y-3 gap-y-3">
                  {filteredNotes.length === 0 ? (
                     <Text className="text-gray-500 italic text-sm py-4">No notes matching your query in this folder.</Text>
                  ) : filteredNotes.map((note: any) => (
                     <NoteCard key={note._id} note={note} onViewPdf={() => setViewingPdfUrl(note.url)} />
                  ))}
               </View>

               {!loading && filteredNotes.length === 0 && (
                  <View className="items-center py-12">
                     <FileText size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                     <Text className="text-lg font-medium text-gray-900 mb-2">Folder Exhausted</Text>
                     <Text className="text-sm text-gray-600 text-center">There are no generic or personal materials loaded here yet.</Text>
                  </View>
               )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Extensible Create Community Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
         <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[32px] p-6 pb-12 w-full max-h-[80%] relative">
               <TouchableOpacity 
                 onPress={() => setShowCreateModal(false)}
                 className="absolute top-6 right-6 z-10 bg-gray-100 p-2 rounded-full">
                 <X size={20} color="#4b5563" />
               </TouchableOpacity>

               <Text className="text-2xl font-semibold text-gray-900 mb-2">Create Community</Text>
               <Text className="text-gray-500 mb-6">Initialize a brand new community subject with an original document for AI insights.</Text>
               
               <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Subject Name</Text>
                  <TextInput 
                     value={newCommTitle}
                     onChangeText={setNewCommTitle}
                     placeholder="E.g. Computer Graphics 101"
                     className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                  />
               </View>

               <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                  <TextInput 
                     value={newCommDesc}
                     onChangeText={setNewCommDesc}
                     placeholder="Summary of the scope..."
                     multiline
                     numberOfLines={3}
                     className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 text-top h-24"
                     style={{ textAlignVertical: 'top' }}
                  />
               </View>

               <View className="mb-4 flex-row items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <View className="flex-1 pr-4">
                     <Text className="text-sm font-medium text-gray-900 mb-1">Make Public</Text>
                     <Text className="text-xs text-gray-500">Allow other students to discover and join this community globally.</Text>
                  </View>
                  <Switch 
                     value={makePublic} 
                     onValueChange={setMakePublic} 
                     trackColor={{ false: "#d1d5db", true: "#a5b4fc" }}
                     thumbColor={makePublic ? "#4f46e5" : "#f3f4f6"}
                  />
               </View>

               <TouchableOpacity 
                  disabled={isUploading || !newCommTitle}
                  onPress={handleCreateCommunity}
                  className={`w-full p-4 rounded-xl flex-row items-center justify-center gap-2 ${isUploading || !newCommTitle ? 'bg-indigo-300' : 'bg-indigo-600'}`}>
                  {isUploading ? <ActivityIndicator color="#ffffff" /> : <UploadCloud size={20} color="#ffffff" />}
                  <Text className="text-white font-semibold text-lg">{isUploading ? 'Building Environment...' : 'Upload Base Document'}</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>

      {/* PDF Viewer Modals */}
      <Modal visible={!!viewingPdfUrl} animationType="slide" onRequestClose={() => setViewingPdfUrl(null)}>
        <View className="flex-1 bg-white">
          <View className="bg-indigo-600 px-6 pt-16 pb-4 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setViewingPdfUrl(null)} className="p-2 -ml-2 flex-row flex-1 items-center gap-2">
              <ArrowLeft size={24} color="#ffffff" />
              <Text className="text-white font-medium text-lg">Close Note</Text>
            </TouchableOpacity>
          </View>
          {Platform.OS === 'web' ? (
            <iframe 
              src={finalPdfUrl!} 
              style={{ width: '100%', height: 'calc(100vh - 80px)', border: 'none', display: 'block' }} 
              title="PDF Viewer"
              allowFullScreen
            />
          ) : Platform.OS === 'android' ? (
            <WebView 
              originWhitelist={['*']}
              source={{ html: androidPdfHtml }} 
              style={{ flex: 1 }}
              startInLoadingState={true}
              renderLoading={() => (
                <View className="flex-1 items-center justify-center bg-gray-50">
                   <ActivityIndicator size="large" color="#4f46e5" />
                </View>
              )}
            />
          ) : (
            <WebView 
              source={{ uri: finalPdfUrl! }} 
              style={{ flex: 1 }}
              startInLoadingState={true}
              renderLoading={() => (
                <View className="flex-1 items-center justify-center bg-gray-50">
                   <ActivityIndicator size="large" color="#4f46e5" />
                </View>
              )}
            />
          )}
        </View>
      </Modal>

    </View>
  );
}

function NoteCard({ note, onViewPdf }: { note: any, onViewPdf: () => void }) {
  const router = useRouter();
  const { setSelectedNotes } = useAILearnContext();
  const [syncing, setSyncing] = useState(false);

  // Synthesize metadata strings
  const sourceName = note.community?.name || note.subject || "Community Syllabus";
  let uploadMetaText = "";
  let uploadMetaColor = "text-gray-500";
  
  if (note.isPersonal === true) {
     const dt = note.createdAt ? new Date(note.createdAt) : new Date();
     uploadMetaText = `Uploaded: ${dt.toLocaleDateString()} at ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
     uploadMetaColor = "text-green-600";
  } else {
     uploadMetaText = `Source: From Community ${sourceName}`;
     uploadMetaColor = "text-indigo-600";
  }

  const handleStudyWithAI = async () => {
    setSyncing(true);
    setSelectedNotes([note._id]);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/chats/sync-rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedNotes: [note._id] })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push({ pathname: '/ai-learn', params: { autoStep: "2" } });
      } else {
        throw new Error(data.message || 'Failed to sync to RAG backend');
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Something went wrong syncing notes.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-base font-semibold text-gray-900 mb-1">{note.title}</Text>
        <View className="flex-col gap-1 mb-4">
          <Text className={`text-xs font-semibold ${uploadMetaColor}`}>{uploadMetaText}</Text>
          <Text className="text-xs text-gray-400 capitalize">{note.topic || note.fileType}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={onViewPdf} className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 flex-row items-center gap-2">
            <FileText size={14} color="#6b7280" />
            <Text className="text-xs font-semibold text-gray-600">View</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={syncing} onPress={handleStudyWithAI} className="px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-100 flex-row items-center gap-2">
            {syncing ? <ActivityIndicator size="small" color="#4f46e5" /> : <Star size={14} color="#4f46e5" />}
            <Text className="text-xs font-semibold text-indigo-700">{syncing ? 'Loading UI...' : 'Study with AI'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

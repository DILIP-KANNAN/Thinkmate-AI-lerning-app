import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Modal } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Upload, Download, Star, Clock, Shield, Users, FileText, LayoutList } from "lucide-react-native";
import { useState, useEffect } from "react";
import { WebView } from "react-native-webview";
import axios from "axios";
import { API_URL, useAuthContext } from "../../contexts/AuthContext";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, updateProfile } = useAuthContext();

  const [community, setCommunity] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      // We don't have a single GET /communities/:id yet, so we pull all and filter
      const commRes = await axios.get(`${API_URL}/communities`);
      const targetComm = commRes.data.find((c: any) => c._id === id);
      setCommunity(targetComm);

      // We should ideally fetch documents. Let's mock a fetch by pulling from a generic endpoint, 
      // or we can build an endpoint quickly. For now, since documents aren't exposed, 
      // let's create a local endpoint list or just map the local mock data if the API is missing.
      // Wait, we seeded Documents! But we didn't expose GET /api/communities/docs. 
      // I will add a mock fetch or assume an endpoint exists. Let's add the endpoint later or just filter dynamically if we have to.
      // Wait, we didn't build `GET /api/documents`! We must build that to fetch the notes.
      // For now, I'll set documents to empty array to avoid crash while I build it.
    } catch (err) {
      console.log('Error fetching community', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
     try {
       const docRes = await axios.get(`${API_URL}/communities/${id}/documents`);
       setDocuments(docRes.data);
     } catch (err) {
       console.log('Error fetching docs', err);
     }
  };

  const handleUnenroll = async () => {
    try {
      const res = await axios.post(`${API_URL}/communities/unenroll`, { communityId: id });
      // sync contextual profile correctly
      updateProfile(res.data);
      alert('Successfully left the community');
      router.replace('/(tabs)/communities');
    } catch (error) {
      console.log('Unenroll error', error);
      alert('Could not leave the community');
    }
  };

  useEffect(() => {
    if (id) fetchDocuments();
  }, [id]);

  // To ensure the mobile device requests the PDF from the computer's IP address instead of itself
  const getResolvedPdfUrl = () => {
     if (!viewingPdfUrl) return null;
     const baseUrl = API_URL.replace('/api', '');
     return viewingPdfUrl.replace('http://localhost:5000', baseUrl);
  };

  const finalPdfUrl = getResolvedPdfUrl();

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

  if (viewingPdfUrl) {
    return (
      <Modal visible={!!viewingPdfUrl} animationType="slide" onRequestClose={() => setViewingPdfUrl(null)}>
        <View className="flex-1 bg-white">
          <View className="bg-indigo-600 px-6 pt-16 pb-4 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setViewingPdfUrl(null)} className="p-2 -ml-2 flex-row flex-1 items-center gap-2">
              <ArrowLeft size={24} color="#ffffff" />
              <Text className="text-white font-medium text-lg">Back to Course Info</Text>
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
    );
  }

  if (loading || !community) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 flex-col">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="bg-indigo-600 px-6 pt-16 pb-6 border-b border-indigo-700">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-6 w-40 border border-transparent">
            <ArrowLeft size={20} color="#e0e7ff" />
            <Text className="text-sm font-medium text-indigo-100">Back</Text>
          </TouchableOpacity>

          <View className="flex-row items-start gap-4 mb-4">
            <View className="flex-1">
              <View className="flex-row items-center flex-wrap gap-2 mb-2">
                <Text className="text-2xl font-semibold text-white">{community.name}</Text>
                {community.isVerified && (
                  <View className="bg-white/20 rounded-full p-1 border border-white/10">
                    <Shield size={16} color="#ffffff" />
                  </View>
                )}
              </View>
              <Text className="text-indigo-100 text-sm font-medium mb-3">{community.subject}</Text>
              <Text className="text-sm text-white/90 leading-6">{community.description || "Course description unavailable."}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center gap-2">
               <Users size={16} color="#e0e7ff" />
               <Text className="text-sm text-indigo-100">{community.membersCount} Enrolled</Text>
            </View>
            
            {user?.subjects?.includes(community._id) && (
               <TouchableOpacity 
                 onPress={handleUnenroll}
                 className="bg-white/20 px-4 py-2 rounded-lg border border-white/30">
                 <Text className="text-white text-xs font-semibold">Leave Community</Text>
               </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Syllabus Section */}
        {community.syllabus && community.syllabus.length > 0 && (
          <View className="bg-white px-6 py-6 border-b border-gray-200">
            <View className="flex-row items-center gap-2 mb-4">
              <LayoutList size={20} color="#4f46e5" />
              <Text className="text-lg font-medium text-gray-900">Syllabus</Text>
            </View>
            <View className="space-y-3 gap-y-3">
              {community.syllabus.map((topic: string, index: number) => (
                <View key={index} className="flex-row items-start gap-3">
                  <View className="w-6 h-6 rounded-full bg-indigo-100 items-center justify-center mt-0.5">
                    <Text className="text-indigo-700 text-xs font-bold">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-base text-gray-700">{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes List */}
        <View className="px-6 py-6">
          <Text className="text-lg font-medium text-gray-900 mb-4">Topic Notes & Resources</Text>

          <View className="space-y-4 gap-y-4">
            {documents.length === 0 ? (
              <Text className="text-gray-500 italic text-sm">No notes available for this course yet.</Text>
            ) : documents.map((note) => (
              <View
                key={note._id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-start justify-between mb-3 w-full">
                  <View className="flex-1 pr-4">
                    <Text className="text-base font-semibold text-gray-900 mb-2">{note.title}</Text>
                    {note.topic && (
                       <Text className="text-sm text-indigo-600 mb-2 font-medium">Topic: {note.topic}</Text>
                    )}
                    <Text className="text-xs text-gray-500">
                      Format: {note.fileType.toUpperCase()}
                    </Text>
                  </View>
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-700 text-[10px] font-bold uppercase tracking-wider">Verified</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between w-full mt-4">
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={() => setViewingPdfUrl(note.url)} className="px-5 py-2 rounded-xl bg-indigo-50 flex-row items-center gap-2">
                      <FileText size={16} color="#4f46e5" />
                      <Text className="text-sm font-semibold text-indigo-700">Read Note</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity className="px-3 py-2 rounded-lg items-center gap-1">
                    <Download size={18} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

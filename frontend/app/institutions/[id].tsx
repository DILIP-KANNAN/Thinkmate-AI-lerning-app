import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Building, Users, BookOpen, ChevronRight, Globe } from "lucide-react-native";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../contexts/AuthContext";
import { Institution, Community } from "../../contexts/CommunitiesContext";

export default function InstitutionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [courses, setCourses] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInstitutionDetails();
    }
  }, [id]);

  const fetchInstitutionDetails = async () => {
    try {
      setLoading(true);
      // Fetch communities and institutions from context or directly. 
      // For this dynamic screen, fetching from backend is reliable.
      const instRes = await axios.get(`${API_URL}/communities/institutions`);
      const allInsts = instRes.data;
      const targetInst = allInsts.find((i: any) => i._id === id);
      setInstitution(targetInst);

      const commRes = await axios.get(`${API_URL}/communities`);
      // Filter communities belonging to this institution
      const linkedCourses = commRes.data.filter((c: any) => c.institution?._id === id || c.institution === id);
      setCourses(linkedCourses);
    } catch (error) {
      console.log("Error fetching inst details", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !institution) {
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
        <View className="bg-indigo-600 px-6 pt-16 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-6 w-32 border border-transparent">
            <ArrowLeft size={20} color="#e0e7ff" />
            <Text className="text-sm font-medium text-indigo-100">Back</Text>
          </TouchableOpacity>

          <View className="flex-row items-start gap-4 mb-4 mt-2">
            <View className="bg-white/20 rounded-2xl p-4">
              <Building size={32} color="#ffffff" />
            </View>
            <View className="flex-1 mt-1">
              <Text className="text-2xl font-semibold text-white mb-2 leading-8">{institution.name}</Text>
              <View className="flex-row items-center gap-2">
                 <Globe size={16} color="#e0e7ff" />
                 <Text className="text-sm font-medium text-indigo-100">{institution.website || 'Educational Institution'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View className="bg-white border-b border-gray-200 px-6 py-6 mb-4">
           <Text className="text-lg font-medium text-gray-900 mb-3">About</Text>
           <Text className="text-base text-gray-600 leading-6">{institution.about || institution.description}</Text>
        </View>

        {/* Subjects Linked */}
        <View className="px-6 py-4">
          <Text className="text-lg font-medium text-gray-900 mb-4">Programs & Communities ({courses.length})</Text>

          <View className="space-y-4 gap-y-4">
            {courses.map((course) => (
              <Link key={course._id} href={`/communities/${course._id}`} asChild>
                <TouchableOpacity className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <View className="flex-row items-center justify-between mb-2">
                     <Text className="text-base font-semibold text-gray-900 flex-1">{course.subject}</Text>
                     <ChevronRight size={20} color="#9ca3af" />
                  </View>
                  <Text className="text-sm text-gray-500 mb-3 line-clamp-2" numberOfLines={2}>
                     {course.description || "Course description currently unavailable."}
                  </Text>
                  <View className="flex-row items-center gap-3">
                     <View className="flex-row items-center bg-indigo-50 px-2 py-1 rounded-full gap-1">
                        <Users size={12} color="#4f46e5" />
                        <Text className="text-xs font-medium text-indigo-700">{course.membersCount} Enrolled</Text>
                     </View>
                     <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full gap-1">
                        <BookOpen size={12} color="#4b5563" />
                        <Text className="text-xs font-medium text-gray-700">Course Materials</Text>
                     </View>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

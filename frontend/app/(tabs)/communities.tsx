import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Search, Plus, Users, Globe, Shield, TrendingUp, Building } from "lucide-react-native";
import { useState } from "react";
import { useCommunitiesContext, Community, Institution } from "../../contexts/CommunitiesContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { Link } from "expo-router";

export default function CommunitiesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");

  const { subjects, communities, institutions, enrollInCommunity, loading } = useCommunitiesContext();
  const { user } = useAuthContext();

  // Enrolled subjects in user profile
  const enrolledSubjectIds = user?.subjects || [];

  const enrolledCommunities = communities.filter((c: Community) => enrolledSubjectIds.includes(c._id));
  const suggestedCommunities = communities.filter((c: Community) => !enrolledSubjectIds.includes(c._id));

  const filterCommunities = (list: Community[]) => {
    return list.filter((community: Community) => {
      const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterSubject === "All" || community.subject === filterSubject;
      return matchesSearch && matchesFilter;
    });
  };

  const displayEnrolled = filterCommunities(enrolledCommunities);
  const displaySuggested = filterCommunities(suggestedCommunities);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-16 pb-6">
        <Text className="text-3xl font-semibold text-gray-900 mb-6">Communities</Text>
        
        {/* Search */}
        <View className="bg-gray-100 rounded-2xl p-2 mb-4 flex-row items-center px-4">
          <Search size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search communities..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 h-10 ml-3 text-base text-gray-900"
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {subjects.map((subject: string, idx: number) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setFilterSubject(subject)}
              className={`px-4 py-2 rounded-full mr-2 ${
                filterSubject === subject ? "bg-indigo-600" : "bg-gray-100"
              }`}
            >
              <Text className={`text-sm font-medium ${
                filterSubject === subject ? "text-white" : "text-gray-700"
              }`}>{subject}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        
        {/* Enrolled Communities Section */}
        {displayEnrolled.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-medium text-gray-900 mb-4">Your Enrolled Communities</Text>
            <View className="space-y-4 gap-y-4">
              {displayEnrolled.map((community: Community) => (
                <Link key={community._id} href={`/communities/${community._id}`} asChild>
                  <TouchableOpacity className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
                    <View className="flex-row items-start justify-between mb-3 w-full">
                      <View className="flex-1">
                        <Text className="text-base font-medium text-indigo-900 mb-1">{community.name}</Text>
                        <Text className="text-sm font-medium text-indigo-600">{community.subject}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Educational Institutions Section */}
        {filterSubject === "All" && institutions.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-medium text-gray-900 mb-4">Educational Institutions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 flex-row">
              {institutions.map((inst: Institution) => (
                <Link key={inst._id} href={`/institutions/${inst._id}` as any} asChild>
                  <TouchableOpacity className="bg-white rounded-2xl p-4 w-64 mr-4 shadow-sm border border-gray-100">
                    <View className="bg-gray-100 rounded-full h-12 w-12 items-center justify-center mb-3">
                      <Building size={24} color="#6b7280" />
                    </View>
                    <Text className="text-base font-medium text-gray-900 mb-1">{inst.name}</Text>
                    <Text className="text-xs text-gray-500 mb-3" numberOfLines={2}>{inst.description}</Text>
                    <View className="bg-indigo-50 py-2 rounded-xl items-center">
                      <Text className="text-sm font-medium text-indigo-600">View Subjects</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Suggested Communities Section */}
        <View className="mb-4">
          <Text className="text-lg font-medium text-gray-900 mb-4">Suggested Communities</Text>
          <View className="space-y-4 gap-y-4">
            {displaySuggested.map((community: Community) => (
              <View key={community._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
                <View className="flex-row items-start justify-between mb-3 w-full">
                  <View className="flex-1 border-gray-100">
                    <View className="flex-row items-center flex-wrap gap-2 mb-2">
                       <Text className="text-base font-medium text-gray-900">{community.name}</Text>
                       {community.isVerified && (
                          <View className="bg-blue-100 rounded-full p-1">
                            <Shield size={12} color="#2563eb" />
                          </View>
                        )}
                    </View>
                    <Text className="text-sm font-medium text-indigo-600 mb-2">{community.subject}</Text>
                  </View>
                  <View className="items-center justify-center">
                     <Globe size={20} color="#6b7280" />
                  </View>
                </View>

                <View className="flex-row items-center gap-4 text-gray-600 mb-3">
                   <View className="flex-row items-center gap-1">
                     <Users size={16} color="#4b5563" />
                     <Text className="text-sm text-gray-600 ml-1">{community.membersCount} members</Text>
                   </View>
                </View>

                <TouchableOpacity 
                  onPress={() => enrollInCommunity(community._id)}
                  className="w-full bg-indigo-600 py-3 rounded-xl flex-row items-center justify-center gap-2">
                   <Plus size={18} color="#ffffff" />
                   <Text className="text-white font-medium text-sm">Enroll Now</Text>
                </TouchableOpacity>
              </View>
            ))}
            {displaySuggested.length === 0 && (
              <Text className="text-gray-500 italic">No communities actived for this filter.</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { Camera, Mail, Building2, BookOpen, Award, Settings, Bell, Lock, HelpCircle, LogOut, ChevronRight, X, User as UserIcon } from "lucide-react-native";
import { useAuthContext } from "../../contexts/AuthContext";
import { useCommunitiesContext } from "../../contexts/CommunitiesContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuthContext();
  const { communities } = useCommunitiesContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editInstitution, setEditInstitution] = useState(user?.institution || "");

  if (!user) return null;

  const getSubjectName = (id: string) => {
    const comm = communities.find((c: any) => c._id === id);
    return comm ? comm.name : "Active Subject"; 
  };

  const stats = [
    { label: "Study Hours", value: user.studyHours?.toString() || "0", icon: BookOpen, color: "#2563eb" },
    { label: "Completed Tasks", value: user.completedTasks?.toString() || "0", icon: Award, color: "#16a34a" },
    { label: "Active Days", value: user.activeDays?.toString() || "1", icon: Award, color: "#9333ea" },
  ];

  const menuItems = [
    { icon: Settings, label: "Account Settings" },
    { icon: Bell, label: "Notifications", badge: "3" },
    { icon: Lock, label: "Privacy & Security" },
    { icon: HelpCircle, label: "Help & Support" },
  ];

  const handleSaveProfile = async () => {
     await updateProfile({ name: editName, institution: editInstitution });
     setIsEditing(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="bg-indigo-600 px-6 pt-16 pb-8 rounded-b-[32px]">
          <Text className="text-3xl font-semibold text-white mb-8">Profile</Text>

          {/* Profile Card */}
          <View className="bg-white/20 rounded-3xl p-6">
            <View className="flex-row items-start gap-4 mb-6">
              <View className="relative">
                <View className="w-20 h-20 bg-indigo-400 rounded-full items-center justify-center">
                  <Text className="text-3xl text-white font-medium">{user.name.charAt(0)}</Text>
                </View>
                <TouchableOpacity className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                  <Camera size={16} color="#4f46e5" />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-medium text-white mb-1">{user.name}</Text>
                <View className="flex-row items-center gap-2 mb-2">
                  <Mail size={16} color="#e0e7ff" />
                  <Text className="text-sm text-indigo-100">{user.email}</Text>
                </View>
                {user.institution ? (
                  <View className="flex-row items-center gap-2">
                    <Building2 size={16} color="#e0e7ff" />
                    <Text className="text-sm text-indigo-100">{user.institution}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-indigo-100">Member since {user.joinDate}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} className="bg-white/20 px-4 py-2 rounded-full">
                <Text className="text-white text-sm">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 py-6">
          <Text className="text-lg font-medium text-gray-900 mb-4">Your Stats</Text>
          <View className="flex-row justify-between w-full">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <View key={idx} className="bg-white rounded-2xl p-4 shadow-sm w-[31%] items-center">
                  <Icon size={28} color={stat.color} style={{ marginBottom: 8 }} />
                  <Text className="text-xl font-semibold text-gray-900 mb-1">{stat.value}</Text>
                  <Text className="text-xs text-gray-600 text-center">{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Active Subjects */}
        <View className="px-6 py-6 bg-white border border-x-0 border-y-gray-200">
          <Text className="text-lg font-medium text-gray-900 mb-4">Active Subjects</Text>
          <View className="flex-row flex-wrap gap-2">
            {user.subjects.map((subject, idx) => (
              <View key={idx} className="bg-indigo-50 px-4 py-2 rounded-full">
                <Text className="text-sm text-indigo-700">{getSubjectName(subject)}</Text>
              </View>
            ))}
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text className="text-sm text-gray-700">+ Add Subject</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6 py-6">
          <View className="bg-white rounded-3xl overflow-hidden shadow-sm">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  className={`flex-row items-center justify-between p-5 border-gray-100 ${idx !== menuItems.length - 1 ? 'border-b' : ''}`}
                >
                  <View className="flex-row items-center gap-4">
                    <Icon size={20} color="#4b5563" />
                    <Text className="text-base font-medium text-gray-900">{item.label}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {item.badge && (
                      <View className="bg-red-500 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-semibold">{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight size={20} color="#9ca3af" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Logout */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={() => {
              logout();
              router.replace("/(auth)/Login");
            }}
            className="w-full bg-red-50 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <LogOut size={20} color="#dc2626" />
            <Text className="text-red-600 font-medium">Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-2">
          <Text className="text-xs text-gray-400">AI Learning App v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} animationType="fade" transparent={true}>
         <View className="flex-1 bg-black/60 justify-center items-center px-6">
            <View className="bg-white w-full rounded-[32px] p-6 pb-8">
               <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-2xl font-semibold text-gray-900">Edit Profile</Text>
                  <TouchableOpacity onPress={() => setIsEditing(false)} className="bg-gray-100 p-2 rounded-full">
                     <X size={20} color="#4b5563" />
                  </TouchableOpacity>
               </View>
               
               <View className="space-y-4 gap-y-4 mb-8">
                  <View>
                     <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
                     <View className="bg-gray-50 flex-row items-center rounded-2xl px-4 border border-gray-200">
                        <UserIcon size={20} color="#9ca3af" />
                        <TextInput 
                           value={editName}
                           onChangeText={setEditName}
                           className="flex-1 p-4 text-base text-gray-900"
                        />
                     </View>
                  </View>
                  <View>
                     <Text className="text-sm font-medium text-gray-700 mb-2">Institution Name</Text>
                     <View className="bg-gray-50 flex-row items-center rounded-2xl px-4 border border-gray-200">
                        <Building2 size={20} color="#9ca3af" />
                        <TextInput 
                           value={editInstitution}
                           onChangeText={setEditInstitution}
                           placeholder="Where do you study?"
                           className="flex-1 p-4 text-base text-gray-900"
                        />
                     </View>
                  </View>
               </View>

               <TouchableOpacity onPress={handleSaveProfile} className="bg-indigo-600 rounded-2xl p-4 items-center">
                  <Text className="text-white font-semibold text-lg">Save Changes</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
}

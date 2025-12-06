import { Tabs, Redirect } from "expo-router";
import { Calendar, User, Trophy, Plus } from "lucide-react-native";
import React from "react";
import Colors from "../../constants/colors";
import { useApp } from "../../providers/AppProvider";

export default function TabLayout() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return null;
  }

  if (!currentUser) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.light.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />

      {/* ✅ FIX: Always render the Screen, but hide the button if not admin */}
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          // If admin, show normally (undefined). If not, hide (null).
          href: currentUser.role === "admin" ? undefined : null,
          tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
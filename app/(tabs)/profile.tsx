import { useApp } from "../../providers/AppProvider";
import { User, Award, Calendar, LogOut, Shield } from "lucide-react-native";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/colors";

export default function ProfileScreen() {
  const { currentUser, logout, events } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!currentUser) {
    return null;
  }

  const registeredEvents = events.filter((e) =>
    currentUser.registeredEvents.includes(e.id)
  );
  const attendedEvents = events.filter((e) =>
    currentUser.attendedEvents.includes(e.id)
  );

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={48} color={Colors.light.primary} />
          </View>
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          {currentUser.role === "admin" ? (
            <View style={styles.roleBadge}>
              <Shield size={14} color="#FFFFFF" />
              <Text style={styles.roleBadgeText}>Club Admin</Text>
            </View>
          ) : (
            <View style={[styles.roleBadge, styles.studentBadge]}>
              <User size={14} color="#FFFFFF" />
              <Text style={styles.roleBadgeText}>Student</Text>
            </View>
          )}
        </View>

        {currentUser.role === "student" && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Award size={24} color={Colors.light.primary} />
                </View>
                <Text style={styles.statValue}>{currentUser.points}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Calendar size={24} color={Colors.light.secondary} />
                </View>
                <Text style={styles.statValue}>
                  {currentUser.attendedEvents.length}
                </Text>
                <Text style={styles.statLabel}>Events Attended</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>College ID</Text>
                  <Text style={styles.infoValue}>
                    {currentUser.collegeId || "N/A"}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>
                    {currentUser.department || "N/A"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Activity</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Registered Events</Text>
                  <Text style={styles.infoValue}>
                    {registeredEvents.length}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Completed Events</Text>
                  <Text style={styles.infoValue}>{attendedEvents.length}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {currentUser.role === "admin" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Club Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Club Name</Text>
                <Text style={styles.infoValue}>
                  {currentUser.clubName || "N/A"}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Events Created</Text>
                <Text style={styles.infoValue}>
                  {events.filter((e) => e.createdBy === currentUser.id).length}
                </Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.light.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  studentBadge: {
    backgroundColor: Colors.light.secondary,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.icon,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.light.icon,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.error,
  },
});

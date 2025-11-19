import { useApp, useLeaderboard } from "../../providers/AppProvider";
import { Trophy, Medal, Award, Star } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/colors";

export default function LeaderboardScreen() {
  const leaderboard = useLeaderboard();
  const { currentUser } = useApp();
  const insets = useSafeAreaInsets();

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy size={24} color="#FFD700" />;
      case 1:
        return <Medal size={24} color="#C0C0C0" />;
      case 2:
        return <Award size={24} color="#CD7F32" />;
      default:
        return null;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "#FFD700";
      case 1:
        return "#C0C0C0";
      case 2:
        return "#CD7F32";
      default:
        return Colors.light.border;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
        <Trophy size={32} color={Colors.light.primary} />
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Top participants this semester</Text>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isCurrentUser = item.id === currentUser?.id;

          return (
            <View
              style={[
                styles.rankCard,
                isCurrentUser && styles.rankCardHighlight,
                index < 3 && styles.rankCardTop,
              ]}
            >
              <View style={styles.rankLeft}>
                <View
                  style={[
                    styles.rankNumber,
                    { borderColor: getRankColor(index) },
                  ]}
                >
                  {index < 3 ? (
                    getRankIcon(index)
                  ) : (
                    <Text style={styles.rankText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.userName,
                      isCurrentUser && styles.userNameHighlight,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                    {isCurrentUser && " (You)"}
                  </Text>
                  <Text style={styles.userDepartment} numberOfLines={1}>
                    {item.department || "N/A"}
                  </Text>
                </View>
              </View>
              <View style={styles.rankRight}>
                <View style={styles.pointsBadge}>
                  <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.pointsText}>{item.points}</Text>
                </View>
                <Text style={styles.eventsText}>
                  {item.attendedEvents.length} events
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Trophy size={64} color={Colors.light.icon} />
            <Text style={styles.emptyText}>No rankings yet</Text>
            <Text style={styles.emptySubtext}>
              Attend events to get on the leaderboard
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.light.icon,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  rankCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  rankCardTop: {
    borderWidth: 2,
  },
  rankCardHighlight: {
    backgroundColor: "#F0FDFA",
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  rankLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  rankNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
  rankText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  userNameHighlight: {
    color: Colors.light.primary,
    fontWeight: "700" as const,
  },
  userDepartment: {
    fontSize: 13,
    color: Colors.light.icon,
  },
  rankRight: {
    alignItems: "flex-end",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  eventsText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 4,
  },
});

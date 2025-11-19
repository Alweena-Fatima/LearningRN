import { useFilteredEvents, useApp } from "../../providers/AppProvider";
import { EventCategory, EventStatus } from "../../types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Search, Calendar, MapPin, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/colors";

const CATEGORIES: (EventCategory | "All")[] = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Academic",
  "Social",
  "Other",
];

export default function EventsScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "all">("upcoming");

  const filteredEvents = useFilteredEvents(search, selectedCategory, selectedStatus);
  const { currentUser } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.greeting}>
            Hello, {currentUser?.name.split(" ")[0]}!
          </Text>
          <Text style={styles.headerSubtitle}>Discover campus events</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.light.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={Colors.light.icon}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === category && styles.filterChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statusContainer}>
        {(["upcoming", "ongoing", "completed"] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              selectedStatus === status && styles.statusButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === status && styles.statusButtonTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isRegistered = item.registeredParticipants.includes(
            currentUser?._id || ""
          );
          const spotsLeft = item.maxParticipants - item.registeredParticipants.length;

          return (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => router.push(`/event/${item._id}` as any)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
              {isRegistered && (
                <View style={styles.registeredBadge}>
                  <Text style={styles.registeredBadgeText}>Registered</Text>
                </View>
              )}
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>{item.points} pts</Text>
                  </View>
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.clubName} numberOfLines={1}>
                  by {item.clubName}
                </Text>
                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={14} color={Colors.light.icon} />
                    <Text style={styles.detailText}>
                      {formatDate(item.date)} • {item.startTime}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color={Colors.light.icon} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {item.venue}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Users size={14} color={Colors.light.icon} />
                    <Text
                      style={[
                        styles.detailText,
                        spotsLeft < 10 && styles.detailTextWarning,
                      ]}
                    >
                      {spotsLeft} spots left
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={Colors.light.icon} />
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.light.icon,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
 filterScroll: {
   
    minHeight: 65, 
    flexGrow: 0,
    marginBottom: 2, // Increased from 12 to 24 to force separation
  },
  filterContent: {
    paddingHorizontal: 20,
    // Add vertical padding so the borders of the chips don't get cut off
    paddingVertical: 10, 
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  statusContainer: {
    flexDirection: "row",
   
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: "#F0FDFA",
    borderColor: Colors.light.primary,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.icon,
  },
  statusButtonTextActive: {
    color: Colors.light.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  eventImage: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.light.border,
  },
  registeredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.light.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  registeredBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  pointsBadge: {
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  clubName: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.light.icon,
    flex: 1,
  },
  detailTextWarning: {
    color: Colors.light.error,
    fontWeight: "600" as const,
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

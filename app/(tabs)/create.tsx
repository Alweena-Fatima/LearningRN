import { useApp } from "../../providers/AppProvider";
import { EventCategory, Event } from "../../types";
import { Calendar, MapPin, Users, DollarSign, Image as ImageIcon, Clock } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/colors";

const CATEGORIES: EventCategory[] = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Academic",
  "Social",
  "Other",
];

export default function CreateEventScreen() {
  const { currentUser, createEvent, isCreatingEvent } = useApp();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("Technical");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [points, setPoints] = useState("");

  const handleCreate = () => {
  if (
    !title ||
    !description ||
    !venue ||
    !date ||
    !startTime ||
    !endTime ||
    !maxParticipants ||
    !points
  ) {
    Alert.alert("Error", "Please fill in all fields");
    return;
  }

  const dateValue = new Date(date).getTime();
  if (isNaN(dateValue)) {
    Alert.alert("Error", "Invalid date format. Use YYYY-MM-DD");
    return;
  }

  const event = {
    title,
    description,
    category,
    clubName: currentUser?.clubName || "Unknown Club",
    venue,
    date: dateValue,
    startTime,
    endTime,
    imageUrl:
      imageUrl ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    maxParticipants: parseInt(maxParticipants, 10),
    registeredParticipants: [],
    registrationDeadline: dateValue - 2 * 24 * 60 * 60 * 1000,
    status: "upcoming",
    createdBy: currentUser?._id || "",
    createdAt: Date.now(),
    points: parseInt(points, 10),
  };

  createEvent(event);
  Alert.alert("Success", "Event created successfully!", [
    {
      text: "OK",
      onPress: () => {
        setTitle("");
        setDescription("");
        setVenue("");
        setDate("");
        setStartTime("");
        setEndTime("");
        setImageUrl("");
        setMaxParticipants("");
        setPoints("");
      },
    },
  ]);
};


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create New Event</Text>
            <Text style={styles.headerSubtitle}>
              Fill in the details below
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Tech Talks 2025"
                placeholderTextColor={Colors.light.icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your event..."
                placeholderTextColor={Colors.light.icon}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Venue *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={Colors.light.icon} />
                <TextInput
                  style={styles.inputField}
                  value={venue}
                  onChangeText={setVenue}
                  placeholder="e.g., Auditorium A"
                  placeholderTextColor={Colors.light.icon}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color={Colors.light.icon} />
                <TextInput
                  style={styles.inputField}
                  value={date}
                  onChangeText={setDate}
                  placeholder="2025-03-15"
                  placeholderTextColor={Colors.light.icon}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Start Time *</Text>
                <View style={styles.inputWithIcon}>
                  <Clock size={20} color={Colors.light.icon} />
                  <TextInput
                    style={styles.inputField}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="10:00 AM"
                    placeholderTextColor={Colors.light.icon}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>End Time *</Text>
                <View style={styles.inputWithIcon}>
                  <Clock size={20} color={Colors.light.icon} />
                  <TextInput
                    style={styles.inputField}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="12:00 PM"
                    placeholderTextColor={Colors.light.icon}
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Max Participants *</Text>
                <View style={styles.inputWithIcon}>
                  <Users size={20} color={Colors.light.icon} />
                  <TextInput
                    style={styles.inputField}
                    value={maxParticipants}
                    onChangeText={setMaxParticipants}
                    placeholder="100"
                    placeholderTextColor={Colors.light.icon}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Points *</Text>
                <View style={styles.inputWithIcon}>
                  <DollarSign size={20} color={Colors.light.icon} />
                  <TextInput
                    style={styles.inputField}
                    value={points}
                    onChangeText={setPoints}
                    placeholder="50"
                    placeholderTextColor={Colors.light.icon}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL (Optional)</Text>
              <View style={styles.inputWithIcon}>
                <ImageIcon size={20} color={Colors.light.icon} />
                <TextInput
                  style={styles.inputField}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="https://..."
                  placeholderTextColor={Colors.light.icon}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                isCreatingEvent && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={isCreatingEvent}
            >
              <Text style={styles.createButtonText}>
                {isCreatingEvent ? "Creating..." : "Create Event"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.light.icon,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.card,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.light.card,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});

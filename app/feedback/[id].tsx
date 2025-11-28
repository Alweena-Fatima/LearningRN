import { useApp, useEventDetails } from "../../providers/AppProvider";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Star, Send } from "lucide-react-native";
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
  ActivityIndicator
} from "react-native";
import Colors from "../../constants/colors";

export default function FeedbackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { event } = useEventDetails(id || "");
  const { currentUser, submitFeedback, isSubmittingFeedback } = useApp();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!event || !currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading...</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    // 1. Validation
    if (rating === 0) {
      if (Platform.OS === 'web') alert("Please select a rating");
      else Alert.alert("Error", "Please select a rating");
      return;
    }

    // 2. Prepare Data (Using _id for MongoDB compatibility)
    const feedbackData = {
      _id: Date.now().toString(), // Temp ID
      eventId: event._id, // <--- CHANGED from .id to ._id
      userId: currentUser._id, // <--- CHANGED from .id to ._id
      userName: currentUser.name,
      rating,
      comment: comment.trim(),
      createdAt: Date.now(),
    };

    // 3. Submit with Callbacks (Async handling)
    submitFeedback(feedbackData, {
      onSuccess: () => {
        // Success Logic
        const message = `Thank you! You earned ${event.points} points.`;
        
        if (Platform.OS === 'web') {
           alert(message);
           router.back();
        } else {
           Alert.alert("Success", message, [
             { text: "OK", onPress: () => router.back() }
           ]);
        }
      },
      onError: (err) => {
        console.error(err);
        const msg = "Could not submit feedback.";
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert("Error", msg);
      }
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "Submit Feedback" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>How was the event?</Text>
            <Text style={styles.subtitle}>{event.title}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Rating *</Text>
            <View style={styles.starsContainer}>
              {Array.from({ length: 5 }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setRating(index + 1)}
                  style={styles.starButton}
                >
                  <Star
                    size={48}
                    color={index < rating ? Colors.light.accent : Colors.light.border}
                    fill={index < rating ? Colors.light.accent : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1
                  ? "Poor"
                  : rating === 2
                  ? "Fair"
                  : rating === 3
                  ? "Good"
                  : rating === 4
                  ? "Very Good"
                  : "Excellent"}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Your Feedback</Text>
            <TextInput
              style={styles.textArea}
              value={comment}
              onChangeText={setComment}
              placeholder="Tell us about your experience..."
              placeholderTextColor={Colors.light.icon}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (rating === 0 || isSubmittingFeedback) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={rating === 0 || isSubmittingFeedback}
          >
            {isSubmittingFeedback ? (
               <ActivityIndicator color="#FFF" />
            ) : (
               <>
                 <Send size={20} color="#FFFFFF" />
                 <Text style={styles.submitButtonText}>Submit Feedback</Text>
               </>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              By submitting feedback, you'll earn {event.points} points!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.accent,
    textAlign: "center",
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.card,
    minHeight: 150,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  infoBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  infoText: {
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
    marginTop: 40,
  },
});
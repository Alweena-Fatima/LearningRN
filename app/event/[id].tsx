import { useEventDetails, useApp } from "../../providers/AppProvider";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Award,
  Star,
  MessageSquare,
  Instagram,
  Twitter,
  Linkedin
} from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from "react-native";
import Colors from "../../constants/colors";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { event, eventFeedbacks, isRegistered, hasFeedback, avgRating } =
    useEventDetails(id || "");
  const { currentUser, registerEvent, unregisterEvent, isRegistering, isUnregistering } =
    useApp();
  const router = useRouter();

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const spotsLeft = event.maxParticipants - event.registeredParticipants.length;
  const isFull = spotsLeft <= 0;
  const isPastEvent = event.date < Date.now();
  const canRegister = !isRegistered && !isFull && !isPastEvent;
  const canUnregister = isRegistered && !isPastEvent;
  const canFeedback = true;

  const handleRegister = () => {
    if (!currentUser) return;
    registerEvent({ eventId: event._id, userId: currentUser._id });
  };

  const handleUnregister = () => {
    if (!currentUser) return;
    if (Platform.OS === 'web') {
      if (confirm("Are you sure you want to unregister?")) {
        unregisterEvent({ eventId: event._id, userId: currentUser._id });
      }
    } else {
      Alert.alert("Unregister", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Unregister", 
          style: "destructive", 
          onPress: () => unregisterEvent({ eventId: event._id, userId: currentUser._id }) 
        },
      ]);
    }
  };

  const handleFeedback = () => {
    router.push(`/feedback/${event._id}` as any);
  };

  const handleSocialLink = async (url?: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open link");
    }
  };

  // Helper variables to check if links exist
  const socials = event.socials || {};
  const hasInsta = !!socials.instagram;
  const hasTwitter = !!socials.twitter;
  const hasLinkedin = !!socials.linkedin;

  return (
    <>
      <Stack.Screen options={{ title: event.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: event.imageUrl }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.badges}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Award size={14} color="#FFFFFF" />
                <Text style={styles.pointsText}>{event.points} pts</Text>
              </View>
            </View>
            {isRegistered && (
              <View style={styles.registeredBadge}>
                <Text style={styles.registeredText}>Registered</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.clubName}>Organized by {event.clubName}</Text>

          {/* --- MODIFIED SOCIAL LINKS SECTION --- */}
          <View style={styles.socialRow}>
            {/* Instagram */}
            <TouchableOpacity 
              style={[styles.socialIcon, !hasInsta && styles.socialIconDisabled]} 
              onPress={() => handleSocialLink(socials.instagram)}
              disabled={!hasInsta}
            >
              <Instagram 
                size={20} 
                color={hasInsta ? Colors.light.primary : "#A0A0A0"} 
              />
            </TouchableOpacity>

            {/* Twitter */}
            <TouchableOpacity 
              style={[styles.socialIcon, !hasTwitter && styles.socialIconDisabled]} 
              onPress={() => handleSocialLink(socials.twitter)}
              disabled={!hasTwitter}
            >
              <Twitter 
                size={20} 
                color={hasTwitter ? Colors.light.primary : "#A0A0A0"} 
              />
            </TouchableOpacity>

            {/* LinkedIn */}
            <TouchableOpacity 
              style={[styles.socialIcon, !hasLinkedin && styles.socialIconDisabled]} 
              onPress={() => handleSocialLink(socials.linkedin)}
              disabled={!hasLinkedin}
            >
              <Linkedin 
                size={20} 
                color={hasLinkedin ? Colors.light.primary : "#A0A0A0"} 
              />
            </TouchableOpacity>
          </View>
          {/* ----------------------------------- */}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Clock size={20} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {event.startTime} - {event.endTime}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={20} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{event.venue}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Users size={20} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={[styles.infoValue, isFull && styles.fullText]}>
                  {event.registeredParticipants.length} / {event.maxParticipants}
                  {isFull && " (Full)"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {eventFeedbacks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.ratingHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={styles.ratingBadge}>
                  <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.ratingText}>
                    {avgRating.toFixed(1)} ({eventFeedbacks.length})
                  </Text>
                </View>
              </View>
              {eventFeedbacks.map((feedback) => (
                <View key={feedback._id} style={styles.feedbackCard}>
                  <View style={styles.feedbackHeader}>
                    <Text style={styles.feedbackName}>{feedback.userName}</Text>
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          color={
                            i < feedback.rating
                              ? Colors.light.accent
                              : Colors.light.border
                          }
                          fill={
                            i < feedback.rating
                              ? Colors.light.accent
                              : "transparent"
                          }
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.feedbackComment}>{feedback.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {currentUser?.role === "student" && (
        <View style={styles.footer}>
          {canRegister && (
            <TouchableOpacity
              style={[styles.button, isRegistering && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isRegistering}
            >
              <Text style={styles.buttonText}>
                {isRegistering ? "Registering..." : "Register Now"}
              </Text>
            </TouchableOpacity>
          )}
          {canUnregister && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.unregisterButton,
                isUnregistering && styles.buttonDisabled,
              ]}
              onPress={handleUnregister}
              disabled={isUnregistering}
            >
              <Text style={[styles.buttonText, styles.unregisterText]}>
                {isUnregistering ? "Unregistering..." : "Unregister"}
              </Text>
            </TouchableOpacity>
          )}
          {canFeedback && (
            <TouchableOpacity style={styles.button} onPress={handleFeedback}>
              <MessageSquare size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Submit Feedback</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  image: {
    width: "100%",
    height: 280,
    backgroundColor: Colors.light.border,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  registeredBadge: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  registeredText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  clubName: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 12,
  },
  // Social Styles Updated
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  socialIcon: {
    padding: 10,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconDisabled: {
    backgroundColor: '#F5F5F5', // Grey background
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  infoSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  fullText: {
    color: Colors.light.error,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.text,
  },
  ratingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  feedbackCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feedbackName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
  },
  feedbackComment: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.text,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    padding: 20,
    paddingBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  unregisterButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  unregisterText: {
    color: Colors.light.error,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
    marginTop: 40,
  },
});
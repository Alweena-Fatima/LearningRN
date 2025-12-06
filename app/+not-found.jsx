import { Link } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "../constants/colors";
import React from "react";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>Page not found</Text>

      <Link href="/(tabs)" asChild>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: 24,
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
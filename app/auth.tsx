import { useApp } from "../providers/AppProvider";
import { UserRole } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, Users, Star, Lock } from "lucide-react-native";

import { loginApi, signupApi } from "../api/auth";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../constants/colors";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [department, setDepartment] = useState("");
  const [clubName, setClubName] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useApp();
  const router = useRouter();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword("");
  };

  const handleAuth = async () => {
    try {
      // ------------------------ SIGNUP -------------------------
      if (!isLogin) {
        if (!name || !email || !password) {
          Alert.alert("Error", "Please fill all required fields");
          return;
        }

        const payload =
          role === "student"
            ? { name, email, password, role, collegeId, department }
            : { name, email, password, role, clubName };

        const res = await signupApi(payload);

        login(res.data.user);
        router.replace("/(tabs)");
        return;
      }

      // ------------------------ LOGIN -------------------------
      if (isLogin) {
        if (!email || !password) {
          Alert.alert("Error", "Email & Password required");
          return;
        }

        const payload = { email, password };

        const res = await loginApi(payload);

        login(res.data.user);
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.log(err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F766E", "#14B8A6", "#2DD4BF"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Calendar size={40} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Campus Events</Text>
              <Text style={styles.subtitle}>
                {isLogin ? "Welcome Back!" : "Create Your Account"}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isLogin ? "Login as" : "Sign up as"}
              </Text>

              {/* ROLE SWITCH BUTTONS */}
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "student" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("student")}
                >
                  <Users
                    size={24}
                    color={role === "student" ? Colors.light.primary : "#9CA3AF"}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "student" && styles.roleTextActive,
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "admin" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("admin")}
                >
                  <Star
                    size={24}
                    color={role === "admin" ? Colors.light.primary : "#9CA3AF"}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "admin" && styles.roleTextActive,
                    ]}
                  >
                    Club Admin
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SIGNUP FIELDS */}
              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your name"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your.email@college.edu"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </>
              )}

              {/* LOGIN EMAIL FIELD */}
              {isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your.email@college.edu"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* ROLE SPECIFIC FIELDS */}
              {role === "student" ? (
                <>
                  {!isLogin && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>College ID</Text>
                      <TextInput
                        style={styles.input}
                        value={collegeId}
                        onChangeText={setCollegeId}
                        placeholder="CS2024001"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  )}

                  {!isLogin && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Department</Text>
                      <TextInput
                        style={styles.input}
                        value={department}
                        onChangeText={setDepartment}
                        placeholder="Computer Science"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  )}
                </>
              ) : (
                !isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Club Name</Text>
                    <TextInput
                      style={styles.input}
                      value={clubName}
                      onChangeText={setClubName}
                      placeholder="Tech Club"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                )
              )}

              {/* PASSWORD FIELD */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                  />
                  <Lock size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                </View>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleAuth}>
                <Text style={styles.loginButtonText}>
                  {isLogin ? "Login" : "Create Account"}
                </Text>
              </TouchableOpacity>

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode}>
                  <Text style={styles.toggleLink}>
                    {isLogin ? "Sign Up" : "Login"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
  },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: { alignItems: "center", marginBottom: 40 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 32, color: "#fff", fontWeight: "700" },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  roleButtonActive: {
    borderColor: Colors.light.primary,
    backgroundColor: "#F0FDFA",
  },
  roleText: { fontSize: 15, color: "#6B7280" },
  roleTextActive: { color: Colors.light.primary },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  toggleText: { color: "#6B7280", fontSize: 14 },
  toggleLink: { color: Colors.light.primary, fontSize: 14, fontWeight: "600" },
});

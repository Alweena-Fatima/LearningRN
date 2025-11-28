import { useApp } from "../providers/AppProvider";
import { UserRole } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, Users, Star, Lock, KeyRound, Mail } from "lucide-react-native";

// Make sure verifyOtpApi is imported
import { loginApi, signupApi, verifyOtpApi } from "../api/auth";

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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../constants/colors";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpSent, setIsOtpSent] = useState(false); // <--- New State
  const [role, setRole] = useState<UserRole>("student");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [department, setDepartment] = useState("");
  const [clubName, setClubName] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Fields
  const [otp, setOtp] = useState("");
  const [tempUserId, setTempUserId] = useState(""); // To store ID while verifying
  const [loading, setLoading] = useState(false);

  const { login } = useApp();
  const router = useRouter();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setIsOtpSent(false); // Reset OTP state if switching
    setPassword("");
  };

  // 1. HANDLE INITIAL SIGNUP OR LOGIN
  const handleAuth = async () => {
    try {
      setLoading(true);

      // ------------------------ SIGNUP FLOW -------------------------
      if (!isLogin) {
        if (!name || !email || !password) {
          Alert.alert("Error", "Please fill all required fields");
          setLoading(false);
          return;
        }

        // // Domain Validation
        // if (!email.toLowerCase().endsWith("@igdtuw.ac.in")) {
        //    Alert.alert("Restricted", "Please use your @igdtuw.ac.in email.");
        //    setLoading(false);
        //    return;
        // }

        const payload =
          role === "student"
            ? { name, email, password, role, collegeId, department }
            : { name, email, password, role, clubName };

        // Call Signup API
        const res = await signupApi(payload);

        // Success: Store User ID and Show OTP Screen
        setTempUserId(res.data.userId); 
        setIsOtpSent(true); 
        Alert.alert("Success", "OTP sent to your email!");
        setLoading(false);
        return;
      }

      // ------------------------ LOGIN FLOW -------------------------
      if (isLogin) {
        if (!email || !password) {
          Alert.alert("Error", "Email & Password required");
          setLoading(false);
          return;
        }

        const payload = { email, password };
        const res = await loginApi(payload);

        // --- CHANGE THIS BLOCK ---
        // Old code:
        // login(res.data.user);
        // router.replace("/(tabs)");

        // New Code (Wait for login to finish):
        await login(res.data.user); 
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.log(err);
      setLoading(false);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  };

  // 2. HANDLE OTP VERIFICATION
  const handleVerifyOtp = async () => {
      if(!otp || otp.length < 6) {
          Alert.alert("Error", "Please enter valid 6-digit OTP");
          return;
      }
      
      try {
          setLoading(true);
          const res = await verifyOtpApi({ userId: tempUserId, otp });
          
          // Success: Log them in directly
          await login(res.data.user);
          router.replace("/(tabs)");
      } catch (err: any) {
          setLoading(false);
          Alert.alert("Verification Failed", err?.response?.data?.message || "Invalid OTP");
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
                {isOtpSent 
                  ? "Verify Your Email" 
                  : isLogin ? "Welcome Back!" : "Create Your Account"
                }
              </Text>
            </View>

            <View style={styles.card}>
              
              {/* ----------------- OTP VERIFICATION UI ----------------- */}
              {isOtpSent ? (
                <View>
                    <Text style={styles.otpInstruction}>
                        We have sent a verification code to {email}.
                    </Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Enter OTP</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1, borderWidth: 0, letterSpacing: 5, fontSize: 24, textAlign: 'center' }]}
                                value={otp}
                                onChangeText={setOtp}
                                placeholder="123456"
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <KeyRound size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={handleVerifyOtp} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Verify & Login</Text>
                        )}
                    </TouchableOpacity>

                     <TouchableOpacity onPress={() => setIsOtpSent(false)} style={styles.backButton}>
                        <Text style={styles.toggleLink}>Change Email / Back</Text>
                    </TouchableOpacity>
                </View>
              ) : (
                /* ----------------- NORMAL LOGIN/SIGNUP UI ----------------- */
                <>
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

                  {/* FORM FIELDS */}
                  {!isLogin && (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                          style={styles.input}
                          value={name}
                          onChangeText={setName}
                          placeholder="Enter your name"
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email (@igdtuw.ac.in)</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your.email@igdtuw.ac.in"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {!isLogin && role === "student" && (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>College ID</Text>
                        <TextInput
                          style={styles.input}
                          value={collegeId}
                          onChangeText={setCollegeId}
                          placeholder="CS2024001"
                        />
                      </View>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Department</Text>
                        <TextInput
                          style={styles.input}
                          value={department}
                          onChangeText={setDepartment}
                          placeholder="Computer Science"
                        />
                      </View>
                    </>
                  )}

                  {!isLogin && role === "admin" && (
                     <View style={styles.inputContainer}>
                        <Text style={styles.label}>Club Name</Text>
                        <TextInput
                          style={styles.input}
                          value={clubName}
                          onChangeText={setClubName}
                          placeholder="Tech Club"
                        />
                      </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[styles.input, { flex: 1, borderWidth: 0 }]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        secureTextEntry
                      />
                      <Lock size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.loginButton} onPress={handleAuth} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>
                        {isLogin ? "Login" : "Send OTP & Register"}
                        </Text>
                    )}
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
                </>
              )}
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
  otpInstruction: {
      textAlign: 'center',
      marginBottom: 20,
      fontSize: 14,
      color: "#6B7280"
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
  backButton: {
    alignItems: 'center',
    marginTop: 20
  },
  toggleText: { color: "#6B7280", fontSize: 14 },
  toggleLink: { color: Colors.light.primary, fontSize: 14, fontWeight: "600" },
});
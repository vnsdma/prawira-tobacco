"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import Icon from "@expo/vector-icons/MaterialIcons"
import Toast from "react-native-toast-message"
import { useAuth } from "../contexts/AuthContext"

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)

  const { user, login, register, logout, isAuthenticated } = useAuth()

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert("Error", "Mohon lengkapi email dan password")
      return
    }

    setLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      Toast.show({
        type: "success",
        text1: "Login berhasil",
        text2: "Selamat datang kembali!",
      })
      // Clear form after successful login
      setLoginForm({ email: "", password: "" })
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Silakan coba lagi"
      Alert.alert("Login gagal", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      Alert.alert("Error", "Mohon lengkapi semua field yang wajib")
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert("Error", "Password tidak cocok")
      return
    }

    if (registerForm.password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter")
      return
    }

    setLoading(true)
    try {
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.phone)
      Toast.show({
        type: "success",
        text1: "Registrasi berhasil",
        text2: "Akun Anda telah dibuat!",
      })
      // Clear form after successful registration
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
      })
    } catch (error) {
      console.error("Register error:", error)
      const errorMessage = error instanceof Error ? error.message : "Silakan coba lagi"
      Alert.alert("Registrasi gagal", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          try {
            await logout()
            Toast.show({
              type: "success",
              text1: "Logout berhasil",
              text2: "Sampai jumpa lagi!",
            })
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Gagal logout",
            })
          }
        },
      },
    ])
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{activeTab === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.activeTab]}
            onPress={() => setActiveTab("login")}
          >
            <Text style={[styles.tabText, activeTab === "login" && styles.activeTabText]}>Masuk</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "register" && styles.activeTab]}
            onPress={() => setActiveTab("register")}
          >
            <Text style={[styles.tabText, activeTab === "register" && styles.activeTabText]}>Daftar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          {activeTab === "login" ? (
            <View style={styles.form}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={loginForm.email}
                onChangeText={(text) => setLoginForm((prev) => ({ ...prev, email: text }))}
                placeholder="Masukkan email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={loginForm.password}
                  onChangeText={(text) => setLoginForm((prev) => ({ ...prev, password: text }))}
                  placeholder="Masukkan password"
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? "visibility-off" : "visibility"} size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Masuk</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.inputLabel}>Nama Lengkap *</Text>
              <TextInput
                style={styles.input}
                value={registerForm.name}
                onChangeText={(text) => setRegisterForm((prev) => ({ ...prev, name: text }))}
                placeholder="Masukkan nama lengkap"
                autoCorrect={false}
              />

              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={registerForm.email}
                onChangeText={(text) => setRegisterForm((prev) => ({ ...prev, email: text }))}
                placeholder="Masukkan email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.inputLabel}>Nomor Telepon</Text>
              <TextInput
                style={styles.input}
                value={registerForm.phone}
                onChangeText={(text) => setRegisterForm((prev) => ({ ...prev, phone: text }))}
                placeholder="08xxxxxxxxxx"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.input}
                value={registerForm.password}
                onChangeText={(text) => setRegisterForm((prev) => ({ ...prev, password: text }))}
                placeholder="Masukkan password (minimal 6 karakter)"
                secureTextEntry
                autoCorrect={false}
              />

              <Text style={styles.inputLabel}>Konfirmasi Password *</Text>
              <TextInput
                style={styles.input}
                value={registerForm.confirmPassword}
                onChangeText={(text) => setRegisterForm((prev) => ({ ...prev, confirmPassword: text }))}
                placeholder="Konfirmasi password"
                secureTextEntry
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Daftar</Text>}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Dengan mendaftar, Anda dapat menikmati fitur:</Text>
            <View style={styles.benefitItem}>
              <Icon name="check" size={16} color="#059669" />
              <Text style={styles.benefitText}>Riwayat pesanan yang tersimpan</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check" size={16} color="#059669" />
              <Text style={styles.benefitText}>Wishlist produk favorit</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check" size={16} color="#059669" />
              <Text style={styles.benefitText}>Checkout yang lebih cepat</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check" size={16} color="#059669" />
              <Text style={styles.benefitText}>Notifikasi promo khusus</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView style={styles.profileContainer}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{user?.status || "active"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Icon name="phone" size={20} color="#6b7280" />
              <Text style={styles.detailText}>{user?.phone || "Belum diisi"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="location-on" size={20} color="#6b7280" />
              <Text style={styles.detailText}>{user?.address || "Belum diisi"}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Bergabung sejak</Text>
              <Text style={styles.statValue}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Login terakhir</Text>
              <Text style={styles.statValue}>
                {user?.last_login ? new Date(user.last_login).toLocaleDateString("id-ID") : "-"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Pengaturan Akun</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifikasi Email</Text>
              <Text style={styles.settingDescription}>Terima notifikasi pesanan via email</Text>
            </View>
            <Icon name="toggle-on" size={24} color="#059669" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Newsletter</Text>
              <Text style={styles.settingDescription}>Terima info promo dan produk baru</Text>
            </View>
            <Icon name="toggle-off" size={24} color="#d1d5db" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#059669",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#fff",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 12,
  },
  submitButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  benefitsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  profileDetails: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})

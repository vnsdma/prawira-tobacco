import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/MaterialIcons"
import Toast from "react-native-toast-message"

import { CartProvider } from "./src/contexts/CartContext"
import { AuthProvider } from "./src/contexts/AuthContext"

import HomeScreen from "./src/screens/HomeScreen"
import CartScreen from "./src/screens/CartScreen"
import OrdersScreen from "./src/screens/OrdersScreen"
import ProfileScreen from "./src/screens/ProfileScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          if (route.name === "Home") {
            iconName = "home"
          } else if (route.name === "Cart") {
            iconName = "shopping-cart"
          } else if (route.name === "Orders") {
            iconName = "receipt"
          } else if (route.name === "Profile") {
            iconName = "person"
          } else {
            iconName = "circle"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#6b7280",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Beranda" }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarLabel: "Keranjang" }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: "Pesanan" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profil" }} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </CartProvider>
    </AuthProvider>
  )
}

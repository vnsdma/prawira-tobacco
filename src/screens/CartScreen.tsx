"use client"

import { useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useCart } from "../contexts/CartContext"
import { formatPrice } from "../utils/formatters"
import CheckoutModal from "../components/CheckoutModal"

export default function CartScreen({ navigation }: any) {
  const { state, updateQuantity, removeItem, clearCart } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  // Extract values from state
  const { items, total, itemCount } = state

  const renderCartItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
          >
            <Icon name="remove" size={16} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <Icon name="add" size={16} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
            <Icon name="delete" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keranjang Belanja</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount} item</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Keranjang masih kosong</Text>
        </View>
      ) : (
        <>
          <FlatList data={items} renderItem={renderCartItem} keyExtractor={(item) => item.id} style={styles.cartList} />

          {/* Total and Checkout */}
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabelBold}>Total</Text>
                <Text style={styles.totalValueBold}>{formatPrice(total)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={() => setShowCheckout(true)}>
              <Text style={styles.checkoutButtonText}>Checkout ({itemCount} item)</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <CheckoutModal visible={showCheckout} onClose={() => setShowCheckout(false)} items={items} total={total} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingTop:50
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
    marginRight: 74,
  },
  badge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
  },
  cartList: {
    flex: 1,
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  quantity: {
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    marginLeft: 12,
    padding: 8,
  },
  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 16,
  },
  totalContainer: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 14,
    color: "#1f2937",
  },
  totalLabelBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  totalValueBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  checkoutButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

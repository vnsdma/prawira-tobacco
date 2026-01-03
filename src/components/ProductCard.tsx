import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { Product } from "../types"
import { formatPrice } from "../utils/formatters"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

const { width } = Dimensions.get("window")
const cardWidth = (width - 48) / 2

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.in_stock === 0
  const isLowStock = product.in_stock > 0 && product.in_stock < 10

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        {isLowStock && (
          <View style={[styles.badge, styles.lowStockBadge]}>
            <Text style={styles.badgeText}>Stok Terbatas</Text>
          </View>
        )}
        {isOutOfStock && (
          <View style={[styles.badge, styles.outOfStockBadge]}>
            <Text style={styles.badgeText}>Habis</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.stock}>Stok: {product.in_stock}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.addButton, isOutOfStock && styles.disabledButton]}
          onPress={() => onAddToCart(product)}
          disabled={isOutOfStock}
          activeOpacity={0.7}
        >
          <Icon name={isOutOfStock ? "block" : "add"} size={16} color="#fff" />
          <Text style={styles.addButtonText}>{isOutOfStock ? "Habis" : "Tambah"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    marginLeft:10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: cardWidth * 0.75,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowStockBadge: {
    backgroundColor: "#f59e0b",
  },
  outOfStockBadge: {
    backgroundColor: "#ef4444",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    padding: 12,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1f2937",
    lineHeight: 18,
  },
  description: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 4,
  },
  stock: {
    fontSize: 12,
    color: "#6b7280",
  },
  buttonContainer: {
    padding: 12,
    paddingTop: 0,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 40,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
})

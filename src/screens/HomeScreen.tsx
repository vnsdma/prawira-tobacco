"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  SafeAreaView, 
  RefreshControl, 
  Alert, 
  Image, 
  Dimensions, 
  NativeSyntheticEvent, 
  NativeScrollEvent 
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Toast from "react-native-toast-message"

import { useCart } from "../contexts/CartContext"
import ProductCard from "../components/ProductCard"
import CategoryFilter from "../components/CategoryFilter"
import { API_BASE_URL, API_ENDPOINTS } from "../config/api"

// --- TYPES ---
interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: string
  in_stock: number
  description?: string
}

interface Promo {
  id: number
  name: string
  code: string
  image_url: string
  description: string
}

// Mendapatkan lebar layar HP untuk responsif
const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [promos, setPromos] = useState<Promo[]>([]) // State untuk Promo
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [categories, setCategories] = useState<string[]>(["Semua"])
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [promoIndex, setPromoIndex] = useState(0) // Untuk indikator titik carousel

  const { addItem } = useCart()
  const flatListRef = useRef<FlatList>(null) // Ref untuk auto-scroll carousel

  useEffect(() => {
    fetchData()
  }, [])

  // Auto Slide Effect untuk Banner
  useEffect(() => {
    if (promos.length === 0) return;
    
    const interval = setInterval(() => {
      setPromoIndex(prevIndex => {
        let nextIndex = prevIndex + 1;
        if (nextIndex >= promos.length) {
          nextIndex = 0;
        }
        // Scroll otomatis
        flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true
        });
        return nextIndex;
      });
    }, 5000); // Ganti slide setiap 5 detik

    return () => clearInterval(interval);
  }, [promos.length]);

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory])

  const fetchData = async () => {
    setLoading(true)
    // Panggil kedua API secara paralel
    await Promise.all([fetchProducts(), fetchPromos()])
    setLoading(false)
    setRefreshing(false)
  }

  const fetchPromos = async () => {
    try {
        // Asumsi endpoint promo ada di sini
        const response = await fetch(`${API_BASE_URL}/api/mobile/promo/active`)
        if (response.ok) {
            const data = await response.json()
            setPromos(data)
        }
    } catch (error) {
        console.error("Error fetching promos:", error)
        // Tidak perlu alert fatal jika promo gagal, cukup log saja
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`)
      if (response.ok) {
        const data = await response.json()
        const productsData = data.products || []
        setProducts(productsData)
        
        const uniqueCategories = Array.from(
            new Set(productsData.map((p: Product) => {
            return p.category.trim().toLowerCase()
          }))
        ).map(cat => {
            // @ts-ignore
          return cat.charAt(0).toUpperCase() + cat.slice(1)
        })
        
        setCategories(["Semua", ...uniqueCategories])
      } else {
        throw new Error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      Alert.alert("Error", "Gagal memuat produk.")
    }
  }

  const filterProducts = () => {
    let filtered = products
    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((product) => 
        product.category.trim().toLowerCase() === selectedCategory.toLowerCase()
      )
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    }
    setFilteredProducts(filtered)
  }

  const handleAddToCart = (product: Product) => {
    if (product.in_stock > 0) {
      addItem(product)
      Toast.show({
        type: "success",
        text1: "Berhasil",
        text2: `${product.name} masuk keranjang`,
      })
    } else {
      Toast.show({
        type: "error",
        text1: "Stok Habis",
        text2: "Produk tidak tersedia",
      })
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  // Handle manual scroll pada carousel untuk update indikator titik
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setPromoIndex(index);
  };

  // --- RENDER COMPONENT ---

  // Sub-komponen Banner Carousel
  const renderBanner = () => {
    if (promos.length === 0) return null;

    return (
        <View style={styles.bannerContainer}>
            <FlatList
                ref={flatListRef}
                data={promos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                onMomentumScrollEnd={onMomentumScrollEnd}
                renderItem={({ item }) => (
                    <View style={styles.bannerItem}>
                        <Image 
                            source={{ uri: item.image_url }} 
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                        <View style={styles.bannerOverlay}>
                            <Text style={styles.bannerTitle}>{item.name}</Text>
                            <Text style={styles.bannerDesc} numberOfLines={1}>{item.description}</Text>
                        </View>
                    </View>
                )}
            />
            {/* Dots Indicator */}
            <View style={styles.pagination}>
                {promos.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === promoIndex ? styles.activeDot : styles.inactiveDot
                        ]}
                    />
                ))}
            </View>
        </View>
    )
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Prawira Tobacco</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk tembakau..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Render Carousel Banner Disini */}
      {renderBanner()}

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <CategoryFilter
            category={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
        />
      </View>
    </View>
  )

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onAddToCart={() => handleAddToCart(item)} />
  )

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Memuat data...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingTop: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 15, // Margin kiri kanan agar tidak nempel
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  // Style Carousel Banner
  bannerContainer: {
    marginBottom: 16,
    height: 180, // Tinggi banner
    position: 'relative',
  },
  bannerItem: {
    width: screenWidth, // Banner memenuhi lebar layar
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15, // Padding agar gambar tidak nempel tepi layar
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12, // Membuat sudut gambar melengkung
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bannerDesc: {
    color: '#eee',
    fontSize: 12,
    maxWidth: 200,
  },
  pagination: {
    position: 'absolute',
    bottom: 15,
    right: 30, // Posisi dots di kanan bawah
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 16, // Dot aktif lebih panjang
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  categoryContainer: {
    paddingBottom: 10,
    paddingHorizontal: 5
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default HomeScreen
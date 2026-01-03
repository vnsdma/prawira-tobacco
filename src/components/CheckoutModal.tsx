"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking, // Pastikan Linking diimport
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { WebView } from 'react-native-webview';
import Icon from "react-native-vector-icons/MaterialIcons"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"
import { formatPrice } from "../utils/formatters"
import { rajaOngkirService, apiService, checkCashifyStatus, promoService } from "../services/api"
import { RAJAONGKIR_CONFIG } from "../config/api"
import QRCode from 'react-native-qrcode-svg';

// --- Interfaces ---
interface CheckoutModalProps {
  visible: boolean
  onClose: () => void
}

interface Province {
  id: string
  name: string
}

interface City {
  id: string
  name: string
}

interface District {
  id: string
  name: string
}

interface ShippingService {
  service: string
  description: string
  cost: Array<{
    value: number
    etd: string
    note: string
  }>
}

interface Promo {
  id: number
  code: string
  description: string
  discount_type: string
  discount_value: number
  discount_amount: number
}

// Tipe data untuk Payment
type PaymentMethod = "midtrans" | "cashify" | "cod"
type EWalletType = "dana" | "ovo" | "shopeepay" | "gopay"

export default function CheckoutModal({ visible, onClose }: CheckoutModalProps) {
  const { state: cartState, clearCart } = useCart()
  const { user } = useAuth()

  const items = cartState?.items || []
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })

  // Shipping state
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [selectedCityName, setSelectedCityName] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>("")
  const [couriers] = useState(["jne", "pos", "tiki"])
  const [selectedCourier, setSelectedCourier] = useState<string>("jne")
  const [shippingServices, setShippingServices] = useState<ShippingService[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>("")
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingShipping, setLoadingShipping] = useState(false)

  // Payment State (BARU)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("midtrans")
  const [selectedEwallet, setSelectedEwallet] = useState<EWalletType>("dana")

  // Promo state
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null)
  const [loadingPromo, setLoadingPromo] = useState(false)
  const [promoError, setPromoError] = useState("")
  
  const [loading, setLoading] = useState(false)

  const discountAmount = appliedPromo?.discount_amount || 0
  const total = subtotal + shippingCost - discountAmount

  const [midtransUrl, setMidtransUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProvinces()
  }, [])

  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user])

  useEffect(() => {
    if (visible) {
      setQrData(null)         // Hapus QR Code lama
      setLoading(false)       // Reset loading
      setPromoError("")       // Reset error promo
      // Opsional: Reset pilihan shipping jika ingin benar-benar fresh
      // setShippingCost(0)
      // setSelectedShipping("")
    }
  }, [visible])
  
  const [qrData, setQrData] = useState<{
    qr_string: string;
    totalAmount: number;
    transactionId: string;
  } | null>(null);
  // ============================================
  // RAJAONGKIR API CALLS - Updated with District
  // ============================================

  const fetchProvinces = async () => {
    setLoadingProvinces(true)
    try {
      console.log('📡 Fetching provinces...')
      const data = await rajaOngkirService.getProvinces()
      console.log('✅ Provinces loaded:', data.length)
      setProvinces(data)
    } catch (error) {
      console.error('❌ Failed to fetch provinces:', error)
      Alert.alert("Error", "Gagal mengambil data provinsi")
    } finally {
      setLoadingProvinces(false)
    }
  }
  
  const fetchCities = async (provinceId: number) => {
    console.log('📡 fetchCities called with:', provinceId, '(type:', typeof provinceId, ')')
    
    // Validate provinceId
    if (!provinceId || isNaN(provinceId) || provinceId <= 0) {
      console.error('❌ Invalid provinceId:', provinceId)
      return
    }
  
    setLoadingCities(true)
    setCities([]) // Clear previous cities
    setSelectedCity("")
    setDistricts([])
    setSelectedDistrict("")
    setShippingServices([])
    setSelectedShipping("")
    setShippingCost(0)
  
    try {
      console.log('📡 Calling rajaOngkirService.getCities with:', provinceId)
      const data = await rajaOngkirService.getCities(provinceId)
      console.log('✅ Cities received:', data.length)
      console.log('✅ First city:', data[0]) // Debug first city structure
      setCities(data)
    } catch (error) {
      console.error('❌ Failed to fetch cities:', error)
      Alert.alert("Error", "Gagal mengambil data kota")
    } finally {
      setLoadingCities(false)
    }
  }
  
  const fetchDistricts = async (cityId: number) => {
    console.log('📡 fetchDistricts called with:', cityId, '(type:', typeof cityId, ')')
    
    if (!cityId || isNaN(cityId) || cityId <= 0) {
      console.error('❌ Invalid cityId:', cityId)
      return
    }
  
    setLoadingDistricts(true)
    setDistricts([])
    setSelectedDistrict("")
    setShippingServices([])
    setSelectedShipping("")
    setShippingCost(0)
  
    try {
      console.log('📡 Calling rajaOngkirService.getDistricts with:', cityId)
      const data = await rajaOngkirService.getDistricts(cityId)
      console.log('✅ Districts received:', data.length)
      setDistricts(data)
    } catch (error) {
      console.error('❌ Failed to fetch districts:', error)
      Alert.alert("Error", "Gagal mengambil data kecamatan")
    } finally {
      setLoadingDistricts(false)
    }
  }
  const fetchShippingCost = async (districtId: number, courier: string) => {
    if (!districtId || !courier) return

    setLoadingShipping(true)
    setShippingServices([])
    setSelectedShipping("")
    setShippingCost(0)

    try {
      const totalWeight = items.reduce((sum, item) => {
        const weight = item.weight || 100
        return sum + item.quantity * weight
      }, 0)

      console.log('📡 Calculating shipping cost...')
      console.log('📡 Origin:', RAJAONGKIR_CONFIG.ORIGIN_DISTRICT_ID)
      console.log('📡 Destination:', districtId)
      console.log('📡 Weight:', totalWeight, 'g')
      console.log('📡 Courier:', courier)

      const results = await rajaOngkirService.calculateCost(
        RAJAONGKIR_CONFIG.ORIGIN_DISTRICT_ID,
        districtId,
        totalWeight,
        courier
      )

      console.log('✅ Results received:', results.length)
      console.log('✅ First result:', results[0])

      if (results.length > 0) {
        // Results are already grouped by courier
        // Get the costs array from first courier result
        const courierResult = results[0]
        
        if (courierResult.costs && courierResult.costs.length > 0) {
          console.log('✅ Services available:', courierResult.costs.length)
          setShippingServices(courierResult.costs)
        } else {
          console.log('⚠️ No services in courier result')
          Alert.alert("Info", "Tidak ada layanan pengiriman tersedia untuk kurir ini")
        }
      } else {
        console.log('⚠️ No results returned')
        Alert.alert("Info", "Tidak ada layanan pengiriman tersedia")
      }
    } catch (error) {
      console.error("❌ Failed to fetch shipping cost:", error)
      Alert.alert("Error", "Gagal menghitung ongkir")
    } finally {
      setLoadingShipping(false)
    }
  }

  const handleProvinceChange = (provinceId: string) => {
    console.log('=== PROVINCE CHANGE ===')
    console.log('1. Raw provinceId:', provinceId, '(type:', typeof provinceId, ')')
    
    setSelectedProvince(provinceId)
    
    // Reset all dependent fields
    setSelectedCity("")
    setSelectedCityName("")
    setCities([])
    setSelectedDistrict("")
    setSelectedDistrictName("")
    setDistricts([])
    setShippingServices([])
    setShippingCost(0)
    
    if (provinceId && provinceId !== "") {
      const province = provinces.find((p) => p.id.toString() === provinceId)
      console.log('2. Found province:', province)
      
      if (province) {
        setSelectedProvinceName(province.name)
        
        // CRITICAL: Convert to number before calling API
        const provinceIdNumber = Number(provinceId)
        console.log('3. Converted to number:', provinceIdNumber, '(type:', typeof provinceIdNumber, ')')
        
        if (!isNaN(provinceIdNumber) && provinceIdNumber > 0) {
          console.log('4. Calling fetchCities...')
          fetchCities(provinceIdNumber)
        } else {
          console.error('❌ Invalid province ID after conversion:', provinceIdNumber)
        }
      } else {
        console.error('❌ Province not found in array')
      }
    }
    console.log('=======================')
  }
  
  const handleCityChange = (cityId: string) => {
    console.log('=== CITY CHANGE ===')
    console.log('1. Raw cityId:', cityId, '(type:', typeof cityId, ')')
    
    setSelectedCity(cityId)
    
    // Reset dependent fields
    setSelectedDistrict("")
    setSelectedDistrictName("")
    setDistricts([])
    setShippingServices([])
    setShippingCost(0)
    
    if (cityId && cityId !== "") {
      const city = cities.find((c) => c.id.toString() === cityId)
      console.log('2. Found city:', city)
      
      if (city) {
        setSelectedCityName(city.name)
        
        // Convert to number
        const cityIdNumber = Number(cityId)
        console.log('3. Converted to number:', cityIdNumber, '(type:', typeof cityIdNumber, ')')
        
        if (!isNaN(cityIdNumber) && cityIdNumber > 0) {
          console.log('4. Calling fetchDistricts...')
          fetchDistricts(cityIdNumber)
        } else {
          console.error('❌ Invalid city ID after conversion:', cityIdNumber)
          Alert.alert("Error", "ID kota tidak valid")
        }
      }
    }
    console.log('===================')
  }
  
  const handleDistrictChange = (districtId: string) => {
    console.log('=== DISTRICT CHANGE ===')
    console.log('1. Raw districtId:', districtId)
    
    setSelectedDistrict(districtId)
    
    // Reset shipping
    setShippingServices([])
    setShippingCost(0)
    
    if (districtId && districtId !== "") {
      const district = districts.find((d) => d.id.toString() === districtId)
      console.log('2. Found district:', district)
      
      if (district) {
        setSelectedDistrictName(district.name)
        
        if (selectedCourier) {
          const districtIdNumber = Number(districtId)
          console.log('3. Converted to number:', districtIdNumber)
          
          if (!isNaN(districtIdNumber) && districtIdNumber > 0) {
            fetchShippingCost(districtIdNumber, selectedCourier)
          }
        }
      }
    }
    console.log('=======================')
  }

  const handleCourierChange = (courier: string) => {
    setSelectedCourier(courier)
    if (selectedDistrict && courier) {
      fetchShippingCost(selectedDistrict, courier)
    }
  }

  const handleShippingChange = (serviceIndex: string) => {
    console.log('🔍 Shipping service selected:', serviceIndex)
    setSelectedShipping(serviceIndex)
    
    const index = Number.parseInt(serviceIndex)
    
    if (shippingServices[index]) {
      const service = shippingServices[index]
      console.log('🔍 Selected service:', service)
      
      // Access cost from the cost array
      const costValue = service.cost[0].value
      console.log('🔍 Cost value:', costValue)
      
      setShippingCost(costValue)
    }
  }
  // ============================================
  // PROMO CODE - Keep as is from original
  // ============================================

  const validatePromo = async () => {
    // 1. Basic input validation
    if (!promoCode.trim()) {
      setPromoError("Masukkan kode promo")
      return
    }

    setLoadingPromo(true)
    setPromoError("")

    try {
      // 2. Call the service
      // We pass the promoCode and the current subtotal (calculated from cart items)
      console.log("Checking promo:", promoCode, "Subtotal:", subtotal)
      
      const response = await promoService.validate(promoCode, subtotal)

      // 3. Handle Success
      if (response.success && response.promo) {
        setAppliedPromo(response.promo)
        
        // Optional: Show success alert
        Alert.alert(
            "Berhasil!", 
            `Kode promo diterapkan. Anda hemat ${formatPrice(response.promo.discount_amount)}`
        )
      } else {
        // Fallback if success is false but no specific error thrown
        setPromoError("Kode promo tidak valid")
        setAppliedPromo(null)
      }

    } catch (error: any) {
      // 4. Handle Error
      console.error("Promo validation error:", error)
      
      // The apiService helper usually throws an Error with the message from the backend API
      // e.g., "Minimum pembelian untuk promo ini adalah Rp 50.000"
      setPromoError(error.message || "Gagal memvalidasi kode promo")
      setAppliedPromo(null)
    } finally {
      setLoadingPromo(false)
    }
  }

  const removePromo = () => {
    setAppliedPromo(null)
    setPromoCode("")
    setPromoError("")
  }

  // ============================================
  // ORDER CREATION
  // ============================================

  const createOrder = async () => {
    try {
      let shippingServiceName = ""
      if (selectedShipping && shippingServices.length > 0) {
        const serviceIndex = Number.parseInt(selectedShipping)
        const service = shippingServices[serviceIndex]
        shippingServiceName = `${selectedCourier.toUpperCase()} - ${service.service}`
      }

      // Ambil metode pembayaran saat ini dari state
      const currentPaymentMethod = paymentMethod;

      // PERBAIKAN: Mengubah keys menjadi snake_case agar sesuai backend
      const orderData = {
        // User Info
        user_id: user?.id ? parseInt(user.id.toString()) : null, // userId -> user_id
        customer_email: customerInfo.email, // customerEmail -> customer_email (WAJIB)
        customer_name: customerInfo.name,   // customerName -> customer_name
        customer_phone: customerInfo.phone, // customerPhone -> customer_phone
        
        // Items
        items: items.map((item) => ({
          product_id: item.id, // productId -> product_id
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          // Opsional: tambahkan weight jika backend butuh
          // weight: item.weight 
        })),

        // Shipping Info
        shipping_address: { // shippingAddress -> shipping_address
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          district: selectedDistrictName,
          city: selectedCityName,
          province: selectedProvinceName,
        },
        shipping_cost: shippingCost, // shippingCost -> shipping_cost
        courier: shippingServiceName,

        // Payment Info
        subtotal: subtotal,
        discount: discountAmount,
        total_amount: total, // totalAmount -> total_amount (WAJIB)
        promo_code: appliedPromo?.code || null, // promoCode -> promo_code
        
        payment_method: currentPaymentMethod, // paymentMethod -> payment_method
        payment_details: currentPaymentMethod === 'cashify' ? { ewallet: selectedEwallet } : null // paymentDetails -> payment_details
      }

      console.log("📦 Creating order with data:", JSON.stringify(orderData, null, 2))

      // Create order via API
      const response = await apiService.createOrder(orderData)
      console.log("✅ Order created:", response)
      
      return response
    } catch (error) {
      console.error("❌ Create order error:", error)
      throw error
    }
  }

  const initiateMidtransPayment = async (orderId: string) => {
    try {
      console.log("💳 Initiating Midtrans payment for order:", orderId)

      // PERBAIKAN: Menyesuaikan struktur JSON dengan yang diminta Backend Next.js
      const paymentData = {
        order_id: orderId,          // Frontend lama: orderId -> Backend minta: order_id
        amount: Math.round(total),  // Pastikan integer
        
        // Frontend lama: customerDetails -> Backend minta: customer
        customer: {                 
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },

        // Opsional: Kirim item_details jika backend support, 
        // tapi pastikan key-nya snake_case jika backend mintanya begitu.
        item_details: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }

      // Tambahkan ongkir ke item_details jika ada
      if (shippingCost > 0) {
        paymentData.item_details.push({
          id: "SHIPPING",
          name: "Ongkos Kirim",
          price: shippingCost,
          quantity: 1,
        })
      }

      // Tambahkan diskon ke item_details jika ada (sebagai nilai minus)
      if (discountAmount > 0) {
        paymentData.item_details.push({
          id: "DISCOUNT",
          name: "Diskon",
          price: -discountAmount,
          quantity: 1,
        })
      }

      console.log("💳 Payment data payload:", JSON.stringify(paymentData, null, 2))

      // Call Snap API
      const snapResponse = await apiService.createSnapPayment(paymentData)
      console.log("✅ Snap token received:", snapResponse.token)

      return snapResponse
    } catch (error) {
      console.error("❌ Midtrans payment error:", error)
      throw error
    }
  }

  const initiateCashifyPayment = async (orderId: string) => {
    try {
      console.log(`💳 Initiating Cashify Payment (${selectedEwallet}) for Order:`, orderId)
      
      // PENTING: Anda perlu membuat endpoint ini di apiService Anda
      // Cashify biasanya butuh: amount, wallet type (dana/ovo/dll), dan return_url
      const paymentData = {
        orderId: orderId,
        amount: total,
        ewalletType: selectedEwallet, 
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email
      }

      
      const response = await apiService.createCashifyPayment(paymentData)
      
      
      return response
    } catch (error) {
      console.error("❌ Cashify payment error:", error)
      throw error
    }
  }

  const openMidtransPayment = async (redirectUrl: string) => {
    try {
      console.log("🌐 Opening payment URL:", redirectUrl)
      
      const supported = await Linking.canOpenURL(redirectUrl)
      
      if (supported) {
        await Linking.openURL(redirectUrl)
      } else {
        Alert.alert("Error", "Tidak dapat membuka halaman pembayaran")
      }
    } catch (error) {
      console.error("❌ Failed to open payment URL:", error)
      Alert.alert("Error", "Gagal membuka halaman pembayaran")
    }
  }

  const handleCheckout = async () => {
        // 1. VALIDASI INPUT
        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
          Alert.alert("Error", "Mohon lengkapi semua informasi pelanggan")
          return
        }
    
        if (!selectedProvince || !selectedCity || !selectedDistrict) {
          Alert.alert("Error", "Mohon lengkapi alamat pengiriman")
          return
        }
    
        if (!selectedCourier || !selectedShipping) {
          Alert.alert("Error", "Mohon pilih kurir dan layanan pengiriman")
          return
        }
    
        if (items.length === 0) {
          Alert.alert("Error", "Keranjang belanja kosong")
          return
        }
    
        setLoading(true)
    
        // 2. PROSES UTAMA (TRY BLOCK)
            try {
          const orderResponse = await createOrder()
          const orderId = orderResponse.order?.id || orderResponse.id
          
          if (paymentMethod === "midtrans") {
              const snapResponse = await initiateMidtransPayment(orderId)
              const paymentUrl = snapResponse.redirectUrl || snapResponse.redirect_url
  
              if (paymentUrl) {
                  // PERUBAHAN: Jangan Linking.openURL, tapi set state untuk WebView
                  setMidtransUrl(paymentUrl);
                  // Kita tidak clearCart/closeModal dulu, tunggu user selesai di WebView
              }    
          } else if (paymentMethod === "cashify") {
            // --- CASHIFY LOGIC (QR Code) ---
            console.log("🔄 Requesting Cashify QR...")
            const cashifyResponse = await initiateCashifyPayment(orderId)
            
            // Ambil data dari response (handle struktur data.data atau root)
            const responseData = cashifyResponse.data || cashifyResponse
    
            if (responseData && responseData.qr_string) {
                 // Jika dapat QR, set State QR agar UI berubah jadi tampilan QR
                 setQrData({
                     qr_string: responseData.qr_string,
                     totalAmount: responseData.totalAmount || total, // Pakai totalAmount dari backend (unik)
                     transactionId: responseData.transactionId
                 })
                 
                 // PENTING: Jangan panggil onClose() di sini agar modal tetap terbuka menampilkan QR
                 // setLoading(false) akan dipanggil otomatis oleh blok 'finally' di bawah
    
            } else if (responseData && responseData.redirect_url) {
                 // Fallback jika Cashify mengembalikan URL redirect (bukan QR)
                 await Linking.openURL(responseData.redirect_url)
                 clearCart()
                 onClose()
            } else {
                 throw new Error("Gagal mendapatkan data pembayaran Cashify")
            }
    
          } else if (paymentMethod === "cod") {
            // --- COD LOGIC ---
            Alert.alert(
              "Pesanan Berhasil",
              "Pesanan COD berhasil dibuat. Silakan siapkan uang tunai saat kurir datang.",
              [{ 
                text: "OK", 
                onPress: () => {
                  clearCart()
                  onClose()
                }
              }]
            )
          }
    
        } catch (error: any) {
          // 3. ERROR HANDLING (CATCH BLOCK)
          console.error("❌ Checkout error:", error)
          Alert.alert(
            "Error", 
            error.message || "Gagal memproses pesanan. Silakan coba lagi."
          )
        } finally {
          // 4. CLEANUP (FINALLY BLOCK)
          // Selalu matikan loading indicator apapun hasilnya
          setLoading(false)
        }
      }

  const onSuccessCheckout = (orderId: string, provider: string) => {
    clearCart()
    onClose()
  }
  const handleModalClose = () => {
    setQrData(null)      // Bersihkan QR
    setLoading(false)    // Matikan loading
    onClose()            // Panggil fungsi close bawaan parent
  }

  const handleCheckCashifyStatus = async () => {
    if (!qrData?.transactionId) return;

    setLoading(true);
    try {
        // Panggil backend kita untuk cek status & update DB
        const result = await checkCashifyStatus(qrData.transactionId);
        
        console.log("Status Result:", result);

        // Sesuaikan kondisi string 'paid'/'success' dengan return backend
        const status = 
            result.final_status ||           // Prioritas 1: Dari backend yang sudah kita fix
            result?.data?.data?.status ||    // Prioritas 2: Sesuai log raw Anda
            result?.data?.status ||          
            result?.status || 
            'pending';

        console.log("✅ Extracted Status:", status);

        if (['paid', 'success', 'settlement'].includes(status)) {
            Alert.alert(
                "Pembayaran Berhasil",
                "Terima kasih! Pembayaran Anda telah kami terima. Silakan tunggu konfirmasi admin untuk pengiriman.",
                [{ 
                    text: "OK", 
                    onPress: () => {
                        handleModalClose(); // Tutup modal & bersihkan cart
                    }
                }]
            );
        } else {
            Alert.alert(
                "Pembayaran Belum Masuk",
                `Status saat ini: ${status.toUpperCase()}.\n\nJika Anda baru saja transfer, mohon tunggu 1-2 menit lalu tekan tombol ini lagi.`,
                [{ text: "Tutup" }]
            );
        }
    } catch (error) {
        console.error("Check Status Error:", error);
        Alert.alert("Error", "Gagal mengecek status pembayaran. Periksa koneksi internet Anda.");
    } finally {
        setLoading(false);
    }
  }

  // --- Render Functions untuk UI Pembayaran ---
  const renderPaymentMethods = () => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            
            <View style={styles.paymentMethodContainer}>
                {/* Button COD */}
                <TouchableOpacity 
                    style={[styles.paymentCard, paymentMethod === 'cod' && styles.paymentCardSelected]}
                    onPress={() => setPaymentMethod('cod')}
                >
                    <Icon name="payments" size={24} color={paymentMethod === 'cod' ? "#059669" : "#6b7280"} />
                    <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextSelected]}>COD</Text>
                </TouchableOpacity>

                {/* Button Cashify */}
                <TouchableOpacity 
                    style={[styles.paymentCard, paymentMethod === 'cashify' && styles.paymentCardSelected]}
                    onPress={() => setPaymentMethod('cashify')}
                >
                    <Icon name="account-balance-wallet" size={24} color={paymentMethod === 'cashify' ? "#059669" : "#6b7280"} />
                    <Text style={[styles.paymentText, paymentMethod === 'cashify' && styles.paymentTextSelected]}>E-Wallet</Text>
                </TouchableOpacity>

                {/* Button Midtrans */}
                <TouchableOpacity 
                    style={[styles.paymentCard, paymentMethod === 'midtrans' && styles.paymentCardSelected]}
                    onPress={() => setPaymentMethod('midtrans')}
                >
                    <Icon name="credit-card" size={24} color={paymentMethod === 'midtrans' ? "#059669" : "#6b7280"} />
                    <Text style={[styles.paymentText, paymentMethod === 'midtrans' && styles.paymentTextSelected]}>Transfer</Text>
                </TouchableOpacity>
            </View>

            {/* Sub-menu untuk Cashify (E-Wallet Selection) */}
            {paymentMethod === 'cashify' && (
                <View style={styles.ewalletContainer}>
                    <Text style={styles.subLabel}>Pilih E-Wallet:</Text>
                    <View style={styles.ewalletGrid}>
                        {(['dana', 'ovo', 'shopeepay', 'gopay'] as EWalletType[]).map((wallet) => (
                            <TouchableOpacity
                                key={wallet}
                                style={[styles.ewalletButton, selectedEwallet === wallet && styles.ewalletButtonSelected]}
                                onPress={() => setSelectedEwallet(wallet)}
                            >
                                <Text style={[styles.ewalletText, selectedEwallet === wallet && styles.ewalletTextSelected]}>
                                    {wallet.toUpperCase()}
                                </Text>
                                {selectedEwallet === wallet && (
                                    <View style={styles.checkIcon}>
                                        <Icon name="check-circle" size={16} color="#059669" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Note untuk COD */}
            {paymentMethod === 'cod' && (
                <View style={styles.infoBox}>
                    <Icon name="info-outline" size={16} color="#d97706" />
                    <Text style={styles.infoText}>Pembayaran dilakukan tunai saat kurir tiba.</Text>
                </View>
            )}
        </View>
    )
  }
  if (!items || items.length === 0) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Checkout</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.emptyContainer}>
            <Icon name="shopping-cart" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Keranjang belanja kosong</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={onClose}>
              <Text style={styles.emptyButtonText}>Kembali Belanja</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <Modal 
        visible={!!midtransUrl} 
        animationType="slide" 
        onRequestClose={() => setMidtransUrl(null)}
      >
        <View style={{flex: 1, backgroundColor: 'white'}}>
            <View style={styles.header}>
                <Text style={styles.title}>Pembayaran Midtrans</Text>
                <TouchableOpacity onPress={() => {
                    setMidtransUrl(null);
                    // Opsional: Tanya user apakah sudah selesai
                    Alert.alert("Konfirmasi", "Apakah Anda sudah menyelesaikan pembayaran?", [
                        { text: "Belum", style: "cancel" },
                        { text: "Sudah", onPress: () => { clearCart(); onClose(); } }
                    ]);
                }}>
                    <Icon name="close" size={24} color="#374151" />
                </TouchableOpacity>
            </View>
            {midtransUrl && (
                <WebView 
                    source={{ uri: midtransUrl }}
                    style={{ flex: 1 }}
                    // Opsional: Deteksi jika URL berubah ke URL 'finish' (redirect backend)
                    onNavigationStateChange={(navState) => {
                        // Jika Midtrans redirect ke URL finish website Anda
                        if (navState.url.includes("order_id=") && navState.url.includes("status_code=200")) {
                            setMidtransUrl(null);
                            clearCart();
                            onClose();
                            Alert.alert("Sukses", "Pembayaran berhasil!");
                        }
                    }}
                />
            )}
        </View>
      </Modal>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Checkout</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {qrData ? (
            // ============================================
            // TAMPILAN 1: QR CODE (Jika qrData ada)
            // ============================================
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Pembayaran {selectedEwallet.toUpperCase()}</Text>
              
              <View style={styles.qrFrame}>
                {/* Pastikan sudah install: npm install react-native-qrcode-svg */}
                <QRCode 
                  value={qrData.qr_string} 
                  size={220} 
                />
              </View>

              <Text style={styles.qrInstruction}>
                Scan QR di atas menggunakan aplikasi {selectedEwallet.toUpperCase()}
              </Text>

              <View style={styles.totalPaymentBox}>
                <Text style={styles.totalPaymentLabel}>Total Bayar (Harus Tepat)</Text>
                <Text style={styles.totalPaymentValue}>{formatPrice(qrData.totalAmount)}</Text>
              </View>

              <Text style={styles.warningText}>
                Mohon transfer sesuai nominal hingga 3 digit terakhir agar verifikasi otomatis berhasil.
              </Text>
              
              <TouchableOpacity 
                    style={styles.checkStatusButton}
                    onPress={handleCheckCashifyStatus} // <--- Ganti function ini
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.checkStatusText}>Saya Sudah Bayar</Text>
                    )}
                </TouchableOpacity>
             </View>
           ) : (
            // ============================================
            // TAMPILAN 2: FORM CHECKOUT NORMAL
            // ============================================
            <> 
            {/* ^^^ PENTING: Tanda <> (Fragment) ini yang memperbaiki error Syntax Anda */}

              {/* 1. Order Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
                {items.map((item) => (
                  <View key={item.id} style={styles.orderItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity}x {formatPrice(item.price)}
                    </Text>
                    <Text style={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</Text>
                  </View>
                ))}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                </View>
              </View>

              {/* 2. Customer Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nama Lengkap *</Text>
                  <TextInput
                    style={styles.input}
                    value={customerInfo.name}
                    onChangeText={(text) => setCustomerInfo({ ...customerInfo, name: text })}
                    placeholder="Masukkan nama lengkap"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={customerInfo.email}
                    onChangeText={(text) => setCustomerInfo({ ...customerInfo, email: text })}
                    placeholder="Masukkan email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nomor Telepon *</Text>
                  <TextInput
                    style={styles.input}
                    value={customerInfo.phone}
                    onChangeText={(text) => setCustomerInfo({ ...customerInfo, phone: text })}
                    placeholder="Masukkan nomor telepon"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Alamat Lengkap *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={customerInfo.address}
                    onChangeText={(text) => setCustomerInfo({ ...customerInfo, address: text })}
                    placeholder="Masukkan alamat lengkap"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* 3. Shipping Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pengiriman</Text>
                
                {/* Province Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Provinsi *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedProvince}
                      onValueChange={handleProvinceChange}
                      style={styles.picker}
                      enabled={!loadingProvinces}
                    >
                      <Picker.Item label="Pilih provinsi" value="" />
                      {provinces.map((province) => (
                        <Picker.Item key={province.id} label={province.name} value={province.id.toString()} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* City Picker */}
                {cities.length > 0 && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kota/Kabupaten *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedCity}
                        onValueChange={handleCityChange}
                        style={styles.picker}
                        enabled={!loadingCities}
                      >
                        <Picker.Item label="Pilih kota/kabupaten" value="" />
                        {cities.map((city) => (
                          <Picker.Item key={city.id} label={city.name} value={city.id.toString()} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}

                {/* District Picker */}
                {districts.length > 0 && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kecamatan *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedDistrict}
                        onValueChange={handleDistrictChange}
                        style={styles.picker}
                        enabled={!loadingDistricts}
                      >
                        <Picker.Item label="Pilih kecamatan" value="" />
                        {districts.map((district) => (
                          <Picker.Item key={district.id} label={district.name} value={district.id.toString()} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}

                {/* Courier Picker */}
                {selectedDistrict && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kurir *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedCourier}
                        onValueChange={handleCourierChange}
                        style={styles.picker}
                        enabled={!loadingShipping}
                      >
                        {couriers.map((courier) => (
                          <Picker.Item key={courier} label={courier.toUpperCase()} value={courier} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}

                {/* Shipping Service Picker */}
                {shippingServices.length > 0 && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Layanan Pengiriman *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedShipping}
                        onValueChange={handleShippingChange}
                        style={styles.picker}
                      >
                        <Picker.Item label="Pilih layanan pengiriman" value="" />
                        {shippingServices.map((service, index) => {
                          const label = `${service.service} - ${service.description} - ${formatPrice(service.cost[0].value)} (${service.cost[0].etd})`
                          return (
                            <Picker.Item key={index} label={label} value={index.toString()} />
                          )
                        })}
                      </Picker>
                    </View>
                  </View>
                )}

                {shippingCost > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Ongkos Kirim</Text>
                    <Text style={styles.summaryValue}>{formatPrice(shippingCost)}</Text>
                  </View>
                )}
              </View>

              {/* 4. Payment Methods (PANGGIL FUNGSI RENDER DI SINI) */}
              {renderPaymentMethods()}

              {/* 5. Promo Code */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kode Promo</Text>
                {appliedPromo ? (
                  <View style={styles.appliedPromo}>
                    <View style={styles.promoInfo}>
                      <Icon name="local-offer" size={20} color="#059669" />
                      <View style={styles.promoDetails}>
                        <Text style={styles.promoCode}>{appliedPromo.code}</Text>
                        <Text style={styles.promoDescription}>{appliedPromo.description}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={removePromo}>
                      <Icon name="close" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.promoInput}>
                    <TextInput
                      style={styles.promoInputField}
                      value={promoCode}
                      onChangeText={setPromoCode}
                      placeholder="Masukkan kode promo"
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={[styles.promoButton, loadingPromo && styles.promoButtonDisabled]}
                      onPress={validatePromo}
                      disabled={loadingPromo}
                    >
                      {loadingPromo ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.promoButtonText}>Terapkan</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                {promoError && <Text style={styles.errorText}>{promoError}</Text>}
                {discountAmount > 0 && (
                  <View style={[styles.summaryRow, styles.discountRow]}>
                    <Text style={styles.discountLabel}>Diskon</Text>
                    <Text style={styles.discountValue}>- {formatPrice(discountAmount)}</Text>
                  </View>
                )}
              </View>

              {/* 6. Total */}
              <View style={styles.section}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Pembayaran</Text>
                  <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                </View>
              </View>

            </> 
            // ^^^ PENTING: Penutup Fragment
          )}
        </ScrollView>
        {!qrData && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.checkoutButton, loading && styles.disabledButton]}
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Icon name={paymentMethod === 'cod' ? "local-shipping" : "payment"} size={20} color="#fff" />
                <Text style={styles.checkoutButtonText}>
                    {paymentMethod === 'cod' ? "Proses Pesanan" : `Bayar via ${paymentMethod === 'cashify' ? selectedEwallet.toUpperCase() : 'Midtrans'}`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },
  content: { flex: 1, padding: 16 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1f2937", marginBottom: 12 },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemName: { flex: 1, fontSize: 14, color: "#374151" },
  itemDetails: { fontSize: 12, color: "#6b7280", marginHorizontal: 8 },
  itemTotal: { fontSize: 14, fontWeight: "600", color: "#1f2937", minWidth: 80, textAlign: "right" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
  },
  summaryLabel: { fontSize: 14, color: "#6b7280" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { height: 50 },
  loadingContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  loadingText: { marginLeft: 8, fontSize: 14, color: "#6b7280" },
  promoInput: { flexDirection: "row", gap: 8 },
  promoInputField: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  promoButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
  },
  promoButtonDisabled: { backgroundColor: "#9ca3af" },
  promoButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  appliedPromo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#059669",
    borderRadius: 8,
    padding: 12,
  },
  promoInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  promoDetails: { marginLeft: 8, flex: 1 },
  promoCode: { fontSize: 14, fontWeight: "600", color: "#059669" },
  promoDescription: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  errorText: { fontSize: 12, color: "#ef4444", marginTop: 4 },
  discountRow: { borderTopWidth: 0 },
  discountLabel: { fontSize: 14, color: "#059669", fontWeight: "600" },
  discountValue: { fontSize: 14, fontWeight: "600", color: "#059669" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  totalValue: { fontSize: 20, fontWeight: "bold", color: "#059669" },
  footer: { padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  checkoutButton: { backgroundColor: "#059669", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  disabledButton: { backgroundColor: "#9ca3af" },
  buttonContent: { flexDirection: "row", alignItems: "center" },
  checkoutButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyText: { fontSize: 18, color: "#6b7280", marginTop: 16, marginBottom: 24 },
  emptyButton: { backgroundColor: "#059669", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  paymentMethodContainer: { flexDirection: "row", gap: 12, marginTop: 8 },
  paymentCard: { flex: 1, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, alignItems: "center", justifyContent: "center", height: 80 },
  paymentCardSelected: { backgroundColor: "#f0fdf4", borderColor: "#059669", borderWidth: 2 },
  paymentText: { marginTop: 8, fontSize: 12, fontWeight: "600", color: "#4b5563" },
  paymentTextSelected: { color: "#059669" },
  
  ewalletContainer: { marginTop: 16, padding: 12, backgroundColor: "#f9fafb", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  subLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 },
  ewalletGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ewalletButton: { width: "48%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  ewalletButtonSelected: { borderColor: "#059669", backgroundColor: "#f0fdf4" },
  ewalletText: { fontSize: 12, fontWeight: "600", color: "#4b5563" },
  ewalletTextSelected: { color: "#059669" },
  checkIcon: { position: "absolute", top: 4, right: 4 },
  
  infoBox: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8, padding: 10, backgroundColor: "#fffbeb", borderRadius: 6, borderWidth: 1, borderColor: "#fcd34d" },
  infoText: { flex: 1, fontSize: 12, color: "#b45309" },
  qrContainer: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 12 },
  qrTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' },
  qrFrame: { padding: 10, backgroundColor: 'white', elevation: 3, borderRadius: 8, marginBottom: 20 },
  qrInstruction: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  totalPaymentBox: { backgroundColor: '#ecfdf5', padding: 16, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#10b981' },
  totalPaymentLabel: { fontSize: 12, color: '#047857', marginBottom: 4 },
  totalPaymentValue: { fontSize: 24, fontWeight: 'bold', color: '#047857' },
  warningText: { fontSize: 12, color: '#ef4444', textAlign: 'center', marginBottom: 20 },
  checkStatusButton: { backgroundColor: '#059669', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center' },
  checkStatusText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
})
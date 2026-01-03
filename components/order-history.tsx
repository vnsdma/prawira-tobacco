"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  id: number
  quantity: number
  price: number
  products: {
    name: string
  }
}

interface Order {
  id: number
  total_amount: number
  status: string
  created_at: string
  order_items: OrderItem[]
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const fetchOrders = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Masukkan email",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const apiUrl = `${window.location.origin}/api/mobile/orders?email=${encodeURIComponent(email)}`
      console.log("Fetching orders from:", apiUrl)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Order history API error:", response.status, errorText)
        throw new Error(`Failed to fetch orders: ${response.status}`)
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memuat riwayat pesanan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="px-4 py-6 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Riwayat Pesanan</h2>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchOrders} disabled={loading}>
            {loading ? "Mencari..." : "Cari"}
          </Button>
        </div>
      </div>

      {orders.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {email ? "Tidak ada pesanan ditemukan" : "Masukkan email untuk melihat riwayat pesanan"}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">ORD-{order.id}</CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.products.name} x{item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

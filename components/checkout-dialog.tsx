"use client"

import React from "react"

import type { ReactElement } from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import SnapPayment from "./snap-payment"
import type { CartItem } from "@/hooks/use-cart"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  total: number
}

export default function CheckoutDialog({ open, onOpenChange, items, total }: CheckoutDialogProps): ReactElement {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("snap")
  const [loading, setLoading] = useState(false)
  const [snapToken, setSnapToken] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)

  const { toast } = useToast()
  const { clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  // Auto-fill form if user is logged in
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [isAuthenticated, user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        toast({
          title: "Data tidak lengkap",
          description: "Mohon lengkapi nama, email, dan nomor telepon",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Create order first
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: total,
        payment_method: paymentMethod,
        notes: "",
      }

      console.log("Creating order with data:", orderData)

      const orderResponse = await fetch("/api/mobile/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => null)
        const errorText = errorData?.error || `HTTP error ${orderResponse.status}`
        console.error("Order creation error:", orderResponse.status, errorText)
        throw new Error(`Failed to create order: ${errorText}`)
      }

      const order = await orderResponse.json()
      console.log("Order created:", order)
      setCurrentOrderId(order.id)

      if (paymentMethod === "snap") {
        // Create Snap payment token
        const snapResponse = await fetch("/api/payment/snap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: order.id,
            amount: total,
            customer: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
          }),
        })

        if (!snapResponse.ok) {
          const errorData = await snapResponse.json().catch(() => null)
          const errorText = errorData?.error || `HTTP error ${snapResponse.status}`
          console.error("Snap creation error:", snapResponse.status, errorText)
          throw new Error(`Failed to create payment: ${errorText}`)
        }

        const snapResult = await snapResponse.json()
        console.log("Snap token created:", snapResult)

        // Set snap token to trigger payment popup
        setSnapToken(snapResult.token)
      } else {
        // COD payment
        clearCart()
        onOpenChange(false)
        toast({
          title: "Pesanan berhasil dibuat",
          description: `Pesanan ${order.order_number || `#${order.id}`} akan segera diproses. Pembayaran dilakukan saat barang diterima.`,
        })
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Gagal membuat pesanan",
        description: error instanceof Error ? error.message : "Silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (result: any) => {
    console.log("Payment success result:", result)
    clearCart()
    setSnapToken(null)
    setCurrentOrderId(null)
    onOpenChange(false)
    toast({
      title: "Pembayaran Berhasil!",
      description: `Pesanan Anda telah dibayar. Terima kasih!`,
    })
  }

  const handlePaymentPending = (result: any) => {
    console.log("Payment pending result:", result)
    clearCart()
    setSnapToken(null)
    setCurrentOrderId(null)
    onOpenChange(false)
    toast({
      title: "Pembayaran Tertunda",
      description: "Pembayaran Anda sedang diproses. Kami akan mengirim konfirmasi setelah pembayaran berhasil.",
    })
  }

  const handlePaymentError = (result: any) => {
    console.log("Payment error result:", result)
    setSnapToken(null)
    toast({
      title: "Pembayaran Gagal",
      description: "Terjadi kesalahan dalam pembayaran. Silakan coba lagi.",
      variant: "destructive",
    })
  }

  const handlePaymentClose = () => {
    console.log("Payment popup closed")
    setSnapToken(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="font-medium">Ringkasan Pesanan</h3>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Informasi Pelanggan</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Input
                  id="address"
                  placeholder="Jl. Contoh No. 123, Kota"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="font-medium">Metode Pembayaran</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="snap" id="snap" />
                  <Label htmlFor="snap" className="flex-1">
                    <div>
                      <div className="font-medium">Pembayaran Online</div>
                      <div className="text-sm text-muted-foreground">Transfer Bank, E-Wallet, Kartu Kredit/Debit</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1">
                    <div>
                      <div className="font-medium">Bayar di Tempat (COD)</div>
                      <div className="text-sm text-muted-foreground">Bayar saat barang diterima</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : paymentMethod === "snap" ? "Bayar Sekarang" : "Buat Pesanan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Snap Payment Component */}
      {snapToken && (
        <SnapPayment
          token={snapToken}
          onSuccess={handlePaymentSuccess}
          onPending={handlePaymentPending}
          onError={handlePaymentError}
          onClose={handlePaymentClose}
        />
      )}
    </>
  )
}

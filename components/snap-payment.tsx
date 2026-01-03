"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface SnapPaymentProps {
  token: string
  onSuccess?: (result: any) => void
  onPending?: (result: any) => void
  onError?: (result: any) => void
  onClose?: () => void
}

declare global {
  interface Window {
    snap: any
  }
}

export default function SnapPayment({ token, onSuccess, onPending, onError, onClose }: SnapPaymentProps) {
  const { toast } = useToast()

  useEffect(() => {
    // Load Snap.js script
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js"

    const script = document.createElement("script")
    script.src = snapUrl
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
    script.async = true

    script.onload = () => {
      if (window.snap && token) {
        // Open Snap payment popup
        window.snap.pay(token, {
          onSuccess: (result: any) => {
            console.log("Payment success:", result)
            toast({
              title: "Pembayaran Berhasil",
              description: "Terima kasih! Pesanan Anda sedang diproses.",
            })
            onSuccess?.(result)
          },
          onPending: (result: any) => {
            console.log("Payment pending:", result)
            toast({
              title: "Pembayaran Tertunda",
              description: "Pembayaran Anda sedang diproses.",
            })
            onPending?.(result)
          },
          onError: (result: any) => {
            console.log("Payment error:", result)
            toast({
              title: "Pembayaran Gagal",
              description: "Terjadi kesalahan dalam pembayaran.",
              variant: "destructive",
            })
            onError?.(result)
          },
          onClose: () => {
            console.log("Payment popup closed")
            onClose?.()
          },
        })
      }
    }

    script.onerror = () => {
      console.error("Failed to load Snap.js")
      toast({
        title: "Error",
        description: "Gagal memuat sistem pembayaran.",
        variant: "destructive",
      })
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [token, onSuccess, onPending, onError, onClose, toast])

  return null
}

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle } from "lucide-react"

export default function PaymentStatusPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "failed">("loading")

  const orderId = searchParams.get("order_id")
  const transactionStatus = searchParams.get("transaction_status")

  useEffect(() => {
    if (transactionStatus) {
      if (transactionStatus === "settlement" || transactionStatus === "capture") {
        setStatus("success")
      } else if (transactionStatus === "pending") {
        setStatus("pending")
      } else {
        setStatus("failed")
      }
    } else {
      // Default to success if no specific status
      setStatus("success")
    }
  }, [transactionStatus])

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case "pending":
        return <Clock className="h-16 w-16 text-yellow-500" />
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Clock className="h-16 w-16 text-gray-500 animate-spin" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "success":
        return {
          title: "Pembayaran Berhasil!",
          description: "Terima kasih! Pembayaran Anda telah berhasil diproses.",
        }
      case "pending":
        return {
          title: "Pembayaran Tertunda",
          description: "Pembayaran Anda sedang diproses.",
        }
      case "failed":
        return {
          title: "Pembayaran Gagal",
          description: "Maaf, pembayaran Anda gagal diproses.",
        }
      default:
        return {
          title: "Memproses...",
          description: "Sedang memproses status pembayaran Anda.",
        }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">{statusMessage.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{statusMessage.description}</p>

          {orderId && (
            <div className="bg-muted p-4 rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div>
            </div>
          )}

          <Button onClick={() => router.push("/")} className="w-full">
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

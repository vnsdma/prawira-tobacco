"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  description: string
  price: number
  in_stock: number
  category: string
}

interface ProductGridProps {
  searchQuery: string
  selectedCategory: string
}

export default function ProductGrid({ searchQuery, selectedCategory }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }

      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const apiUrl = `${window.location.origin}/api/mobile/products?${params}`
      console.log("Fetching products from:", apiUrl)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Products API error:", response.status, errorText)
        throw new Error(`Failed to fetch products: ${response.status}`)
      }

      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memuat produk",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: "/placeholder.svg?height=200&width=200",
      quantity: 1,
    })
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${product.name} berhasil ditambahkan`,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="px-4 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="aspect-square bg-muted rounded-t-lg" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {selectedCategory === "all"
            ? "Semua Produk"
            : selectedCategory === "cigarettes"
              ? "Rokok"
              : selectedCategory === "tobacco"
                ? "Tembakau"
                : "Aksesoris"}
        </h2>
        <span className="text-sm text-muted-foreground">{products.length} produk</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src="/placeholder.svg?height=200&width=200"
                  alt={product.name}
                  className="aspect-square object-cover w-full"
                />
                {product.in_stock < 10 && product.in_stock > 0 && (
                  <Badge variant="destructive" className="absolute top-2 left-2">
                    Stok Terbatas
                  </Badge>
                )}
                {product.in_stock === 0 && (
                  <Badge variant="secondary" className="absolute top-2 left-2">
                    Habis
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                <p className="text-xs text-muted-foreground">Stok: {product.in_stock}</p>
              </div>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
                size="sm"
                disabled={product.in_stock === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                {product.in_stock === 0 ? "Habis" : "Tambah"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
        </div>
      )}
    </div>
  )
}

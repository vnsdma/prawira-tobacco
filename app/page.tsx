"use client"

import { useState } from "react"
import { ShoppingCart, Search, Menu, User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ProductGrid from "@/components/product-grid"
import CartSheet from "@/components/cart-sheet"
import CategoryFilter from "@/components/category-filter"
import OrderHistory from "@/components/order-history"
import ProfileSection from "@/components/profile-section"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsContent } from "@/components/ui/tabs"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("home")
  const { getTotalItems } = useCart()
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                <h2 className="text-lg font-semibold">Menu</h2>
                <nav className="flex flex-col space-y-2">
                  <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("home")}>
                    Beranda
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("orders")}>
                    Pesanan Saya
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("profile")}>
                    {isAuthenticated ? "Profil" : "Masuk/Daftar"}
                  </Button>
                </nav>
                {isAuthenticated && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-xl font-bold text-primary">Prawira Tobacco</h1>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setActiveTab("profile")}>
              <User className="h-6 w-6" />
            </Button>
            <CartSheet>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </CartSheet>
          </div>
        </div>

        {activeTab === "home" && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk tembakau..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="home" className="mt-0">
          <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

          {/* Hero Banner */}
          <div className="px-4 py-6">
            <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {isAuthenticated ? `Selamat datang, ${user?.name?.split(" ")[0]}!` : "Selamat Datang!"}
                </h2>
                <p className="text-amber-100 mb-4">Temukan produk tembakau berkualitas</p>
                {!isAuthenticated && (
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab("profile")}>
                    Daftar untuk Promo Khusus
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <ProductGrid searchQuery={searchQuery} selectedCategory={selectedCategory} />
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <OrderHistory />
        </TabsContent>

        <TabsContent value="profile" className="mt-0">
          <ProfileSection />
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex items-center justify-around py-2">
          <Button
            variant={activeTab === "home" ? "default" : "ghost"}
            className="flex flex-col items-center py-2"
            onClick={() => setActiveTab("home")}
          >
            <div className="h-6 w-6 mb-1 bg-primary rounded" />
            <span className="text-xs">Beranda</span>
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            className="flex flex-col items-center py-2"
            onClick={() => setActiveTab("orders")}
          >
            <Package className="h-6 w-6 mb-1" />
            <span className="text-xs">Pesanan</span>
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            className="flex flex-col items-center py-2"
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs">{isAuthenticated ? "Profil" : "Masuk"}</span>
          </Button>
        </div>
      </nav>

      <div className="h-20" />
    </div>
  )
}

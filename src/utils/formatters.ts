export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const safeFormatPrice = (price: any) => {
  const numPrice = Number(price)
  if (isNaN(numPrice) || price === null || price === undefined) {
    return "Rp 0"
  }
  return formatPrice(numPrice)
}
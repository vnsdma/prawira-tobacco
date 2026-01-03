import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"

interface CategoryFilterProps {
  category: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

const categoryIcons: { [key: string]: string } = {
  "Semua": "🏪",
  "ciggarettes": "🚬",
  "tobacco": "🌿",
  "accessories": "🔧",
}

export default function CategoryFilter({ category, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {category.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton, 
              selectedCategory === cat && styles.selectedCategory
            ]}
            onPress={() => onSelectCategory(cat)}
          >
            <Text style={styles.categoryIcon}>
              {categoryIcons[cat] || "📦"}
            </Text>
            <Text 
              style={[
                styles.categoryText, 
                selectedCategory === cat && styles.selectedCategoryText
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  selectedCategory: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  selectedCategoryText: {
    color: "#fff",
  },
})
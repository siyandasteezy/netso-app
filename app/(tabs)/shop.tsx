import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, Image, Pressable,
  StyleSheet, ActivityIndicator, TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api, Product } from "../../lib/api";
import { formatPrice } from "../../lib/utils";

export default function ShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Load products once
  useEffect(() => {
    api.products.list().then((data) => {
      setProducts(data);
      const cats = ["All", ...Array.from(new Set(data.map((p) => p.category.name)))];
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  // Apply category param from Home screen navigation
  useEffect(() => {
    if (params.category && categories.includes(params.category)) {
      setActiveCategory(params.category);
    }
  }, [params.category, categories]);

  // Filter whenever category/search/products change
  useEffect(() => {
    let result = products;
    if (activeCategory !== "All") result = result.filter((p) => p.category.name === activeCategory);
    if (search.trim()) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [activeCategory, search, products]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#fff" size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category pills */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.pills}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.pill, activeCategory === item && styles.pillActive]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.pillText, activeCategory === item && styles.pillTextActive]}>
              {item}
            </Text>
          </Pressable>
        )}
      />

      {/* Active category label */}
      {activeCategory !== "All" && (
        <View style={styles.activeCatBar}>
          <Text style={styles.activeCatText}>{activeCategory}</Text>
          <Pressable onPress={() => setActiveCategory("All")}>
            <Text style={styles.clearCat}>✕ Clear</Text>
          </Pressable>
        </View>
      )}

      {/* Product grid */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <Text style={styles.empty}>No products found.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/shop/${item.id}`)}
          >
            <View style={styles.imageBox}>
              {item.images[0] ? (
                <Image
                  source={{ uri: `https://silly-stroopwafel-565c91.netlify.app${item.images[0].url}` }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: "#222" }]} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.catLabel}>{item.category.name}</Text>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  searchBox: { padding: 12 },
  searchInput: {
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  pills: { paddingHorizontal: 12, gap: 8, paddingBottom: 12 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: "#333" },
  pillActive: { backgroundColor: "#fff", borderColor: "#fff" },
  pillText: { color: "#666", fontSize: 12, fontWeight: "600" },
  pillTextActive: { color: "#000" },
  activeCatBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  activeCatText: { color: "#fff", fontWeight: "800", fontSize: 13, letterSpacing: 1 },
  clearCat: { color: "#555", fontSize: 12 },
  grid: { paddingHorizontal: 12, paddingBottom: 32 },
  row: { gap: 8, marginBottom: 8 },
  card: { flex: 1 },
  imageBox: { aspectRatio: 0.8, backgroundColor: "#111", overflow: "hidden", marginBottom: 8 },
  info: { paddingHorizontal: 2 },
  name: { color: "#fff", fontSize: 12, fontWeight: "600", marginBottom: 2 },
  catLabel: { color: "#555", fontSize: 10, marginBottom: 2 },
  price: { color: "#aaa", fontSize: 12, fontWeight: "700" },
  empty: { color: "#666", textAlign: "center", marginTop: 40, fontSize: 14 },
});

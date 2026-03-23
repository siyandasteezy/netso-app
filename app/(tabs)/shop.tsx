import { useEffect, useState } from "react";
import {
  View, Text, FlatList, Image, Pressable,
  StyleSheet, ActivityIndicator, TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { api, Product } from "../../lib/api";
import { formatPrice } from "../../lib/utils";

export default function ShopScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.list().then((data) => {
      setProducts(data);
      setFiltered(data);
      const cats = ["All", ...Array.from(new Set(data.map((p) => p.category.name)))];
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

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
      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.cats}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.cat, activeCategory === item && styles.catActive]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.catText, activeCategory === item && styles.catTextActive]}>
              {item}
            </Text>
          </Pressable>
        )}
      />

      {/* Grid */}
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
              <Text style={styles.cat2}>{item.category.name}</Text>
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
  cats: { paddingHorizontal: 12, gap: 8, paddingBottom: 12 },
  cat: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: "#333" },
  catActive: { backgroundColor: "#fff", borderColor: "#fff" },
  catText: { color: "#666", fontSize: 12, fontWeight: "600" },
  catTextActive: { color: "#000" },
  grid: { paddingHorizontal: 12, paddingBottom: 32 },
  row: { gap: 8, marginBottom: 8 },
  card: { flex: 1 },
  imageBox: { aspectRatio: 0.8, backgroundColor: "#111", overflow: "hidden", marginBottom: 8 },
  info: { paddingHorizontal: 2 },
  name: { color: "#fff", fontSize: 12, fontWeight: "600", marginBottom: 2 },
  cat2: { color: "#555", fontSize: 10, marginBottom: 2 },
  price: { color: "#aaa", fontSize: 12, fontWeight: "700" },
  empty: { color: "#666", textAlign: "center", marginTop: 40, fontSize: 14 },
});

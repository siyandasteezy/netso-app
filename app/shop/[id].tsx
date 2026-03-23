import { useEffect, useState } from "react";
import {
  ScrollView, View, Text, Image, Pressable,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api, Product } from "../../lib/api";
import { useCart } from "../../lib/cart-store";
import { formatPrice, SIZES } from "../../lib/utils";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) api.products.get(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#fff" size="large" /></View>;
  }
  if (!product) {
    return <View style={styles.center}><Text style={styles.error}>Product not found.</Text></View>;
  }

  const imageUrl = product.images[activeImage]
    ? `https://silly-stroopwafel-565c91.netlify.app${product.images[activeImage].url}`
    : null;

  function handleAddToCart() {
    if (!selectedSize) {
      Alert.alert("Select a size", "Please choose a size before adding to cart.");
      return;
    }
    addItem({
      productId: product!.id,
      name: product!.name,
      price: product!.price,
      image: product!.images[0]?.url ?? "",
      size: selectedSize,
      quantity: 1,
    });
    Alert.alert("Added to bag", `${product!.name} (${selectedSize}) added.`, [
      { text: "Keep Shopping" },
      { text: "Go to Cart", onPress: () => router.push("/(tabs)/cart") },
    ]);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main image */}
      <View style={styles.mainImage}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#111" }]} />
        )}
      </View>

      {/* Thumbnails */}
      {product.images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
          {product.images.map((img, i) => (
            <Pressable key={i} onPress={() => setActiveImage(i)}>
              <View style={[styles.thumb, i === activeImage && styles.thumbActive]}>
                <Image
                  source={{ uri: `https://silly-stroopwafel-565c91.netlify.app${img.url}` }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.details}>
        <Text style={styles.category}>{product.category.name}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        {/* Size selector */}
        <Text style={styles.sizeLabel}>SELECT SIZE</Text>
        <View style={styles.sizes}>
          {SIZES.map((size) => (
            <Pressable
              key={size}
              style={[styles.sizeBtn, selectedSize === size && styles.sizeBtnActive]}
              onPress={() => setSelectedSize(size)}
            >
              <Text style={[styles.sizeBtnText, selectedSize === size && styles.sizeBtnTextActive]}>
                {size}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>ADD TO BAG — {formatPrice(product.price)}</Text>
        </Pressable>

        {product.stock < 5 && product.stock > 0 && (
          <Text style={styles.lowStock}>Only {product.stock} left</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  error: { color: "#666" },
  mainImage: { width: "100%", aspectRatio: 0.85, backgroundColor: "#111" },
  thumbRow: { paddingHorizontal: 16, paddingVertical: 12 },
  thumb: { width: 60, height: 60, marginRight: 8, overflow: "hidden", borderWidth: 1, borderColor: "transparent" },
  thumbActive: { borderColor: "#fff" },
  details: { padding: 20 },
  category: { color: "#666", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  name: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  price: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 16 },
  description: { color: "#888", fontSize: 14, lineHeight: 20, marginBottom: 24 },
  sizeLabel: { color: "#666", fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  sizes: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  sizeBtn: { width: 52, height: 44, borderWidth: 1, borderColor: "#333", alignItems: "center", justifyContent: "center" },
  sizeBtnActive: { backgroundColor: "#fff", borderColor: "#fff" },
  sizeBtnText: { color: "#666", fontSize: 13, fontWeight: "600" },
  sizeBtnTextActive: { color: "#000" },
  addBtn: { backgroundColor: "#fff", paddingVertical: 16, alignItems: "center" },
  addBtnText: { color: "#000", fontWeight: "800", letterSpacing: 1, fontSize: 14 },
  lowStock: { color: "#F59E0B", fontSize: 12, textAlign: "center", marginTop: 8 },
});

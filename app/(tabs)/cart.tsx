import {
  View, Text, FlatList, Image, Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../lib/cart-store";
import { formatPrice } from "../../lib/utils";

const VAT_RATE = 15;

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, total } = useCart();

  const subtotal = total();
  const vatAmount = subtotal * (VAT_RATE / 100);
  const grandTotal = subtotal + vatAmount;

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bag-outline" size={64} color="#333" />
        <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
        <Pressable style={styles.shopBtn} onPress={() => router.push("/(tabs)/shop")}>
          <Text style={styles.shopBtnText}>SHOP NOW</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => `${i.productId}-${i.size}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.imageBox}>
              {item.image ? (
                <Image
                  source={{ uri: `https://silly-stroopwafel-565c91.netlify.app${item.image}` }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: "#222" }]} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.size}>Size: {item.size}</Text>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
              <View style={styles.qty}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={14} color="#fff" />
                </Pressable>
                <Text style={styles.qtyNum}>{item.quantity}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                >
                  <Ionicons name="add" size={14} color="#fff" />
                </Pressable>
              </View>
            </View>
            <View style={styles.right}>
              <Pressable onPress={() => removeItem(item.productId, item.size)}>
                <Ionicons name="trash-outline" size={18} color="#555" />
              </Pressable>
              <Text style={styles.lineTotal}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal (excl. VAT)</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (15%)</Text>
              <Text style={styles.summaryValue}>{formatPrice(vatAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryNote}>Calculated at checkout</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total incl. VAT</Text>
              <Text style={styles.totalValue}>{formatPrice(grandTotal)}</Text>
            </View>
            <Pressable style={styles.checkoutBtn} onPress={() => router.push("/checkout")}>
              <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  list: { padding: 16 },
  empty: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 16 },
  emptyTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  shopBtn: { backgroundColor: "#fff", paddingHorizontal: 32, paddingVertical: 12 },
  shopBtnText: { color: "#000", fontWeight: "800", letterSpacing: 2, fontSize: 13 },
  item: { flexDirection: "row", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#111" },
  imageBox: { width: 80, height: 100, backgroundColor: "#111", overflow: "hidden" },
  info: { flex: 1 },
  name: { color: "#fff", fontSize: 13, fontWeight: "600", marginBottom: 4 },
  size: { color: "#666", fontSize: 12, marginBottom: 4 },
  price: { color: "#aaa", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  qty: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: { width: 28, height: 28, borderWidth: 1, borderColor: "#333", alignItems: "center", justifyContent: "center" },
  qtyNum: { color: "#fff", fontWeight: "700", minWidth: 20, textAlign: "center" },
  right: { alignItems: "flex-end", justifyContent: "space-between" },
  lineTotal: { color: "#fff", fontWeight: "800", fontSize: 14 },
  summary: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#222", gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: "#666", fontSize: 13 },
  summaryValue: { color: "#aaa", fontSize: 13 },
  summaryNote: { color: "#555", fontSize: 12, fontStyle: "italic" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#222", marginTop: 4 },
  totalLabel: { color: "#fff", fontWeight: "800", fontSize: 16 },
  totalValue: { color: "#fff", fontWeight: "800", fontSize: 18 },
  checkoutBtn: { backgroundColor: "#fff", paddingVertical: 16, alignItems: "center", marginTop: 16 },
  checkoutBtnText: { color: "#000", fontWeight: "800", letterSpacing: 2, fontSize: 14 },
});

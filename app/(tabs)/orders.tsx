import { useState } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, Order } from "../../lib/api";
import { formatPrice, formatDate, STATUS_COLORS, STATUS_LABELS } from "../../lib/utils";

export default function OrdersScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const data = await api.orders.list(email.trim());
      setOrders(data);
      if (data.length === 0) Alert.alert("No orders found", `No orders found for ${email}`);
    } catch {
      Alert.alert("Error", "Could not look up orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Email lookup */}
      <View style={styles.lookup}>
        <Text style={styles.lookupTitle}>ORDER LOOKUP</Text>
        <View style={styles.lookupRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Pressable style={styles.lookupBtn} onPress={lookup} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" size="small" /> : (
              <Ionicons name="search" size={18} color="#000" />
            )}
          </Pressable>
        </View>
      </View>

      {orders === null ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>Enter your email to view your orders</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No orders found for that email.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: order }) => (
            <View style={styles.orderCard}>
              {/* Header */}
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + "22", borderColor: STATUS_COLORS[order.status] }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Text>
                  </View>
                  {order.paymentStatus === "paid" && (
                    <Text style={styles.paid}>✓ Paid</Text>
                  )}
                </View>
              </View>

              {/* Items */}
              {order.items.map((item) => (
                <View key={item.id} style={styles.item}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                    {item.size ? ` (${item.size})` : ""} ×{item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                </View>
              ))}

              {/* Tickets */}
              {order.tickets.map((t) => (
                <View key={t.id} style={styles.item}>
                  <View>
                    <Text style={styles.itemName}>{t.event.title} ×{t.quantity}</Text>
                    <Text style={styles.ticketCode}>{t.ticketCode}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatPrice(t.totalPrice)}</Text>
                </View>
              ))}

              {/* Totals */}
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                {order.trackingNumber ? (
                  <View style={styles.trackingRow}>
                    <Ionicons name="bicycle-outline" size={14} color="#06B6D4" />
                    <Text style={styles.tracking}>Track: {order.trackingNumber}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  lookup: { padding: 16, backgroundColor: "#111", borderBottomWidth: 1, borderBottomColor: "#222" },
  lookupTitle: { color: "#666", fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  lookupRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, backgroundColor: "#000", color: "#fff", padding: 12, borderWidth: 1, borderColor: "#222", fontSize: 14 },
  lookupBtn: { backgroundColor: "#fff", width: 44, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyText: { color: "#555", textAlign: "center", fontSize: 14 },
  list: { padding: 16, gap: 12 },
  orderCard: { backgroundColor: "#111", padding: 16 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  orderId: { color: "#fff", fontWeight: "800", fontSize: 14, fontFamily: "monospace" },
  orderDate: { color: "#666", fontSize: 12, marginTop: 2 },
  statusBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-end" },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  paid: { color: "#10B981", fontSize: 11, fontWeight: "700", textAlign: "right", marginTop: 4 },
  item: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#1a1a1a" },
  itemName: { color: "#ccc", fontSize: 12, flex: 1 },
  itemPrice: { color: "#fff", fontWeight: "700", fontSize: 12, marginLeft: 8 },
  ticketCode: { color: "#555", fontSize: 10, fontFamily: "monospace" },
  orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#222" },
  orderTotal: { color: "#fff", fontWeight: "800", fontSize: 16 },
  trackingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  tracking: { color: "#06B6D4", fontSize: 12 },
});

import { useEffect, useState } from "react";
import {
  ScrollView, View, Text, Image, Pressable,
  StyleSheet, ActivityIndicator, TextInput, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { api, Event } from "../../lib/api";
import { formatDateTime, formatPrice } from "../../lib/utils";

const WEB_BASE = "https://silly-stroopwafel-565c91.netlify.app";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (id) api.events.get(id).then(setEvent).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#fff" size="large" /></View>;
  if (!event) return <View style={styles.center}><Text style={styles.err}>Event not found.</Text></View>;

  const ticketsLeft = event.totalTickets - event.soldTickets;
  const total = event.ticketPrice * quantity;

  async function handleBuy() {
    if (!form.name || !form.email) {
      Alert.alert("Missing info", "Please enter your name and email.");
      return;
    }
    setBuying(true);
    try {
      // Use the web checkout for ticket payment (same PayFast flow)
      const url = `${WEB_BASE}/events/${event!.id}?buyerName=${encodeURIComponent(form.name)}&buyerEmail=${encodeURIComponent(form.email)}&quantity=${quantity}`;
      await WebBrowser.openAuthSessionAsync(url, "netso://");
      router.replace("/(tabs)/orders");
    } catch {
      Alert.alert("Error", "Could not open checkout. Please try again.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageBox}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#111" }]} />
        )}
        <View style={styles.imageOverlay} />
        <View style={styles.imageContent}>
          <Text style={styles.dateLabel}>{formatDateTime(event.date)}</Text>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.venue}>{event.venue} · {event.city}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {event.description ? <Text style={styles.description}>{event.description}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatPrice(event.ticketPrice)}</Text>
            <Text style={styles.statLabel}>Per Ticket</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{ticketsLeft}</Text>
            <Text style={styles.statLabel}>Tickets Left</Text>
          </View>
        </View>

        {ticketsLeft > 0 ? (
          <>
            <Text style={styles.sectionTitle}>BUY TICKETS</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="Your name"
                placeholderTextColor="#555"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="your@email.com"
                placeholderTextColor="#555"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.qtyRow}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <View style={styles.qtyControls}>
                <Pressable style={styles.qtyBtn} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qtyNum}>{quantity}</Text>
                <Pressable style={styles.qtyBtn} onPress={() => setQuantity((q) => Math.min(ticketsLeft, q + 1))}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.buyBtn} onPress={handleBuy} disabled={buying}>
              <Text style={styles.buyBtnText}>
                BUY {quantity} TICKET{quantity !== 1 ? "S" : ""} — {formatPrice(total)}
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  err: { color: "#666" },
  imageBox: { height: 280, position: "relative" },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  imageContent: { position: "absolute", bottom: 20, left: 20, right: 20 },
  dateLabel: { color: "#aaa", fontSize: 11, letterSpacing: 2, marginBottom: 6 },
  title: { color: "#fff", fontSize: 26, fontWeight: "900", marginBottom: 6 },
  venue: { color: "#ccc", fontSize: 13 },
  body: { padding: 20 },
  description: { color: "#888", fontSize: 14, lineHeight: 22, marginBottom: 24 },
  statsRow: { flexDirection: "row", gap: 24, marginBottom: 28, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#222" },
  stat: {},
  statValue: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel: { color: "#666", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  sectionTitle: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 2, marginBottom: 16 },
  field: { marginBottom: 14 },
  fieldLabel: { color: "#666", fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" },
  input: { backgroundColor: "#111", color: "#fff", padding: 12, borderWidth: 1, borderColor: "#222", fontSize: 14 },
  qtyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 20 },
  qtyBtn: { width: 36, height: 36, borderWidth: 1, borderColor: "#333", alignItems: "center", justifyContent: "center" },
  qtyBtnText: { color: "#fff", fontSize: 18 },
  qtyNum: { color: "#fff", fontWeight: "700", fontSize: 18, minWidth: 24, textAlign: "center" },
  buyBtn: { backgroundColor: "#fff", paddingVertical: 16, alignItems: "center" },
  buyBtnText: { color: "#000", fontWeight: "800", letterSpacing: 1, fontSize: 14 },
  soldOut: { backgroundColor: "#111", padding: 20, alignItems: "center" },
  soldOutText: { color: "#555", fontWeight: "900", fontSize: 16, letterSpacing: 4 },
});

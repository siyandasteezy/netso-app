import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api, Event } from "../../lib/api";
import { formatDate, formatPrice } from "../../lib/utils";

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.events.list().then((data) => setEvents(data.filter((e) => e.active))).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#fff" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming events.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/events/${item.id}`)}>
            <View style={styles.imageBox}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: "#1a1a1a" }]} />
              )}
              <View style={styles.overlay} />
              <View style={styles.imageContent}>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.venue}>{item.venue} · {item.city}</Text>
              </View>
            </View>
            <View style={styles.footer}>
              <View>
                <Text style={styles.sold}>{item.totalTickets - item.soldTickets} tickets left</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.price}>{formatPrice(item.ticketPrice)}</Text>
                <Text style={styles.priceSub}>per ticket</Text>
              </View>
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
  list: { padding: 16, gap: 16 },
  empty: { color: "#666", textAlign: "center", marginTop: 40 },
  card: { backgroundColor: "#111", overflow: "hidden" },
  imageBox: { height: 200, position: "relative" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  imageContent: { position: "absolute", bottom: 16, left: 16, right: 16 },
  date: { color: "#aaa", fontSize: 11, letterSpacing: 2, marginBottom: 4 },
  title: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  venue: { color: "#ccc", fontSize: 13 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  sold: { color: "#666", fontSize: 12 },
  priceBox: { alignItems: "flex-end" },
  price: { color: "#fff", fontWeight: "800", fontSize: 18 },
  priceSub: { color: "#666", fontSize: 10 },
});

import { useEffect, useState } from "react";
import {
  ScrollView, View, Text, Image, Pressable,
  StyleSheet, ActivityIndicator, FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { api, Product, Event } from "../../lib/api";
import { formatPrice, formatDate } from "../../lib/utils";

export default function HomeScreen() {
  const router = useRouter();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.products.list(), api.events.list()])
      .then(([products, evs]) => {
        setFeatured(products.filter((p) => p.featured).slice(0, 6));
        setEvents(evs.filter((e) => e.active).slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>South African Streetwear</Text>
        <Text style={styles.heroTitle}>THE LATEST{"\n"}DROP</Text>
        <Pressable style={styles.heroBtn} onPress={() => router.push("/(tabs)/shop")}>
          <Text style={styles.heroBtnText}>SHOP NOW</Text>
        </Pressable>
      </View>

      {/* Featured */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FEATURED</Text>
          <Pressable onPress={() => router.push("/(tabs)/shop")}>
            <Text style={styles.seeAll}>See all →</Text>
          </Pressable>
        </View>
        <FlatList
          data={featured}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.row}
          renderItem={({ item }) => (
            <Pressable
              style={styles.productCard}
              onPress={() => router.push(`/shop/${item.id}`)}
            >
              <View style={styles.productImage}>
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
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            </Pressable>
          )}
        />
      </View>

      {/* Events */}
      {events.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>EVENTS</Text>
            <Pressable onPress={() => router.push("/(tabs)/events")}>
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>
          {events.map((ev) => (
            <Pressable
              key={ev.id}
              style={styles.eventCard}
              onPress={() => router.push(`/events/${ev.id}`)}
            >
              <View>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <Text style={styles.eventMeta}>{formatDate(ev.date)} · {ev.venue}, {ev.city}</Text>
              </View>
              <View style={styles.eventPrice}>
                <Text style={styles.eventPriceText}>{formatPrice(ev.ticketPrice)}</Text>
                <Text style={styles.eventPriceSub}>per ticket</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  hero: { backgroundColor: "#111", padding: 32, paddingTop: 48 },
  heroEyebrow: { color: "#666", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 40, fontWeight: "900", letterSpacing: -1, lineHeight: 44, marginBottom: 24 },
  heroBtn: { backgroundColor: "#fff", paddingVertical: 14, paddingHorizontal: 28, alignSelf: "flex-start" },
  heroBtnText: { color: "#000", fontWeight: "800", letterSpacing: 2, fontSize: 13 },
  section: { paddingTop: 32, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { color: "#fff", fontWeight: "900", fontSize: 16, letterSpacing: 2 },
  seeAll: { color: "#666", fontSize: 13 },
  row: { gap: 12, paddingRight: 16 },
  productCard: { width: 160 },
  productImage: { width: 160, height: 200, backgroundColor: "#111", marginBottom: 8, overflow: "hidden" },
  productName: { color: "#fff", fontSize: 12, fontWeight: "600", marginBottom: 2 },
  productPrice: { color: "#aaa", fontSize: 12 },
  eventCard: {
    backgroundColor: "#111",
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: { color: "#fff", fontWeight: "700", fontSize: 14, marginBottom: 4 },
  eventMeta: { color: "#666", fontSize: 12 },
  eventPrice: { alignItems: "flex-end" },
  eventPriceText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  eventPriceSub: { color: "#666", fontSize: 10 },
});

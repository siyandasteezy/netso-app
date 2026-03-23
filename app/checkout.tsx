import { useState } from "react";
import {
  ScrollView, View, Text, TextInput, Pressable,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCart } from "../lib/cart-store";
import { api } from "../lib/api";
import { formatPrice, SA_PROVINCES } from "../lib/utils";

const WEB_BASE = "https://silly-stroopwafel-565c91.netlify.app";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [step, setStep] = useState<"details" | "delivery" | "pay">("details");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: "", suburb: "", city: "", province: "Gauteng", postalCode: "",
  });

  const [quotes, setQuotes] = useState<{ serviceId: string; serviceName: string; price: number; estimatedDeliveryDays: number }[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const subtotal = total();
  const vatAmount = subtotal * 0.15;
  const deliveryFee = quotes.find((q) => q.serviceId === selectedQuote)?.price ?? 0;
  const grandTotal = subtotal + vatAmount + deliveryFee;

  async function fetchQuotes() {
    const { address, suburb, city, province, postalCode } = form;
    if (!address || !suburb || !city || !postalCode) {
      Alert.alert("Missing fields", "Please fill in your full delivery address.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.shipping.quote({
        deliveryAddress: { streetAddress: address, suburb, city, province, postalCode },
      });
      setQuotes(res.quotes);
      setStep("delivery");
    } catch {
      Alert.alert("Error", "Could not fetch delivery quotes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!selectedQuote) { Alert.alert("Select delivery", "Please choose a delivery option."); return; }
    setLoading(true);
    try {
      const nameParts = form.name.trim().split(" ");
      const result = await api.payfast.initiate({
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        address: form.address,
        suburb: form.suburb,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        deliveryServiceId: selectedQuote,
        deliveryFee,
        items: items.map((i) => ({ ...i })),
      });

      // Build the bridge URL — web app will auto-submit the PayFast form
      const params = new URLSearchParams(result.fields).toString();
      const bridgeUrl = `${WEB_BASE}/checkout/mobile-pay?pf_url=${encodeURIComponent(result.payfastUrl)}&${params}`;

      const res = await WebBrowser.openAuthSessionAsync(bridgeUrl, "netso://");

      // User returned from browser — clear cart and go to orders
      clearCart();
      router.replace("/(tabs)/orders");
    } catch (err) {
      Alert.alert("Payment error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const Field = ({
    label, value, onChangeText, keyboardType = "default", placeholder = "", autoCapitalize = "words" as const,
  }: {
    label: string; value: string; onChangeText: (v: string) => void;
    keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
    placeholder?: string; autoCapitalize?: "none" | "words" | "sentences";
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#555"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Order summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>{items.length} item{items.length !== 1 ? "s" : ""} · {formatPrice(subtotal)} excl. VAT</Text>
      </View>

      {/* Step: Details */}
      {step === "details" && (
        <View style={styles.section}>
          <Text style={styles.stepTitle}>CONTACT & DELIVERY</Text>
          <Field label="Full Name" value={form.name} onChangeText={set("name")} />
          <Field label="Email" value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" />
          <Field label="Street Address" value={form.address} onChangeText={set("address")} />
          <Field label="Suburb" value={form.suburb} onChangeText={set("suburb")} />
          <Field label="City" value={form.city} onChangeText={set("city")} />
          <Field label="Postal Code" value={form.postalCode} onChangeText={set("postalCode")} keyboardType="numeric" />

          <Text style={styles.label}>Province</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {SA_PROVINCES.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.provinceBtn, form.province === p && styles.provinceBtnActive]}
                  onPress={() => set("province")(p)}
                >
                  <Text style={[styles.provinceBtnText, form.province === p && styles.provinceBtnTextActive]}>
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Pressable style={styles.nextBtn} onPress={fetchQuotes} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.nextBtnText}>GET DELIVERY QUOTES →</Text>}
          </Pressable>
        </View>
      )}

      {/* Step: Delivery */}
      {step === "delivery" && (
        <View style={styles.section}>
          <Text style={styles.stepTitle}>CHOOSE DELIVERY</Text>
          {quotes.map((q) => (
            <Pressable
              key={q.serviceId}
              style={[styles.quoteCard, selectedQuote === q.serviceId && styles.quoteCardActive]}
              onPress={() => setSelectedQuote(q.serviceId)}
            >
              <View>
                <Text style={styles.quoteName}>{q.serviceName}</Text>
                <Text style={styles.quoteDays}>{q.estimatedDeliveryDays} business day{q.estimatedDeliveryDays !== 1 ? "s" : ""}</Text>
              </View>
              <Text style={styles.quotePrice}>{formatPrice(q.price)}</Text>
            </Pressable>
          ))}

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT (15%)</Text>
              <Text style={styles.totalVal}>{formatPrice(vatAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery</Text>
              <Text style={styles.totalVal}>{selectedQuote ? formatPrice(deliveryFee) : "—"}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandRow]}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandVal}>{formatPrice(grandTotal)}</Text>
            </View>
          </View>

          <Pressable style={styles.nextBtn} onPress={handlePay} disabled={loading || !selectedQuote}>
            {loading ? <ActivityIndicator color="#000" /> : (
              <Text style={styles.nextBtnText}>PAY WITH PAYFAST — {formatPrice(grandTotal)}</Text>
            )}
          </Pressable>
          <Pressable style={styles.backBtn} onPress={() => setStep("details")}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  summary: { backgroundColor: "#111", padding: 16, borderBottomWidth: 1, borderBottomColor: "#222" },
  summaryTitle: { color: "#aaa", fontSize: 13 },
  section: { padding: 20 },
  stepTitle: { color: "#fff", fontWeight: "900", fontSize: 14, letterSpacing: 2, marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { color: "#666", fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" },
  input: { backgroundColor: "#111", color: "#fff", padding: 12, borderWidth: 1, borderColor: "#222", fontSize: 14 },
  provinceBtn: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#333" },
  provinceBtnActive: { backgroundColor: "#fff", borderColor: "#fff" },
  provinceBtnText: { color: "#666", fontSize: 12 },
  provinceBtnTextActive: { color: "#000", fontWeight: "700" },
  nextBtn: { backgroundColor: "#fff", paddingVertical: 16, alignItems: "center", marginTop: 8 },
  nextBtnText: { color: "#000", fontWeight: "800", letterSpacing: 1, fontSize: 13 },
  backBtn: { paddingVertical: 12, alignItems: "center", marginTop: 8 },
  backBtnText: { color: "#666", fontSize: 13 },
  quoteCard: { padding: 16, borderWidth: 1, borderColor: "#222", marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quoteCardActive: { borderColor: "#fff", backgroundColor: "#111" },
  quoteName: { color: "#fff", fontWeight: "600", fontSize: 14 },
  quoteDays: { color: "#666", fontSize: 12, marginTop: 2 },
  quotePrice: { color: "#fff", fontWeight: "800", fontSize: 16 },
  totals: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#222", gap: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { color: "#666", fontSize: 13 },
  totalVal: { color: "#aaa", fontSize: 13 },
  grandRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#222", marginTop: 4 },
  grandLabel: { color: "#fff", fontWeight: "800", fontSize: 16 },
  grandVal: { color: "#fff", fontWeight: "800", fontSize: 18 },
});

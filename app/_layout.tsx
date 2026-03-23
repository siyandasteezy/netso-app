import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="shop/[id]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Shop",
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="events/[id]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Events",
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: true,
            headerTitle: "Checkout",
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </>
  );
}

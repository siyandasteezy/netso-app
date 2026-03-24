const BASE = "https://silly-stroopwafel-565c91.netlify.app/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  _count: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  featured: boolean;
  category: { id: string; name: string; slug: string };
  images: { url: string; alt: string }[];
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  venue: string;
  city: string;
  imageUrl: string;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  active: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  deliveryFee: number;
  status: string;
  paymentStatus: string;
  waybillNumber: string;
  trackingNumber: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    size: string;
    product: { name: string; images: { url: string }[] };
  }[];
  tickets: {
    id: string;
    ticketCode: string;
    quantity: number;
    totalPrice: number;
    event: { title: string; date: string };
  }[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const api = {
  categories: {
    list: () => get<Category[]>("/categories"),
  },
  products: {
    list: () => get<Product[]>("/products"),
    get: (id: string) => get<Product>(`/products/${id}`),
  },
  events: {
    list: () => get<Event[]>("/events"),
    get: (id: string) => get<Event>(`/events/${id}`),
  },
  orders: {
    list: (email: string) => get<Order[]>(`/orders?email=${encodeURIComponent(email)}`),
    get: (id: string) => get<Order>(`/orders/${id}`),
  },
  payfast: {
    initiate: (body: {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      address: string;
      suburb: string;
      city: string;
      province: string;
      postalCode: string;
      deliveryServiceId: string;
      deliveryFee: number;
      items: CartItem[];
    }) => post<{ payfastUrl: string; fields: Record<string, string> }>("/payfast/initiate", body),
  },
  shipping: {
    quote: (body: {
      deliveryAddress: {
        streetAddress: string;
        suburb: string;
        city: string;
        province: string;
        postalCode: string;
      };
    }) =>
      post<{ quotes: { serviceId: string; serviceName: string; price: number; estimatedDeliveryDays: number }[] }>(
        "/shipping/quote",
        body
      ),
  },
};

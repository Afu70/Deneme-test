import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Platform } from 'react-native';

const API_URL = Platform.select({ web: 'http://localhost:5000', default: 'http://10.0.2.2:5000' });

type Product = { id: number; name: string; active: boolean };
type Customer = { id: number; name: string; phone?: string; address?: string };

type OrderItem = { id: number; productId: number; quantity: number; product: Product };
type Order = {
  id: number;
  customerId: number;
  customer: Customer;
  status: 'HAZIRLANIYOR' | 'TESLIM_EDILDI';
  paymentStatus: 'ONDEN_ODEME_ALINDI' | 'TAHSIL_EDILMEDI' | 'TESLIM_ANINDA' | 'VERESIYE';
  invoiceStatus: 'KESILDI' | 'ISTEMIYOR' | 'GEREK_YOK';
  note?: string;
  items: OrderItem[];
  createdAt: string;
};

type Screen = 'orders' | 'new-order' | 'order-detail';

export default function App() {
  const [screen, setScreen] = useState<Screen>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  function openDetail(order: Order) {
    setSelectedOrder(order);
    setScreen('order-detail');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header onRefresh={fetchOrders} onNew={() => setScreen('new-order')} />
      {screen === 'orders' && (
        loading ? <ActivityIndicator /> : (<OrderList orders={orders} onPress={openDetail} />)
      )}
      {screen === 'order-detail' && selectedOrder && (
        <OrderDetail order={selectedOrder} onBack={() => setScreen('orders')} />
      )}
      {screen === 'new-order' && (
        <NewOrder onCancel={() => setScreen('orders')} onCreated={() => { setScreen('orders'); fetchOrders(); }} />
      )}
    </SafeAreaView>
  );
}

function Header({ onRefresh, onNew }: { onRefresh: () => void; onNew: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Ön Satış Siparişleri</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SmallButton label="Yenile" onPress={onRefresh} />
        <SmallButton label="Yeni" onPress={onNew} />
      </View>
    </View>
  );
}

function SmallButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.smallBtn}>
      <Text style={styles.smallBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function OrderList({ orders, onPress }: { orders: Order[]; onPress: (o: Order) => void }) {
  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(o) => String(o.id)}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
          <Text style={styles.cardTitle}>{item.customer?.name ?? 'Müşteri'}</Text>
          <Text style={styles.badges}>Durum: {item.status} · Tahsilat: {item.paymentStatus} · Fatura: {item.invoiceStatus}</Text>
          <Text style={styles.subText}>{new Date(item.createdAt).toLocaleString()}</Text>
          <Text style={styles.subText}>{item.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const totalItems = useMemo(() => order.items.reduce((s, i) => s + i.quantity, 0), [order.items]);
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <SmallButton label="Geri" onPress={onBack} />
      <Text style={styles.detailTitle}>{order.customer?.name}</Text>
      <Text style={styles.subText}>Telefon: {order.customer?.phone ?? '-'}</Text>
      <Text style={styles.subText}>Adres: {order.customer?.address ?? '-'}</Text>
      <Text style={styles.badges}>Durum: {order.status} · Tahsilat: {order.paymentStatus} · Fatura: {order.invoiceStatus}</Text>
      <Text style={[styles.cardTitle, { marginTop: 12 }]}>Ürünler ({totalItems})</Text>
      {order.items.map(i => (
        <Text key={i.id} style={styles.subText}>• {i.product.name} x{i.quantity}</Text>
      ))}
      {order.note ? <Text style={[styles.subText, { marginTop: 8 }]}>Not: {order.note}</Text> : null}
    </View>
  );
}

function NewOrder({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [pc, cc] = await Promise.all([
        fetch(`${API_URL}/api/products`).then(r => r.json()),
        fetch(`${API_URL}/api/customers`).then(r => r.json()),
      ]);
      setProducts(pc);
      setCustomers(cc);
    })();
  }, []);

  async function ensureCustomer(): Promise<number> {
    if (selectedCustomer) return selectedCustomer.id;
    if (!customerName.trim()) throw new Error('Müşteri adı zorunlu');
    const res = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: customerName, phone: customerPhone, address: customerAddress }),
    });
    const c = await res.json();
    return c.id;
  }

  async function createOrder() {
    try {
      setSaving(true);
      const customerId = await ensureCustomer();
      const items = Object.entries(quantities)
        .map(([pid, q]) => ({ productId: Number(pid), quantity: Number(q) }))
        .filter(i => i.quantity > 0);
      if (items.length === 0) throw new Error('En az bir ürün adedi gerekli');

      await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, items, note }),
      });
      onCreated();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <SmallButton label="Vazgeç" onPress={onCancel} />
        <Text style={styles.cardTitle}>Müşteri</Text>
        <FlatList
          horizontal
          data={customers}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCustomer(item)}
              style={[styles.pill, selectedCustomer?.id === item.id && styles.pillActive]}
            >
              <Text style={[styles.pillText, selectedCustomer?.id === item.id && styles.pillTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
        {!selectedCustomer && (
          <View style={{ gap: 8, marginTop: 8 }}>
            <TextInput placeholder="Yeni müşteri adı" value={customerName} onChangeText={setCustomerName} style={styles.input} />
            <TextInput placeholder="Telefon" value={customerPhone} onChangeText={setCustomerPhone} style={styles.input} />
            <TextInput placeholder="Adres" value={customerAddress} onChangeText={setCustomerAddress} style={styles.input} />
          </View>
        )}
      </View>

      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex: 1 }}>{item.name}</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="0"
              value={String(quantities[item.id] ?? '')}
              onChangeText={(t) => setQuantities((q) => ({ ...q, [item.id]: Number(t || 0) }))}
              style={styles.qty}
            />
          </View>
        )}
      />

      <View style={styles.footer}>
        <TextInput placeholder="Not" value={note} onChangeText={setNote} style={[styles.input, { flex: 1 }]} />
        <TouchableOpacity style={styles.cta} onPress={createOrder} disabled={saving}>
          <Text style={styles.ctaText}>{saving ? 'Kaydediliyor...' : 'Sipariş Oluştur'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f9' },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '700' },
  smallBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallBtnText: { color: 'white', fontWeight: '600' },
  card: { backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  subText: { color: '#444', marginTop: 4 },
  badges: { color: '#111', marginTop: 4, fontWeight: '600' },
  detailTitle: { fontSize: 24, fontWeight: '800', marginVertical: 12 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8 },
  pillActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  pillText: { color: '#0f172a' },
  pillTextActive: { color: 'white', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  input: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  qty: { width: 64, textAlign: 'center', backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 8, padding: 16, backgroundColor: '#f6f7f9', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e2e8f0' },
  cta: { backgroundColor: '#16a34a', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  ctaText: { color: 'white', fontWeight: '800' },
});

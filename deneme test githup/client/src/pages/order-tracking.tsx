import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Truck, User, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderForm from "@/components/order-form";
import OrderCard from "@/components/order-card";
import OrderStats from "@/components/order-stats";
import EditOrderModal from "@/components/edit-order-modal";
import type { Order } from "@shared/schema";

export default function OrderTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.listeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.siparisiVeren.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.urunListesi.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.siparisDurumu === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                💼 Sipariş Takip Sistemi
              </h1>
            </div>
            <div className="flex items-center text-white/90 bg-white/20 px-4 py-2 rounded-lg">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium">Yönetici Paneli</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <OrderForm />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Sipariş Listesi
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Sipariş ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Tüm Durumlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="Hazırlandı">Hazırlandı</SelectItem>
                    <SelectItem value="Teslim Edildi">Teslim Edildi</SelectItem>
                    <SelectItem value="Teslim Edilmedi">Teslim Edilmedi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm animate-fade-in-up">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 20h16M20 28h16M20 36h16M8 20h.01M8 28h.01M8 36h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    📋 Henüz sipariş bulunmuyor
                  </h3>
                  <p className="text-gray-600">
                    İlk siparişinizi eklemek için sol taraftaki formu kullanın.
                  </p>
                </div>
              ) : (
                filteredOrders.map((order, index) => (
                  <div key={order.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <OrderCard 
                      order={order} 
                      onEdit={(order) => setEditingOrder(order)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Statistics Section - Moved to bottom */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Sipariş Analizi</h2>
            <p className="text-gray-600">Genel sipariş durumu ve istatistikler</p>
          </div>
          <OrderStats orders={orders} />
        </div>
      </div>

      {/* Edit Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
}

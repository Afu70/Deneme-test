import { Box, CheckCircle, Clock, TrendingUp, Package, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@shared/schema";

interface OrderStatsProps {
  orders: Order[];
}

export default function OrderStats({ orders }: OrderStatsProps) {
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.siparisDurumu === "Teslim Edildi").length;
  const readyOrders = orders.filter(order => order.siparisDurumu === "Hazırlandı").length;
  const pendingOrders = orders.filter(order => order.siparisDurumu === "Teslim Edilmedi").length;
  const paidOrders = orders.filter(order => order.tahsilatDurumu === "Tahsil Edildi").length;
  const uniqueCustomers = new Set(orders.map(order => order.siparisiVeren)).size;

  const StatCard = ({ icon: Icon, value, label, color, bgColor, description }: {
    icon: React.ElementType;
    value: number;
    label: string;
    color: string;
    bgColor: string;
    description?: string;
  }) => (
    <Card className="stats-card hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
      <CardContent className="p-6 text-center relative">
        <div className={`absolute inset-0 ${bgColor} opacity-5`}></div>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${bgColor} ${color} mb-4 relative z-10`}>
          <Icon className="h-8 w-8" />
        </div>
        <h4 className="text-3xl font-bold mb-2 relative z-10">{value}</h4>
        <p className={`text-sm font-medium mb-1 relative z-10 ${color}`}>{label}</p>
        {description && (
          <p className="text-xs text-gray-500 relative z-10">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatCard
        icon={Package}
        value={totalOrders}
        label="Toplam Sipariş"
        color="text-blue-600"
        bgColor="bg-blue-100"
        description="Tüm siparişler"
      />
      <StatCard
        icon={CheckCircle}
        value={completedOrders}
        label="Teslim Edilen"
        color="text-green-600"
        bgColor="bg-green-100"
        description="Başarılı teslimat"
      />
      <StatCard
        icon={Box}
        value={readyOrders}
        label="Hazırlandı"
        color="text-blue-500"
        bgColor="bg-blue-100"
        description="Teslim bekliyor"
      />
      <StatCard
        icon={Clock}
        value={pendingOrders}
        label="Teslim Edilmedi"
        color="text-red-600"
        bgColor="bg-red-100"
        description="Bekleyen siparişler"
      />
      <StatCard
        icon={TrendingUp}
        value={paidOrders}
        label="Tahsil Edildi"
        color="text-emerald-600"
        bgColor="bg-emerald-100"
        description="Ödeme alındı"
      />
      <StatCard
        icon={Users}
        value={uniqueCustomers}
        label="Müşteri Sayısı"
        color="text-purple-600"
        bgColor="bg-purple-100"
        description="Benzersiz müşteriler"
      />
    </div>
  );
}

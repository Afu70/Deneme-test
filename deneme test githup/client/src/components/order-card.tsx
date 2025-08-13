import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, User, Calendar, Box } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Order } from "@shared/schema";

interface OrderCardProps {
  order: Order;
  onEdit: (order: Order) => void;
}

export default function OrderCard({ order, onEdit }: OrderCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Başarılı",
        description: "Sipariş başarıyla silindi!",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Sipariş silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Bu siparişi silmek istediğinizden emin misiniz?")) {
      deleteOrderMutation.mutate(order.id);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "Teslim Edildi":
        return "bg-green-100 text-green-800 border-green-200";
      case "Hazırlandı":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Teslim Edilmedi":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === "Tahsil Edildi" 
      ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
      : "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "Fatura Kesildi":
        return "bg-green-100 text-green-800 border-green-200";
      case "Fatura Kesilecek":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Fatura İstemiyor":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getHeaderGradient = (status: string) => {
    switch (status) {
      case "Teslim Edildi":
        return "bg-gradient-to-r from-green-600 to-green-700";
      case "Hazırlandı":
        return "bg-gradient-to-r from-blue-600 to-blue-700";
      case "Teslim Edilmedi":
        return "bg-gradient-to-r from-red-600 to-red-700";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-700";
    }
  };

  return (
    <Card className="order-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden">
      <CardHeader className={`${getHeaderGradient(order.siparisDurumu)} text-white rounded-t-lg relative`}>
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h4 className="font-bold text-xl flex items-center">
              <Box className="h-5 w-5 mr-2" />
              #{order.listeNo}
            </h4>
            <p className="text-white/90 flex items-center text-sm mt-1">
              <User className="h-4 w-4 mr-1" />
              {order.siparisiVeren}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/90 flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(order.tarih).toLocaleDateString('tr-TR')}
            </p>
            <p className="text-white/80 text-xs mt-1">
              {new Date(order.tarih).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Ürün Detayları</h5>
            <p className="text-gray-700 mb-2">{order.urunListesi}</p>
            <p className="text-sm text-gray-500 flex items-center">
              <Box className="h-4 w-4 mr-1" />
              {order.adet} adet
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Sipariş Durumu</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.siparisDurumu)}`}>
                {order.siparisDurumu}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tahsilat</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.tahsilatDurumu)}`}>
                {order.tahsilatDurumu}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Fatura</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getInvoiceStatusColor(order.faturaDurumu)}`}>
                {order.faturaDurumu}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(order)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Edit className="h-4 w-4 mr-1" />
            Düzenle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteOrderMutation.isPending}
            className="text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {deleteOrderMutation.isPending ? "Siliniyor..." : "Sil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

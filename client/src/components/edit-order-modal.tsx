import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { insertOrderSchema, type InsertOrder, type Order } from "@shared/schema";
import { PRODUCT_LIST } from "@shared/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
}

export default function EditOrderModal({ order, onClose }: EditOrderModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      listeNo: order.listeNo,
      siparisiVeren: order.siparisiVeren,
      urunListesi: order.urunListesi,
      adet: order.adet,
      siparisDurumu: order.siparisDurumu,
      tahsilatDurumu: order.tahsilatDurumu,
      faturaDurumu: order.faturaDurumu,
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const response = await apiRequest("PUT", `/api/orders/${order.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onClose();
      toast({
        title: "Başarılı",
        description: "Sipariş başarıyla güncellendi!",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Sipariş güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertOrder) => {
    updateOrderMutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Save className="h-5 w-5 mr-2" />
            Sipariş Düzenle
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="listeNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liste No</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siparisiVeren"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Siparişi Veren</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adet</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siparisDurumu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sipariş Durumu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Hazırlandı">Hazırlandı</SelectItem>
                        <SelectItem value="Teslim Edildi">Teslim Edildi</SelectItem>
                        <SelectItem value="Teslim Edilmedi">Teslim Edilmedi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tahsilatDurumu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahsilat Durumu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tahsil Edildi">Tahsil Edildi</SelectItem>
                        <SelectItem value="Tahsil Edilmedi">Tahsil Edilmedi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="faturaDurumu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fatura Durumu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fatura Kesildi">Fatura Kesildi</SelectItem>
                        <SelectItem value="Fatura Kesilecek">Fatura Kesilecek</SelectItem>
                        <SelectItem value="Fatura İstemiyor">Fatura İstemiyor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="urunListesi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ürün Seçimi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ürün seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRODUCT_LIST.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={updateOrderMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateOrderMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

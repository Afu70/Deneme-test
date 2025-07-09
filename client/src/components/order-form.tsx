import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { insertOrderSchema, type InsertOrder } from "@shared/schema";
import { PRODUCT_LIST } from "@shared/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function OrderForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      listeNo: "",
      siparisiVeren: "",
      urunListesi: "",
      adet: 1,
      siparisDurumu: "",
      tahsilatDurumu: "",
      faturaDurumu: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      form.reset();
      toast({
        title: "Başarılı",
        description: "Sipariş başarıyla eklendi!",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Sipariş eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertOrder) => {
    createOrderMutation.mutate(data);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Plus className="h-5 w-5 mr-2 text-blue-600" />
        Yeni Sipariş
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="listeNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liste No</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: SP-2024-001" {...field} />
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
                  <Input placeholder="Müşteri adı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    placeholder="Toplam adet" 
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
                      <SelectValue placeholder="Durum seçin" />
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
                      <SelectValue placeholder="Durum seçin" />
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
                      <SelectValue placeholder="Durum seçin" />
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

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ekleniyor...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Siparişi Ekle
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

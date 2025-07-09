import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  listeNo: text("liste_no").notNull(),
  siparisiVeren: text("siparisi_veren").notNull(),
  urunListesi: text("urun_listesi").notNull(),
  adet: integer("adet").notNull(),
  siparisDurumu: text("siparis_durumu").notNull(),
  tahsilatDurumu: text("tahsilat_durumu").notNull(),
  faturaDurumu: text("fatura_durumu").notNull(),
  tarih: timestamp("tarih").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  tarih: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

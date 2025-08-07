import { Router } from "express";
import prisma from "../prisma";
import { OrderStatus, PaymentStatus, InvoiceStatus } from "@prisma/client";

const router = Router();

router.get("/", async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, items: { include: { product: true } } },
  });
  res.json(orders);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({ where: { id }, include: { customer: true, items: { include: { product: true } } } });
  if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });
  res.json(order);
});

router.post("/", async (req, res) => {
  const { customerId, items, status, paymentStatus, invoiceStatus, note } = req.body as {
    customerId: number;
    items: { productId: number; quantity: number }[];
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    invoiceStatus?: InvoiceStatus;
    note?: string;
  };

  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Müşteri ve en az bir ürün zorunlu" });
  }

  const cleanItems = items.filter(i => i.quantity && i.quantity > 0);
  if (cleanItems.length === 0) return res.status(400).json({ message: "Adet > 0 olmalı" });

  const created = await prisma.order.create({
    data: {
      customerId,
      status: status ?? OrderStatus.HAZIRLANIYOR,
      paymentStatus: paymentStatus ?? PaymentStatus.TAHSIL_EDILMEDI,
      invoiceStatus: invoiceStatus ?? InvoiceStatus.GEREK_YOK,
      note,
      items: { createMany: { data: cleanItems } },
    },
    include: { customer: true, items: { include: { product: true } } },
  });

  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { status, paymentStatus, invoiceStatus, note, items } = req.body as Partial<{
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    invoiceStatus: InvoiceStatus;
    note: string;
    items: { productId: number; quantity: number }[];
  }>;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({ where: { id }, data: { status, paymentStatus, invoiceStatus, note } });

      if (items && Array.isArray(items)) {
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        const cleanItems = items.filter(i => i.quantity && i.quantity > 0);
        if (cleanItems.length > 0) {
          await tx.orderItem.createMany({ data: cleanItems.map(i => ({ ...i, orderId: id })) });
        }
      }

      return tx.order.findUnique({ where: { id }, include: { customer: true, items: { include: { product: true } } } });
    });

    res.json(updated);
  } catch {
    res.status(404).json({ message: "Sipariş bulunamadı" });
  }
});

export default router;
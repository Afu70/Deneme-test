import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  res.json(customers);
});

router.post("/", async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name) return res.status(400).json({ message: "İsim zorunlu" });
  const customer = await prisma.customer.create({ data: { name, phone, address } });
  res.status(201).json(customer);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, phone, address } = req.body;
  try {
    const customer = await prisma.customer.update({ where: { id }, data: { name, phone, address } });
    res.json(customer);
  } catch {
    res.status(404).json({ message: "Müşteri bulunamadı" });
  }
});

export default router;
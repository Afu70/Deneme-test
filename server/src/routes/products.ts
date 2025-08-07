import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { id: "asc" } });
  res.json(products);
});

export default router;
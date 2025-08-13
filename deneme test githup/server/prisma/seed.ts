import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  "ideal pet şişe 0.33",
  "ideal pet şişe 0.50",
  "ideal pet şişe 5l",
  "ideal pet şişe 1,5 l",
  "ideal pet şişe 19",
  "ideal bardak su 200cc",
  "limonata",
  "meyveli soda",
  "sade soda",
  "şalgam",
];

async function main() {
  for (const name of products) {
    await prisma.product.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Seed tamamlandı.");
}

main().finally(async () => {
  await prisma.$disconnect();
});
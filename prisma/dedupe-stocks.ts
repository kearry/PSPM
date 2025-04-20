/**
 * Delete duplicate stocks per (userId,ticker) pair and
 * move their transactions onto the first keep‑record.
 *
 * Usage:  npx ts-node prisma/dedupe-stocks.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ select: { id: true } });

    for (const { id: userId } of users) {
        // group by ticker
        const stocks = await prisma.stock.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },   // oldest first
        });

        const groups = stocks.reduce<Record<string, typeof stocks>>(
            (acc, s) => {
                (acc[s.ticker] ||= []).push(s);
                return acc;
            },
            {},
        );

        for (const [ticker, duplicates] of Object.entries(groups)) {
            if (duplicates.length <= 1) continue;

            const [keep, ...remove] = duplicates;

            // move transactions
            await prisma.transaction.updateMany({
                where: { stockId: { in: remove.map((s) => s.id) } },
                data: { stockId: keep.id },
            });

            // move notes
            await prisma.note.updateMany({
                where: { stockId: { in: remove.map((s) => s.id) } },
                data: { stockId: keep.id },
            });

            // delete duplicates
            await prisma.stock.deleteMany({
                where: { id: { in: remove.map((s) => s.id) } },
            });

            console.log(
                `Merged ${remove.length} duplicate ${ticker} rows into ${keep.id}`,
            );
        }
    }
}

main().finally(() => prisma.$disconnect());
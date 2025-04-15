// prisma/migration.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    try {
        console.log('Starting migration to add exchange rate and FX fee fields...');

        // Apply migration by setting default values
        console.log('Updating all existing transactions with default values...');

        const transactions = await prisma.transaction.findMany();

        let updated = 0;
        for (const transaction of transactions) {
            try {
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        exchangeRate: 1.0, // Default to 1.0 (no conversion)
                        fxFee: 0.0,      // Default to no fee
                    },
                });
                updated++;
            } catch (error) {
                console.error(`Error updating transaction ${transaction.id}:`, error);
            }
        }

        console.log(`Migration complete! Updated ${updated} of ${transactions.length} transactions.`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
migrate().catch(console.error);
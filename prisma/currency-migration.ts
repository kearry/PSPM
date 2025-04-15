// prisma/currency-migration.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    try {
        console.log('Starting migration to add currency fields...');

        // Add default currency to User model
        console.log('Updating all existing users with default currency (GBP)...');
        const usersUpdated = await prisma.user.updateMany({
            data: {
                defaultCurrency: 'GBP',
            },
        });
        console.log(`Updated ${usersUpdated.count} users.`);

        // Add currency to Stock model
        console.log('Updating all existing stocks with default currency (USD)...');
        const stocksUpdated = await prisma.stock.updateMany({
            data: {
                currency: 'USD',
            },
        });
        console.log(`Updated ${stocksUpdated.count} stocks.`);

        // Add currency to Transaction model
        console.log('Updating all existing transactions with default currency (USD)...');
        const transactionsUpdated = await prisma.transaction.updateMany({
            data: {
                currency: 'USD',
            },
        });
        console.log(`Updated ${transactionsUpdated.count} transactions.`);

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
migrate().catch(console.error);
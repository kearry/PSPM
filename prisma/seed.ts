import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import { TransactionType } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
    // Create default user
    const defaultUserName = process.env.DEFAULT_USER_NAME || 'Demo User';
    const defaultUserEmail = process.env.DEFAULT_USER_EMAIL || 'user@example.com';

    // Create user if not exists
    const user = await prisma.user.upsert({
        where: { email: defaultUserEmail },
        update: {},
        create: {
            name: defaultUserName,
            email: defaultUserEmail,
        },
    });

    console.log(`Default user created or found with ID: ${user.id}`);

    // Create sectors
    const sectors = await Promise.all([
        'Technology',
        'Healthcare',
        'Financial Services',
        'Consumer Goods',
        'Energy',
        'Utilities',
        'Real Estate',
        'Communication Services',
        'Materials',
        'Industrials',
    ].map(async (name) => {
        return await prisma.sector.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }));

    console.log(`Created or found ${sectors.length} sectors`);

    // Create sample stocks
    const techSector = sectors[0];
    const financeSector = sectors[2];
    const stocks = await Promise.all([
        {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            sectorId: techSector.id,
            userId: user.id,
        },
        {
            ticker: 'MSFT',
            name: 'Microsoft Corporation',
            sectorId: techSector.id,
            userId: user.id,
        },
        {
            ticker: 'JPM',
            name: 'JPMorgan Chase & Co.',
            sectorId: financeSector.id,
            userId: user.id,
        },
    ].map(async (stock) => {
        return await prisma.stock.upsert({
            where: {
                id: `${stock.userId}-${stock.ticker}`, // This will fail, but we'll catch it
            },
            update: {},
            create: stock,
            select: {
                id: true,
                ticker: true,
            },
        }).catch(() => {
            // If the upsert fails (since we don't have a compound unique constraint),
            // we'll create a new stock
            return prisma.stock.create({
                data: stock,
                select: {
                    id: true,
                    ticker: true,
                },
            });
        });
    }));

    console.log(`Created sample stocks: ${stocks.map(s => s.ticker).join(', ')}`);

    // Create sample transactions
    const today = new Date();

    // Regular local currency transactions
    for (const stock of stocks) {
        // Create a BUY transaction
        await prisma.transaction.create({
            data: {
                stockId: stock.id,
                userId: user.id,
                type: TransactionType.BUY,
                quantity: 10,
                price: stock.ticker === 'AAPL' ? 175.5 :
                    stock.ticker === 'MSFT' ? 340.2 : 150.75,
                exchangeRate: 1.0, // Local currency
                fxFee: 0.0,       // No FX fee
                date: subDays(today, Math.floor(Math.random() * 30)),
            }
        });

        // Create another BUY transaction
        await prisma.transaction.create({
            data: {
                stockId: stock.id,
                userId: user.id,
                type: TransactionType.BUY,
                quantity: 5,
                price: stock.ticker === 'AAPL' ? 180.25 :
                    stock.ticker === 'MSFT' ? 345.8 : 155.3,
                exchangeRate: 1.0, // Local currency
                fxFee: 0.0,       // No FX fee
                date: subDays(today, Math.floor(Math.random() * 20)),
            }
        });

        // Create a SELL transaction for AAPL only
        if (stock.ticker === 'AAPL') {
            await prisma.transaction.create({
                data: {
                    stockId: stock.id,
                    userId: user.id,
                    type: TransactionType.SELL,
                    quantity: 3,
                    price: 190.5,
                    exchangeRate: 1.0, // Local currency
                    fxFee: 0.0,       // No FX fee
                    date: subDays(today, Math.floor(Math.random() * 10)),
                }
            });
        }
    }

    // Add some foreign currency transactions as examples
    const msftStock = stocks.find(s => s.ticker === 'MSFT');
    if (msftStock) {
        // Add a EUR transaction for MSFT
        await prisma.transaction.create({
            data: {
                stockId: msftStock.id,
                userId: user.id,
                type: TransactionType.BUY,
                quantity: 8,
                price: 320.75, // Price in EUR
                exchangeRate: 1.10, // Convert EUR to USD
                fxFee: 12.50,     // FX fee in USD
                date: subDays(today, 5),
            }
        });
    }

    console.log('Created sample transactions (including foreign currency examples)');

    // Create sample notes
    await prisma.note.create({
        data: {
            content: 'Apple showing strong growth potential after recent product launch',
            userId: user.id,
            stockId: stocks[0].id,
        }
    });

    await prisma.note.create({
        data: {
            content: 'Microsoft cloud services continue to exceed expectations',
            userId: user.id,
            stockId: stocks[1].id,
        }
    });

    // Add a note about foreign currency transaction
    if (msftStock) {
        await prisma.note.create({
            data: {
                content: 'Purchased through European broker with EUR - watch exchange rates for future trades',
                userId: user.id,
                stockId: msftStock.id,
            }
        });
    }

    console.log('Created sample notes');

    // Create some audit logs
    await prisma.auditLog.create({
        data: {
            action: 'CREATE_STOCK',
            entityType: 'Stock',
            entityId: stocks[0].id,
            payload: JSON.stringify({ ticker: 'AAPL', name: 'Apple Inc.' }),
            userId: user.id,
        }
    });

    console.log('Created sample audit logs');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
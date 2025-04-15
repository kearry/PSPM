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
        update: {
            defaultCurrency: 'GBP', // Update with default currency
        },
        create: {
            name: defaultUserName,
            email: defaultUserEmail,
            defaultCurrency: 'GBP', // Set default currency
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
            currency: 'USD', // Set currency for stock
        },
        {
            ticker: 'MSFT',
            name: 'Microsoft Corporation',
            sectorId: techSector.id,
            userId: user.id,
            currency: 'USD', // Set currency for stock
        },
        {
            ticker: 'JPM',
            name: 'JPMorgan Chase & Co.',
            sectorId: financeSector.id,
            userId: user.id,
            currency: 'USD', // Set currency for stock
        },
        {
            ticker: 'BARC',
            name: 'Barclays PLC',
            sectorId: financeSector.id,
            userId: user.id,
            currency: 'GBP', // Set a GBP stock as example
        },
    ].map(async (stock) => {
        return await prisma.stock.upsert({
            where: {
                id: `${stock.userId}-${stock.ticker}`, // This will fail, but we'll catch it
            },
            update: {
                currency: stock.currency, // Update currency if stock exists
            },
            create: stock,
            select: {
                id: true,
                ticker: true,
                currency: true,
            },
        }).catch(() => {
            // If the upsert fails (since we don't have a compound unique constraint),
            // we'll create a new stock
            return prisma.stock.create({
                data: stock,
                select: {
                    id: true,
                    ticker: true,
                    currency: true,
                },
            });
        });
    }));

    console.log(`Created sample stocks: ${stocks.map(s => s.ticker).join(', ')}`);

    // Create sample transactions
    const today = new Date();

    // Regular transactions with various currencies
    for (const stock of stocks) {
        // Determine the currency for this stock's transactions
        const stockCurrency = stock.currency;

        // Create a BUY transaction
        await prisma.transaction.create({
            data: {
                stockId: stock.id,
                userId: user.id,
                type: TransactionType.BUY,
                quantity: 10,
                price: stock.ticker === 'AAPL' ? 175.5 :
                    stock.ticker === 'MSFT' ? 340.2 :
                        stock.ticker === 'BARC' ? 150.75 : 150.75,
                currency: stockCurrency, // Use the stock's currency
                exchangeRate: stockCurrency === 'GBP' ? 1.0 : 1.25, // Exchange rate from USD to GBP if needed
                fxFee: stockCurrency === 'GBP' ? 0.0 : 5.0, // FX fee for foreign currency
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
                    stock.ticker === 'MSFT' ? 345.8 :
                        stock.ticker === 'BARC' ? 155.3 : 155.3,
                currency: stockCurrency, // Use the stock's currency
                exchangeRate: stockCurrency === 'GBP' ? 1.0 : 1.27, // Exchange rate from USD to GBP if needed
                fxFee: stockCurrency === 'GBP' ? 0.0 : 4.5, // FX fee for foreign currency
                date: subDays(today, Math.floor(Math.random() * 20)),
            }
        });

        // Create a SELL transaction for AAPL and BARC only
        if (stock.ticker === 'AAPL' || stock.ticker === 'BARC') {
            await prisma.transaction.create({
                data: {
                    stockId: stock.id,
                    userId: user.id,
                    type: TransactionType.SELL,
                    quantity: 3,
                    price: stock.ticker === 'AAPL' ? 190.5 : 165.25,
                    currency: stockCurrency, // Use the stock's currency
                    exchangeRate: stockCurrency === 'GBP' ? 1.0 : 1.26, // Exchange rate from USD to GBP if needed
                    fxFee: stockCurrency === 'GBP' ? 0.0 : 4.75, // FX fee for foreign currency
                    date: subDays(today, Math.floor(Math.random() * 10)),
                }
            });
        }
    }

    console.log('Created sample transactions with currency information');

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

    // Add a note about currency considerations
    const barcStock = stocks.find(s => s.ticker === 'BARC');
    if (barcStock) {
        await prisma.note.create({
            data: {
                content: 'UK stock with no currency conversion needed as it trades in GBP',
                userId: user.id,
                stockId: barcStock.id,
            }
        });
    }

    // Add a note about foreign currency transaction
    const msftStock = stocks.find(s => s.ticker === 'MSFT');
    if (msftStock) {
        await prisma.note.create({
            data: {
                content: 'Need to monitor USD/GBP exchange rates for impact on returns',
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
            payload: JSON.stringify({ ticker: 'AAPL', name: 'Apple Inc.', currency: 'USD' }),
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
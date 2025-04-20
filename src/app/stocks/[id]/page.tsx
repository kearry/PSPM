// src/app/stocks/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStockById } from "@/actions/stocks";
import { calculateAveragePrice, calculateTotalHoldings } from "@/lib/utils";
import StockHeader from "@/components/stocks/stock-header";
import StockDetails from "@/components/stocks/stock-details";
import StockTransactions from "@/components/stocks/stock-transactions";
import StockNotes from "@/components/stocks/stock-notes";
import { Currency } from "@/lib/validators"; // Import the Currency type

interface StockPageProps {
    params: { id: string };
}

export async function generateMetadata({
    params,
}: StockPageProps): Promise<Metadata> {
    const { success, data, error } = await getStockById(params.id);

    if (!success || !data) {
        return {
            title: "Stock Not Found | Stock Manager",
        };
    }

    return {
        title: `${data.ticker} | Stock Manager`,
        description: `Details for ${data.name} (${data.ticker})`,
    };
}

export default async function StockPage({ params }: StockPageProps) {
    const { success, data: stock, error } = await getStockById(params.id);

    if (!success || !stock) {
        notFound();
    }

    // Calculate stock details
    const averagePrice = calculateAveragePrice(stock.transactions);
    const holdings = calculateTotalHoldings(stock.transactions);
    const value = holdings * averagePrice; // Note: This assumes average price reflects current value

    // Enhance the stock object and cast the currency type
    const enhancedStock = {
        ...stock,
        averagePrice,
        holdings,
        value,
        currency: (stock.currency || "USD") as Currency, // Cast stock currency
        notes: stock.notes || [],
    };

    // Map over transactions to cast their currency type
    const typedTransactions = stock.transactions.map((tx) => ({
        ...tx,
        currency: (tx.currency || stock.currency || "USD") as Currency, // Cast transaction currency
    }));

    // Log for debugging
    console.log(`Stock ${stock.ticker} has ${stock.notes?.length || 0} notes`);

    return (
        <div className="space-y-6">
            <StockHeader stock={enhancedStock} />

            <div className="grid gap-6 md:grid-cols-7">
                <div className="md:col-span-3">
                    <StockDetails stock={enhancedStock} />
                </div>
                <div className="md:col-span-4">
                    <StockTransactions
                        stock={enhancedStock}
                        transactions={typedTransactions} // <-- Pass the correctly typed transactions
                    />
                </div>
            </div>
            <StockNotes stockId={stock.id} notes={stock.notes || []} />
        </div>
    );
}
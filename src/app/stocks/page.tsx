import { Metadata } from "next";
import { getStocks, getSectors } from "@/actions/stocks";
import { getTransactions } from "@/actions/transactions";
import StocksHeader from "@/components/stocks/stocks-header";
import StocksTable from "@/components/stocks/stocks-table";
import { calculateAveragePrice, calculateTotalHoldings } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Stocks | Stock Manager",
    description: "Manage your stock portfolio",
};

export default async function StocksPage() {
    const [stocksResponse, transactionsResponse, sectorsResponse] = await Promise.all([
        getStocks(),
        getTransactions(),
        getSectors(),
    ]);

    const stocks = stocksResponse.success ? stocksResponse.data ?? [] : [];
    const transactions = transactionsResponse.success ? transactionsResponse.data ?? [] : [];
    const sectors = sectorsResponse.success ? sectorsResponse.data ?? [] : [];

    // Enhance stock data with calculated fields
    const enhancedStocks = stocks.map((stock) => {
        const stockTransactions = transactions.filter(
            (transaction) => transaction.stockId === stock.id
        );

        const averagePrice = calculateAveragePrice(stockTransactions);
        const holdings = calculateTotalHoldings(stockTransactions);
        const value = holdings * averagePrice;

        // Make sure we keep the notes data from the original stock object
        return {
            ...stock,
            averagePrice,
            holdings,
            value,
            transactions: stockTransactions.length,
            notes: stock.notes || [], // Ensure notes are passed along
        };
    });

    // Log for debugging
    console.log("Stock notes data sample:",
        enhancedStocks.length > 0 ?
            `First stock has ${enhancedStocks[0].notes?.length || 0} notes` :
            "No stocks available");

    return (
        <div className="space-y-6">
            <StocksHeader />
            <StocksTable stocks={enhancedStocks} sectors={sectors} />
        </div>
    );
}
import { Metadata } from "next";
import { getStocks } from "@/actions/stocks";
import { getTransactions } from "@/actions/transactions";
import { getCurrentUser } from "@/actions/user";
import { calculateAveragePrice, calculateTotalHoldings, formatCurrency } from "@/lib/utils";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StockSummary from "@/components/dashboard/stock-summary";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import SectorBreakdown from "@/components/dashboard/sector-breakdown";
import PortfolioValue from "@/components/dashboard/portfolio-value";

export const metadata: Metadata = {
    title: "Dashboard | Stock Manager",
    description: "View your stock portfolio at a glance",
};

export default async function DashboardPage() {
    const [userResponse, stocksResponse, transactionsResponse] = await Promise.all([
        getCurrentUser(),
        getStocks(),
        getTransactions(),
    ]);

    const stocks = stocksResponse.success ? stocksResponse.data ?? [] : [];
    const transactions = transactionsResponse.success ? transactionsResponse.data ?? [] : [];
    const userCurrency = userResponse.defaultCurrency || "GBP";

    // Calculate portfolio summary
    const stocksWithDetails = stocks.map((stock) => {
        const stockTransactions = transactions.filter(
            (transaction) => transaction.stockId === stock.id
        );

        const averagePrice = calculateAveragePrice(stockTransactions);
        const holdings = calculateTotalHoldings(stockTransactions);
        const value = holdings * averagePrice; // Using average price as current price

        return {
            ...stock,
            averagePrice,
            holdings,
            value,
        };
    });

    const portfolioValue = stocksWithDetails.reduce(
        (total, stock) => total + stock.value,
        0
    );

    const stocksWithHoldings = stocksWithDetails.filter(
        (stock) => stock.holdings > 0
    );

    // Group stocks by sector for breakdown
    const sectorData = stocksWithHoldings.reduce((acc, stock) => {
        const sectorName = stock.sector?.name || "Uncategorized";

        if (!acc[sectorName]) {
            acc[sectorName] = {
                name: sectorName,
                value: 0,
            };
        }

        acc[sectorName].value += stock.value;
        return acc;
    }, {} as Record<string, { name: string; value: number }>);

    const sectorBreakdown = Object.values(sectorData).map((sector) => ({
        ...sector,
        percentage: (sector.value / portfolioValue) * 100,
    }));

    // Get recent transactions
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <DashboardHeader
                username={userResponse.name}
                portfolioValue={portfolioValue}
                currency={userCurrency}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <PortfolioValue
                    portfolioValue={portfolioValue}
                    stocksCount={stocksWithHoldings.length}
                    currency={userCurrency}
                />

                <SectorBreakdown
                    sectors={sectorBreakdown}
                    currency={userCurrency}
                />

                <RecentTransactions
                    transactions={recentTransactions}
                    userCurrency={userCurrency}
                />
            </div>

            <StockSummary
                stocks={stocksWithHoldings}
                userCurrency={userCurrency}
            />
        </div>
    );
}
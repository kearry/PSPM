import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Landmark } from "lucide-react";

interface PortfolioValueProps {
    portfolioValue: number;
    stocksCount: number;
}

export default function PortfolioValue({
    portfolioValue,
    stocksCount,
}: PortfolioValueProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
                <p className="text-xs text-muted-foreground">
                    {stocksCount} {stocksCount === 1 ? "stock" : "stocks"} in portfolio
                </p>
            </CardContent>
        </Card>
    );
}
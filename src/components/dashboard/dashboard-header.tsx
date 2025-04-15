import { formatCurrency } from "@/lib/utils";

interface DashboardHeaderProps {
    username: string;
    portfolioValue: number;
    currency: string;
}

export default function DashboardHeader({
    username,
    portfolioValue,
    currency,
}: DashboardHeaderProps) {
    return (
        <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back, {username}</h2>
            <div className="flex items-center text-muted-foreground">
                <span>Your portfolio is currently worth {formatCurrency(portfolioValue, currency)}</span>
            </div>
        </div>
    );
}
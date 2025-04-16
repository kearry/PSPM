"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SectorBreakdownProps {
    sectors: {
        name: string;
        value: number;
        percentage: number;
    }[];
    currency?: string; // Add currency prop with optional marker
}

// Generate colors for the pie chart
const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0",
    "#00BFFF", "#8884D8", "#82CA9D", "#FF6B6B", "#FFA07A"
];

export default function SectorBreakdown({ sectors, currency = 'GBP' }: SectorBreakdownProps) {
    // If no sectors, display a fallback
    if (sectors.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sector Breakdown</CardTitle>
                    <CardDescription>Allocation by industry sector</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No sector data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sector Breakdown</CardTitle>
                <CardDescription>Allocation by industry sector</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sectors}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {sectors.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value, currency)}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1">
                    {sectors.map((sector, index) => (
                        <div key={sector.name} className="flex items-center text-xs">
                            <div
                                className="w-3 h-3 mr-1"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="flex-1 font-medium">{sector.name}</div>
                            <div>{formatCurrency(sector.value, currency)}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
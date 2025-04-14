"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TagIcon, PlusIcon } from "lucide-react";

interface Sector {
    id: string;
    name: string;
}

interface SectorsManagementProps {
    sectors: Sector[];
}

export default function SectorsManagement({ sectors }: SectorsManagementProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sectors</CardTitle>
                <CardDescription>
                    Manage industry sectors for your stocks
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {sectors.map((sector) => (
                        <div
                            key={sector.id}
                            className="flex items-center bg-secondary text-secondary-foreground rounded-md px-3 py-1 text-sm"
                        >
                            <TagIcon className="mr-1 h-3 w-3" />
                            {sector.name}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                    Industry sectors are pre-configured and cannot be edited directly. They are automatically used when adding or editing stocks.
                </p>
            </CardContent>
        </Card>
    );
}
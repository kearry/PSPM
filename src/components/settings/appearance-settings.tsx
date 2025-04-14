"use client";

import { useTheme } from "next-themes";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, MonitorIcon } from "lucide-react";

export default function AppearanceSettings() {
    const { theme, setTheme } = useTheme();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize how the application looks
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant={theme === "light" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setTheme("light")}
                        >
                            <SunIcon className="mr-2 h-4 w-4" />
                            Light
                        </Button>
                        <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setTheme("dark")}
                        >
                            <MoonIcon className="mr-2 h-4 w-4" />
                            Dark
                        </Button>
                        <Button
                            variant={theme === "system" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setTheme("system")}
                        >
                            <MonitorIcon className="mr-2 h-4 w-4" />
                            System
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Choose a theme for the application. System setting will follow your device preferences.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
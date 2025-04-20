// src/app/settings/page.tsx
import { Metadata } from "next";
import { getCurrentUser } from "@/actions/user";
import { getSectors } from "@/actions/stocks";
import UserProfileForm from "@/components/settings/user-profile-form";
import AppearanceSettings from "@/components/settings/appearance-settings";
import DataManagementSettings from "@/components/settings/data-management-settings";
import SectorsManagement from "@/components/settings/sectors-management";
import { Currency } from "@/lib/validators"; // Import the Currency type

export const metadata: Metadata = {
    title: "Settings | Stock Manager",
    description: "Configure your stock portfolio manager",
};

export default async function SettingsPage() {
    const [user, sectorsResponse] = await Promise.all([
        getCurrentUser(),
        getSectors(),
    ]);

    const sectors = sectorsResponse.success ? sectorsResponse.data ?? [] : [];

    // Cast the user object to ensure defaultCurrency matches the expected type
    const typedUser = {
        ...user,
        defaultCurrency: (user.defaultCurrency || "GBP") as Currency, // Cast here
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Configure your preferences and account settings
                </p>
            </div>
            <div className="grid gap-6">
                {/* Pass the correctly typed user object */}
                <UserProfileForm user={typedUser} />
                <AppearanceSettings />
                <SectorsManagement sectors={sectors} />
                <DataManagementSettings />
            </div>
        </div>
    );
}
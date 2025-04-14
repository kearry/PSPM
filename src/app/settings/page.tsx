import { Metadata } from "next";
import { getCurrentUser } from "@/actions/user";
import { getSectors } from "@/actions/stocks";
import UserProfileForm from "@/components/settings/user-profile-form";
import AppearanceSettings from "@/components/settings/appearance-settings";
import DataManagementSettings from "@/components/settings/data-management-settings";
import SectorsManagement from "@/components/settings/sectors-management";

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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Configure your preferences and account settings
                </p>
            </div>

            <div className="grid gap-6">
                <UserProfileForm user={user} />
                <AppearanceSettings />
                <SectorsManagement sectors={sectors} />
                <DataManagementSettings />
            </div>
        </div>
    );
}
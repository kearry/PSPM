"use server";

import { prisma } from "@/lib/db";
import { UserProfileFormValues } from "@/lib/validators";
import { revalidatePath } from "next/cache";

/**
 * Get the current user (for local development, we'll use the default user)
 */
export async function getCurrentUser() {
    const defaultUserEmail = process.env.DEFAULT_USER_EMAIL || "user@example.com";

    const user = await prisma.user.findUnique({
        where: { email: defaultUserEmail },
    });

    if (!user) {
        throw new Error("No user found. Please ensure the seed script has been run.");
    }

    return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UserProfileFormValues) {
    try {
        const currentUser = await getCurrentUser();

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                name: data.name,
                email: data.email,
                defaultCurrency: data.defaultCurrency,
            },
        });

        revalidatePath("/settings");

        return { success: true, user: updatedUser };
    } catch (error) {
        console.error("Error updating user profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}
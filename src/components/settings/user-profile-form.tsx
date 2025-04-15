"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserProfileFormValues, userProfileSchema } from "@/lib/validators";
import { updateUserProfile } from "@/actions/user";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/utils";

interface User {
    id: string;
    name: string;
    email: string;
    defaultCurrency: string;
}

interface UserProfileFormProps {
    user: User;
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UserProfileFormValues>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            defaultCurrency: user.defaultCurrency || "GBP",
        },
    });

    const onSubmit = async (data: UserProfileFormValues) => {
        setIsLoading(true);
        try {
            const result = await updateUserProfile(data);

            if (result.success) {
                toast({
                    title: "Profile updated",
                    description: "Your profile has been updated successfully.",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update profile.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="defaultCurrency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Currency</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a currency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="GBP">{getCurrencySymbol("GBP")} GBP - British Pound</SelectItem>
                                            <SelectItem value="USD">{getCurrencySymbol("USD")} USD - US Dollar</SelectItem>
                                            <SelectItem value="EUR">{getCurrencySymbol("EUR")} EUR - Euro</SelectItem>
                                            <SelectItem value="JPY">{getCurrencySymbol("JPY")} JPY - Japanese Yen</SelectItem>
                                            <SelectItem value="CHF">{getCurrencySymbol("CHF")} CHF - Swiss Franc</SelectItem>
                                            <SelectItem value="CAD">{getCurrencySymbol("CAD")} CAD - Canadian Dollar</SelectItem>
                                            <SelectItem value="AUD">{getCurrencySymbol("AUD")} AUD - Australian Dollar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
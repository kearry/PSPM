"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NoteFormValues, noteSchema } from "@/lib/validators";
import { createNote } from "@/actions/notes";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AddNoteFormProps {
    entityType: "stock" | "transaction";
    entityId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddNoteForm({
    entityType,
    entityId,
    open,
    onOpenChange,
}: AddNoteFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            content: "",
            stockId: entityType === "stock" ? entityId : undefined,
            transactionId: entityType === "transaction" ? entityId : undefined,
        },
    });

    const onSubmit = async (data: NoteFormValues) => {
        setIsLoading(true);
        try {
            const result = await createNote(data);

            if (result.success) {
                toast({
                    title: "Note added",
                    description: "Your note has been added successfully.",
                });
                form.reset();
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to add note.",
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                    <DialogDescription>
                        Add a new note for this {entityType}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <input
                            type="hidden"
                            {...form.register("stockId")}
                            value={entityType === "stock" ? entityId : ""}
                        />
                        <input
                            type="hidden"
                            {...form.register("transactionId")}
                            value={entityType === "transaction" ? entityId : ""}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your notes here..."
                                            className="min-h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Adding..." : "Add Note"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
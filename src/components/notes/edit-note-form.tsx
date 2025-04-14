"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NoteFormValues, noteSchema } from "@/lib/validators";
import { updateNote } from "@/actions/notes";
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

interface Note {
    id: string;
    content: string;
}

interface EditNoteFormProps {
    note: Note;
    entityType: "stock" | "transaction";
    entityId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditNoteForm({
    note,
    entityType,
    entityId,
    open,
    onOpenChange,
}: EditNoteFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            content: note.content,
            stockId: entityType === "stock" ? entityId : undefined,
            transactionId: entityType === "transaction" ? entityId : undefined,
        },
    });

    // Update form values when note changes
    useEffect(() => {
        form.reset({
            content: note.content,
            stockId: entityType === "stock" ? entityId : undefined,
            transactionId: entityType === "transaction" ? entityId : undefined,
        });
    }, [note, entityType, entityId, form]);

    const onSubmit = async (data: NoteFormValues) => {
        setIsLoading(true);
        try {
            const result = await updateNote(note.id, data);

            if (result.success) {
                toast({
                    title: "Note updated",
                    description: "Your note has been updated successfully.",
                });
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update note.",
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
                    <DialogTitle>Edit Note</DialogTitle>
                    <DialogDescription>
                        Update your note for this {entityType}
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
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
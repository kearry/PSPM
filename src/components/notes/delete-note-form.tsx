"use client";

import { useState } from "react";
import { deleteNote } from "@/actions/notes";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Note {
    id: string;
    content: string;
}

interface DeleteNoteDialogProps {
    note: Note;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteNoteDialog({
    note,
    open,
    onOpenChange,
}: DeleteNoteDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await deleteNote(note.id);

            if (result.success) {
                toast({
                    title: "Note deleted",
                    description: "Your note has been deleted successfully.",
                });
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete note.",
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
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Note</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this note? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
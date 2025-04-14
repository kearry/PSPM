"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import EditNoteForm from "@/components/notes/edit-note-form";
import DeleteNoteDialog from "@/components/notes/delete-note-dialog";

interface Note {
    id: string;
    content: string;
    stockId?: string | null;
    transactionId?: string | null;
    stock?: {
        id: string;
    } | null;
    transaction?: {
        id: string;
    } | null;
}

interface NoteActionsProps {
    note: Note;
}

export default function NoteActions({ note }: NoteActionsProps) {
    const router = useRouter();
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const entityType = note.stock ? "stock" : note.transaction ? "transaction" : "stock";
    const entityId = note.stock?.id || note.transaction?.id || note.stockId || note.transactionId || "";

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
            >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
            >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
            </Button>

            <EditNoteForm
                note={note}
                entityType={entityType}
                entityId={entityId}
                open={showEditForm}
                onOpenChange={setShowEditForm}
            />

            <DeleteNoteDialog
                note={note}
                open={showDeleteDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowDeleteDialog(false);
                    } else if (!open && !note.id) {
                        // If deleted successfully, redirect to notes list
                        router.push("/notes");
                    }
                }}
            />
        </div>
    );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import AddNoteForm from "@/components/notes/add-note-form";

export default function NotesHeader() {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Notes</h2>
                <p className="text-muted-foreground">
                    Manage your investment research and notes
                </p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="sm:w-auto w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Note
            </Button>

            <AddNoteForm
                entityType="stock"
                entityId=""
                open={showAddForm}
                onOpenChange={setShowAddForm}
            />
        </div>
    );
}
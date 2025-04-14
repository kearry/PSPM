import { Metadata } from "next";
import { getNotes } from "@/actions/notes";
import NotesHeader from "@/components/notes/notes-header";
import NotesTable from "@/components/notes/notes-table";

export const metadata: Metadata = {
    title: "Notes | Stock Manager",
    description: "Manage your stock notes and research",
};

export default async function NotesPage() {
    const { success, data: notes, error } = await getNotes();

    return (
        <div className="space-y-6">
            <NotesHeader />
            <NotesTable notes={success ? notes ?? [] : []} />
        </div>
    );
}
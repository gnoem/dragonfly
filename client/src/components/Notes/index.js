import { useContext } from "react";
import { DataContext, ViewContext, ModalContext } from "../../contexts";
import { Editor } from "../Editor";
import { NoteList } from "./NoteList";
import { GiantCornerButton } from "../Page";

export const Notes = ({ notes, view, currentNote }) => {
    const { refreshData } = useContext(DataContext);
    const { createModal, closeModal } = useContext(ModalContext);
    const { updateView } = useContext(ViewContext);
    const back = () => updateView({ type: 'collections' });
    return (
        <>
            {(view.type === 'collection' && !currentNote)
                && <GiantCornerButton className="back" onClick={back} />}
            <NoteList {...{ notes, view, refreshData, createModal, closeModal }} />
            {currentNote && <Editor {...{ currentNote, refreshData, createModal }} />}
        </>
    );
}
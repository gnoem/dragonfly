import { Editor } from "../Editor";
import { NoteList } from "./NoteList";
import { GiantCornerButton } from "../Page";

export const Notes = (props) => {
    const { view, currentNote } = props;
    const back = () => props.updateView({ type: 'collections' });
    return (
        <>
            {(view.type === 'collection' && !currentNote)
                && <GiantCornerButton className="back" onClick={back} />}
            <NoteList {...props} />
            {currentNote && <Editor {...props} />}
        </>
    );
}
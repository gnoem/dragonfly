import { Editor } from '../Editor';
import { NoteList } from './components/NoteList';

export const Notes = (props) => {
    const { view, currentNote } = props;
    return (
        <div>
            {view.type === 'collection' && <GiantBackButton {...props} />}
            <NoteList {...props} />
            {currentNote && <Editor {...props} />}
        </div>
    );
}

const GiantBackButton = (props) => {
    const { currentNote } = props;
    const back = () => {
        props.updateView({ type: 'collections' });
    }
    if (currentNote) return null;
    return <button className="giantCornerButton back" onClick={back}></button>;
}
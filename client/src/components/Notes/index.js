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
    const back = () => {
        props.updateView({ type: 'collections' });
    }
    return <button className="giantCornerButton back" onClick={back}></button>;
}
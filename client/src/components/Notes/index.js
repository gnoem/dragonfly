import { Editor } from '../Editor';
import { List } from './components/List';

export const Notes = (props) => {
    const { currentNote } = props;
    return (
        <div className="Main" data-editor={!!currentNote}>
            <List {...props} />
            {currentNote && <Editor {...props} />}
        </div>
    );
}
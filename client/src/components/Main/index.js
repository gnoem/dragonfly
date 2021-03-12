import { Notes } from '../Notes';
import { Collections } from '../Collections';

const getNotes = (view, allNotes) => {
    const notesTaggedWith = (tagsArray) => {
        // if note has these tags
        if (!tagsArray || !tagsArray.length) return [];
        allNotes.forEach(note => {
            // create test object by which to compare
            let testObject = {};
            note.tags.forEach((tag, index) => testObject[tag] = index);
            const tagIsHad = (tag) => testObject[tag] !== undefined;
            const noteHasTheseTags = view.sortTags === 'all'
                ? tagsArray.every(tagIsHad)
                : tagsArray.some(tagIsHad);
            if (!noteHasTheseTags) return null;
            return note;
        });
    }
    switch (view.type) {
        case 'all-notes': return allNotes.filter(note => !note.trash);
        case 'starred-notes': return allNotes.filter(note => note.starred);
        case 'trash': return allNotes.filter(note => note.trash);
        case 'collection': return allNotes.filter(note => note.collectionId === view?.collection?._id);
        case 'tags': return notesTaggedWith(view.tags);
        default: return <div>(default) all notes</div>;
    }
}

export const Main = (props) => {
    const { view, contentType, allNotes, currentNote } = props;
    const content = (() => {
        switch (contentType) {
            case 'notes': return <Notes {...props} notes={getNotes(view, allNotes)} />;
            case 'collections': return <Collections {...props} />;
            default: return <div>figure it out</div>;
        }
    })();
    return (
        <div className="Main" data-editor={!!currentNote}>
            {content}
        </div>
    );
}
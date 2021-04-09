import "./Main.css";
import { useState, useEffect, useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import { Notes } from "../Notes";
import { CollectionsList } from "../Collections";
import { MyAccount } from "../MyAccount";
import { Settings } from "../Settings";

const getNotes = (view, allNotes) => {
    const notesTaggedWith = (tagsArray) => {
        // if note has these tags
        if (!tagsArray || !tagsArray.length) return [];
        const array = [];
        allNotes.forEach(note => {
            // create test object by which to compare
            let testObject = {};
            note.tags.forEach((tag, index) => testObject[tag] = index);
            const tagIsHad = (tag) => testObject[tag._id] !== undefined;
            const noteHasTheseTags = view.sortMethod === 'all'
                ? tagsArray.every(tagIsHad)
                : tagsArray.some(tagIsHad);
            if (noteHasTheseTags) array.push(note);
        });
        return array;
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

export const Main = ({ contentType, currentNote }) => {
    const [slideIn, setSlideIn] = useState(false);
    const { view, updateView } = useContext(ViewContext);
    const { user, notes: allNotes, refreshData } = useContext(DataContext);
    useEffect(() => {
        if (currentNote) setSlideIn(true);
        else setTimeout(() => setSlideIn(false), 200);
    }, [currentNote]);
    const content = (() => {
        switch (contentType) {
            case 'notes': return <Notes {...{ view, currentNote }} notes={getNotes(view, allNotes)} />;
            case 'collections': return <CollectionsList {...{ allNotes, updateView }} />;
            case 'my-account': return <MyAccount {...{ user, refreshData }} />;
            case 'settings': return <Settings {...{ user, refreshData }} />;
            default: return <div>figure it out</div>;
        }
    })();
    return (
        <div className={`Main${slideIn ? ' slide' : ''}`} data-editor={!!currentNote}>
            {content}
        </div>
    );
}
import { useState, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import Menu from '../Menu';
import Sidebar from '../Sidebar';
import Loading from '../Loading';
import { Notes } from '../Notes';

export const Dashboard = (props) => {
    const { id } = props.match.params;
    const [view, setView] = useState({ type: 'all-notes' });
    const [data, setData] = useState(null);
    const [modal, setModal] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const viewingNotes = ['all-notes', 'starred-notes', 'trash', 'collection', 'tags'].includes(view?.type);
    const isMobile = window.innerWidth < 900;
    const refreshData = useCallback(async () => {
        const response = await fetch(`/user/${id}/data`);
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.dir(body.error);
        setData(body.data);
        setIsLoaded(true);
        return body.data;
    }, [id]);
    useEffect(() => {
        refreshData().then(result => console.dir(result));
    }, [refreshData]);
    const utils = {
        gracefullyCloseModal: () => {
            console.log('gracefully closing modal');
            setModal(false);
        },
        updateCurrentNote: (note) => {
            console.dir(note);
            setView(prevView => ({
                ...prevView,
                currentNote: note
            }));
        },
        updateUnsavedChanges: (value) => {
            setView(prevView => ({
                ...prevView,
                unsavedChanges: value
            }))
        },
        warnUnsavedChanges: () => {
            console.log('unsaved changes!');
        }
    }
    const state = {
        view, updateView: setView,
        user: data?.user,
        unfilteredNotes: data?.notes,
        currentNote: view?.currentNote,
        unsavedChanges: view?.unsavedChanges,
        data, refreshData,
        modal, updateModal: setModal,
        ...utils
    }
    if (!isLoaded) return <Loading />
    return (
        <div className="Dashboard" data-mobile={isMobile}>
            <Modal {...props} {...state} content={modal.content} />
            {isMobile
                ? ((view.type !== 'note') && <Menu {...props} {...state} />)
                : <Sidebar {...props} {...state} />}
            <Content {...props} {...state} contentType={viewingNotes ? 'notes' : 'misc'} />
        </div>
    );
}

const Content = (props) => {
    const { view, contentType, unfilteredNotes } = props;
    const getNotes = (view) => {
        const notesTaggedWith = (tagsArray) => {
            // if note has these tags
            if (!tagsArray || !tagsArray.length) return [];
            unfilteredNotes.forEach(note => {
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
            case 'all-notes': return unfilteredNotes.filter(note => !note.trash);
            case 'starred-notes': return unfilteredNotes.filter(note => note.starred);
            case 'trash': return unfilteredNotes.filter(note => note.trash);
            case 'collection': return unfilteredNotes.filter(note => note.collection === view.name);
            case 'tags': return notesTaggedWith(view.tags);
            default: return <div>(default) all notes</div>;
        }
    }
    if (contentType !== 'notes') return (
        <div>something else</div>
    );
    return (
        <Notes {...props} notes={getNotes(view)} />
    );
}
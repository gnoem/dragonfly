import { useState, useEffect, useCallback } from 'react';
import { Login } from '../Login';
import { Modal } from '../Modal';
import Menu from '../Menu';
import Sidebar from '../Sidebar';
import Loading from '../Loading';
import { Main } from '../Main';

export const Dashboard = (props) => {
    const { id: identifier } = props.match.params;
    const [accessToken, setAccessToken] = useState(null);
    const [view, setView] = useState({ type: 'all-notes' });
    const [data, setData] = useState(null);
    const [modal, setModal] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const contentType = (() => {
        const notesTypes = ['all-notes', 'starred-notes', 'trash', 'collection', 'tags'];
        if (notesTypes.includes(view?.type)) return 'notes';
        return view?.type;
    })();
    const isMobile = window.innerWidth < 900;
    useEffect(() => {
        const auth = async () => {
            const response = await fetch(`/auth/${identifier}`);
            const body = await response.json();
            if (body.redirect) return window.location.assign(`/d/${body.username}`); // todo without reload
            setAccessToken(body.success);
        }
        auth();
    }, []);
    const refreshData = useCallback(async () => {
        if (!accessToken) return null;
        const response = await fetch(`/user/${identifier}/data`);
        const body = await response.json();
        if (!body.success) return console.dir(body.error);
        setData(body.data);
        setIsLoaded(true);
        return body.data;
    }, [identifier, accessToken]);
    useEffect(() => {
        if (accessToken) refreshData().then(/* body => console.dir(body) */);
    }, [refreshData]);
    useEffect(() => {
        if (!data?.notes) return;
        const refreshCurrentNote = (notes) => {
            if (!view.currentNote) return;
            const currentNoteId = view.currentNote._id;
            const replaceCurrentNote = notes.find(note => note._id === currentNoteId);
            setView(prevView => ({ ...prevView, currentNote: replaceCurrentNote }));
        }
        refreshCurrentNote(data.notes);
    }, [data?.notes]);
    const utils = {
        updateModal: (content, type, options) => {
            setModal({
                content,
                type: type ?? 'normal',
                options
            });
        },
        gracefullyCloseModal: () => {
            setModal(prevState => ({ ...prevState, selfDestruct: true }));
        },
        updateCurrentNote: (note) => {
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
        },
        logout: async () => {
            await fetch(`/logout`);
            setIsLoaded(false);
            setTimeout(() => {
                window.location.assign(window.location.href);
            }, 500);
        }
    }
    const inherit = {
        view, updateView: setView,
        user: data?.user,
        allNotes: data?.notes,
        collections: data?.collections,
        tags: data?.tags,
        currentNote: view?.currentNote,
        unsavedChanges: view?.unsavedChanges,
        data, refreshData,
        ...utils
    }
    if (accessToken === false) return <Login username={identifier} updateAccessToken={setAccessToken} />;
    if (!isLoaded) return <Loading />;
    return (
        <div className="Dashboard" data-mobile={isMobile}>
            {modal && <Modal {...inherit} {...modal} setModal={setModal} exit={utils.gracefullyCloseModal} />}
            {isMobile
                ? ((view.type !== 'note') && <Menu {...inherit} />)
                : <Sidebar {...inherit} />}
            <Main {...inherit} contentType={contentType} />
        </div>
    );
}
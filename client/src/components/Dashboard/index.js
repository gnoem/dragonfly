import { useState, useEffect, useRef, useCallback } from 'react';
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
    const userId = useRef(null);
    useEffect(() => {
        const auth = async () => {
            const response = await fetch(`/auth/${identifier}`);
            const body = await response.json();
            if (body.username) return window.location.assign(`/d/${body.username}`); // todo without reload
            setAccessToken(body.success);
            userId.current = body._id;
        }
        auth();
    }, []);
    const refreshData = useCallback(async () => {
        if (!accessToken || !userId.current) return null;
        const response = await fetch(`/user/${userId.current}/data`);
        const body = await response.json();
        if (!body.success) return console.dir(body.error);
        setData(body.data);
        setIsLoaded(true);
        return body.data;
    }, [identifier, accessToken]);
    useEffect(() => {
        if (accessToken) return refreshData();
        // else reload?
    }, [refreshData]);
    useEffect(() => {
        if (!data?.notes || !view.currentNote) return;
        // make sure currentNote is up to date after possible change
        const updatedCurrentNote = data.notes.find(note => note._id === view.currentNote._id);
        setView(prevView => ({ ...prevView, currentNote: updatedCurrentNote }));
    }, [data?.notes]);
    useEffect(() => {
        if (view.type !== 'collection') return;
        // make sure current collection is up to date after possible change
        const updatedCollection = data?.collections?.find(item => item._id === view.collection._id);
        setView(prevView => ({ ...prevView, collection: updatedCollection }));
    }, [data?.collections]);
    useEffect(() => {
        if (view.type !== 'tags') return;
        // make sure current tags are up to date after possible change
        // loop through view.tags, for each, get replaced tag info
        const updatedTagList = (view) => {
            const arrayWithPossibleNulls = view.tags.map(tag => {
                return data?.tags?.find(item => item._id === tag._id);
            });
            const filteredArray = arrayWithPossibleNulls.filter(el => el != null);
            return filteredArray;
        }
        setView(prevView => ({ ...prevView, tags: updatedTagList(prevView) }));
    }, [data?.tags]);
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
            }));
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
        modal, updateModal: setModal,
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
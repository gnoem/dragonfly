import { useState, useEffect, useRef, useCallback } from 'react';
import { Login } from '../Login';
import { Modal } from '../Modal';
import Menu from '../Menu';
import Sidebar from '../Sidebar';
import Loading from '../Loading';
import { Main } from '../Main';
import { handleError } from '../Form/handleError';
import { User } from '../../api';

export const Dashboard = (props) => {
    const { id: identifier } = props.match.params;
    const [accessToken, setAccessToken] = useState(null);
    const [loginWarning, setLoginWarning] = useState(null);
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
        const handleAuthError = (err) => {
            setAccessToken(false);
            if (err.status === 404) {
                setLoginWarning('User not found');
                return;
            }
            handleError(err, { updateModal: utils.updateModal });
        }
        const auth = (customId) => User.auth(customId ?? identifier).then(({ _id, token, username }) => {
            if (username) {
                window.history.pushState('', '', `/d/${username}`);
                auth(username);
                return;
            }
            setAccessToken(token);
            userId.current = _id;
        }).catch(handleAuthError);
        auth();
    }, []);
    const refreshData = useCallback(async (_, callback) => {
        User.getData(userId.current).then(({ data }) => {
            setData(data);
            callback?.();
            setIsLoaded(true);
            return data;
        })/* .catch(err => handleError(err, { updateModal: setModal })) */;
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
            console.dir('gettingc alled parently')
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
    if (accessToken === false) return (
        <div className="Login">
            {modal
                ? <Modal {...inherit} {...modal} setModal={setModal} exit={utils.gracefullyCloseModal} />
                : <Login username={identifier}
                    loginWarning={loginWarning}
                    updateAccessToken={setAccessToken} />}
        </div>
    );
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
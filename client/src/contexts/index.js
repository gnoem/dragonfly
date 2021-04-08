import React, { useState, useRef, useEffect } from "react";
import { User } from "api";

export const MobileContext = React.createContext(null);
export const ModalContext = React.createContext(null);
export const DataContext = React.createContext(null);
export const ViewContext = React.createContext(null);

const MobileContextProvider = ({ children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    useEffect(() => {
        const resize = () => {
            if (!isMobile && window.innerWidth <= 900) return setIsMobile(true);
            if (isMobile && window.innerWidth > 900) return setIsMobile(false);
            // not debouncing since setIsMobile is called conditionally
        }
        window.addEventListener('resize', resize);
        return () => window.addEventListener('resize', resize);
    }, []);
    return (
        <MobileContext.Provider value={{ isMobile }}>
            {children}
        </MobileContext.Provider>
    );
}

const ModalContextProvider = ({ children }) => {
    const [modal, setModal] = useState(null);
    const createModal = (content, type, options) => {
        setModal({
            content: content ?? "😳",
            type: type ?? 'custom',
            options: options ?? {}
        });
    }
    const closeModal = () => setModal(prevState => ({ ...prevState, selfDestruct: true }));
    const modalContext = { modal, setModal, createModal, closeModal };
    return (
        <ModalContext.Provider value={modalContext}>
            {children}
        </ModalContext.Provider>
    );
}

const DataContextProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const userId = useRef(null);
    const refreshData = async (callback, _id = userId.current) => {
        if (!_id) return console.log('none or null user id');
        userId.current = _id; // will get "registered" on first auth, from dashboard - after that, can just call refreshData() with no params
        // todo figure out how to unset????? logout currently refreshes window and clears everything but should figure something out anyway
        return User.getData(_id).then(({ data }) => {
            setData(data);
            callback?.();
            return data;
        }).catch(err => {
            throw err;
        });
    }
    const logout = async () => {
        await fetch(`/logout`).then(() => {
            setTimeout(() => {
                window.location.assign(window.location.href);
            }, 500);
        });
    }
    const dataContext = { ...data, refreshData, logout };
    return (
        <DataContext.Provider value={dataContext}>
            {children}
        </DataContext.Provider>
    );
}

const ViewContextProvider = ({ children }) => {
    const [view, setView] = useState({ type: 'all-notes' });
    // should return [updateCurrentNote, unsavedChanges, updateUnsavedChanges]
    const viewContext = {
        view,
        updateView: setView,
        currentNote: view?.currentNote,
        updateCurrentNote: (note) => {
            setView(prevView => ({
                ...prevView,
                currentNote: note
            }));
        },
        unsavedChanges: view?.unsavedChanges,
        updateUnsavedChanges: (value) => {
            setView(prevView => ({
                ...prevView,
                unsavedChanges: value
            }));
        }
    }
    return (
        <ViewContext.Provider value={viewContext}>
            {children}
        </ViewContext.Provider>
    );
}

export const AppContextProvider = ({ children }) => {
    return (
        <MobileContextProvider>
            <ModalContextProvider>
                <DataContextProvider>
                    <ViewContextProvider>
                        {children}
                    </ViewContextProvider>
                </DataContextProvider>
            </ModalContextProvider>
        </MobileContextProvider>
    );
}
import "./Dashboard.css";
import { useState, useEffect, useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import { Loading } from "../Loading";
import { Sidebar } from "../Sidebar";
import { Main } from "../Main";

export const Dashboard = ({ userId, accessToken }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const { view, updateView } = useContext(ViewContext);
    const { notes, collections, tags, refreshData } = useContext(DataContext);
    const contentType = (() => {
        const notesTypes = ['all-notes', 'starred-notes', 'trash', 'collection', 'tags'];
        if (notesTypes.includes(view?.type)) return 'notes';
        return view?.type;
    })();
    const isMobile = window.innerWidth < 900;
    useEffect(() => {
        if (accessToken) return refreshData(null, userId.current).then(() => {
            setIsLoaded(true);
        });
    }, [userId.current, accessToken]);
    useEffect(() => {
        // make sure currentNote, current collection, and current tags (all stored in 'view' state) are up to date after possible data change
        const handleCurrentNote = () => {
            if (!notes || !view.currentNote) return;
            const updatedCurrentNote = notes.find(note => note._id === view.currentNote._id);
            updateView(prevView => ({ ...prevView, currentNote: updatedCurrentNote }));
        }
        const handleCurrentCollection = () => {
            if (view.type !== 'collection') return;
            const updatedCollection = collections?.find(item => item._id === view.collection._id);
            updateView(prevView => ({ ...prevView, collection: updatedCollection }));
        }
        const handleCurrentTags = () => {
            if (view.type !== 'tags') return;
            const updatedTagList = (view) => {
                const arrayWithPossibleNulls = view.tags.map(tag => {
                    return tags?.find(item => item._id === tag._id);
                });
                const filteredArray = arrayWithPossibleNulls.filter(el => el != null);
                return filteredArray;
            }
            updateView(prevView => ({ ...prevView, tags: updatedTagList(prevView) }));
        }
        handleCurrentNote();
        handleCurrentCollection();
        handleCurrentTags();
    }, [notes, collections, tags])
    if (!isLoaded) return <Loading />;
    return (
        <div className="Dashboard" data-mobile={isMobile}>
            <Sidebar {...{ isMobile }} />
            <Main {...{ contentType, currentNote: view?.currentNote }} />
        </div>
    );
}
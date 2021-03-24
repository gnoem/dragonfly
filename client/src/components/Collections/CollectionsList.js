import { useContext } from "react";
import { DataContext, ModalContext } from "contexts";
import { List, ListHeader, ListContent, ListFooter } from "../List";
import { CollectionPreview } from "./CollectionPreview";

export const CollectionsList = ({ allNotes, updateView }) => {
    const { user, collections, refreshData } = useContext(DataContext);
    return (
        <List>
            <CollectionsListHeader {...{ user, refreshData }} />
            <CollectionsListContent {...{ allNotes, collections, updateView }} />
        </List>
    );
}

const CollectionsListHeader = ({ user, refreshData }) => {
    const { createModal } = useContext(ModalContext);
    const formOptions = {
        _id: user._id,
        onSuccess: () => refreshData()
    }
    const createNewCollection = () => createModal('createCollection', 'form', formOptions);
    return (
        <ListHeader title="Collections">
            <button className="createNew" onClick={createNewCollection}>
                <span className="tooltip">Create a new collection</span>
            </button>
        </ListHeader>
    );
}

const CollectionsListContent = ({ collections, allNotes, updateView }) => {
    const collectionsList = () => {
        return collections.map(collection => (
            <CollectionPreview
                key={`NotePreview-${collection._id}`}
                {...collection}
                allNotes={allNotes}
                onClick={() => updateView({ type: 'collection', collection })}
            />
        ));
    }
    return (
        <ListContent footer={<CollectionsListFooter collections={collections} />}>
            {collectionsList()}
        </ListContent>
    );
}

const CollectionsListFooter = ({ collections }) => {
    if (collections.length) return null;
    return (
        <ListFooter>
            None found
        </ListFooter>
    );
}
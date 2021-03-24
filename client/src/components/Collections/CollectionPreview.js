import { useContext, useState } from "react";
import { ModalContext, DataContext } from "contexts";
import { ListItem, ListItemContent } from "../List/ListItem";
import { MiniMenu } from "../MiniMenu";

export const CollectionPreview = ({ _id, name, onClick, allNotes }) => {
    return (
        <ListItem className="collectionPreview"
                  title={<CollectionPreviewTitle {...{ name }} />}
                  onClick={onClick}
                  button={<CollectionPreviewButton {...{ _id, name }} />}>
            <CollectionPreviewContent {...{ _id, allNotes }} />
        </ListItem>
    );
}

const CollectionPreviewTitle = ({ name }) => <h2>{name}</h2>;

const CollectionPreviewContent = ({ allNotes, _id }) => {
    const howManyNotes = (() => {
        const notesInCollection = allNotes.filter(note => note.collectionId === _id);
        if (notesInCollection.length === 1) return '1 note';
        return `${notesInCollection.length} notes`;
    })();
    return (
        <ListItemContent>
            {howManyNotes}
        </ListItemContent>
    );
}

const CollectionPreviewButton = ({ _id, name }) => {
    const [showMiniMenu, setShowMiniMenu] = useState(false);
    const { refreshData } = useContext(DataContext);
    const { createModal } = useContext(ModalContext);
    const formOptions = { _id, name, onSuccess: () => refreshData() };
    const editCollection = () => createModal('editCollection', 'form', formOptions);
    const deleteCollection = () => createModal('deleteCollection', 'form', formOptions);
    const menuItems = [{ label: 'Edit', onClick: editCollection }, { label: 'Delete', onClick: deleteCollection }];
    return (
        <div className="previewButton">
            <button onClick={() => setShowMiniMenu(true)} className="icon ellipsis round-basic"></button>
            <MiniMenu show={showMiniMenu} updateShow={setShowMiniMenu} menuItems={menuItems} />
        </div>
    );
}
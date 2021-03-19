import { List, ListHeader, ListContent, ListFooter } from "../../List"
import { CollectionPreview } from './CollectionPreview';

export const CollectionsList = (props) => {
    return (
        <List>
            <CollectionsListHeader {...props} />
            <CollectionsListContent {...props} />
        </List>
    );
}

const CollectionsListHeader = (props) => {
    const { user } = props;
    const formOptions = {
        _id: user._id,
        onSuccess: props.refreshData
    }
    const createNewCollection = () => props.updateModal('createCollection', 'form', formOptions);
    return (
        <ListHeader title="Collections">
            <button className="createNew" onClick={createNewCollection}>
                <span className="tooltip">Create a new collection</span>
            </button>
        </ListHeader>
    );
}

const CollectionsListContent = (props) => {
    const { collections } = props;
    const collectionsList = () => {
        return collections.map(collection => (
            <CollectionPreview
                key={`NotePreview-${collection._id}`}
                {...props}
                {...collection}
                onClick={() => props.updateView({ type: 'collection', collection })}
            />
        ));
    }
    return (
        <ListContent footer={<CollectionsListFooter {...props} />}>
            {collectionsList()}
        </ListContent>
    );
}

const CollectionsListFooter = (props) => {
    const { collections } = props;
    if (collections.length) return null;
    return (
        <ListFooter>
            None found
        </ListFooter>
    );
}
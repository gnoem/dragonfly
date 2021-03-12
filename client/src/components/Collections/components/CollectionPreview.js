import { ListItem, ListItemContent } from "../../List/components/ListItem"

export const CollectionPreview = (props) => {
    const { onClick } = props;
    return (
        <ListItem className="collectionPreview" title={<Title {...props} />} onClick={onClick}>
            <Content {...props} />
        </ListItem>
    );
}

const Title = ({ name }) => <h2>{name}</h2>;

const Content = (props) => {
    const { allNotes, _id } = props;
    const howMany = (() => {
        const notesInCollection = allNotes.filter(note => note.collectionId === _id);
        return notesInCollection.length;
    })();
    return (
        <ListItemContent>
            {howMany} notes
        </ListItemContent>
    );
}
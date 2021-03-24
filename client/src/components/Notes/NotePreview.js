import dayjs from "dayjs";
import { ListItem, ListItemTitle, ListItemContent } from "../List/ListItem";

export const NotePreview = ({ title, content, starred, createdAt, lastModified, onClick }) => {
    return (
        <ListItem title={<Title {...{ title, starred, createdAt }} />} onClick={onClick}>
            <ListItemContent>
                <Excerpt {...{ content }} />
                <Meta {...{ createdAt, lastModified }} />
            </ListItemContent>
        </ListItem>
    );
}

const Title = ({ title, starred, createdAt }) => {
    const autoTitle = `Note from ${dayjs(createdAt).format('MM/DD/YYYY')}`;
    return (
        <ListItemTitle>
            {title || autoTitle}
            {starred && <div className="hasStar"><i className="fas fa-star"></i></div>}
        </ListItemTitle>
    );
}

const Excerpt = ({ content }) => {
    const num = 115;
    const textContent = content.blocks[0].text.length < num
        ? content.blocks[0].text
        : content.blocks[0].text.substr(0, num) + '...';
    return <span className="excerpt">{textContent}</span>;
}

const Meta = ({ createdAt, lastModified }) => {
    const untouched = createdAt === lastModified;
    const dayFormat = (date) => dayjs(date).format('MM/DD/YYYY');
    const sameDay = (date) => dayFormat(date) === dayjs().format('MM/DD/YYYY');
    const created = () => {
        const createdToday = sameDay(createdAt);
        const atDate = createdToday ? dayjs(createdAt).format('h:mm a') : dayFormat(createdAt);
        return `Created ${atDate}`;
    }
    const modified = () => {
        const lastModifiedToday = sameDay(lastModified);
        const atDate = lastModifiedToday ? dayjs(lastModified).format('h:mm a') : dayFormat(lastModified);
        return `• Last modified ${atDate}`;
    }
    return (
        <span className="meta">{created()} {!untouched && modified()}</span>
    );
}
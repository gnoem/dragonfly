import dayjs from 'dayjs';

export default function NotePreview(props) {
    let { temp, _id, title, content, starred, createdAt, lastModified } = props;
    const noteExcerpt = (content) => {
        if (temp) return;
        const getExcerpt = (content) => {
            const num = 115;
            let textContent = content.blocks[0].text.length < num
                ? content.blocks[0].text
                : content.blocks[0].text.substr(0, num) + '...';
            return <span className="excerpt">{textContent}</span>;
        }
        return getExcerpt(content);
    }
    const noteTitle = () => {
        if (!title) return `Note from ${dayjs(createdAt).format('MM/DD/YYYY')}`;
        return title;
    }
    const isCurrent = (id) => {
        if (id === props.current) return ' current';
        if (temp) return ' temp';
        else return '';
    }
    const isStarred = () => {
        if (starred) return <div className="hasStar"><i className="fas fa-star"></i></div>;
    }
    const dateInfo = () => {
        const untouched = createdAt === lastModified;
        let createdAtMMDDYYYY = dayjs(createdAt).format('MM/DD/YYYY');
        let lastModifiedMMDDYYYY = dayjs(lastModified).format('MM/DD/YYYY');
        createdAt = (createdAtMMDDYYYY === dayjs().format('MM/DD/YYYY'))
            ? dayjs(createdAt).format('h:mm a')
            : createdAtMMDDYYYY;
        lastModified = (lastModifiedMMDDYYYY === dayjs().format('MM/DD/YYYY'))
            ? dayjs(lastModified).format('h:mm a')
            : lastModifiedMMDDYYYY;
        const created = `Created ${createdAt}`;
        const modified = `• Last modified ${lastModified}`;
        return (
            <span className="meta">{created} {!untouched && modified}</span>
        );
    }
    return (
        <div className={`NotePreview${isCurrent(_id)}`} data-id={_id}>
            <h2>{noteTitle()}</h2>
            {noteExcerpt(content)}
            {dateInfo()}
            {isStarred()}
        </div>
    );
}
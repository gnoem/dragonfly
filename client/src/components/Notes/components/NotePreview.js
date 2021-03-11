import dayjs from 'dayjs';

export const NotePreview = (props) => {
    let { onClick } = props;
    return (
        <div className="NoteExcerpt" onClick={onClick}>
            <Title {...props} />
            <Excerpt {...props} />
            <Meta {...props} />
        </div>
    );
}

const Title = ({ title, starred, createdAt }) => {
    const autoTitle = `Note from ${dayjs(createdAt).format('MM/DD/YYYY')}`;
    return (
        <div className="title">
            <h2>{title || autoTitle}</h2>
            {starred && <div className="hasStar"><i className="fas fa-star"></i></div>}
        </div>
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
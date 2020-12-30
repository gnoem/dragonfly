import dayjs from 'dayjs';

export default function List(props) {
    let { _id, title, content, createdAt, lastModified } = props;
    _id = _id ? _id : 'temp';
    const noteExcerpt = (content) => {
        if (_id === 'temp') return;
        const getTextContent = (content) => {
            let textContent = [];
            for (let i = 0; i < content.blocks.length; i++) {
                textContent.push(content.blocks[i].text);
            }
            return <span className="excerpt">{textContent}</span>;
        }
        //if (content.length > 100) return content += '...';
        return getTextContent(content);
    }
    title = title ? title : `Note from ${createdAt}`;
    const isCurrent = (id) => {
        if (id === props.current) return ' current';
        if (id === 'temp') return ' temp';
        else return '';
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
        )
    }
    return (
        <div className={`NotePreview${isCurrent(_id)}`} onClick={() => props.makeActive(_id)}>
            <h2>{title}</h2>
            {noteExcerpt(content)}
            {dateInfo()}
        </div>
    )
}
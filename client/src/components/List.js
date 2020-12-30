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
    createdAt = dayjs(createdAt).format('MM/DD/YYYY'); // if createdAt is undefined, defaults to today's date
    lastModified = dayjs(lastModified).format('MM/DD/YYYY'); // ditto
    title = title ? title : `Note from ${createdAt}`;
    const isCurrent = (id) => {
        if (id === props.current) return ' current';
        if (id === 'temp') return ' temp';
        else return '';
    }
    return (
        <div className={`NotePreview${isCurrent(_id)}`} onClick={() => props.makeActive(_id)}>
            <h2>{title}</h2>
            {noteExcerpt(content)}
            <span className="meta">Created {createdAt} {lastModified !== createdAt && `• Last modified ${lastModified}`}</span>
        </div>
    )
}
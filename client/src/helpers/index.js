export const starNote = async (props, currentNote, callback) => {
    const response = await fetch(`/note/${currentNote._id}/star`, { method: 'PUT' });
    const body = await response.json();
    if (!body.success) return console.log(body.error);
    props.refreshData().then(callback);
}

export const moveNoteToCollection = async (props, currentNote, collectionId, callback) => {
    const response = await fetch(`/note/${currentNote._id}/collection`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId })
    });
    const body = await response.json();
    if (!body.success) return console.log(body.error);
    props.refreshData().then(callback);
}

export const createCollection = async (props, formData, callback) => {
    const response = await fetch('/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    const body = await response.json();
    if (!body.success) return console.log(body.error);
    console.log('success!!');
    console.dir(body);
    props.refreshData().then(callback);
    return body.collection;
}
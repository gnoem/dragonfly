export const Note = {
    starNote: async (props, currentNote, callback) => {
        const response = await fetch(`/note/${currentNote._id}/star`, { method: 'PUT' });
        const body = await response.json();
        if (!body.success) return console.log(body.error);
        props.refreshData().then(callback);
    },
    moveNoteToCollection: async (props, currentNote, collectionId, callback) => {
        const response = await fetch(`/note/${currentNote._id}/collection`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectionId })
        });
        const body = await response.json();
        if (!body.success) return console.log(body.error);
        props.refreshData().then(callback);
    }
}

export const Collection = {
    createCollection: async (props, formData, callback) => {
        const response = await fetch('/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body.success) return console.log(body.error);
        props.refreshData().then(callback);
        return body.collection;
    },
    editCollection: async (props, _id, formData, callback) => {
        const response = await fetch(`/collection/${_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body.success) return console.log(body.error);
        props.refreshData().then(callback);
        return body.collection;
    },
    deleteCollection: async (props, _id, callback) => {
        const response = await fetch(`/collection/${_id}`, { method: 'DELETE' });
        const body = await response.json();
        if (!body.success) return console.log(body.error);
        props.refreshData().then(callback);
        return body.collection;
    }
}
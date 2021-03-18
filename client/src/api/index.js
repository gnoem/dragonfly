import { get, post, put, del } from "./fetchWrapper";

export const User = {
    createUser: async () => await post('/user'),
    createAccount: async (_id, formData) => await post(`/user/${_id}`, formData),
    editAccount: async (_id, formData) => await put(`/user/${_id}`, formData),
    changePassword: async (_id, formData) => await put(`/user/${_id}/password`, formData),
    deleteAccount: async (_id) => await del(`/user/${_id}`)
}

export const Note = {
    createNote: async (props, formData, callback) => {
        const response = await fetch('/note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
    },
    editNote: async (props, _id, formData, callback) => {
        const response = await fetch(`/note/${_id}/content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
    },
    starNote: async (props, currentNote, callback) => {
        const response = await fetch(`/note/${currentNote._id}/star`, { method: 'PUT' });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
    },
    moveNoteToCollection: async (props, currentNote, collectionId, callback) => {
        const response = await fetch(`/note/${currentNote._id}/collection`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectionId })
        });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
    },
    tagNote: async (props, currentNote, tagId, callback) => {
        const response = await fetch(`/note/${currentNote._id}/tag`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tagId })
        });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
    },
    trashNote: async (props, _id, callback) => {
        const response = await fetch(`/note/${_id}/trash`, { method: 'PUT' });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.note;
    },
    deleteNote: async (props, _id, callback) => {
        const response = await fetch(`/note/${_id}`, { method: 'DELETE' });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.note;
    },
    emptyTrash: async (props, userId, callback) => {
        const response = await fetch(`/notes-in-trash/${userId}`, { method: 'DELETE' });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.notes;
    },
    restoreTrash: async (props, userId, callback) => {
        const response = await fetch(`/notes-in-trash/${userId}`, { method: 'PUT' });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.notes;
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
        if (!body.success) throw body.error;
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
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.collection;
    },
    deleteCollection: async (props, _id, callback) => {
        const response = await fetch(`/collection/${_id}`, { method: 'DELETE' });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.collection;
    }
}

export const Tag = {
    createTag: async (props, formData, callback) => {
        const response = await fetch('/tag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.tag;
    },
    editTag: async (props, _id, formData, callback) => {
        const response = await fetch(`/tag/${_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.tag;
    },
    deleteTag: async (props, _id, callback) => {
        const response = await fetch(`/tag/${_id}`, { method: 'DELETE' });
        const body = await response.json();
        if (!body.success) throw body.error;
        props.refreshData().then(callback);
        return body.tag;
    }
}
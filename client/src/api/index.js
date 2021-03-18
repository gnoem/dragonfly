import { get, post, put, del } from "./fetchWrapper";

export const User = {
    createUser: async () => await post('/user'),
    createAccount: async (_id, formData) => await post(`/user/${_id}`, formData),
    editAccount: async (_id, formData) => await put(`/user/${_id}`, formData),
    changePassword: async (_id, formData) => await put(`/user/${_id}/password`, formData),
    deleteAccount: async (_id) => await del(`/user/${_id}`)
}

export const Note = {
    createNote: async (formData) => await post(`/note`, formData),
    editNote: async (_id, formData) => await put(`/note/${_id}/content`, formData),
    starNote: async (_id) => await put(`/note/${_id}/star`),
    moveNoteToCollection: async (_id, collectionId) => await put(`/note/${_id}/collection`, { collectionId }),
    tagNote: async (_id, tagId) => await put(`/note/${_id}/tag`, { tagId }),
    trashNote: async (_id) => await put(`/note/${_id}/trash`),
    deleteNote: async (_id) => await del(`/note/${_id}`),
    emptyTrash: async (userId) => await del(`/notes-in-trash/${userId}`),
    restoreTrash: async (userId) => await put(`/notes-in-trash/${userId}`)
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
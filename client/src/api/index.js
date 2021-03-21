import { get, post, put, del } from "./fetchWrapper";

export const User = {
    auth: async (identifier) => await get(`/auth/${identifier}`),
    login: async (username, { password }) => await post(`/login/${username}`, { password }),
    getData: async (_id) => await get(`/user/${_id}/data`),
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
    createCollection: async (formData) => await post(`/collection`, formData),
    editCollection: async (_id, { userId, name }) => await put(`/collection/${_id}`, { userId, name }),
    deleteCollection: async (_id) => await del(`/collection/${_id}`)
}

export const Tag = {
    createTag: async (formData) => await post(`/tag`, formData),
    editTag: async (_id, { userId, name }) => await put(`/tag/${_id}`, { userId, name }),
    deleteTag: async (_id) => await del(`/tag/${_id}`)
}
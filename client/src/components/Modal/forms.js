import { useState } from 'react';
import { Form, Submit } from '../Form';
import { Note, Collection, Tag } from '../../api';

export const formStore = {
    warnUnsavedChanges: (props) => <WarnUnsavedChanges {...props} />,
    trashNote: (props) => <TrashNote {...props} />,
    deleteNotePermanently: (props) => <DeleteNote {...props} />,
    emptyTrash: (props) => <EmptyTrash {...props} />,
    restoreTrash: (props) => <RestoreTrash {...props} />,
    createCollection: (props) => <CreateCollection {...props} />,
    editCollection: (props) => <EditCollection {...props} />,
    deleteCollection: (props) => <DeleteCollection {...props} />,
    createTag: (props) => <CreateTag {...props} />,
    editTag: (props) => <EditTag {...props} />,
    deleteTag: (props) => <DeleteTag {...props} />,
}

const WarnUnsavedChanges = (props) => {
    const { options } = props;
    const { saveChanges, discardChanges } = options;
    return (
        <Form {...props} onSubmit={saveChanges} onSuccess={props.gracefullyCloseModal}
              title="Unsaved changes"
              submit={<Submit value="Save changes" nvm="Discard changes" cancel={discardChanges} />}>
            It looks like you have unsaved changes. Would you like to save changes or discard?
        </Form>
    );
}

const TrashNote = (props) => {
    const { options } = props;
    const handleSuccess = () => {
        options?.onSuccess();
        props.gracefullyCloseModal();
    }
    const handleSubmit = () => Note.trashNote(options?._id);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Move to Trash?"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to move this note to the Trash?
        </Form>
    );
}

const DeleteNote = (props) => {
    const { options } = props;
    const handleSuccess = () => {
        options?.onSuccess();
        props.gracefullyCloseModal();
    }
    const handleSubmit = () => Note.deleteNote(options?._id);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Delete note permanently"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to permanently delete this note? This action cannot be undone.
        </Form>
    );
}

const EmptyTrash = (props) => {
    const { options } = props;
    const handleSuccess = () => {
        options?.onSuccess();
        props.gracefullyCloseModal();
    }
    const handleSubmit = () => Note.emptyTrash(options?._id);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Empty Trash"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to permanently delete all the notes in your Trash? This action cannot be undone.
        </Form>
    );
}

const RestoreTrash = (props) => {
    const { options } = props;
    const handleSuccess = () => {
        options?.onSuccess();
        props.gracefullyCloseModal();
    }
    const handleSubmit = () => Note.restoreTrash(options?._id);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Restore all"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to restore all the notes in your Trash?
        </Form>
    );
}

const CreateCollection = (props) => {
    const { user, options } = props;
    const [formData, setFormData] = useState({ userId: user._id });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = (formData) => Collection.createCollection(props, formData, options?.callback);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={props.gracefullyCloseModal}
              formData={formData}
              title="Create a new collection">
            <label htmlFor="name">Enter a name for your collection:</label>
            <input
                name="name"
                type="text"
                className={formError?.name ? 'nope' : ''}
                onChange={updateFormData} />
        </Form>
    );
}

const EditCollection = (props) => {
    const { options } = props;
    const [formData, setFormData] = useState({ name: options?.name });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = (formData) => Collection.editCollection(props, options?._id, formData, options?.callback);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={props.gracefullyCloseModal}
              formData={formData}
              title="Edit this collection">
            <label htmlFor="name">Collection name:</label>
            <input
                name="name"
                defaultValue={options?.name}
                type="text"
                className={formError?.name ? 'nope' : ''}
                onChange={updateFormData} />
        </Form>
    );
}

const DeleteCollection = (props) => {
    const { options } = props;
    const handleSubmit = () => Collection.deleteCollection(props, options?._id, options?.callback);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={props.gracefullyCloseModal}
              title="Delete this collection"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete the collection <b>{options?.name}</b>? Doing so will not delete any of its contents, only the collection itself.
        </Form>
    );
}

const CreateTag = (props) => {
    const { user, options } = props;
    const [formData, setFormData] = useState({ userId: user._id });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = (formData) => Tag.createTag(props, formData, options?.callback);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={props.gracefullyCloseModal}
              formData={formData}
              title="Create a new tag">
            <label htmlFor="name">Enter a name for your tag:</label>
            <input
                name="name"
                type="text"
                className={formError?.name ? 'nope' : ''}
                onChange={updateFormData} />
        </Form>
    );
}

const EditTag = (props) => {
    const { options } = props;
    const [formData, setFormData] = useState({ name: options?.name });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = (formData) => Tag.editTag(props, options?._id, formData, options?.callback);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={props.gracefullyCloseModal}
              formData={formData}
              title="Edit this tag">
            <label htmlFor="name">Tag name:</label>
            <input
                name="name"
                defaultValue={options?.name}
                type="text"
                className={formError?.name ? 'nope' : ''}
                onChange={updateFormData} />
        </Form>
    );
}

const DeleteTag = (props) => {
    const { options } = props;
    const handleSubmit = () => Tag.deleteTag(props, options?._id, options?.callback);
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={props.gracefullyCloseModal}
              title="Delete this tag"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete the tag <b>{options?.name}</b>? Doing so will not delete any notes with this tag, only the tag itself.
        </Form>
    );
}
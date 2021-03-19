import { useState } from 'react';
import { Form, Input, Submit } from '../Form';
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
        options?.onSuccess?.();
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
        options?.onSuccess?.();
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
        options?.onSuccess?.();
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
        options?.onSuccess?.();
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
    const resetFormError = (e) => setFormError(prevState => {
        if (!prevState?.[e.target.name]) return prevState;
        const newState = {...prevState};
        delete newState[e.target.name];
        return newState;
    });
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
    }
    const handleSubmit = () => Collection.createCollection(formData);
    const handleSuccess = () => {
        options?.onSuccess?.();
        props.gracefullyCloseModal();
    }
    const handleFormError = (errors) => setFormError({ ...errors });
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={handleFormError}
              formData={formData}
              title="Create a new collection">
            <Input type="text"
                name="name"
                label="Enter a name for your collection:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={inputHint('name')} />
        </Form>
    );
}

const EditCollection = (props) => {
    const { options, user } = props;
    const [formData, setFormData] = useState({ userId: user._id, name: options?.name });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const resetFormError = (e) => setFormError(prevState => {
        if (!prevState?.[e.target.name]) return prevState;
        const newState = {...prevState};
        delete newState[e.target.name];
        return newState;
    });
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
    }
    const handleSubmit = () => Collection.editCollection(options?._id, formData);
    const handleSuccess = () => {
        console.dir(options);
        options?.onSuccess?.();
        props.gracefullyCloseModal();
    }
    const handleFormError = (errors) => setFormError({ ...errors });
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={handleFormError}
              formData={formData}
              title="Edit this collection">
            <Input type="text"
                name="name"
                label="Collection name:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={inputHint('name')} />
        </Form>
    );
}

const DeleteCollection = (props) => {
    const { options } = props;
    const handleSubmit = () => Collection.deleteCollection(options?._id);
    const handleSuccess = () => {
        options?.onSuccess?.();
        props.gracefullyCloseModal();
    }
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess}
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
    const resetFormError = (e) => setFormError(prevState => {
        if (!prevState?.[e.target.name]) return prevState;
        const newState = {...prevState};
        delete newState[e.target.name];
        return newState;
    });
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
    }
    const handleSubmit = () => Tag.createTag(formData);
    const handleSuccess = () => {
        options?.onSuccess?.();
        props.gracefullyCloseModal();
    }
    const handleFormError = (errors) => setFormError({ ...errors });
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={handleFormError}
              formData={formData}
              title="Create a new tag">
            <Input type="text"
                name="name"
                label="Enter a name for your tag:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={inputHint('name')} />
        </Form>
    );
}

const EditTag = (props) => {
    const { options, user } = props;
    const [formData, setFormData] = useState({ userId: user._id, name: options?.name });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const resetFormError = (e) => setFormError(prevState => {
        if (!prevState?.[e.target.name]) return prevState;
        const newState = {...prevState};
        delete newState[e.target.name];
        return newState;
    });
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
    }
    const handleSubmit = () => Tag.editTag(options?._id, formData);
    const handleSuccess = () => {
        options?.onSuccess?.();
        props.gracefullyCloseModal();
    }
    const handleFormError = (errors) => setFormError({ ...errors });
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={handleFormError}
              formData={formData}
              title="Edit this tag">
            <Input type="text"
                name="name"
                label="Tag name:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={inputHint('name')} />
        </Form>
    );
}

const DeleteTag = (props) => {
    const { options } = props;
    const handleSubmit = () => Tag.deleteTag(options?._id);
    const handleSuccess = () => {
        options?.onSuccess?.();
        props.gracefullyCloseModal();
    }
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Delete this tag"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete the tag <b>{options?.name}</b>? Doing so will not delete any notes with this tag, only the tag itself.
        </Form>
    );
}
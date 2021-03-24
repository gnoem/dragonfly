import { Note, Collection, Tag } from "../../api";
import { useFormData, useFormError } from '../../hooks';
import { Form, Input, Submit } from "../Form";

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

const WarnUnsavedChanges = ({ options, closeModal }) => {
    const { saveChanges, discardChanges } = options;
    return (
        <Form onSubmit={saveChanges} onSuccess={closeModal}
              title="Unsaved changes"
              submit={<Submit value="Save changes" nvm="Discard changes" cancel={discardChanges} />}>
            It looks like you have unsaved changes. Would you like to save changes or discard?
        </Form>
    );
}

const TrashNote = ({ options, closeModal }) => {
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    const handleSubmit = () => Note.trashNote(options?._id);
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Move to Trash?"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to move this note to the Trash?
        </Form>
    );
}

const DeleteNote = ({ options, closeModal }) => {
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    const handleSubmit = () => Note.deleteNote(options?._id);
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Delete note permanently"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to permanently delete this note? This action cannot be undone.
        </Form>
    );
}

const EmptyTrash = ({ options, closeModal }) => {
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    const handleSubmit = () => Note.emptyTrash(options?._id);
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Empty Trash"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to permanently delete all the notes in your Trash? This action cannot be undone.
        </Form>
    );
}

const RestoreTrash = ({ options, closeModal }) => {
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    const handleSubmit = () => Note.restoreTrash(options?._id);
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Restore all"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to restore all the notes in your Trash?
        </Form>
    );
}

const CreateCollection = ({ user, options, closeModal }) => {
    const [formData, updateFormData] = useFormData({ userId: user._id });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Collection.createCollection(formData);
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Create a new collection">
            <Input type="text"
                name="name"
                label="Enter a name for your collection:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('name')} />
        </Form>
    );
}

const EditCollection = ({ user, options, closeModal }) => {
    const [formData, updateFormData] = useFormData({ userId: user._id, name: options?.name });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Collection.editCollection(options?._id, formData);
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Edit this collection">
            <Input type="text"
                name="name"
                label="Collection name:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('name')} />
        </Form>
    );
}

const DeleteCollection = ({ options, closeModal }) => {
    const handleSubmit = () => Collection.deleteCollection(options?._id);
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Delete this collection"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete the collection <b>{options?.name}</b>? Doing so will not delete any of its contents, only the collection itself.
        </Form>
    );
}

const CreateTag = ({ user, options, closeModal }) => {
    const [formData, updateFormData] = useFormData({ userId: user._id });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Tag.createTag(formData);
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Create a new tag">
            <Input type="text"
                name="name"
                label="Enter a name for your tag:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('name')} />
        </Form>
    );
}

const EditTag = ({ user, options, closeModal }) => {
    const [formData, updateFormData] = useFormData({ userId: user._id, name: options?.name });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Tag.editTag(options?._id, formData);
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Edit this tag">
            <Input type="text"
                name="name"
                label="Tag name:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('name')} />
        </Form>
    );
}

const DeleteTag = ({ options, closeModal }) => {
    const handleSubmit = () => Tag.deleteTag(options?._id);
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Delete this tag"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete the tag <b>{options?.name}</b>? Doing so will not delete any notes with this tag, only the tag itself.
        </Form>
    );
}
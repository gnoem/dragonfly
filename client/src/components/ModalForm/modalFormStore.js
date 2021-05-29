import { User, Note, Collection, Tag } from "../../api";
import { useFormData, useFormError } from "../../hooks";
import { useState } from "react";
import { ModalForm } from ".";
import { Input, Submit } from "../Form";
import { Checkbox } from "../Checkbox";

export const modalFormStore = {
    welcomeForm: (props) => <WelcomeForm {...props} />,
    resetPassword: (props) => <ResetPassword {...props} />,
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

const WelcomeForm = ({ options, closeModal }) => {
    const { userId } = options;
    const [formData, setFormData] = useState({ hideWelcomeMessage: false });
    const handleSubmit = () => User.updateWelcomed(userId, formData);
    const handleSuccess = () => closeModal();
    const handleCheckboxChange = (e) => setFormData({ hideWelcomeMessage: e.target.checked });
    return (
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess}
                   noLoad={true}
                   className="WelcomeMessage"
                   title="Welcome to Dragonfly!"
                   submit={false}>
            <p>Your public Dragonfly dashboard URL is:</p>
            <div className="dashboardURL"><strong>{window.location.origin}/d/{userId}</strong></div>
            <p>Any notes you create will be publicly accessible at this link. To customize your dashboard URL and password-protect your notes, finalize your account registration under the "My Account" tab in the sidebar.</p>
            <Checkbox label="Don't show this message again" onChange={handleCheckboxChange} />
            <div className="buttons">
                <button type="submit">Got it</button>
            </div>
        </ModalForm>
    );
}

const ResetPassword = ({ closeModal }) => {
    const [success, setSuccess] = useState(false);
    const [formData, updateFormData] = useFormData({});
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => User.resetPassword(formData);
    const handleSuccess = () => setSuccess(true);
    if (success) return (
        <div>
            <h2>Success!</h2>
            <p>An email containing a link to reset your password has been sent to <b>{formData.email}</b>. The link will expire in 2 hours. Be sure to check your spam folder if you can't find the email in your regular inbox.</p>
            <div className="buttons">
                <button type="button" onClick={closeModal}>Close</button>
            </div>
        </div>
    );
    return (
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Forgot your password?"
              submit={<Submit value="Send email" />}>
            <p>Enter your email address to receive a password reset link in your inbox.</p>
            <Input
                type="text"
                name="email"
                label="Email address:"
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('email')}
            />
        </ModalForm>
    );
}

const WarnUnsavedChanges = ({ options, closeModal }) => {
    const { saveChanges, discardChanges } = options;
    return (
        <ModalForm onSubmit={saveChanges} onSuccess={closeModal}
              title="Unsaved changes"
              submit={<Submit value="Save changes" nvm="Discard changes" cancel={discardChanges} />}>
            It looks like you have unsaved changes. Would you like to save changes or discard?
        </ModalForm>
    );
}

const TrashNote = ({ options, closeModal }) => {
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    const handleSubmit = () => Note.trashNote(options?._id);
    return (
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Move to Trash?"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to move this note to the Trash?
        </ModalForm>
    );
}

const DeleteNote = ({ options, closeModal }) => {
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    const handleSubmit = () => Note.deleteNote(options?._id);
    return (
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Delete note permanently"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to permanently delete this note? This action cannot be undone.
        </ModalForm>
    );
}

const EmptyTrash = ({ options, closeModal }) => {
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    const handleSubmit = () => Note.emptyTrash(options?._id);
    return (
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Empty Trash"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to permanently delete all the notes in your Trash? This action cannot be undone.
        </ModalForm>
    );
}

const RestoreTrash = ({ options, closeModal }) => {
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    const handleSubmit = () => Note.restoreTrash(options?._id);
    return (
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Restore all"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to restore all the notes in your Trash?
        </ModalForm>
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
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Create a new collection">
            <Input type="text"
                name="name"
                label="Enter a name for your collection:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('name')} />
        </ModalForm>
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
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Edit this collection">
            <Input type="text"
                name="name"
                label="Collection name:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('name')} />
        </ModalForm>
    );
}

const DeleteCollection = ({ options, closeModal }) => {
    const handleSubmit = () => Collection.deleteCollection(options?._id);
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    return (
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Delete this collection"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete the collection <b>{options?.name}</b>? Doing so will not delete any of its contents, only the collection itself.
        </ModalForm>
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
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Create a new tag">
            <Input type="text"
                name="name"
                label="Enter a name for your tag:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('name')} />
        </ModalForm>
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
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
              title="Edit this tag">
            <Input type="text"
                name="name"
                label="Tag name:"
                defaultValue={formData?.name}
                onChange={updateFormData}
                onInput={resetFormError}
                hint={warnFormError('name')} />
        </ModalForm>
    );
}

const DeleteTag = ({ options, closeModal }) => {
    const handleSubmit = () => Tag.deleteTag(options?._id);
    const handleSuccess = () => {
        options?.onSuccess?.();
        closeModal();
    }
    return (
        <ModalForm onSubmit={handleSubmit} onSuccess={handleSuccess}
              title="Delete this tag"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete the tag <b>{options?.name}</b>? Doing so will not delete any notes with this tag, only the tag itself.
        </ModalForm>
    );
}
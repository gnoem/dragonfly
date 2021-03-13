import { useState } from 'react';
import { Collection, Tag } from '../../helpers';
import Loading from '../Loading';

export const Form = (props) => {
    const { title, children, submit, formData, onSubmit } = props;
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        onSubmit(formData);
    }
    return (
        <form onSubmit={handleSubmit} autoComplete="off">
            <h2>{title}</h2>
            {children}
            {loading ? <Loading /> : (submit ?? <Submit {...props} />)}
        </form>
    );
}

export const Submit = (props) => {
    const { value, nvm, cancel } = props;
    const handleCancel = cancel || props.gracefullyCloseModal;
    return (
        <div className="buttons">
            <button type="submit">{value || 'Submit'}</button>
            <button type="button" className="greyed" onClick={handleCancel}>{nvm || 'Cancel'}</button>
        </div>
    )
}

const CreateCollection = (props) => {
    const { user } = props;
    const [formData, setFormData] = useState({ userId: user._id });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = (formData) => Collection.createCollection(props, formData, props.gracefullyCloseModal);
    return (
        <Form {...props} onSubmit={handleSubmit} formData={formData} title="Create a new collection">
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
    const [formData, setFormData] = useState({ name: options.name });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = (formData) => Collection.editCollection(props, options._id, formData, props.gracefullyCloseModal);
    return (
        <Form {...props} onSubmit={handleSubmit} formData={formData} title="Edit this collection">
            <label htmlFor="name">Collection name:</label>
            <input
                name="name"
                defaultValue={options.name}
                type="text"
                className={formError?.name ? 'nope' : ''}
                onChange={updateFormData} />
        </Form>
    );
}

const DeleteCollection = (props) => {
    const { options } = props;
    const handleSubmit = () => Collection.deleteCollection(props, options._id, props.gracefullyCloseModal);
    return (
        <Form {...props} onSubmit={handleSubmit}
              title="Delete this collection"
              submit={<Submit {...props} value="Yes, I'm sure" />}>
            Are you sure you want to delete the collection <b>{options.name}</b>? Doing so will not delete any of its contents, only the collection itself.
        </Form>
    );
}

const CreateTag = (props) => {
    const { user } = props;
    const [formData, setFormData] = useState({ userId: user._id });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = (formData) => Tag.createTag(props, formData, props.gracefullyCloseModal);
    return (
        <Form {...props} onSubmit={handleSubmit} formData={formData} title="Create a new tag">
            <label htmlFor="name">Enter a name for your tag:</label>
            <input
                name="name"
                type="text"
                className={formError?.name ? 'nope' : ''}
                onChange={updateFormData} />
        </Form>
    );
}

export const formStore = {
    createCollection: (props) => <CreateCollection {...props} />,
    editCollection: (props) => <EditCollection {...props} />,
    deleteCollection: (props) => <DeleteCollection {...props} />,
    createTag: (props) => <CreateTag {...props} />
}
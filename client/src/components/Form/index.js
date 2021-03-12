import { useState } from 'react';
import Loading from '../Loading';

const Form = ({ title, children, submit, formData, onSubmit }) => {
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
            {loading ? <Loading /> : (submit ?? <Submit />)}
        </form>
    );
}

const Submit = ({ value }) => {
    return (
        <div className="buttons">
            <button type="submit">{value || 'Submit'}</button>
            <button type="button" className="greyed">Cancel</button>
        </div>
    )
}

export const CreateCollection = (props) => {
    const { user } = props;
    const [formData, setFormData] = useState({ userId: user._id });
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = async (formData) => {
        const response = await fetch('/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body.success) return console.log(body.error);
        console.log('success!!');
        console.dir(body);
        props.refreshData();
        props.gracefullyCloseModal();
    }
    return (
        <Form onSubmit={handleSubmit} formData={formData} title="Create a new collection">
            Enter a name for your collection:
            <input
                name="name"
                type="text"
                className={formError?.name ? 'nope' : ''}
                onChange={updateFormData} />
        </Form>
    );
}

export const formStore = {
    createCollection: (props) => <CreateCollection {...props} />
}
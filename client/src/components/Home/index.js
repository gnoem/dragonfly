import React from 'react';
import { User } from '../../api';
import { Button } from '../Form';
import { Header } from '../Page';

export default function Home() {
    const onSuccess = ({ user }) => window.location.assign(`/d/${user._id}`);
    const createUser = () => User.createUser().then(onSuccess);
    return (
        <div className="Home">
            <Header />
            A simple note-taking app for your browser.
            <Button type="button" onClick={createUser} showLoadingIcon={true}>Get started</Button>
        </div>
    );
}
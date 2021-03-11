import React from 'react';

export default function Home() {
    const createUser = async () => {
        const response = await fetch('/create/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        if (!body.user) return console.log('no userdata response from server');
        window.location.assign(`/d/${body.user._id}`);
    }
    return (
        <div className="Home">
            <h1>Dragonfly</h1>
            A simple note-taking app for your browser.
            <button onClick={createUser}>Get started</button>
        </div>
    )
}
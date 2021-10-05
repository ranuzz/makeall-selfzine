import withRoot from '../app/withRoot.js';
import React from 'react';
import BasicAppBar from '../components/BasicAppBar.js';

function Home() {

    return (
        <>
        <BasicAppBar></BasicAppBar>
        </>
    );

}

export default withRoot(Home);
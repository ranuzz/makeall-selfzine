import withRoot from '../app/withRoot.js';
import React from 'react';
import BasicAppBar from '../components/BasicAppBar.js';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function Home() {

    let stateData = {
        "given_name": ""
    };
    if (document.querySelector('script#edge_state') !== null) {
        stateData = JSON.parse(document.querySelector('script#edge_state').innerText)
    }
    let itemData = {
        "count": 0
    }
    if (document.querySelector('script#edge_items') !== null) {
        itemData = JSON.parse(document.querySelector('script#edge_items').innerText)
    }
    
    return (
        <>
        <BasicAppBar></BasicAppBar>
        <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
            action="/submititem"
            method="POST"
        >
            <TextField id="outlined-basic" label="Item" variant="outlined" name="item" />
            <Button variant="outlined" type="submit">Submit</Button>
        </Box>
        <div>
            {JSON.stringify(stateData)}
        </div>
        <div>
            {JSON.stringify(itemData)}
        </div>
        </>
    );

}

export default withRoot(Home);
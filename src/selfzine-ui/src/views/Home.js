import withRoot from '../app/withRoot.js';
import React from 'react';
import BasicAppBar from '../components/BasicAppBar.js';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function Home() {

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
        </>
    );

}

export default withRoot(Home);
import withRoot from '../app/withRoot.js';
import React from 'react';
import BasicAppBar from '../components/BasicAppBar.js';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import UserCard from '../components/UserCard.js';
import Grid from '@mui/material/Grid';
import ItemCards from '../components/ItemCards.js';

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
        itemData = JSON.parse(document.querySelector('script#edge_items').innerText);
    } 


    return (
        <>
        <BasicAppBar></BasicAppBar>
        <br /><br />
        <Grid container spacing={2}>

            <Grid item xs={4}>
            </Grid>
            <Grid item xs={4}>
                <UserCard userinfo={stateData}></UserCard>
            </Grid>
            <Grid item xs={4}>
            </Grid>
            
            <Grid item xs={4}>
            </Grid>
            <Grid item xs={4}>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, width: '55ch' },
                    }}
                    noValidate
                    autoComplete="off"
                    action="/submititem"
                    method="POST"
                >
                    <TextField 
                        id="outlined-basic"
                        
                        variant="outlined" 
                        name="item"
                        multiline
                        maxRows={4} 
                        rows={1}
                        placeholder={'Add Something You Achieved Today'}
                        /> <br/>
                    <Button variant="outlined" type="submit">Add</Button>
                </Box>
            </Grid>
            <Grid item xs={4}>
            </Grid>

            <Grid item xs={4}>
            </Grid>
            <Grid item xs={4}>
                {itemData === null ? <></> : <ItemCards iteminfo={itemData}></ItemCards>}
            </Grid>
            <Grid item xs={4}>
            </Grid>
        </Grid>
    
        </>
    );

}

export default withRoot(Home);
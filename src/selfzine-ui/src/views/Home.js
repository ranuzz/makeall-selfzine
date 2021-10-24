import withRoot from '../app/withRoot.js';
import React from 'react';
import BasicAppBar from '../components/BasicAppBar.js';
import UserCard from '../components/UserCard.js';
import Grid from '@mui/material/Grid';
import ItemCards from '../components/ItemCards.js';
import ItemInputCard from '../components/ItemInputCard.js';

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
    

    // Dummy data for testing
    // stateData = {
    //     "given_name": "ranu",
    //     "family_name": "ranu",
    //     "picture": "",
    //     "email": "ranuzz@makeall.dev"
    // };

    // itemData = {
    //     "1635077585": "Sample Data",
    //     "count": 1
    // };

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
                <ItemInputCard userinfo={stateData}></ItemInputCard>
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
import withRoot from '../app/withRoot.js';
import React from 'react';
import BasicAppBar from '../components/BasicAppBar.js';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

function About() {

    return (
        <>
        <BasicAppBar></BasicAppBar>
        <br /><br />
        <Grid container spacing={2}>

            <Grid item xs={4}>
            </Grid>
            <Grid item xs={4}>
                <Typography sx={{ fontSize: 24 }} color="text.secondary" gutterBottom>
                    SelfZine : Periodic newsletter curated by you mailed by us
                </Typography>

                <Typography sx={{ fontSize: 20 }} color="text.secondary" gutterBottom>
                    Add what you accomplished today
                </Typography>

                <Typography sx={{ fontSize: 20 }} color="text.secondary" gutterBottom>
                    We will keep the ten most recent activities
                </Typography>

                <Typography sx={{ fontSize: 20 }} color="text.secondary" gutterBottom>
                    A newsletter like mail will be sent to you as per your schedule
                </Typography>
                <br /><br /><br /><br />
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    A makeall.dev project by ranuzz
                </Typography>
            </Grid>
            <Grid item xs={4}>
            </Grid>
        </Grid>
        </>
    );

}

export default withRoot(About);
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function UserCard(props) {
    if (props.userinfo.given_name.length === 0) {
        return (<></>);
    } else {
        return (
            <Card sx={{ minWidth: 275, maxWidth: 500 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        Hello
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Avatar alt="user" src={props.userinfo.picture} sx={{ width: 56, height: 56 }} /> 
                        <Typography variant="h5" component="div">
                            {props.userinfo.given_name} {props.userinfo.family_name}
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                {props.userinfo.email}
                            </Typography>
                        </Typography>
                    </Stack>                   
                </CardContent>
                <CardActions>
                    <Button size="small">LogOut</Button> <Button size="small">Schedule email</Button>
                </CardActions>
            </Card>
        )
    }
}
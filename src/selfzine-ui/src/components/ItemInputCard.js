import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function ItemInputCard(props) {
    if (props.userinfo.given_name.length === 0) {
        return (<></>);
    } else {
        return (
            <>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, width: '56ch' },
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
                        /> <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<Button variant="outlined" type="submit">Add</Button>
                </Box>
            </>
        )
    }
}
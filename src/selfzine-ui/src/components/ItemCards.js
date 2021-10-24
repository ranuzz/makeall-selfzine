import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function ItemCards(props) {

    const [open, setOpen] = React.useState(false);

    const handleOpenSB = () => {
        setOpen(true);
      };
    
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };


    const action = (
        <React.Fragment>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      );    

    if (props.iteminfo.count === 0 || props.iteminfo.count === undefined) {
        return (<></>);
    } else {
        let cards = [];
        Object.keys(props.iteminfo).map(function (key) {
            if (key !== 'count') {
                cards.push(
                    <Card key={key} sx={{ minWidth: 275, maxWidth: 500, marginBottom: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 11 }} color="text.secondary" gutterBottom>
                                {new Date(key*1000).toString()}
                            </Typography>
                            <Typography variant="h5" component="div">
                                {props.iteminfo[key]}
                            </Typography>
                        </CardContent>
                        <CardActions>
                        <Button size="small" onClick={() => {}}><EditOutlined sx={{ fontSize: 15 }}/></Button>
                        <Button size="small" onClick={() => {
                            fetch(`/delitem/${key}`, {
                                method: 'DELETE'
                            }).then(function(response) {
                                if (!response.ok) {
                                    handleOpenSB();
                                } else {
                                    window.location = '/';
                                }
                            });
                        }}><DeleteOutlinedIcon sx={{ fontSize: 15 }} /></Button>
                        </CardActions>
                    </Card>

                );
            } 
        });
        return (
            <>
            {cards} 
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message="Delete Failed"
                action={action}
            />
            </> 
        )
    }
}
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Approval';
import {
  Link,
  NavLink 
} from "react-router-dom";

export default function BasicAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SelfZine
          </Typography>
          <Button color="inherit">
            <NavLink 
              to="/"
              activeStyle={{
                fontWeight: "bold",
                color: "white"
              }}
              >
                Home
            </NavLink>
          </Button>
          <Button color="inherit">
            <NavLink 
              to="/about"
              activeStyle={{
                fontWeight: "bold",
                color: "white"
              }}
              >
                About
            </NavLink>
          </Button>
          <Button color="inherit" onClick={
            () => {
              document.cookie = "AUTH0-AUTH=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              window.location = '/logout'
            }}>
              Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
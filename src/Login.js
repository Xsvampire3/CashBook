import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "./firebase";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { styled } from "@mui/system";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from "@mui/material";
import Register from "./Register";

const LoginContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: theme.spacing(8),
  backgroundColor: "#F0F2F5",
  borderRadius: "10px",
  padding: "20px"
}));

const LoginForm = styled("form")(({ theme }) => ({
  marginTop: theme.spacing(1),
  width: "100%"
}));

const LoginButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2)
}));

const Login = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const userName = data.get("userName");
    const password = data.get("password");
    signInWithEmailAndPassword(auth, userName, password)
      .then((userDetails) => {
        //const uid = userDetails.user.uid; // Retrieve the user ID

        setIsLoggedIn(true);
        navigate("/");
      })

      .catch((error) => {
        console.log("Error signing in:", error);
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          alert("Username or password is invalid. Please try again.");
        } else {
          alert("An error occurred. Please try again.");
        }
      });
  };

  return (
    <LoginContainer maxWidth="xs">
      <Box sx={{ mb: 3 }}>
        <LockOutlinedIcon />
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
      </Box>
      <LoginForm onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="userName"
          label="Email Address"
          name="userName"
          autoComplete="email"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <LoginButton
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </LoginButton>
        <Link to="#" variant="body2" onClick={handleOpenDialog}>
          {"Don't have an account? Sign Up"}
        </Link>
      </LoginForm>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          <Register />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </LoginContainer>
  );
};

export default Login;

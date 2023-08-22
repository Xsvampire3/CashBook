import { Button, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "./firebase";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const userName = data.get("userName");
    const password = data.get("password");

    createUserWithEmailAndPassword(auth, userName, password)
      .then((userDetails) => {
        alert("Registration successful!");
        navigate("/");
      })

      .catch((error) => {
        console.log(error);
        alert("Registration failed. Please try again.");
      });

    /*setTimeout(() => {
      navigate("/");
    }, 0);*/
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          p: 4,
          backgroundColor: "#F0F2F5",
          borderRadius: "16px",
          boxShadow: "0px 3px 6px #00000029"
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            type="text"
            name="userName"
            label="Email"
            placeholder="abc@gmail.com"
            variant="outlined"
            size="small"
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            name="password"
            label="Password"
            placeholder="Enter Password"
            variant="outlined"
            size="small"
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" size="large">
            Register
          </Button>
        </form>
      </Box>
    </Box>
  );
}

export default Register;

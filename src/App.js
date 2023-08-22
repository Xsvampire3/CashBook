import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    // Render a loading indicator or fallback component while Firebase authentication is being checked
    return <div>Loading...</div>;
  }

  // Custom route component to handle authentication logic
  const PrivateRoute = ({ element, path }) => {
    return user ? (
      element
    ) : (
      <Navigate replace state={{ from: path }} to="/login" />
    );
  };

  return (
    <BrowserRouter>
      {!loading && !user && <Navigate to="/login" replace />}{" "}
      {/* Redirect to the login page if not logged in */}
      {user && <Navbar />}{" "}
      {/* Render the Navbar component only if the user is logged in */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={<PrivateRoute element={<Home />} path="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

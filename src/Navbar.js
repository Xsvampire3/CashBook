import React, { useState, useEffect } from "react";
import "./styles.css";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Typography,
  Box // Add Box component from MUI
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MenuIcon from "@mui/icons-material/Menu";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  where,
  query,
  onSnapshot
} from "firebase/firestore";
import MyCalendar from "./MyCalendar";
import Summary from "./Summary";

const StyledAppBar = styled(AppBar)({
  zIndex: (theme) => theme.zIndex.drawer + 1
});

const Navbar = ({ entries, deleteAllEntries, toggleNightMode, nightMode }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEntries, setUserEntries] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userId = user.uid;

        const q = query(
          collection(db, "entries"),
          where("userId", "==", userId)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const userEntriesData = snapshot.docs.map((doc) => doc.data());
          setUserEntries(userEntriesData);
        });

        return () => unsubscribe(); // Clean up the listener on unmount
      } else {
        setIsLoggedIn(false);
        setUserEntries([]);
      }
    });
  }, []);

  function handleLogout() {
    const authInstance = getAuth(); // Rename the constant to authInstance or authService
    signOut(authInstance)
      .then(() => {
        alert("Log out successful");
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const entriesData = entries.map((entry) => [
      //isValid(entry.timestamp) ? format(entry.timestamp, 'dd/MM/yyyy hh:mm:ss a') : '',
      format(entry.timestamp.toDate(), "dd/MM/yyyy hh:mm:ss a"),
      entry.remark,
      entry.type === "cashIn" ? "+" : "-",
      `${entry.amount}`,
      `${entry.balance}`
    ]);

    doc.text("Cashbook Entries", 10, 10);
    doc.autoTable({
      head: [["Timestamp", "Remark", "Type", "Amount", "Balance"]],
      body: entriesData
    });

    doc.save("cashbook.pdf");
  };

  const handleConfirmDeleteOpen = () => {
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  const handleConfirmDeleteClose = () => {
    setConfirmDeleteOpen(false);
  };

  const handleDeleteAllEntries = () => {
    deleteAllEntries();
    handleConfirmDeleteClose();
  };

  const handleCalendarOpen = () => {
    setCalendarOpen(true);
    handleMenuClose();
  };

  const handleSummaryOpen = () => {
    setSummaryOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <StyledAppBar className={nightMode ? "night-mode" : ""}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem component={Link} to="/" onClick={handleMenuClose}>
              Home
            </MenuItem>
            <MenuItem component={Link} to="/" onClick={handleCalendarOpen}>
              Calendar
            </MenuItem>
            <MenuItem component={Link} to="/" onClick={handleSummaryOpen}>
              Summary
            </MenuItem>
            <MenuItem onClick={handleConfirmDeleteOpen}>Delete All</MenuItem>
            <MenuItem>
              <Switch checked={nightMode} onChange={toggleNightMode} />
              {nightMode ? "Day Mode" : "Night Mode"}
            </MenuItem>
          </Menu>
          <Typography style={{ fontWeight: "bold" }}>CashBook</Typography>
          <Box sx={{ marginLeft: "auto" }}>
            <IconButton
              color="inherit"
              aria-label="Export as PDF"
              onClick={handleExportPDF}
            >
              <PictureAsPdfIcon />
            </IconButton>
            {isLoggedIn ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/login"
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Dialog open={confirmDeleteOpen} onClose={handleConfirmDeleteClose}>
        <DialogTitle>Delete All Entries</DialogTitle>
        <DialogContent>
          Are you sure you want to delete all entries? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDeleteClose}>Cancel</Button>
          <Button
            onClick={handleDeleteAllEntries}
            variant="contained"
            color="error"
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={calendarOpen} onClose={() => setCalendarOpen(false)}>
        <DialogTitle>Calendar</DialogTitle>
        <DialogContent>
          <MyCalendar entries={userEntries} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={summaryOpen} onClose={() => setSummaryOpen(false)}>
        <DialogTitle>Summary</DialogTitle>
        <DialogContent>
          <Summary entries={userEntries} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSummaryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;

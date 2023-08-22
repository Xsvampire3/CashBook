import React, { useState, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import "./styles.css";
import {
  Button,
  Container,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  Snackbar,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import { format } from "date-fns";
import "jspdf-autotable";
import "./styles.css";
import Navbar from "./Navbar";
import {
  collection,
  addDoc,
  doc,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase"; // Import your Firebase Firestore instance here
import { getAuth } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, where, query, onSnapshot } from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";

const RootContainer = styled("div")(({ theme, nightMode }) => ({
  display: "flex",
  backgroundColor: nightMode ? "#333" : "inherit",
  padding: theme.spacing(3),
  margin: theme.spacing(0)
}));

const ContentContainer = styled("main")({
  flexGrow: 1,
  padding: (theme) => theme.spacing(3)
});

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  gap: "15px"
});

const Loader = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vh"
});

const EntryContainer = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: "10px",
  marginTop: "10px",
  padding: "10px",
  backgroundColor: theme.palette.background.paper
}));

const EntryContainer2 = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "10px",
  marginTop: "10px",
  padding: "10px",
  justifyItems: "center",
  backgroundColor: theme.palette.background.paper
}));

const EntryBox = styled("div")(({ theme }) => ({
  flex: 2
}));

const EntryText = styled(Typography)(({ theme }) => ({
  fontWeight: "bold"
}));

const BalanceText = styled(EntryText)(({ theme }) => ({
  color: "blue"
}));

const CashInText = styled(EntryText)({
  color: "green"
});

const CashOutText = styled(EntryText)({
  color: "red"
});

const EntriesWrapper = styled("div")(({ theme }) => ({
  overflow: "auto",
  maxHeight: "316px", // Adjust the maximum height as needed
  [theme.breakpoints.down("sm")]: {
    maxHeight: "400px" // Adjust the maximum height for smaller screens
  }
}));

function Home() {
  const [openCashIn, setOpenCashIn] = useState(false);
  const [openCashOut, setOpenCashOut] = useState(false);
  const [cashInAmount, setCashInAmount] = useState("");
  const [cashInRemark, setCashInRemark] = useState("");
  const [cashOutAmount, setCashOutAmount] = useState("");
  const [cashOutRemark, setCashOutRemark] = useState("");
  const [balance, setBalance] = useState(0);
  const [entries, setEntries] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const entriesContainerRef = useRef(null);
  const [nightMode, setNightMode] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEntries, setUserEntries] = useState([]);

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
          const userEntriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserEntries(userEntriesData);
          setLoading(false); // Mark loading as false after fetching data
        });

        return () => unsubscribe(); // Clean up the listener on unmount
      } else {
        setIsLoggedIn(false);
        setUserEntries([]);
        setLoading(false); // Mark loading as false when user is not logged in
      }
    });
  }, []);

  useEffect(() => {
    // Calculate balance from entries when component mounts or entries change
    const initialBalance = userEntries.reduce((acc, entry) => {
      if (entry.type === "cashIn") {
        return acc + parseFloat(entry.amount);
      } else {
        return acc - parseFloat(entry.amount);
      }
    }, 0);
    setBalance(initialBalance);
  }, [userEntries]);

  const handleCashIn = () => {
    setOpenCashIn(true);
  };

  const handleCashOut = () => {
    setOpenCashOut(true);
  };

  const handleCashInCreate = async () => {
    const user = getAuth().currentUser;
    const userId = user.uid;

    const newBalance = balance + parseFloat(cashInAmount);
    const newEntry = {
      userId,
      type: "cashIn",
      amount: cashInAmount,
      remark: cashInRemark,
      balance: newBalance,
      timestamp: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, "entries"), newEntry);
      setEntries((prevEntries) => {
        const updatedEntries = [newEntry, ...prevEntries];
        return updatedEntries;
      });
      setBalance(newBalance);
      setOpenCashIn(false);
      setCashInAmount("");
      setCashInRemark("");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error creating cash in entry:", error);
    }
  };

  const handleCashOutCreate = async () => {
    const user = getAuth().currentUser;
    const userId = user.uid;

    const newBalance = balance - parseFloat(cashOutAmount);
    const newEntry = {
      userId,
      type: "cashOut",
      amount: cashOutAmount,
      remark: cashOutRemark,
      balance: newBalance,
      timestamp: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, "entries"), newEntry);
      setEntries((prevEntries) => {
        const updatedEntries = [newEntry, ...prevEntries];
        return updatedEntries;
      });
      setBalance(newBalance);
      setOpenCashOut(false);
      setCashOutAmount("");
      setCashOutRemark("");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error creating cash out entry:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const deleteEntry = async (entryId) => {
    try {
      await deleteDoc(doc(db, "entries", entryId));
      // Update the userEntries state by removing the deleted entry
      setUserEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== entryId)
      );
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const deleteAllEntries = () => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const entriesRef = collection(db, "entries");
      const q = query(entriesRef, where("userId", "==", userId));

      // Get all entries for the current user
      getDocs(q)
        .then((querySnapshot) => {
          // Delete each entry
          querySnapshot.forEach((doc) => {
            deleteDoc(doc.ref);
          });

          alert("All entries deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting entries:", error);
        });
    }
  };

  const toggleNightMode = () => {
    setNightMode((prevNightMode) => !prevNightMode);
  };

  const calculateTotals = () => {
    let totalCashIn = 0;
    let totalCashOut = 0;

    userEntries.forEach((entry) => {
      if (entry.type === "cashIn") {
        totalCashIn += parseFloat(entry.amount);
      } else if (entry.type === "cashOut") {
        totalCashOut += parseFloat(entry.amount);
      }
    });
    return {
      totalCashIn,
      totalCashOut,
      balance2: balance.toFixed(2)
    };
  };
  const { totalCashIn, totalCashOut, balance2 } = calculateTotals();

  return (
    <RootContainer nightMode={nightMode}>
      {loading ? (
        // Render a loading indicator or placeholder
        <Loader>
          <CircularProgress />
        </Loader>
      ) : (
        <>
          <Navbar
            entries={userEntries}
            deleteAllEntries={deleteAllEntries}
            toggleNightMode={toggleNightMode}
            nightMode={nightMode}
          />

          <ContentContainer>
            <Toolbar />
            <Container maxWidth="sm">
              <ButtonContainer>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCashIn}
                >
                  Cash In
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCashOut}
                >
                  Cash Out
                </Button>
              </ButtonContainer>

              <EntryContainer>
                <EntryText>Date/Remark</EntryText>
                <EntryText>Cr/Dr</EntryText>
                <EntryText>Balance</EntryText>
              </EntryContainer>

              <EntriesWrapper>
                <div ref={entriesContainerRef}>
                  {userEntries.map((entry) => (
                    <EntryContainer key={entry.id}>
                      <EntryText>
                        {format(
                          entry.timestamp.toDate(),
                          "dd/MM/yyyy hh:mm:ss a"
                        )}
                        <br />
                        {entry.remark}
                      </EntryText>

                      <CashInText>
                        {entry.type === "cashIn" ? `+ ${entry.amount}` : ""}
                        <CashOutText>
                          {entry.type === "cashOut" ? `- ${entry.amount}` : ""}
                        </CashOutText>
                      </CashInText>

                      <EntryText>{entry.balance}</EntryText>

                      <IconButton
                        onClick={() => deleteEntry(entry.id)} // Call a delete function passing the entry ID
                        color="inherit"
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </EntryContainer>
                  ))}
                </div>
              </EntriesWrapper>
            </Container>

            <EntryContainer2>
              <EntryBox>
                <EntryText>Cash In</EntryText>
                <CashInText>{totalCashIn.toFixed(2)}</CashInText>
              </EntryBox>
              <EntryBox>
                <EntryText>Cash Out</EntryText>
                <CashOutText>{totalCashOut.toFixed(2)}</CashOutText>
              </EntryBox>
              <EntryBox>
                <EntryText>Balance</EntryText>
                <BalanceText>{balance2}</BalanceText>
              </EntryBox>
            </EntryContainer2>
          </ContentContainer>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            message="Entry created successfully."
          />

          <Drawer
            anchor="bottom"
            open={openCashIn}
            onClose={() => setOpenCashIn(false)}
          >
            <Toolbar />
            <Container maxWidth="sm">
              <div style={{ marginBottom: "10px" }}>
                <FormControl fullWidth>
                  <TextField
                    id="amount-input"
                    type="number"
                    value={cashInAmount}
                    label="Amount"
                    onChange={(e) => setCashInAmount(e.target.value)}
                  />
                </FormControl>
              </div>
              <div>
                <FormControl fullWidth>
                  <TextField
                    id="remark-input"
                    label="Remark"
                    value={cashInRemark}
                    onChange={(e) => setCashInRemark(e.target.value)}
                  />
                </FormControl>
              </div>
              <ButtonContainer sx={{ margin: "10px" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCashInCreate}
                >
                  Create
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setOpenCashIn(false)}
                >
                  Cancel
                </Button>
              </ButtonContainer>
            </Container>
          </Drawer>

          <Drawer
            anchor="bottom"
            open={openCashOut}
            onClose={() => setOpenCashOut(false)}
          >
            <Toolbar />
            <Container maxWidth="sm">
              <div style={{ marginBottom: "10px" }}>
                <FormControl fullWidth>
                  <TextField
                    id="amount-input"
                    type="number"
                    label="Amount"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(e.target.value)}
                  />
                </FormControl>
              </div>
              <div>
                <FormControl fullWidth>
                  <TextField
                    id="remark-input"
                    label="Remark"
                    value={cashOutRemark}
                    onChange={(e) => setCashOutRemark(e.target.value)}
                  />
                </FormControl>
              </div>
              <ButtonContainer sx={{ margin: "10px" }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCashOutCreate}
                >
                  Create
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setOpenCashOut(false)}
                >
                  Cancel
                </Button>
              </ButtonContainer>
            </Container>
          </Drawer>
        </>
      )}
    </RootContainer>
  );
}

export default Home;

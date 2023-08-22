import React, { useState } from "react";
import Calendar from "react-calendar";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { format } from "date-fns";

const EntryContainer = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "auto auto auto",
  gap: "10px",
  marginTop: "10px",
  padding: "10px",
  backgroundColor: theme.palette.background.paper
}));

const EntryText = styled(Typography)(({ theme }) => ({
  fontWeight: "bold"
}));

const CashInText = styled(EntryText)({
  color: "green"
});

const CashOutText = styled(EntryText)({
  color: "red"
});

const MyCalendar = ({ entries }) => {
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (date) => {
    // Filter entries for the selected date
    const entriesForDate = entries.filter((entry) => {
      const entryDate = entry.timestamp.toDate();
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });

    // Update the selected entries state
    setSelectedDate(date);
    setSelectedEntries(entriesForDate);
  };

  return (
    <div>
      <Calendar
        onClickDay={handleDateClick}
        value={selectedDate}
        tileClassName={({ date, view }) =>
          view === "month" &&
          selectedDate &&
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear()
            ? "selected"
            : ""
        }
      />
      {selectedEntries.length > 0 ? (
        <div>
          <h3>Entries for selected date:</h3>
          {selectedEntries.map((entry, index) => (
            <EntryContainer key={entry.id}>
              <EntryText>
                {format(entry.timestamp.toDate(), "dd/MM/yyyy hh:mm:ss a")}
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
            </EntryContainer>
          ))}
        </div>
      ) : (
        <p>No entries made on the selected date.</p>
      )}
    </div>
  );
};

export default MyCalendar;

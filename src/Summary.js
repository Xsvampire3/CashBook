import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  ArcElement,
  Title,
  Legend,
  Tooltip
} from "chart.js";

// Register the required chart elements
Chart.register(CategoryScale, ArcElement, Title, Legend, Tooltip);

const Summary = ({ entries }) => {
  // Calculate total cash in and cash out amounts
  let cashInAmount = 0;
  let cashOutAmount = 0;

  entries.forEach((entry) => {
    if (entry.type === "cashIn") {
      cashInAmount += parseFloat(entry.amount);
    } else if (entry.type === "cashOut") {
      cashOutAmount += parseFloat(entry.amount);
    }
  });

  // Prepare data for cash in and cash out chart
  const cashInCashOutData = {
    labels: ["Cash In", "Cash Out"],
    datasets: [
      {
        data: [cashInAmount, cashOutAmount],
        backgroundColor: ["green", "red"]
      }
    ]
  };

  // Prepare options for the pie chart
  const cashInCashOutOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const labelIndex = context.dataIndex;
            const dataset = context.dataset;
            const value = dataset.data[labelIndex];
            const label = context.chart.data.labels[labelIndex];
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  return (
    <div>
      <div>
        <h2>Cash In - Cash Out</h2>
        <Pie data={cashInCashOutData} options={cashInCashOutOptions} />
      </div>
    </div>
  );
};

export default Summary;

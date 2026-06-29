import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";

// Helper to generate a full year of empty/zero counts
const getPastYearData = (commits) => {
  const data = [];
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setDate(today.getDate() - 365);

  const commitCountsByDate = {};
  let currentDate = new Date(oneYearAgo);

  // Initialize all dates with 0 count
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split("T")[0];
    commitCountsByDate[dateStr] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count actual commits
  if (commits && Array.isArray(commits)) {
    commits.forEach((commit) => {
      if (commit.date) {
        try {
          const cDate = new Date(commit.date).toISOString().split("T")[0];
          if (commitCountsByDate[cDate] !== undefined) {
            commitCountsByDate[cDate] += 1;
          }
        } catch (e) {
          // Ignored parsing errors
        }
      }
    });
  }

  // Map to format required by uiw/react-heat-map
  Object.keys(commitCountsByDate).forEach((date) => {
    data.push({
      date: date.replace(/-/g, "/"), // format as YYYY/MM/DD for better library parsing
      count: commitCountsByDate[date],
    });
  });

  return data;
};

// Generates color mapping for heatmap values based on the TrackChange palette
const getPanelColors = (maxCount) => {
  const colors = {};
  const limit = Math.max(maxCount, 20);
  for (let i = 0; i <= limit; i++) {
    if (i === 0) {
      colors[i] = "#E5ECE9"; // Soft cream-gray for 0 contributions
    } else if (i <= 2) {
      colors[i] = "#A8DADC"; // Low activity: Teal accent
    } else if (i <= 5) {
      colors[i] = "#6FA8DC"; // Medium-low: Light slate blue
    } else if (i <= 8) {
      colors[i] = "#457B9D"; // Medium: Slate blue
    } else if (i <= 12) {
      colors[i] = "#1D3557"; // High: Deep Navy
    } else {
      colors[i] = "#E63946"; // Peak: TrackChange Red
    }
  }
  return colors;
};

const HeatMapProfile = ({ commits }) => {
  const [activityData, setActivityData] = useState([]);
  const [panelColors, setPanelColors] = useState({});

  useEffect(() => {
    const data = getPastYearData(commits);
    setActivityData(data);

    const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 0;
    setPanelColors(getPanelColors(maxCount));
  }, [commits]);

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setDate(today.getDate() - 365);

  return (
    <div className="evolution-map-container">
      <div className="heatmap-header">
        <h4 className="heatmap-title">Code Evolution Map</h4>
        <span className="heatmap-subtitle">Visualizing changes over the last 365 days</span>
      </div>
      <div className="heatmap-scroll-wrapper">
        <HeatMap
          className="HeatMapProfile"
          style={{ 
            color: "var(--deep-navy)", 
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            padding: "10px 0"
          }}
          value={activityData}
          weekLabels={["Sun", "", "Tue", "", "Thu", "", "Sat"]}
          startDate={oneYearAgo}
          endDate={today}
          rectSize={12}
          space={3}
          rectProps={{
            rx: 2,
          }}
          panelColors={panelColors}
        />
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-boxes">
          <div className="legend-box" style={{ backgroundColor: "#E5ECE9" }} title="0 commits"></div>
          <div className="legend-box" style={{ backgroundColor: "#A8DADC" }} title="1-2 commits"></div>
          <div className="legend-box" style={{ backgroundColor: "#6FA8DC" }} title="3-5 commits"></div>
          <div className="legend-box" style={{ backgroundColor: "#457B9D" }} title="6-8 commits"></div>
          <div className="legend-box" style={{ backgroundColor: "#1D3557" }} title="9-12 commits"></div>
          <div className="legend-box" style={{ backgroundColor: "#E63946" }} title="13+ commits"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatMapProfile;

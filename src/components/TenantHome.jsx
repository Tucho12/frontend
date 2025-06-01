import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const TenantHome = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [bookings, setBookings] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [availableProperties, setAvailableProperties] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch bookings
        const bookingsRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/bookings/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const bookingsData = bookingsRes.data;
        setBookings(bookingsData);

        // Count statuses
        const confirmed = bookingsData.filter(
          (b) => b.status === "confirmed"
        ).length;
        const cancelled = bookingsData.filter(
          (b) => b.status === "cancelled"
        ).length;
        setConfirmedCount(confirmed);
        setCancelledCount(cancelled);

        // Fetch all properties
        const allListingsRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/properties`
        );
        const allProperties = allListingsRes.data;
        setTotalProperties(allProperties.length);

        // Available = not in booked list
        const bookedPropertyIds = bookingsData.map((b) => b.property._id);
        const available = allProperties.filter(
          (p) => !bookedPropertyIds.includes(p._id)
        ).length;
        setAvailableProperties(available);
      } catch (err) {
        console.error("Failed to fetch tenant dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  
  const totalStats = confirmedCount + cancelledCount + availableProperties;

  const data = [
    { name: "Confirmed Bookings", value: confirmedCount },
    { name: "Cancelled Bookings", value: cancelledCount },
    { name: "Available Properties", value: availableProperties },
    { name: "Total Properties", value: totalProperties },
    { name: "All Bookings", value: bookings.length },
  ];
 const CustomTooltip = ({ active, payload, label }) => {
   if (active && payload && payload.length) {
     const percent = ((payload[0].value / totalStats) * 100).toFixed(1);
     return (
       <div className="bg-white border rounded p-2 shadow">
         <strong>{label}</strong>
         <br />
         Count: {payload[0].value}
         <br />({percent}% of relevant total)
       </div>
     );
   }
   return null;
 };
  return (
    <div className="container mt-4">
      <h2 style={{ marginBottom: "10px" }}>Welcome Back, Tenant</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>{dateStr}</p>

      <h4 className="mb-4">Property Summary</h4>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "30px",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height={350}
            className="responsive-chart"
          >
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ResponsiveContainer
          width="100%"
          height={350}
          className="responsive-chart"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h4 className="mb-3">Recent Bookings</h4>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <ul>
            {bookings.slice(0, 5).map((booking) => (
              <li key={booking._id}>
                🏡
                {booking.property.title} - {booking.status.toUpperCase()} on{" "}
                {new Date(booking.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TenantHome;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  Box,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import Favorite from "@mui/icons-material/Favorite";

const defaultData = {
  age: 63,
  sex: 1,
  cp: 3,
  trtbps: 150,
  chol: 290,
  fbs: 1,
  restecg: 2,
  thalachh: 110,
  exng: 1,
  oldpeak: 3.5,
  slp: 0,
  caa: 3,
  thall: 1,
  o2Saturation: 85,
};

// const defaultData = {
//   age: 45,
//   sex: 0,
//   cp: 0,
//   trtbps: 120,
//   chol: 190,
//   fbs: 0,
//   restecg: 0,
//   thalachh: 160,
//   exng: 0,
//   oldpeak: 0.0,
//   slp: 2,
//   caa: 0,
//   thall: 2,
//   o2Saturation: 98
// };


const HeartLoader = () => (
  <motion.div
    initial={{ scale: 1 }}
    animate={{ scale: [1, 1.2, 1] }}
    transition={{ duration: 0.8, repeat: Infinity }}
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#1e293b",
      padding: "20px",
      borderRadius: "50%",
      boxShadow: "0 0 25px #f87171",
    }}
  >
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
      <Favorite sx={{ color: "#f87171", fontSize: 48 }} />
    </motion.div>
  </motion.div>
);

// Dynamically load react-rewards
const RewardWrapper = ({ children, triggerReward }) => {
  const ref = useRef(null);

  useEffect(() => {
    let rewardInstance;
    const loadReward = async () => {
      const Reward = (await import("react-rewards")).default;
      rewardInstance = new Reward(ref.current, "confetti");
      if (triggerReward) rewardInstance.rewardMe();
    };
    loadReward();
  }, [triggerReward]);

  return <div ref={ref}>{children}</div>;
};

const Home = () => {
  const [formData, setFormData] = useState(defaultData);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: Number(e.target.value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("http://localhost:5000/api/predict-heart-risk", formData);
      setTimeout(() => {
        setResult(res.data);
        setLoading(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #0f172a, #1e3a8a)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      p: 4
    }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%", maxWidth: 1200 }}
      >
        <Paper elevation={10} sx={{
          p: 5,
          borderRadius: 5,
          backgroundColor: "#111827",
          color: "#fff",
          position: "relative",
        }}>
          {loading && (
            <Box sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 9,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 5
            }}>
              <HeartLoader />
            </Box>
          )}

          <Typography variant="h4" textAlign="center" fontWeight={700} mb={4} color="primary">
            <HealthAndSafetyIcon fontSize="large" /> Heart Risk Prediction
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {Object.entries(formData).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <TextField
                    fullWidth
                    label={key}
                    name={key}
                    type="number"
                    value={value}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "#9ca3af" } }}
                    inputProps={{ style: { color: "#fff" } }}
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#3b82f6" },
                        "&:hover fieldset": { borderColor: "#60a5fa" },
                        "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                      },
                    }}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    background: "#dc2626",
                    "&:hover": { background: "#ef4444" },
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    py: 1.5,
                  }}
                  startIcon={<FavoriteIcon />}
                  disabled={loading}
                >
                  Predict Risk
                </Button>
              </Grid>
            </Grid>
          </form>

          {result && (
            <Box mt={5}>
              <Divider sx={{ bgcolor: "#4b5563", mb: 3 }} />
              <Paper elevation={3} sx={{
                backgroundColor: "#1f2937",
                p: 4,
                borderRadius: 3,
                color: "#fff"
              }}>
                {result.prediction === "Low Risk" ? (
                  <RewardWrapper triggerReward={true}>
                    <Typography variant="h5" fontWeight={600} mb={2} color="green">
                      ✅ You are at Low Risk
                    </Typography>
                  </RewardWrapper>
                ) : (
                  <Typography variant="h5" fontWeight={600} mb={2} color="error">
                    ⚠️ High Risk Detected! Immediate Attention Needed
                  </Typography>
                )}

                <Typography><strong>Confidence:</strong> {result.confidence}</Typography>
                {result.estimated_heart_attack_age !== "Not Estimated" && (
                  <Typography><strong>Estimated Heart Attack Age:</strong> {result.estimated_heart_attack_age}</Typography>
                )}

                <Box mt={3}>
                  <Typography fontWeight={600} mb={1} color="warning.main">Risk Factors:</Typography>
                  <ul style={{ paddingLeft: 20 }}>
                    {result.risk_factors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </Box>

                <Box mt={3}>
                  <Typography fontWeight={600} mb={1} color="info.main">Health Summary:</Typography>
                  <ul style={{ paddingLeft: 20 }}>
                    {Object.entries(result.health_summary).map(([key, val]) => (
                      <li key={key}><strong>{key}:</strong> {val}</li>
                    ))}
                  </ul>
                </Box>

                {result.prediction === "High Risk" && (
                  <Box mt={3}>
                    <Typography variant="h6" color="error" gutterBottom>
                      🩺 Recommendations & Action Plan
                    </Typography>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>💊 Consult a cardiologist immediately.</li>
                      <li>🥦 Adopt a Mediterranean diet.</li>
                      <li>🚶 Walk or exercise 30 mins daily.</li>
                      <li>📉 Reduce stress via meditation or yoga.</li>
                      <li>💉 Monitor blood pressure and sugar regularly.</li>
                      <li>🚭 Quit smoking, limit alcohol.</li>
                    </ul>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Home;

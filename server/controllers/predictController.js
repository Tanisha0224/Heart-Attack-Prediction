import axios from "axios";

export const predictHeartRisk = async (req, res) => {
  try {
    const flaskResponse = await axios.post('http://localhost:5001/predict', req.body);

    const {
      prediction,
      confidence,
      estimated_heart_attack_age,
      health_summary,
      risk_factors
    } = flaskResponse.data;

    res.json({
      prediction,
      confidence,
      estimated_heart_attack_age,
      health_summary,
      risk_factors
    });
    
  } catch (error) {
    console.error('Error from Flask API:', error.message);
    res.status(500).json({ error: 'Something went wrong while predicting risk.' });
  }
};

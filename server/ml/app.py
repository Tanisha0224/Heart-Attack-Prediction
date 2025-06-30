from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model
with open('model/model.pkl', 'rb') as f:
    model = pickle.load(f)

# Feature order
features_order = [
    'age', 'sex', 'cp', 'trtbps', 'chol', 'fbs',
    'restecg', 'thalachh', 'exng', 'oldpeak',
    'slp', 'caa', 'thall', 'o2Saturation'
]

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    try:
        input_features = [data[feature] for feature in features_order]
    except KeyError as e:
        return jsonify({'error': f'Missing feature: {str(e)}'}), 400

    input_array = np.array(input_features).reshape(1, -1)
    prediction = model.predict(input_array)[0]
    probability = model.predict_proba(input_array)[0][prediction]

    result = "Low Risk" if prediction == 1 else "High Risk"

    risk_factors = []
    if data['trtbps'] > 140:
        risk_factors.append("High Blood Pressure")
    if data['chol'] > 240:
        risk_factors.append("High Cholesterol")
    if data['oldpeak'] > 2.0:
        risk_factors.append("ST Depression")
    if data['thalachh'] < 100:
        risk_factors.append("Low Max Heart Rate")
    if data['exng'] == 1:
        risk_factors.append("Exercise Induced Angina")
    if data['o2Saturation'] < 90:
        risk_factors.append("Low Oxygen Saturation")
    if data['caa'] > 0:
        risk_factors.append("Coronary Artery Involvement")

    # 📝 Health summary for dashboard
    health_summary = {
        "age": data["age"],
        "blood_pressure": f"{data['trtbps']} mmHg",
        "cholesterol": f"{data['chol']} mg/dL",
        "oxygen_saturation": f"{data['o2Saturation']}%",
        "max_heart_rate": f"{data['thalachh']} bpm"
    }
    age = data["age"]

    if result == "High Risk":
      
      if age < 40:
        years_to_attack = round((1 - probability) * 100)
      elif 40 <= age < 50:
        years_to_attack = round((1 - probability) * 80)
      elif 50 <= age < 60:
        years_to_attack = round((1 - probability) * 60)
      elif 60 <= age < 70:
        years_to_attack = round((1 - probability) * 40)
      else:  # age >= 70
        years_to_attack = round((1 - probability) * 20)

      estimated_attack_age = age + years_to_attack
    else:
      estimated_attack_age = None

    return jsonify({
    'prediction': result,
    'confidence': f"{round(probability * 100, 2)}%",
    'estimated_heart_attack_age': estimated_attack_age if result == "High Risk" else "Not Estimated",
    'risk_factors': risk_factors,
    'health_summary': health_summary
    })


if __name__ == '__main__':
    app.run(debug=True, port=5001)

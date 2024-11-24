import sys
import pandas as pd
import numpy as np
import pickle
import Drain3Parse

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, recall_score, accuracy_score, mean_absolute_error, r2_score
from sklearn.metrics import roc_auc_score, roc_curve
from collections import Counter
from sklearn.datasets import make_regression
from sklearn.utils import resample

def test_RF_Predictions():
    # Load the model
    with open('./data/random_forest_model_0.pkl', 'rb') as file:
        model = pickle.load(file)

        # Create a pandas DataFrame
        data = pd.DataFrame({
            'E1': [100, 98, 94, 28, 200, 22, 0, 500],       # Info
            'E2': [0, 0, 0, 153, 200, 19, 0, 25],           # Warnings
            'E3': [0, 0, 20, 0, 10, 0, 12, 0],
            'E5': [0, 0, 0, 0, 0, 0, 0, 0],
            'E6': [0, 0, 0, 0, 0, 0, 0, 0],
            
        })

        # Predict
        predictions = model.predict(data)
        print(predictions)

    return {"Predictions": predictions}


def RF_Prediction(data):
    # Load the model
    # print(data)
    with open('./data/random_forest_model_0.pkl', 'rb') as file:
        model = pickle.load(file)
        # Predict
        predictions = model.predict(data)
        if predictions[0] == 1:
            print("********************************************************")
            print("Alarm: True")
            print("********************************************************")
            return True

    return False


    
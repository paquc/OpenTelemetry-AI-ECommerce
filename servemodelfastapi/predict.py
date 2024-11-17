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
    with open('./data/random_forest_model_warns_apigateway_0.pkl', 'rb') as file:
        model = pickle.load(file)

        # Create a pandas DataFrame
        data = pd.DataFrame({
            'E1': [100, 98, 94, 28, 200, 22, 0, 500],       # Info
            'E2': [0, 0, 0, 153, 200, 19, 0, 25],           # Warnings
            'E3': [0, 0, 0, 0, 0, 832, 2, 0]                # Errors
        })

        # Predict
        predictions = model.predict(data)
        print(predictions)

    return {"Predictions": predictions}


def RF_Prediction(data):
    # Load the model
    # print(data)
    with open('./data/random_forest_model_warns_apigateway_0.pkl', 'rb') as file:
        model = pickle.load(file)
        # Predict
        predictions = model.predict(data)
        if predictions[0] == 1:
            print("********************************************************")
            print("Alarm: True")
            print("********************************************************")
            return True

    return False


    # # Load the data
    # data = pd.read_csv('data/eventslog.csv')
    # # Prepare the data
    # data['DateTime'] = pd.to_datetime(data['DateTime'])
    # data['EpochTime'] = pd.to_datetime(data['EpochTime'])
    # data['ErrorType'] = pd.to_datetime(data['ErrorType'])
    # data['Service'] = pd.to_datetime(data['Service'])
    # data['EndPoint'] = pd.to_datetime(data['EndPoint'])
    # data['DataVal1'] = pd.to_datetime(data['DataVal1'])
    # data['DataVal2'] = pd.to_datetime(data['DataVal2'])
    # data['Content'] = pd.to_datetime(data['Content'])
    
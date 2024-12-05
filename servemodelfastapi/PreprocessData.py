import pandas as pd
import sys
import os

def remove_duplicates(file_path, output_path=None):
    # Load the file
    df = pd.read_csv(file_path)
    
    # Drop duplicate rows and keep the first occurrence
    df_dedup = df.drop_duplicates(keep='first')
    
    # Define the output path
    if output_path is None:
        output_path = file_path  # Overwrite the original file if no output path is provided
    
    # Save the deduplicated data
    df_dedup.to_csv(output_path, index=False)
    
    print(f"Duplicates removed. Deduplicated file saved to {output_path}")
    return df_dedup

# ******************************************
# Function to split DataFrame based on time intervals and aggregate by Cluster ID counts
def split_and_aggregate_by_cluster(df, time_interval, error_threshold, anomaly_clusters, alarm_clusters):
    
    # Convert 'FullDateTime' to a usable datetime format for pandas
    df['FullDateTime'] = pd.to_datetime(df['DateTime'], format='%Y-%m-%d %H:%M:%S.%f')

    # Set 'Datetime' as index for time-based resampling
    df.set_index('FullDateTime', inplace=True)
    print(df.head())

    # Resample based on time intervals and count occurrences of each Cluster ID
    cluster_counts = df.groupby([pd.Grouper(freq=time_interval), 'EventId']).size().unstack(fill_value=0)
    print(f"Cluster counts: {cluster_counts.shape}")
    print(cluster_counts)

    cluster_counts_tmp = cluster_counts.copy()
    cluster_counts_tmp.reset_index(inplace=True)
    cluster_counts_tmp.to_csv(f"./data/cluster_counts.csv")

    # Initialize an empty column for the anomaly label
    cluster_counts['IsAlarm'] = '0'

    # Label the chunk as 'anomaly' based on the specified threshold and specific Cluster IDs
    for index, row in cluster_counts.iterrows():
        if anomaly_clusters:
            # Check if any of the anomaly clusters exceed the error threshold
            if row[anomaly_clusters].sum() >= error_threshold:
                # print(row[anomaly_clusters].sum())
                cluster_counts.at[index, 'IsAlarm'] = '1'
        

    # ******************************************
    # IMPORTANT!!!!!!!!!
    # Drop the columns corresponding to the Cluster IDs in anomaly_clusters
    if alarm_clusters:
        print("Dropping columns: ", alarm_clusters)
        cluster_counts.drop(columns=alarm_clusters, inplace=True)
    # ******************************************
   
    return cluster_counts

def GenMatricesV2(time_interval, error_threshold):

    logs_file = f"./data/AI-ECommerce-Learn_structured.csv"  

    # Load the parsed logs from the CSV file - STRUCTED log file
    df = pd.read_csv(logs_file)

    # Set the time interval to split the logs (e.g., '30T' for 30 minutes)
    # time_interval = '15min'  # Change to your preferred interval

    # Define the anomaly conditions (specific clusters or thresholds)
    anomaly_clusters = ['E14', 'E15', 'E16', 'E17']  # Specific clusters to label as anomaly
    alarm_clusters = []

    # error_threshold = 3  # If the sum of occurrences of these clusters in a chunk exceeds this, label as anomaly

    # Split and aggregate the DataFrame into chunks based on the specified time interval
    result_df = split_and_aggregate_by_cluster(df, time_interval, error_threshold, anomaly_clusters, alarm_clusters)

    # Reset the index to flatten the DataFrame, with time intervals as rows
    result_df.reset_index(inplace=True)

    # Display the resulting DataFrame
    print(result_df)

    #Drop DateTime column
    # cluster_counts.reset_index(drop=True, inplace=True)
    del result_df['FullDateTime']

    # Display the resulting DataFrame
    print(result_df)

    # Sort the columns in the desired order
    # Sort the columns in the desired order
    desired_order = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'IsAlarm']
    result_df = result_df.reindex(columns=desired_order)

    # Remove column that dont have an impact on predictions
    result_df.drop(columns=['E9','E2','E3','E1','E7','E6','E11','E12'], inplace=True)

    # Optionally, save the result to a new CSV file
    #result_df.to_csv('./Thunderbird_Brain_results/Thunderbird.log_structured_Preprocess_Samples.csv', index=False)
    output_file = f"./data/occurences_matrix_preprocessed_dups.csv"
    result_df.to_csv(output_file, index=False)

    output_file_dedup = f"./data/occurences_matrix_preprocessed.csv"
    remove_duplicates(output_file, output_file_dedup)

    # Delete the intermediate file with duplicates
    if os.path.exists(output_file):
        os.remove(output_file)
        print(f"Intermediate file {output_file} deleted.")
    else:
        print(f"Intermediate file {output_file} not found.")

    print(f"Preprocessing completed and saved to CSV file: {output_file}")

    # ******************************************



def split_and_aggregate_by_clusterV3(df, time_interval, error_threshold, anomaly_clusters, alarm_clusters, pred_index):
    
    # Convert 'FullDateTime' to a usable datetime format for pandas
    df['FullDateTime'] = pd.to_datetime(df['DateTime'], format='%Y-%m-%d %H:%M:%S.%f')

    # Set 'Datetime' as index for time-based resampling
    df.set_index('FullDateTime', inplace=True)
    print(df.head())

    # Resample based on time intervals and count occurrences of each Cluster ID
    cluster_counts = df.groupby([pd.Grouper(freq=time_interval), 'EventId']).size().unstack(fill_value=0)
    print(f"Cluster counts: {cluster_counts.shape}")
    print(cluster_counts)

    cluster_counts_tmp = cluster_counts.copy()
    cluster_counts_tmp.reset_index(inplace=True)
    cluster_counts_tmp.to_csv(f"./data/cluster_counts.csv")

    # Initialize an empty column for the anomaly label
    cluster_counts['IsAlarm'] = '0'

    # Label the chunk as 'anomaly' based on the specified threshold and specific Cluster IDs
    for index, row in cluster_counts.iterrows():
        row_index = cluster_counts.index.get_loc(index)
        if anomaly_clusters:
            if row_index + pred_index < len(cluster_counts):
                pred_cluster = cluster_counts.iloc[row_index + pred_index]
                # Check if any of the anomaly clusters exceed the error threshold
                if pred_cluster[anomaly_clusters].sum() >= error_threshold:
                    # print(row[anomaly_clusters].sum())
                    cluster_counts.at[index, 'IsAlarm'] = '1'
        

    # ******************************************
    # IMPORTANT!!!!!!!!!
    # Drop the columns corresponding to the Cluster IDs in anomaly_clusters
    if anomaly_clusters:
        print("Dropping columns: ", anomaly_clusters)
        cluster_counts.drop(columns=anomaly_clusters, inplace=True)
    # ******************************************
   
    return cluster_counts


def GenMatricesV3(time_interval, error_threshold, pred_index):

    logs_file = f"./data/AI-ECommerce-Learn_structured.csv"  

    # Load the parsed logs from the CSV file - STRUCTED log file
    df = pd.read_csv(logs_file)

    # Set the time interval to split the logs (e.g., '30T' for 30 minutes)
    # time_interval = '15min'  # Change to your preferred interval

    # Define the anomaly conditions (specific clusters or thresholds)
    # anomaly_clusters = ['E9', 'E10', 'E11', 'E12']  # Specific clusters to label as anomaly
    anomaly_clusters = ['E10', 'E12']  # CPU and LATANCE errors
    alarm_clusters = []

    # error_threshold = 3  # If the sum of occurrences of these clusters in a chunk exceeds this, label as anomaly

    # Split and aggregate the DataFrame into chunks based on the specified time interval
    result_df = split_and_aggregate_by_clusterV3(df, time_interval, error_threshold, anomaly_clusters, alarm_clusters, pred_index)

    # Reset the index to flatten the DataFrame, with time intervals as rows
    result_df.reset_index(inplace=True)

    # Display the resulting DataFrame
    print(result_df)

    #Drop DateTime column
    # cluster_counts.reset_index(drop=True, inplace=True)
    del result_df['FullDateTime']

    # Display the resulting DataFrame
    print(result_df)

    # Sort the columns in the desired order
    # Sort the columns in the desired order
    desired_order = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'IsAlarm']
    result_df = result_df.reindex(columns=desired_order)

    # Remove column that dont have an impact on predictions
    result_df.drop(columns=['E14', 'E12', 'E10', 'E13', 'E16', 'E17'], inplace=True)

    # Optionally, save the result to a new CSV file
    #result_df.to_csv('./Thunderbird_Brain_results/Thunderbird.log_structured_Preprocess_Samples.csv', index=False)
    output_file = f"./data/occurences_matrix_preprocessed_dups.csv"
    result_df.to_csv(output_file, index=False)

    output_file_dedup = f"./data/occurences_matrix_preprocessed.csv"
    remove_duplicates(output_file, output_file_dedup)

    # Delete the intermediate file with duplicates
    if os.path.exists(output_file):
        os.remove(output_file)
        print(f"Intermediate file {output_file} deleted.")
    else:
        print(f"Intermediate file {output_file} not found.")

    print(f"Preprocessing completed and saved to CSV file: {output_file}")

    # ******************************************
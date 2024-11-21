import pandas as pd
from collections import Counter
import fileinput
import sys
import os

# Node=an690 for 20M-10-30
# Node=dn30 for 10M

def delete_file(file_path):
    # Delete the file output_sequences_file
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"File {file_path} deleted successfully.")
    else:
        print(f"File {file_path} does not exist.")

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



# Function to find the event sequence within a specified time window
def find_event(df_logs, window_box_start_time_epoch, window_box_time_width_epoch, direction='future'):
    
    # Calculate the end epoch time for the desired time interval
    end_epoch_time = window_box_start_time_epoch + window_box_time_width_epoch

    # Filter the DataFrame to include only rows from start until the specified time interval
    sequence_df = df_logs[(df_logs['EpochTime'] >= window_box_start_time_epoch) & (df_logs['EpochTime'] <= end_epoch_time)]
    print(f"Sequence start time: {window_box_start_time_epoch}, tail time: {end_epoch_time}, Nb rows: {sequence_df.shape[0]}")
    if sequence_df.empty:
        return None

    # Get the last row of the sequence to get the end time of the sequence
    window_box_last_row_epochtime = sequence_df.iloc[-1]['EpochTime']

    return [sequence_df, window_box_last_row_epochtime]

def find_next_start(df_logs, window_box_start_time_epoch, window_box_time_width_epoch, direction='future'):
    
    # Calculate the end epoch time for the desired time interval
    end_epoch_time = window_box_start_time_epoch + window_box_time_width_epoch

    # Filter rows where 'EpochTime' is greater than the given value
    filtered_df = df_logs[df_logs['EpochTime'] >= end_epoch_time]
    if filtered_df.empty:
        return None

    next_start_epoch_time = filtered_df.iloc[0]['EpochTime']
    
    return [filtered_df, next_start_epoch_time]


def print_alarm_types(df_logs, suffix, node_name):
             
    filtered_df = df_logs[df_logs['AlertFlagLabel'] == 'VAPI'].groupby('Noeud')
        
    with open(f"./Thunderbird_Brain_results/VAPI_alarms_types_{suffix}.csv", "w") as alarm_tpes_output_file:
        VAPI_node_df = df_logs.loc[(df_logs['AlertFlagLabel'] == 'VAPI') & (df_logs['Noeud'] == node_name)]
        alarm_tpes_output_file.write(f"Number of VAPI alarms for node {node_name} in full log file: {VAPI_node_df.shape[0]}")
        alarm_tpes_output_file.write(f"\n\n")

        for noeud, group in filtered_df:
            alarm_tpes_output_file.write(f"Group for Noeud: {noeud}\n")
            alarm_tpes_output_file.write(f"{group}\n")
            alarm_tpes_output_file.write(f"\n\n")


def GenMatrices(service_name, suffix, time_window_epoch, prediction_window_epoch, moving_window_epoch, prediction_window_offset_epoch, aggregated_alarms_TH, alarm_clusters):

    logs_file = f"./data/AI-ECommerce-Learn_structured.csv"  

    # Load the log data from the CSV file
    print(f"Processing log file: {logs_file}")
    df_logs = pd.read_csv(logs_file)
    print(f"Number of log entries: {df_logs.shape[0]}")
    print(f"Last epoch time: {df_logs.iloc[-1]['EpochTime']}")
    #sys.exit(0)

    file_suffix = f"{suffix}_{service_name}_{time_window_epoch}_{prediction_window_epoch}_{moving_window_epoch}_{prediction_window_offset_epoch}"
    
    # Open the output file in write mode
    output_sequences_file = f"./data/alarm_sequences.csv"
    with open(output_sequences_file, "w") as sequences_output_file:

        print(f"Generating sequences of events within {time_window_epoch} seconds for each entry...")
        sequences_output_file.write("EventSequence,IsAlarm\n")
       
        # print_alarm_types(df_logs, suffix, node_name)
        # sys.exit(0)
        
        search_counter = 0
        
        window_box_sequence_start_time_epoch = df_logs.iloc[0]['EpochTime']

        while True:
                      
            # Get the window box
            window_box_sequence_data = find_event(df_logs, window_box_sequence_start_time_epoch, time_window_epoch, 'future')
            if window_box_sequence_data is None:
                print("No more events to process (window_box_sequence_data). Exiting...")
                break
            #print(f"Window box start time: {window_box_sequence_start_time_epoch}, tail time: {window_box_sequence_data[1]}, Nb rows: {window_box_sequence_data[0].shape[0]}, Total time: {window_box_sequence_data[0].iloc[-1]['EpochTime'] - window_box_sequence_start_time_epoch}")

            # Get the prediction window
            window_box_sequence_tail_time_epoch = window_box_sequence_data[1]
            # prediction_box_data = find_event(df_logs, window_box_sequence_tail_time_epoch, prediction_window_epoch, 'future')
            # prediction_box_data = find_event(df_logs, window_box_sequence_tail_time_epoch - prediction_window_epoch, prediction_window_epoch, 'future')
            prediction_box_data = find_event(df_logs, window_box_sequence_tail_time_epoch + prediction_window_offset_epoch, prediction_window_epoch, 'future')
            print(f"Prediction box start time: {window_box_sequence_tail_time_epoch + prediction_window_offset_epoch}, tail time: {prediction_window_epoch}")

            if prediction_box_data:
                prediction_df = prediction_box_data[0]
                #print(prediction_df.head(10))
                #print(f"Prediction box start time: {window_box_sequence_tail_time_epoch + 1}, tail time: {prediction_box_data[1]}, Total time: {prediction_df.iloc[-1]['EpochTime'] - window_box_sequence_tail_time_epoch}")

                # Filter the prediction DataFrame to keep only rows where 'Severity' is 'warn' for the desired service
                prediction_warn_service_df = prediction_df.loc[(prediction_df['Severity'] == 'warn') & (prediction_df['Service'] == service_name)]
                prediction_errors_service_df = prediction_df.loc[(prediction_df['Severity'] == 'error') & (prediction_df['Service'] == service_name)]
                #print(f"Number of warnings alarms for node {service_name} in prediction box: {prediction_warn_service_df.shape[0]}")

                # Count the number of alarms in the prediction window (shape() returns a tuple of (num_rows, num_columns))
                num_warns_service_alarms = prediction_warn_service_df.shape[0]
                num_errors_service_alarms = prediction_errors_service_df.shape[0]

                # There is an alarm if the number of warnings is greater than the threshold
                if num_warns_service_alarms >= aggregated_alarms_TH or num_errors_service_alarms >= 1:
                    is_alarm = 1
                    print(f"ALARM: Alarms detected: {num_warns_service_alarms} alarms.")
                    search_counter = 0
                else:
                    is_alarm = 0
                    if search_counter == 0:
                        print(f"NO ALARM: alarms detected: {num_warns_service_alarms} alarms. Searching...")
                    search_counter += 1
                    print(f"ALARMS searching --> {search_counter}..... ")
                    if search_counter > 10:
                        search_counter = 0

                # Filter out all events corresponfig to service in window box for sequence
                window_box_sequences_events_df = window_box_sequence_data[0]
                window_box_sequences_node_events_df = window_box_sequences_events_df.loc[window_box_sequences_events_df['Service'] == service_name]   
                # Drop rows where 'Severity' is 'info'
                # window_box_sequences_node_events_df = window_box_sequences_node_events_df[window_box_sequences_node_events_df['Severity'] != 'info']

                # Generate a sequence of EventIds within the sequence window box
                sequence_events = ','.join(window_box_sequences_node_events_df['EventId'].tolist())

                # Check if the sequence is not empty and generate the sequence
                if sequence_events:
                    # Write the sequence and label to the file (*** ensure to insert "" around the sequence ***)
                    sequences_output_file.write(f'"{sequence_events}",{is_alarm}\n')

            # Get info for NEXT window box
            df_logs_data = find_next_start(df_logs, window_box_sequence_start_time_epoch, moving_window_epoch, 'future')
            if df_logs_data is None:
                print("No more events to process (next_window_box_event_data). Exiting...")
                break
            
            df_logs = df_logs_data[0]
            window_box_sequence_start_time_epoch = df_logs_data[1]
            
        
        print(f"Output file: {output_sequences_file}")
        #sys.exit(0)


    output_sequences_file_dedup = output_sequences_file.replace(".csv", "_dedup.csv")

    # Remove diplicates from the sequences
    print("Sequences generated successfully!")
    remove_duplicates(output_sequences_file, output_sequences_file_dedup)
    delete_file(output_sequences_file)
    print("Deduplicated sequences saved successfully!")

    #sys.exit(0)
    
    # Charger le fichier de séquences d'événements générées précédemment
    df_sequences = pd.read_csv(output_sequences_file_dedup, header=0)

    #********************************************************************************************************************
    # Identifier tous les événements uniques à travers toutes les séquences d'événements
    print("Identifying unique events...")
    unique_events = set()  # Initialiser un ensemble vide pour collecter tous les événements uniques

    # Parcourir chaque séquence d'événements dans la colonne 'EventSequence' du DataFrame
    for sequence_events in df_sequences['EventSequence']:
        # Diviser chaque séquence en événements individuels et les ajouter à l'ensemble unique_events (set ignore the duplicates!!)
        unique_events.update(sequence_events.split(','))

    # Trier les événements uniques pour garantir un ordre cohérent des colonnes dans la matrice d'occurrences
    unique_events = sorted(unique_events)
    print(f"Found {len(unique_events)} unique events.")

    #********************************************************************************************************************
    # Écrire les données de la matrice d'occurrences ligne par ligne dans le fichier CSV
    matrix_output_file_path = f"./data/alarm_occurences_matrix.csv"

    # Ouvrir le fichier de sortie en mode écriture
    with open(matrix_output_file_path, 'w') as matrix_output_file:
        print(f"Generating occurrence matrix at {matrix_output_file_path}...")
        # Écrire l'en-tête (les événements uniques comme colonnes et 'IsAlarm' comme dernière colonne)
        header = ','.join(unique_events) + ',IsAlarm\n'
        matrix_output_file.write(header)

        # Parcourir chaque séquence d'événements dans la colonne 'EventSequence' du DataFrame
        for idx, row in df_sequences.iterrows():
            # Diviser la séquence en événements individuels
            events = row['EventSequence'].split(',')
            # Compter le nombre d'occurrences de chaque événement dans la séquence actuelle
            event_count = Counter(events)
            # Créer une ligne pour la matrice d'occurrences, avec chaque colonne représentant un événement unique
            # La valeur de chaque cellule est le nombre d'occurrences de cet événement dans la séquence actuelle
            matrix_row = [event_count.get(event, 0) for event in unique_events]
            # Ajouter l'étiquette 'IsAlarm' à la fin de la ligne
            matrix_row.append(row['IsAlarm'])
            # Écrire la ligne dans le fichier CSV, avec les valeurs séparées par des virgules
            matrix_output_file.write(','.join(map(str, matrix_row)) + '\n')

    print(f"Occurrence matrix generated successfully at {matrix_output_file_path}!")
    remove_duplicates(matrix_output_file_path, matrix_output_file_path.replace(".csv", "_dedup.csv"))
    delete_file(matrix_output_file_path)
    print(f"Deduplicated occurrence matrix saved successfully at {matrix_output_file_path.replace('.csv', '_dedup.csv')}")

    matrix = pd.read_csv(f"./data/alarm_occurences_matrix_dedup.csv", header=0)
    if alarm_clusters:
        matrix.drop(columns=alarm_clusters, inplace=True)
        matrix.to_csv(f"./data/alarm_occurences_matrix_final.csv", index=False)





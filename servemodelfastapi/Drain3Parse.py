import pickle
from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
import re
import pandas as pd
from drain3.file_persistence import FilePersistence


log_pattern_real_time = re.compile(
        r"(?P<Date>\d{4}-\d{2}-\d{2})\s"                      # Date: yyyy-mm-dd
        r"(?P<Time>\d{2}:\d{2}:\d{2}\.\d{3}),"                # Time: hh:mm:ss.sss
        r"(?P<Level>\w+),"                                    # Level: info, error, etc.
        r"(?P<EpochTime>\d+),"                                # Epoch Time: Unix timestamp in milliseconds
        r"(?P<Status>\w+),"                                   # Status: OK, ERROR, etc.
        r"(?P<Component>[^\s,]+),"                            # Component: Component name (e.g., apigateway)
        r"(?P<Endpoint>[^,]*),"                               # Endpoint: URL or API endpoint (e.g., /userslist)
        r"(?P<DataVal1>\d*),"                                 # Duration: Numeric value (e.g., response time)
        r"(?P<DataVal2>[^,]*),"                               # Extra Field: Optional extra field (empty in this example)
        r"(?P<Content>.*),"                                   # Message: Log message
        r"(?P<UUID>[a-f0-9\-]{36})"                           # UUID: Standard 36-character UUID format
    )


log_pattern = re.compile(
    r"(?P<FirstTimestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s"  # ISO 8601 Timestamp with nanoseconds
    r"\{name=(?P<Name>[^\}]+)\}\s"                                       # Metadata: {name=value}
    r"(?P<Date>\d{4}-\d{2}-\d{2})\s"                                     # Date: yyyy-mm-dd
    r"(?P<Time>\d{2}:\d{2}:\d{2}\.\d{3}),"                               # Time: hh:mm:ss.sss
    r"(?P<Level>\w+),"                                                   # Level: info, error, etc.
    r"(?P<EpochTime>\d+),"                                               # Epoch Time: Unix timestamp in milliseconds
    r"(?P<Status>\w+),"                                                  # Status: OK, ERROR, etc.
    r"(?P<Component>[^\s,]+),"                                           # Component: Component name (e.g., user-service)
    r"(?P<Endpoint>[^,]*),"                                              # Endpoint: URL or API endpoint (e.g., list)
    r"(?P<DataVal1>-?\d*(\.\d+)?|),"                                     # DataVal1: Integer, Float, or empty
    r"(?P<DataVal2>-?\d*(\.\d+)?|),"                                     # DataVal2: Integer, Float, or empty
    r"(?P<Content>[^,]*),"                                               # Message: Log message up to the UUID
    r"(?P<UUID>[a-f0-9\-]{36})"                                          # UUID: Standard 36-character UUID format
)


# log_pattern = re.compile(
#     r"(?P<FirstTimestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s"  # ISO 8601 Timestamp with nanoseconds
#     r"\{name=(?P<Name>[^\}]+)\}\s"                                       # Metadata: {name=value}
#     r"(?P<Date>\d{4}-\d{2}-\d{2})\s"                                     # Date: yyyy-mm-dd
#     r"(?P<Time>\d{2}:\d{2}:\d{2}\.\d{3}),"                               # Time: hh:mm:ss.sss
#     r"(?P<Level>\w+),"                                                   # Level: info, error, etc.
#     r"(?P<EpochTime>\d+),"                                               # Epoch Time: Unix timestamp in milliseconds
#     r"(?P<Status>\w+),"                                                  # Status: OK, ERROR, etc.
#     r"(?P<Component>[^\s,]+),"                                           # Component: Component name (e.g., user-service)
#     r"(?P<Endpoint>[^,]*),"                                              # Endpoint: URL or API endpoint (e.g., list)
#     r"(?P<DataVal1>\d*),"                                                # Duration: Numeric value (e.g., response time)
#     r"(?P<DataVal2>[^,]*),"                                              # Extra Field: Optional extra field (empty in this example)
#     r"(?P<Content>[^,]*),"                                               # Message: Log message up to the UUID
#     r"(?P<UUID>[a-f0-9\-]{36})"                                          # UUID: Standard 36-character UUID format
# )

# 1. New log entry comes-in: 2024-11-15 07:22:10.883,info,1731698530883,OK,apigateway,/userslist,11,,Users list fetched successfully from user-service in 11 ms
# 2. Add log message to Drain3 parser: 0,2024-11-15 07:22:10.883,info,1731698530883,OK,apigateway,/userslist,11,,Users list fetched successfully from user-service in 11 ms,E1,Users list fetched successfully from user-service in <*> ms

 # Create a pandas DataFrame
newEvent = pd.DataFrame({
    'E1': [],       # Info
    'E10': [],           # Warnings
    'E11': [],
    'E12': [],
    'E13': [],
    'E14': [],
    'E2': [],
    'E3': [],
    'E4': [],
    'E5': [],
    'E6': [],
    'E7': [],
    'E9': [],
    'E8': [],
})

newItemsCounter = 0
E1_list = 0
E2_list = 0
E3_list = 0
E4_list = 0
E5_list = 0
E6_list = 0
E7_list = 0
E8_list = 0
E9_list = 0
E10_list = 0
E11_list = 0
E12_list = 0
E13_list = 0
E14_list = 0

# E1,E10,E11,E12,E13,E14,E2,E3,E4,E5,E6,E7,E9,IsAlarm

def ParseNewEvent(log_entry, alarm_clusters):
    global E1_list
    global E2_list
    global E3_list
    global E4_list
    global E5_list
    global E6_list
    global E7_list
    global E8_list
    global E9_list
    global E10_list
    global E11_list
    global E12_list
    global E13_list
    global E14_list
    global newItemsCounter
    global newEvent

    config = TemplateMinerConfig()

    # Step 1: Train Drain model on training log data
    persistence = FilePersistence("./data/drain3_state.bin")
    drain_parser = TemplateMiner(persistence, config=config)

    # log_entry = "2024-11-15 07:22:10.883,info,1731698530883,OK,apigateway,/userslist,11,,Users list fetched successfully from user-service in 11 ms"
    # print("********************************************************")
    # print(log_entry)
    # print("********************************************************")

    match = log_pattern_real_time.match(log_entry)
    if match:
        log_content = match.group("Content")  # Extract the Content field
        result = drain_parser.add_log_message(log_content)  # Add the log message to the Drain3 parser to continue training while receiving new log entries
        result = drain_parser.match(log_content)
        if result.cluster_id == 1:
            E1_list += 1
        if result.cluster_id == 2:
            E2_list += 1
        if result.cluster_id == 3:
            E3_list += 1
        if result.cluster_id == 4:
            E4_list += 1
        if result.cluster_id == 5:
            E5_list += 1
        if result.cluster_id == 6:
            E6_list += 1
        if result.cluster_id == 7:
            E7_list += 1
        if result.cluster_id == 8:
            E8_list += 1
        if result.cluster_id == 9:
            E9_list += 1
        if result.cluster_id == 10:
            E10_list += 1
        if result.cluster_id == 11:
            E11_list += 1
        if result.cluster_id == 12:
            E12_list += 1
        if result.cluster_id == 13:
            E13_list += 1
        if result.cluster_id == 14:
            E14_list += 1

        newItemsCounter += 1

        if newItemsCounter == 200:
            newEvent = pd.DataFrame({
                'E1': [E1_list],       # Info
                'E10': [E10_list],
                'E11': [E11_list],
                'E12': [E12_list],
                'E13': [E13_list],
                'E14': [E14_list],
                'E2': [E2_list],
                'E3': [E3_list],
                'E4': [E4_list],
                'E5': [E5_list],
                'E6': [E6_list],
                'E7': [E7_list],
                'E9': [E9_list],
                'E8': [E8_list],
            })
            
            print("********************************************************")
            print("********************************************************")
            print(newEvent)
            print("********************************************************")
            print("********************************************************")

            newDataFrame = newEvent.copy()
            
            newItemsCounter = 0
            E1_list = 0
            E2_list = 0
            E3_list = 0
            E4_list = 0
            E5_list = 0
            E6_list = 0
            E7_list = 0
            E8_list = 0
            E9_list = 0
            E10_list = 0
            E11_list = 0
            E12_list = 0
            E13_list = 0
            E14_list = 0

            newEvent = pd.DataFrame({
                'E1': [],       # Info
                'E10': [],           # Warnings
                'E11': [],
                'E12': [],
                'E13': [],
                'E14': [],
                'E2': [],
                'E3': [],
                'E4': [],
                'E5': [],
                'E6': [],
                'E7': [],
                'E9': [],
                'E8': [],
            })

            if alarm_clusters:
                newDataFrame.drop(columns=alarm_clusters, inplace=True)
                print(newDataFrame)

            return newDataFrame

    return None



def Drain3ParseLearn():

    config = TemplateMinerConfig()

    # Step 1: Train Drain model on training log data
    persistence = FilePersistence("./data/drain3_state.bin")
    drain_parser = TemplateMiner(persistence, config=config)

    # Train Drain3
    with open('system_unified_log.csv', 'r') as log_file:
        for line in log_file:
            # Remove any leading/trailing whitespace from the line
            line = line.strip()
            match = log_pattern.match(line)
            if match:
                # print("Match found for line: ", line)
                log_content = match.group("Content")  # Extract the Content field
                result = drain_parser.add_log_message(log_content)
            else:
                print("No match found for line: ", line)

    log_data = []

    # Parse the log file and extract the log fields in inference mode
    with open('system_unified_log.csv', 'r') as log_file:
        for log in log_file:
            match = log_pattern.match(log)
            if match:
                date = match.group("Date")
                time = match.group("Time")
                level = match.group("Level")
                epoch_time = match.group("EpochTime")
                status = match.group("Status")
                component = match.group("Component")
                endpoint = match.group("Endpoint")
                data_val1 = match.group("DataVal1")
                data_val2 = match.group("DataVal2")
                log_content = match.group("Content")  # Extract the Content field
                uuid_content = match.group("UUID")
            
                result = drain_parser.match(log_content)

                event_id = "E" + str(result.cluster_id)
                date_time = date + " " + time
                
                log_entry = {
                    "DateTime": date_time,
                    "Severity": level,
                    "EpochTime": epoch_time,
                    "ErrorType": status,
                    "Service": component,
                    "EndPoint": endpoint,
                    "DataVal1": data_val1,
                    "DataVal2": data_val2,
                    "Content": log_content,
                    "UUID": uuid_content,
                    "EventId": event_id,
                    "EventTemplate": result.get_template(),
                }
                
                # Append the dictionary to the list
                log_data.append(log_entry)


    df = pd.DataFrame(log_data)
    df.to_csv('./data/AI-ECommerce-Learn_structured.csv')


# def Drain3Append():

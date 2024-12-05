import pickle
from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
import re
import pandas as pd
from drain3.file_persistence import FilePersistence
from collections import OrderedDict

# Log example:
# 2024-11-29 02:33:02.130,info,1732847582130,OK,product-service,list,1,,Products fetched with success in 1 ms,b579481a-ce40-4e28-9244-bd4f4899aca3
log_pattern_real_time = re.compile(
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


# Log example:
# 2024-11-27T03:55:07.458992118Z {name=a31243cb2d2b} 2024-11-27 03:55:07.397,info,1732679707397,OK,purchase-service,buy,,,Request to buy a product for ID=3,0f10d5e8-c3b1-4014-8630-65af53640e3d
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

# 1. New log entry comes-in: 2024-11-15 07:22:10.883,info,1731698530883,OK,apigateway,/userslist,11,,Users list fetched successfully from user-service in 11 ms
# 2. Add log message to Drain3 parser: 0,2024-11-15 07:22:10.883,info,1731698530883,OK,apigateway,/userslist,11,,Users list fetched successfully from user-service in 11 ms,E1,Users list fetched successfully from user-service in <*> ms

newEvent = pd.DataFrame()
newItemsCounter = 0

# Create an OrderedDict
ordered_dict = OrderedDict()

# Initialize 100 elements in the OrderedDict
for i in range(1, 25):
    ordered_dict[i] = 0

def ParseNewEvent(log_entry, events_clusters, alarm_clusters, events_stack_size):
    global newItemsCounter
    global ordered_dict
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

        ordered_dict[result.cluster_id] += 1
        newItemsCounter += 1

        event_type = "E" + str(result.cluster_id)
        # if event_type in alarm_clusters:
          
        if newItemsCounter >= events_stack_size and event_type in alarm_clusters:
            
            for key, value in ordered_dict.items():
                event = "E" + str(key)
                newEvent[event] = [value]
                # print(f"{event}: {value}")
            
            print("********************************************************")
            print("********************************************************")
            print(newEvent)
            print("********************************************************")
            print("********************************************************")

            newDataFrame = newEvent.copy()
            
            newItemsCounter = 0
            for i in range(1, 25):
                ordered_dict[i] = 0

            newEvent = newEvent.fillna(0)

            if events_clusters:
                # Keep only columns given by alarm_clusters
                newDataFrame = newDataFrame[events_clusters]
                newDataFrame.reset_index(drop=True, inplace=True)
                # newDataFrame.drop(columns=alarm_clusters, inplace=True)
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

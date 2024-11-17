import pickle
from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
import re
import pandas as pd
from drain3.file_persistence import FilePersistence


persistence = FilePersistence("./Drain3/drain3_state.bin")

config = TemplateMinerConfig()

# Step 1: Train Drain model on training log data
drain_parser = TemplateMiner(persistence, config=config)

# log_pattern = re.compile(
#     r"(?P<Date>\d{4}-\d{2}-\d{2})\s"
#     r"(?P<Time>\d{2}:\d{2}:\d{2})\s"
#     r"\[(?P<Level>\w+)\]\s"
#     r"\[(?P<Component>[^\]]+)\]\s"
#     r"(?P<Content>.*)"
# )

log_pattern = re.compile(
    r"(?P<Date>\d{4}-\d{2}-\d{2})\s"                      # Date: yyyy-mm-dd
    r"(?P<Time>\d{2}:\d{2}:\d{2}\.\d{3}),"                # Time: hh:mm:ss.sss
    r"(?P<Level>\w+),"                                    # Level: info, error, etc.
    r"(?P<EpochTime>\d+),"                                # Epoch Time: Unix timestamp in milliseconds
    r"(?P<Status>\w+),"                                   # Status: OK, ERROR, etc.
    r"(?P<Component>[^\s,]+),"                            # Component: Component name (e.g., apigateway)
    r"(?P<Endpoint>[^,]*),"                               # Endpoint: URL or API endpoint (e.g., /userslist)
    r"(?P<DataVal1>\d*),"                                 # Duration: Numeric value (e.g., response time)
    r"(?P<DataVal2>[^,]*),"                               # Extra Field: Optional extra field (empty in this example)
    r"(?P<Content>.*)"                                    # Message: Log message
)

# Train Drain3
with open('AI-ECommerce-Learn.csv', 'r') as log_file:
    for line in log_file:
        # Remove any leading/trailing whitespace from the line
        line = line.strip()
        match = log_pattern.match(line)
        if match:
            log_content = match.group("Content")  # Extract the Content field
            result = drain_parser.add_log_message(log_content)

log_data = []
with open('AI-ECommerce-Learn.csv', 'r') as log_file:
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
        
            result = drain_parser.match(log_content)

            event_id = "E" + str(result.cluster_id)

            log_entry = {
                "Date": date,
                "Time": time,
                "Severity": level,
                "EpochTime": epoch_time,
                "ErrorType": status,
                "Service": component,
                "EndPoint": endpoint,
                "DataVal1": data_val1,
                "DataVal2": data_val2,
                "Content": log_content,
                "EventId": event_id,
                "EventTemplate": result.get_template()
            }
            
            # Append the dictionary to the list
            log_data.append(log_entry)


df = pd.DataFrame(log_data)
df.to_csv('./Drain3/AI-ECommerce-Learn_structured.csv')


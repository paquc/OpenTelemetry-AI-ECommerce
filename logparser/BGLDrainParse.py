#!/usr/bin/env python

#"BGL": {
#        "log_file": "BGL/BGL_2k.log",
#        "log_format": "<Label> <Timestamp> <Date> <Node> <Time> <NodeRepeat> <Type> <Component> <Level> <Content>",
#        "regex": [r"core\.\d+"],
#        "maxChildNum": 4,
 #       "mergeThreshold": 0.005,
 #       "formatLookupThreshold": 0.3,
 #       "superFormatThreshold": 0.85,
 #   },

import sys  # Import the sys module to manipulate the Python runtime environment
sys.path.append('../../')  # Add the parent directory to the system path so that modules from the parent directory can be imported

# Import the LogParser class from the Drain log parser module
from logparser.Drain import LogParser

# Define the directory containing the log file to be parsed
input_dir = '../../data/BGL/'  # Path to the directory containing the log file

# Define the directory where the parsing results will be saved
output_dir = '../../data/BGL/BGL_full_results/'  # Output directory for the parsed results

# Specify the log file to be parsed
log_file = 'BGL.log'  # The name of the input log file

# Define the log format that corresponds to the structure of the log file
log_format = '<AlertFlagLabel> <EpochTime> <Date> <NodeLoc> <FullDateTime> <NodeLocSecond> <Type> <SubSys> <Severity> <Content>'
# Explanation: 
# <Content> : MANDATORY !!

# A list of regular expressions for optional preprocessing. These are used to mask out certain patterns from the log content.
regex = [
    #r"core\.\d+",
    #r'blk_(|-)[0-9]+',  # Block IDs
    #r'(/|)([0-9]+\.){3}[0-9]+(:[0-9]+|)(:|)',  # IP addresses
    #r'(?<=[^A-Za-z0-9])(\-?\+?\d+)(?=[^A-Za-z0-9])|[0-9]+$',  # Numbers  
]

# Set the similarity threshold for log grouping
st = 0.005  # Similarity threshold; determines how similar two log messages should be to be grouped under the same template
# A lower value makes the parser more sensitive to differences in log messages.

# Set the depth of the parsing tree
depth = 4  # The maximum depth of the parsing tree, which defines how specific the log templates can be
# A higher depth allows for more detailed templates but increases the computational complexity.

# Initialize the LogParser with the specified parameters
parser = LogParser(
    log_format,      # Log format as defined above
    indir=input_dir,  # Input directory containing the log file
    outdir=output_dir,  # Output directory for the results
    depth=depth,      # Depth of the parsing tree
    st=st,            # Similarity threshold
    rex=regex         # List of regular expressions for preprocessing
)

# Parse the log file using the parser
parser.parse(log_file)  # This processes the log file and writes the results to the specified output directory

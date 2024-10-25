import pandas as pd

# Read the CSV file with the specified format
input_file = './BGL_Brain_results/BGL.log_templates.csv' 
df = pd.read_csv(input_file, header=None, names=["EventID", "Description", "Count"])

# Reshape the data to have EventIDs as columns and the counts as the values
output_df = df.set_index("EventID").T.drop("Description")

# Save the output to a new CSV file
output_file = './BGL_Brain_results/BGL_Events_Matrix.csv'  # Replace with your desired output file name
output_df.to_csv(output_file, index=False)

# Display the result
print(output_df)
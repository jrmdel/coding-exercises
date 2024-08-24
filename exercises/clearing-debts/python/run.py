import json
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(current_dir, "..", "data.json")

with open(path, 'r') as file:
  data = json.load(file)

print(data)

import json
import os

path = os.path.join("..", "data.json")

with open(path, 'r') as file:
  data = json.load(file)

print(data)

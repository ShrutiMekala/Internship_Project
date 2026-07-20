import pandas as pd
import json

play = pd.read_csv('play_clean.csv')

# Categories not starting with A, C, G, S
excluded_letters = ('A','C','G','S')
elig = play[~play['Category'].str.startswith(excluded_letters)]

cat_installs = elig.groupby('Category')['Installs_clean'].sum().sort_values(ascending=False)
print("All eligible categories by installs:\n", cat_installs)

top5 = cat_installs.head(5)
print("\nTop 5 (excluding A/C/G/S):\n", top5)

result = []
for cat, installs in top5.items():
    result.append({
        'category': cat,
        'total_installs': int(installs),
        'highlight': bool(installs > 1_000_000)
    })
print(json.dumps(result, indent=2))
with open('chart2_data.json','w') as f:
    json.dump(result, f, indent=2)

import pandas as pd
import numpy as np
import json

play = pd.read_csv('play_clean.csv')

# Filters
f = play[
    (~play['App'].astype(str).str.lower().str.startswith(('x','y','z'))) &
    (play['Category'].str.startswith(('E','C','B'))) &
    (play['Reviews_clean'] > 500) &
    (~play['App'].astype(str).str.contains('S', case=False, na=False)) &
    (play['Last_Updated_dt'].notna())
].copy()

print("Rows after filters:", len(f))
print(f['Category'].value_counts())

# Monthly total installs per category (using Last Updated year-month as time axis)
monthly = f.groupby(['Category','Last_Updated_ym'])['Installs_clean'].sum().reset_index()
monthly = monthly.sort_values(['Category','Last_Updated_ym'])

result = {}
for cat, grp in monthly.groupby('Category'):
    grp = grp.sort_values('Last_Updated_ym')
    months = grp['Last_Updated_ym'].tolist()
    installs = grp['Installs_clean'].tolist()
    pct_changes = [None]
    for i in range(1, len(installs)):
        prev = installs[i-1]
        pct = ((installs[i]-prev)/prev*100) if prev>0 else None
        pct_changes.append(pct)
    result[cat] = {
        'months': months,
        'installs': installs,
        'pct_change': pct_changes,
        'high_growth_months': [months[i] for i,p in enumerate(pct_changes) if p is not None and p>20]
    }

print(json.dumps(result, indent=2)[:3000])
with open('chart4_data.json','w') as f2:
    json.dump(result, f2, indent=2)

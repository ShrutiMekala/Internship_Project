import pandas as pd
import numpy as np
import json
import re

play = pd.read_csv('play_clean.csv')

f = play[
    (play['Rating_clean'] >= 4.2) &
    (~play['App'].astype(str).str.contains(r'\d', na=False)) &
    (play['Category'].str.startswith(('T','P'))) &
    (play['Reviews_clean'] > 1000) &
    (play['Size_MB'] >= 20) & (play['Size_MB'] <= 80) &
    (play['Last_Updated_dt'].notna())
].copy()

print("Rows after filters:", len(f))
print(f['Category'].value_counts())

monthly = f.groupby(['Category','Last_Updated_ym'])['Installs_clean'].sum().reset_index()
monthly = monthly.sort_values(['Category','Last_Updated_ym'])

all_months = sorted(monthly['Last_Updated_ym'].unique())

result = {}
for cat, grp in monthly.groupby('Category'):
    s = grp.set_index('Last_Updated_ym')['Installs_clean'].astype(np.int64)
    s = s.reindex(all_months, fill_value=0)
    cum = s.cumsum()
    grp = s
    installs_list = grp.tolist()
    pct_changes = [None]
    for i in range(1, len(installs_list)):
        prev = installs_list[i-1]
        pct = ((installs_list[i]-prev)/prev*100) if prev>0 else None
        pct_changes.append(pct)
    result[cat] = {
        'months': all_months,
        'monthly_installs': installs_list,
        'cumulative_installs': cum.tolist(),
        'pct_change': pct_changes,
        'high_growth_months': [all_months[i] for i,p in enumerate(pct_changes) if p is not None and p>25]
    }

label_translations = {
    'TRAVEL_AND_LOCAL': 'Voyages et Local',
    'PRODUCTIVITY': 'Productividad',
    'PHOTOGRAPHY': '写真'
}

print(list(result.keys()))
with open('chart6_data.json','w') as f2:
    json.dump({'data': result, 'translations': label_translations, 'all_months': all_months}, f2, indent=2)

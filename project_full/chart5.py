import pandas as pd
import numpy as np
import json

play = pd.read_csv('play_clean.csv')
rev_agg = pd.read_csv('review_agg.csv')

merged = play.merge(rev_agg, on='App', how='inner')  # need sentiment data present

target_cats = ['GAME','BEAUTY','BUSINESS','COMICS','COMMUNICATION','DATING','ENTERTAINMENT','SOCIAL','EVENTS']

f = merged[
    (merged['Rating_clean'] > 3.5) &
    (merged['Category'].isin(target_cats)) &
    (merged['Reviews_clean'] > 500) &
    (~merged['App'].astype(str).str.contains('S', case=False, na=False)) &
    (merged['Avg_Sentiment_Subjectivity'] > 0.5) &
    (merged['Installs_clean'] > 50000) &
    (merged['Size_MB'].notna())
].copy()

print("Rows after filters:", len(f))
print(f['Category'].value_counts())

label_translations = {
    'BEAUTY': 'ब्यूटी',
    'BUSINESS': 'வணிகம்',
    'DATING': 'Dating (Partnersuche)'
}

records = []
for _, row in f.iterrows():
    cat = row['Category']
    records.append({
        'app': row['App'],
        'category': cat,
        'category_label': label_translations.get(cat, cat),
        'size_mb': round(row['Size_MB'],2),
        'rating': round(row['Rating_clean'],2),
        'installs': int(row['Installs_clean']),
        'reviews': int(row['Reviews_clean']),
        'subjectivity': round(row['Avg_Sentiment_Subjectivity'],3)
    })

print(json.dumps(records[:3], indent=2))
with open('chart5_data.json','w') as f2:
    json.dump(records, f2, indent=2)
print("Total records:", len(records))

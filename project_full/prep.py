import pandas as pd
import numpy as np
import re
import json

play = pd.read_csv('/mnt/user-data/uploads/Play_Store_Data.csv')
reviews = pd.read_csv('/mnt/user-data/uploads/User_Reviews.csv')

play = play.drop_duplicates(subset='App', keep='first')
# drop malformed rows (category '1.9' etc.)
valid_categories = set(play['Category'].dropna().unique()) - {'1.9'}
play = play[play['Category'].isin(valid_categories)].copy()

# Installs
play['Installs_clean'] = play['Installs'].astype(str).str.replace(',', '', regex=False).str.replace('+', '', regex=False)
play = play[play['Installs_clean'].str.isnumeric()]
play['Installs_clean'] = play['Installs_clean'].astype(np.int64)

# Reviews
play['Reviews_clean'] = pd.to_numeric(play['Reviews'], errors='coerce')

# Rating
play['Rating_clean'] = pd.to_numeric(play['Rating'], errors='coerce')

# Price -> revenue
play['Price_clean'] = play['Price'].astype(str).str.replace('$','',regex=False).str.strip()
play['Price_clean'] = pd.to_numeric(play['Price_clean'], errors='coerce').fillna(0)
play['Revenue'] = play['Price_clean'] * play['Installs_clean']

# Size -> MB
def size_to_mb(s):
    if pd.isna(s): return np.nan
    s = str(s).strip()
    if s in ('Varies with device',''): return np.nan
    try:
        if s.endswith('M'): return float(s[:-1])
        if s.endswith(('k','K')): return float(s[:-1])/1024
        return float(s)
    except ValueError:
        return np.nan
play['Size_MB'] = play['Size'].apply(size_to_mb)

# Android ver
def android_ver_to_num(v):
    if pd.isna(v): return np.nan
    v = str(v).strip()
    if v in ('Varies with device',''): return np.nan
    m = re.match(r'(\d+(\.\d+)?)', v)
    return float(m.group(1)) if m else np.nan
play['Android_Ver_num'] = play['Android Ver'].apply(android_ver_to_num)

play['App_name_len'] = play['App'].astype(str).str.len()

# Last updated
play['Last_Updated_dt'] = pd.to_datetime(play['Last Updated'], errors='coerce')
play['Last_Updated_month'] = play['Last_Updated_dt'].dt.month
play['Last_Updated_year'] = play['Last_Updated_dt'].dt.year
play['Last_Updated_ym'] = play['Last_Updated_dt'].dt.to_period('M').astype(str)

print("Cleaned play store rows:", len(play))
play.to_csv('play_clean.csv', index=False)

# Average sentiment subjectivity per app
rev_agg = reviews.groupby('App')['Sentiment_Subjectivity'].mean().reset_index()
rev_agg.columns = ['App', 'Avg_Sentiment_Subjectivity']
rev_agg.to_csv('review_agg.csv', index=False)
print("Apps with review sentiment data:", len(rev_agg))

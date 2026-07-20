import pandas as pd, json
play = pd.read_csv('play_clean.csv')

app_filtered = play[
    (play['Size_MB'] >= 10) &
    (play['Last_Updated_month'] == 1) &
    (play['Rating_clean'].notna())
].copy()

cat_agg = app_filtered.groupby('Category').agg(
    Total_Installs=('Installs_clean','sum'),
    Avg_Rating=('Rating_clean','mean'),
    Total_Reviews=('Reviews_clean','sum'),
).reset_index()

top10 = cat_agg.sort_values('Total_Installs', ascending=False).head(10)
final_cats = top10[top10['Avg_Rating'] >= 4.0].copy()
final_cats = final_cats.sort_values('Total_Installs', ascending=False)

result = [{'category': r['Category'], 'avg_rating': round(r['Avg_Rating'],2), 'total_reviews': int(r['Total_Reviews'])} for _, r in final_cats.iterrows()]
print(json.dumps(result, indent=2))
with open('chart1_data.json','w') as f:
    json.dump(result, f, indent=2)

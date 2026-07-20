import pandas as pd, json
play = pd.read_csv('play_clean.csv')
play = play[play['Type'].isin(['Free','Paid'])]

common = (
    (play['Installs_clean'] >= 10000) &
    (play['Android_Ver_num'] > 4.0) &
    (play['Size_MB'] > 15) &
    (play['Content Rating'] == 'Everyone') &
    (play['App_name_len'] <= 30)
)
base = play[common].copy()
final = base[(base['Type']=='Free') | ((base['Type']=='Paid') & (base['Revenue']>=10000))].copy()

cat_totals = final.groupby('Category')['Installs_clean'].sum().sort_values(ascending=False)
top3 = cat_totals.head(3).index.tolist()
top3_df = final[final['Category'].isin(top3)]

summary = top3_df.groupby(['Category','Type']).agg(
    Avg_Installs=('Installs_clean','mean'),
    Avg_Revenue=('Revenue','mean'),
).reset_index()

result = {}
for cat in top3:
    result[cat] = {}
    for _, row in summary[summary['Category']==cat].iterrows():
        result[cat][row['Type']] = {'avg_installs': round(row['Avg_Installs'],2), 'avg_revenue': round(row['Avg_Revenue'],2)}

print(json.dumps(result, indent=2))
with open('chart3_data.json','w') as f:
    json.dump(result, f, indent=2)

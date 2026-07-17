# 📱 Google Play Store Data Analysis

A data analysis and visualization project exploring app performance, user sentiment, and market trends on the **Google Play Store**, built with Python.

## 📌 Overview

This project cleans and analyzes two datasets — app listings and user reviews — to uncover insights about app categories, ratings, installs, and user sentiment. It wraps up with an **interactive HTML dashboard** built from Plotly charts.

## 📂 Datasets

| File | Description |
|---|---|
| `Play Store Data.csv` | App-level metadata (category, installs, rating, reviews, type, genre, last updated, etc.) |
| `User Reviews.csv` | User review text with sentiment polarity and subjectivity scores |

## 🛠️ Tech Stack

- **Python** — pandas, numpy
- **NLTK** (VADER) — sentiment analysis of review text
- **Plotly Express** — interactive charts
- **HTML/CSS** — custom dashboard layout

## 🔄 Workflow

1. **Data Loading** — Import app and review datasets with pandas
2. **Data Cleaning**
   - Fill missing values using column mode
   - Remove duplicate rows
   - Convert `Reviews`, `Installs`, `Rating`, `Sentiment_Polarity`, and `Last Updated` to proper numeric/date types
   - Strip whitespace from column names
3. **Feature Engineering**
   - Categorize apps by install count (`Very Popular`, `Popular`, `Average`, `Less Popular`)
   - Extract `Year` from the last update date
4. **Sentiment Analysis** — Score review text using NLTK's VADER sentiment analyzer
5. **Visualization** — Generate 10 interactive Plotly charts covering categories, ratings, sentiment, installs, and trends over time
6. **Dashboard Export** — Combine all charts into a single interactive `web page.html` dashboard

## 📊 Visualizations

- Top app categories on the Play Store
- App type distribution (Free vs Paid)
- App rating distribution
- User review sentiment distribution
- Top 10 categories by number of apps
- App updates over the years
- Top categories by total installs
- Top 10 app genres
- Reviews vs. rating by category (scatter)
- Rating distribution by category (box plot)

## 🚀 How to Run

1. Install dependencies:
   ```bash
   pip install pandas numpy nltk plotly pytz
   ```
2. Download NLTK's VADER lexicon (first run only):
   ```python
   import nltk
   nltk.download('vader_lexicon')
   ```
3. Place `Play Store Data.csv` and `User Reviews.csv` in the project directory
4. Run the notebook `Training_project.ipynb` cell by cell
5. Open the generated dashboard at `output/web page.html` in your browser

## 📁 Output

Running the notebook creates an `output/` folder containing the final interactive dashboard (`web page.html`) with all charts embedded.

## 📝 Notes

This is a learning/training project focused on practicing the end-to-end data analysis workflow: cleaning messy real-world data, deriving features, running sentiment analysis, and building an interactive dashboard — from raw CSVs to a shareable HTML report.

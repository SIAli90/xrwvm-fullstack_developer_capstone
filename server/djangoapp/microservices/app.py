import json
import os

import nltk
from flask import Flask
from nltk.sentiment import SentimentIntensityAnalyzer

app = Flask('Sentiment Analyzer')

# The starter repository already contains sentiment/vader_lexicon.zip.
# Adding this directory lets NLTK use the bundled data without downloading it.
nltk.data.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sia = SentimentIntensityAnalyzer()


@app.get('/')
def home():
    return 'Welcome to the Sentiment Analyzer. Use /analyze/text to get the sentiment'


@app.get('/analyze/<path:input_txt>')
def analyze_sentiment(input_txt):
    scores = sia.polarity_scores(input_txt)
    compound = scores['compound']
    if compound >= 0.05:
        sentiment = 'positive'
    elif compound <= -0.05:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    return app.response_class(
        response=json.dumps({'sentiment': sentiment}),
        status=200,
        mimetype='application/json',
    )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)

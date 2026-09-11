import json
import os
from pathlib import Path
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv('backend_url', 'http://localhost:3030').strip()
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    'http://localhost:5050/',
).strip().rstrip('/')

DATA_DIR = Path(__file__).resolve().parents[1] / 'database' / 'data'
RUNTIME_REVIEWS = DATA_DIR / 'runtime_reviews.json'


def _load_json(name):
    with (DATA_DIR / name).open('r', encoding='utf-8') as handle:
        return json.load(handle)


def _runtime_reviews():
    if not RUNTIME_REVIEWS.exists():
        return []
    try:
        with RUNTIME_REVIEWS.open('r', encoding='utf-8') as handle:
            return json.load(handle)
    except (json.JSONDecodeError, OSError):
        return []


def _local_get(endpoint):
    """Fallback implementation using the starter JSON datasets."""
    clean = '/' + endpoint.strip('/')
    dealers = _load_json('dealerships.json').get('dealerships', [])
    reviews = _load_json('reviews.json').get('reviews', []) + _runtime_reviews()

    if clean == '/fetchDealers':
        return dealers
    if clean.startswith('/fetchDealers/'):
        state = clean.rsplit('/', 1)[-1]
        if state.lower() == 'all':
            return dealers
        return [d for d in dealers if str(d.get('state', '')).lower() == state.lower()]
    if clean.startswith('/fetchDealer/'):
        dealer_id = int(clean.rsplit('/', 1)[-1])
        return [d for d in dealers if int(d.get('id', -1)) == dealer_id]
    if clean.startswith('/fetchReviews/dealer/'):
        dealer_id = int(clean.rsplit('/', 1)[-1])
        return [r for r in reviews if int(r.get('dealership', -1)) == dealer_id]
    if clean == '/fetchReviews':
        return reviews
    raise ValueError(f'Unsupported local endpoint: {endpoint}')


def get_request(endpoint, **kwargs):
    """GET JSON from Node, falling back to bundled data for one-service deploys."""
    request_url = f"{backend_url.rstrip('/')}/{endpoint.lstrip('/')}"
    try:
        response = requests.get(request_url, params=kwargs or None, timeout=4)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return _local_get(endpoint)


def analyze_review_sentiments(text):
    """Return Flask sentiment JSON, with a deterministic local fallback."""
    request_url = f"{sentiment_analyzer_url}/analyze/{quote(text, safe='')}"
    try:
        response = requests.get(request_url, timeout=4)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        value = text.lower()
        positive = ('fantastic', 'excellent', 'great', 'friendly', 'helpful', 'amazing', 'love', 'good')
        negative = ('bad', 'terrible', 'awful', 'slow', 'rude', 'hate', 'poor')
        score = sum(word in value for word in positive) - sum(word in value for word in negative)
        return {'sentiment': 'positive' if score > 0 else 'negative' if score < 0 else 'neutral'}


def post_review(data_dict):
    """Post to Node or persist locally when the Node service is unavailable."""
    request_url = f"{backend_url.rstrip('/')}/insert_review"
    try:
        response = requests.post(request_url, json=data_dict, timeout=4)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        existing = _load_json('reviews.json').get('reviews', []) + _runtime_reviews()
        new_review = dict(data_dict)
        new_review['id'] = max([int(r.get('id', 0)) for r in existing] or [0]) + 1
        runtime = _runtime_reviews()
        runtime.append(new_review)
        with RUNTIME_REVIEWS.open('w', encoding='utf-8') as handle:
            json.dump(runtime, handle, indent=2)
        return new_review

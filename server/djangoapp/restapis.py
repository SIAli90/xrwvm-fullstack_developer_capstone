import os
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv('backend_url', 'http://localhost:3030').strip()
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    'http://localhost:5050/',
).strip().rstrip('/')


def get_request(endpoint, **kwargs):
    """GET JSON data from the Node dealership service."""
    request_url = f"{backend_url.rstrip('/')}/{endpoint.lstrip('/')}"
    response = requests.get(request_url, params=kwargs or None, timeout=10)
    response.raise_for_status()
    return response.json()


def analyze_review_sentiments(text):
    """Return sentiment JSON from the Flask sentiment service."""
    request_url = f"{sentiment_analyzer_url}/analyze/{quote(text, safe='')}"
    response = requests.get(request_url, timeout=10)
    response.raise_for_status()
    return response.json()


def post_review(data_dict):
    """Post a review to the Node dealership service."""
    request_url = f"{backend_url.rstrip('/')}/insert_review"
    response = requests.post(request_url, json=data_dict, timeout=10)
    response.raise_for_status()
    return response.json()

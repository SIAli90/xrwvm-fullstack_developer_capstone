import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import analyze_review_sentiments, get_request, post_review

logger = logging.getLogger(__name__)


def _json_body(request):
    try:
        return json.loads(request.body or '{}')
    except (json.JSONDecodeError, TypeError):
        return {}


@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'Method Not Allowed'}, status=405)

    data = _json_body(request)
    username = data.get('userName', '').strip()
    password = data.get('password', '')
    user = authenticate(username=username, password=password)

    if user is None:
        return JsonResponse({'userName': username, 'status': 'Failed'}, status=401)

    login(request, user)
    return JsonResponse({
        'userName': user.username,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'status': 'Authenticated',
    })


def logout_request(request):
    logout(request)
    return JsonResponse({'userName': '', 'status': 'Logged out'})


@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'Method Not Allowed'}, status=405)

    data = _json_body(request)
    username = data.get('userName', '').strip()
    password = data.get('password', '')
    first_name = data.get('firstName', '').strip()
    last_name = data.get('lastName', '').strip()
    email = data.get('email', '').strip()

    if not all([username, first_name, last_name, email, password]):
        return JsonResponse(
            {'status': 'Failed', 'error': 'All registration fields are required'},
            status=400,
        )

    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {'userName': username, 'status': 'Failed', 'error': 'Already Registered'},
            status=409,
        )

    user = User.objects.create_user(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
    )
    login(request, user)
    return JsonResponse({'userName': username, 'status': 'Authenticated'}, status=201)


def get_dealerships(request, state='All'):
    endpoint = '/fetchDealers' if state.lower() == 'all' else f'/fetchDealers/{state}'
    try:
        dealerships = get_request(endpoint)
        return JsonResponse({'status': 200, 'dealers': dealerships})
    except Exception as exc:
        logger.exception('Unable to retrieve dealerships: %s', exc)
        return JsonResponse(
            {'status': 503, 'dealers': [], 'message': 'Dealer service unavailable'},
            status=503,
        )


def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request(f'/fetchReviews/dealer/{dealer_id}')
        for review_detail in reviews:
            try:
                sentiment = analyze_review_sentiments(review_detail.get('review', ''))
                review_detail['sentiment'] = sentiment.get('sentiment', 'neutral')
            except Exception:
                review_detail['sentiment'] = 'neutral'
        return JsonResponse({'status': 200, 'reviews': reviews})
    except Exception as exc:
        logger.exception('Unable to retrieve dealer reviews: %s', exc)
        return JsonResponse(
            {'status': 503, 'reviews': [], 'message': 'Review service unavailable'},
            status=503,
        )


def get_dealer_details(request, dealer_id):
    try:
        dealership = get_request(f'/fetchDealer/{dealer_id}')
        return JsonResponse({'status': 200, 'dealer': dealership})
    except Exception as exc:
        logger.exception('Unable to retrieve dealer details: %s', exc)
        return JsonResponse(
            {'status': 503, 'dealer': [], 'message': 'Dealer service unavailable'},
            status=503,
        )


@csrf_exempt
def add_review(request):
    if request.method != 'POST':
        return JsonResponse({'status': 405, 'message': 'POST required'}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({'status': 403, 'message': 'Unauthorized'}, status=403)

    data = _json_body(request)
    required = ['dealership', 'review', 'purchase_date', 'car_make', 'car_model', 'car_year']
    if any(data.get(field) in (None, '') for field in required):
        return JsonResponse({'status': 400, 'message': 'Missing review fields'}, status=400)

    if not data.get('name'):
        data['name'] = request.user.get_full_name() or request.user.username

    try:
        saved_review = post_review(data)
        return JsonResponse({'status': 200, 'review': saved_review})
    except Exception as exc:
        logger.exception('Unable to post review: %s', exc)
        return JsonResponse({'status': 503, 'message': 'Unable to post review'}, status=503)


def get_cars(request):
    if CarMake.objects.count() == 0:
        initiate()

    car_makes = [
        {'name': make.name, 'description': make.description}
        for make in CarMake.objects.order_by('name')
    ]
    car_models = CarModel.objects.select_related('car_make').all()
    cars = [
        {
            'CarModel': car_model.name,
            'CarMake': car_model.car_make.name,
            'CarType': car_model.type,
            'CarYear': car_model.year,
        }
        for car_model in car_models
    ]
    return JsonResponse({
        'status': 200,
        'CarMakes': car_makes,
        'CarModels': cars,
    })


def analyze_review(request, text):
    try:
        result = analyze_review_sentiments(text)
        return JsonResponse({'text': text, **result})
    except Exception as exc:
        logger.exception('Unable to analyze review: %s', exc)
        return JsonResponse({'text': text, 'sentiment': 'unavailable'}, status=503)

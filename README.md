# Cars Dealership — Full Stack Application Development Capstone

**Repository name:** `xrwvm-fullstack_developer_capstone`

**Project name:** `Cars Dealership`

Cars Dealership is a full-stack Django/React application for discovering car dealerships, filtering dealers by state, viewing customer reviews, registering and authenticating users, and posting sentiment-labelled dealership reviews.

## Technology stack

- Django and SQLite for authentication, car makes/models, API routing, and administration
- React for the dealership, authentication, and review user interface
- Node.js, Express, MongoDB/Mongoose for dealership and review data
- Flask/NLTK for review sentiment analysis
- GitHub Actions for CI

## Main application routes

- `/` — landing page
- `/about` — About Us
- `/contact` — Contact Us
- `/dealers` — all dealerships
- `/login` — user login
- `/register` — user registration
- `/dealer/<id>` — dealership details and reviews
- `/postreview/<id>` — post a dealership review

## Main API routes

- `POST /djangoapp/login`
- `GET /djangoapp/logout`
- `POST /djangoapp/register`
- `GET /djangoapp/get_dealers`
- `GET /djangoapp/get_dealers/<state>`
- `GET /djangoapp/dealer/<id>`
- `GET /djangoapp/reviews/dealer/<id>`
- `GET /djangoapp/get_cars`
- `POST /djangoapp/add_review`

## Local development

```bash
cd server
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
cd database && docker compose up -d && cd ..
cd djangoapp/microservices && python app.py & cd ../..
cd frontend && npm install && npm run build && cd ..
python manage.py runserver
```

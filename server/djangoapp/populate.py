from .models import CarMake, CarModel


def initiate():
    """Seed a small set of car makes/models used by the review form."""
    car_make_data = [
        ('Nissan', 'Japanese vehicle manufacturer'),
        ('Mercedes', 'German luxury vehicle manufacturer'),
        ('Audi', 'German premium vehicle manufacturer'),
        ('Kia', 'South Korean vehicle manufacturer'),
        ('Toyota', 'Japanese vehicle manufacturer'),
    ]

    makes = {}
    for name, description in car_make_data:
        make, _ = CarMake.objects.get_or_create(
            name=name,
            defaults={'description': description},
        )
        makes[name] = make

    car_model_data = [
        ('Nissan', 'Pathfinder', 'SUV', 2023),
        ('Nissan', 'Qashqai', 'SUV', 2023),
        ('Nissan', 'X-Trail', 'SUV', 2023),
        ('Mercedes', 'A-Class', 'SEDAN', 2023),
        ('Mercedes', 'C-Class', 'SEDAN', 2023),
        ('Mercedes', 'GLE', 'SUV', 2023),
        ('Audi', 'A4', 'SEDAN', 2023),
        ('Audi', 'A5', 'COUPE', 2023),
        ('Audi', 'Q5', 'SUV', 2023),
        ('Kia', 'Seltos', 'SUV', 2022),
        ('Kia', 'Sorento', 'SUV', 2023),
        ('Kia', 'Cerato', 'SEDAN', 2023),
        ('Toyota', 'Corolla', 'SEDAN', 2023),
        ('Toyota', 'Camry', 'SEDAN', 2023),
        ('Toyota', 'RAV4', 'SUV', 2023),
    ]

    for make_name, model_name, car_type, year in car_model_data:
        CarModel.objects.get_or_create(
            car_make=makes[make_name],
            name=model_name,
            year=year,
            defaults={'type': car_type},
        )

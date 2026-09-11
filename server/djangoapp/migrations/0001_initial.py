from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='CarMake',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='CarModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(choices=[('SEDAN', 'Sedan'), ('SUV', 'SUV'), ('WAGON', 'Wagon'), ('TRUCK', 'Truck'), ('COUPE', 'Coupe')], default='SUV', max_length=10)),
                ('year', models.IntegerField(default=2023, validators=[MinValueValidator(2015), MaxValueValidator(2023)])),
                ('car_make', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='car_models', to='djangoapp.carmake')),
            ],
            options={
                'ordering': ['car_make__name', 'name', '-year'],
                'unique_together': {('car_make', 'name', 'year')},
            },
        ),
    ]

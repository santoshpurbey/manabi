# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2015-09-06 18:49
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flashcards', '0003_add_duration_fields'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='card',
            name='interval',
        ),
        migrations.RemoveField(
            model_name='card',
            name='last_interval',
        ),
        migrations.RenameField(
            model_name='card',
            old_name='new_interval',
            new_name='interval',
        ),
        migrations.RenameField(
            model_name='card',
            old_name='new_last_interval',
            new_name='last_interval',
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-09-03 18:42
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('flashcards', '0018_cardhistory_n_interval'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cardhistory',
            name='interval',
        ),
    ]

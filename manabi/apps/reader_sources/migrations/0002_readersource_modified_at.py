# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2017-12-11 13:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reader_sources', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='readersource',
            name='modified_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
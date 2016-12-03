# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2016-12-03 21:27
from __future__ import unicode_literals

import autoslug.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('flashcards', '0031_drop_deck_slug_to_retry'),
    ]

    operations = [
        migrations.AddField(
            model_name='deck',
            name='slug',
            field=autoslug.fields.AutoSlugField(always_update=True, blank=True, editable=False, populate_from=b'name'),
        ),
    ]
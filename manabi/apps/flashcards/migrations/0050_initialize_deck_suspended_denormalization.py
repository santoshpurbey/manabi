# -*- coding: utf-8 -*-
# Generated by Django 1.11a1 on 2017-02-18 20:07
from __future__ import unicode_literals

from django.db import migrations


def forwards(apps, schema_editor):
    Card = apps.get_model('flashcards', 'Card')

    for card in Card.objects.all().select_related('deck').iterator():
        card.deck_suspended = card.deck.suspended
        card.save(update_fields=['deck_suspended'])


class Migration(migrations.Migration):

    dependencies = [
        ('flashcards', '0049_card_deck_suspended'),
    ]

    operations = [
        migrations.RunPython(forwards)
    ]
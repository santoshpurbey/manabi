import django.dispatch
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete, pre_delete
from manabi.apps.flashcards.models import Card

fact_suspended = django.dispatch.Signal()
fact_unsuspended = django.dispatch.Signal()
fact_deleted = django.dispatch.Signal()

########################################################################

# This signal is used to invalidate the cache on our fact grid views.
# `decks` is a list of decks this applies to.
fact_grid_updated = django.dispatch.Signal(providing_args=['decks'])


# Below are the listeners which will send `fact_grid_updated`.

@receiver(fact_suspended, dispatch_uid='fact_grid_updated_f_s')
@receiver(fact_unsuspended, dispatch_uid='fact_grid_updated_f_us')
@receiver(fact_deleted, dispatch_uid='fact_grid_updated_f_d')
def fact_status_updated(sender, **kwargs):
    fact_grid_updated.send(sender=sender,
                           decks=sender.all_owner_decks())

########################################################################

total_count_changed = django.dispatch.Signal(providing_args=['decks'])


########################################################################

new_count_changed = django.dispatch.Signal(providing_args=['instance'])

@receiver(post_save, sender=Card, dispatch_uid='new_count_changed_cs')
def card_created(sender, instance, created, **kwargs):
    if created and instance.active and not instance.suspended:
        new_count_changed.send(sender=sender, instance=instance)

########################################################################
# Card signals

pre_card_reviewed = django.dispatch.Signal(providing_args=['instance'])
post_card_reviewed = django.dispatch.Signal(providing_args=['instance'])

# When a card's `active` field changes.
# DEPRECATED.
card_active_field_changed = django.dispatch.Signal(providing_args=['instance'])


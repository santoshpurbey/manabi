import pytz
from datetime import datetime, time, timedelta

from django.conf import settings


def seconds_to_days(s):
    return s / 86400.


def start_and_end_of_day(user, time_zone, date=None):
    '''
    `date` is a datetime.date object.
    `time_zone` is a pytz object.

    Returns a tuple of 2 UTC datetimes.

    Uses waking hours, not calendar day.
    '''
    if date is None:
        # Today
        local_time = datetime.now(time_zone)
        date = local_time.date()

    start_of_day_time = time(
        hour=settings.START_OF_DAY, minute=0, second=0, tzinfo=time_zone)

    start_of_day_datetime = (
        datetime.combine(date, start_of_day_time).astimezone(pytz.utc)
    )

    if local_time.time() < start_of_day_time:
        start_of_day_datetime -= timedelta(days=1)

    #start = datetime.now(timezone).replace(
    #    hour=settings.START_OF_DAY, minute=0, second=0).astimezone(pytz.utc)

    end = start_of_day_datetime + timedelta(hours=23, minutes=59, seconds=59)

    return (start_of_day_datetime, end)

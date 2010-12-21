from functools import wraps
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from flashcards.models.decks import Deck
from dojango.util import to_json_response
from django.http import HttpResponseServerError
from django.utils import simplejson as json

#decorator_with_arguments = lambda decorator: lambda *args, **kwargs: lambda func: decorator(func, *args, **kwargs)


def all_http_methods(view_func):
    '''
    Decorator that adds headers to a response so that it will
    never be cached.
    '''
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        #modified_request = request #shallow copy is enough
        if request.method == 'POST':
            if '_method' in request.POST and request.POST['_method'] in ['PUT', 'DELETE', 'GET', 'POST']:
                method = request.POST['_method']
                request.method = method
        return view_func(request, *args, **kwargs)
    return wrapper


def has_card_query_filters(func):
    '''
    Adds some kwargs to the `func` call for cleaning request GET data into
    querysets.

    Adds the following (potentially with value None):
        `deck`, `tags`
    '''
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        # Deck
        if 'deck' in request.GET and request.GET['deck'].strip():
            deck = get_object_or_404(Deck, pk=request.GET['deck'])
        else:
            deck = None
        kwargs['deck'] = deck

        # Tags
        try:
            tag_id = int(request.GET.get('tag', -1))
        except ValueError:
            tag_id = -1
        if tag_id != -1:
            tag_ids = [tag_id] #TODO support multiple tags
            tags = usertagging.models.Tag.objects.filter(id__in=tag_ids)
        else:
            tags = None
        kwargs['tags'] = tags

        return func(request, *args, **kwargs)

    return wrapper


class ApiException(Exception):
    '''
    `api_data_response` catches these exceptions and does the following:

    When a view decorated with `api_data_response` raises this exception,
    it results in the 'success' field of the returned JSON data being 
    set to False, and the 'error' field set to the message of the 
    raised exception. 
    '''
    pass


def api_data_response(view_func):
    '''
    Uses `dojango.decorators.json_response`, except with a more 
    specific structure. The view return value is put into the `data` 
    field.

    Ex.:
        {
            'success': True,
            'data': 'foobar'
        }
    '''
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        ret = {'success': True}

        try:
            ret['data'] = func(request, *args, **kwargs)
        except ApiException as e:
            ret['success'] = False
            ret['error'] = unicode(e)

        json_ret = u''
        try:
            # Sometimes the serialization fails, i.e. when there are 
            # too deeply nested objects or even classes inside
            json_ret = to_json_response(ret)
        except Exception, e:
            return HttpResponseServerError(content=unicode(e))
        return json_ret
    return wrapper


def flashcard_api(view_func):
    '''
    Our standard decorator for JSON API views,
    within our flashcard API.

    It's just a shortcut for decorating with the following:
        `@api_data_response`
        `@login_required`
        `@all_http_methods`
    '''
    return api_data_response(
           login_required(
           all_http_methods(view_func)))

def flashcard_api_with_dojo_data(view_func):
    return json_response(
           login_required(
           all_http_methods(view_func)))


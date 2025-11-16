"""
WSGI config for techzone project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise
import os
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techzone.settings')
application = get_wsgi_application()

BASE_DIR = Path(__file__).resolve().parent.parent
application = WhiteNoise(application, root=str(BASE_DIR / 'staticfiles'))

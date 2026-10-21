"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from pathlib import Path

from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import RedirectView
from django.views.static import serve
from jobs import views

BASE_DIR = Path(__file__).resolve().parent.parent
PAGES = {
    'signup': 'signup-role.html',
    'company-signup': 'company-signup.html',
    'jobseeker-signup': 'jobseeker-signup.html',
    'employer': 'employer.html',
    'employee': 'employee.html',
    'login': 'login.html',
    'pricing': 'pricing.html',
    'posting-job': 'posting-job.html',
    'terms': 'terms.html',
    'privacy': 'privacy.html',
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('index.html', serve, {'document_root': BASE_DIR, 'path': 'index.html'}),
]

urlpatterns += [
    path(f'{slug}/', RedirectView.as_view(url=f'/pages/{filename}', query_string=True), name=slug)
    for slug, filename in PAGES.items()
]

urlpatterns += [
    re_path(r'^pages/(?P<path>.*)$', serve, {'document_root': BASE_DIR / 'pages'}),
    re_path(r'^css/(?P<path>.*)$', serve, {'document_root': BASE_DIR / 'css'}),
    re_path(r'^js/(?P<path>.*)$', serve, {'document_root': BASE_DIR / 'js'}),
    re_path(r'^images/(?P<path>.*)$', serve, {'document_root': BASE_DIR / 'images'}),
]

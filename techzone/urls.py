# techzone/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # type: ignore
from django.conf import settings
from django.conf.urls.static import static
from TechHub import views as tech_views


urlpatterns = [
    # root page — provide both 'index' and 'home' names so templates that use either work
    path('', TemplateView.as_view(template_name="index.html"), name='index'),
    path('home/', TemplateView.as_view(template_name="index.html"), name='home'),

    # "All Products" pages (templates use uppercase 'All' in your templates)
    path('all/', TemplateView.as_view(template_name="allpro.html"), name='All'),
    path('shop/', TemplateView.as_view(template_name="allpro.html"), name='all'),

    # category / product pages
    path('smartphone/', TemplateView.as_view(template_name="smartphone.html"), name='Smartphone'),
    path('laptop/', TemplateView.as_view(template_name="laptop.html"), name='laptop'),
    path('monitor/', TemplateView.as_view(template_name="monitor.html"), name='monitor'),
    path('cpu/', TemplateView.as_view(template_name="cpu.html"), name='cpu'),
    path('mouse/', TemplateView.as_view(template_name="mouse.html"), name='mouse'),
    path('keyboard/', TemplateView.as_view(template_name="keyboard.html"), name='keyboard'),
    path('smartwatch/', TemplateView.as_view(template_name="smartwatch.html"), name='smartwatch'),

    # cart/login/checkout
    path('cart/', TemplateView.as_view(template_name="cart.html"), name='cart'),
    path('login/', TemplateView.as_view(template_name="login.html"), name='login'),
    path('signup/', tech_views.signup, name='signup'),
    path('checkout/', TemplateView.as_view(template_name="checkout.html"), name='checkout'),
    path('orders/<int:order_id>/', tech_views.order_detail, name='order_detail'),
    path('checkout/', tech_views.checkout, name='checkout'),
    # Backend / API
    path('admin/', admin.site.urls),
    path('api/', include('TechHub.urls_api')),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media & static in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

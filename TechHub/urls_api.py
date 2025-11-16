from django.urls import path
from .api_views import ProductList, ProductDetail, CartListCreate, CartItemDelete, Checkout

urlpatterns = [
    path('products/', ProductList.as_view(), name='product-list'),
    path('products/<slug:slug>/', ProductDetail.as_view(), name='product-detail'),
    path('cart/', CartListCreate.as_view(), name='cart-list-create'),
    path('cart/<int:pk>/', CartItemDelete.as_view(), name='cart-item-delete'),
    path('checkout/', Checkout.as_view(), name='checkout'),
]

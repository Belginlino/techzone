from rest_framework import generics, permissions, status # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from .models import Product, CartItem, Order, OrderItem
from .serializers import ProductSerializer, CartItemSerializer, OrderSerializer
from django.shortcuts import get_object_or_404
from django.db import transaction

class ProductList(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'

class CartListCreate(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = CartItem.objects.filter(user=request.user)
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data.get('quantity', 1)
        item, created = CartItem.objects.get_or_create(user=request.user, product_id=product_id, defaults={'quantity': quantity})
        if not created:
            item.quantity = quantity
            item.save()
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)

class CartItemDelete(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pk):
        item = get_object_or_404(CartItem, pk=pk, user=request.user)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class Checkout(APIView):
    permission_classes = [permissions.IsAuthenticated]
    @transaction.atomic
    def post(self, request):
        cart_items = CartItem.objects.filter(user=request.user).select_related('product')
        if not cart_items.exists():
            return Response({'detail':'Cart is empty'}, status=400)
        order = Order.objects.create(user=request.user, total=0)
        total = 0
        for ci in cart_items:
            if ci.product.stock < ci.quantity:
                transaction.set_rollback(True)
                return Response({'detail': f'Not enough stock for {ci.product.name}'}, status=400)
            OrderItem.objects.create(order=order, product=ci.product, price=ci.product.price, quantity=ci.quantity)
            total += float(ci.product.price) * ci.quantity
            ci.product.stock -= ci.quantity
            ci.product.save()
        order.total = total
        order.save()
        cart_items.delete()
        return Response(OrderSerializer(order).data, status=201)

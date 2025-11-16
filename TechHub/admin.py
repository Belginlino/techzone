from django.contrib import admin
from .models import Category, Product, CartItem, Order, OrderItem, Address

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(CartItem)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('price','quantity')

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ('id','user','status','total','created_at')

admin.site.register(Order, OrderAdmin)
admin.site.register(Address)

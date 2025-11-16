from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django import forms

# Custom UserCreationForm with email field
class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'placeholder': 'Enter your email address',
            'class': 'form-control'
        })
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'placeholder': 'Choose a username',
            'class': 'form-control'
        })
        self.fields['password1'].widget.attrs.update({
            'placeholder': 'Create a strong password',
            'class': 'form-control'
        })
        self.fields['password2'].widget.attrs.update({
            'placeholder': 'Confirm your password',
            'class': 'form-control'
        })
        
        # Customize labels
        self.fields['username'].label = 'Username'
        self.fields['email'].label = 'Email Address'
        self.fields['password1'].label = 'Password'
        self.fields['password2'].label = 'Password Confirmation'
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

# Custom AuthenticationForm for better styling
class CustomAuthenticationForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'placeholder': 'Enter your username',
            'class': 'form-control'
        })
        self.fields['password'].widget.attrs.update({
            'placeholder': 'Enter your password',
            'class': 'form-control'
        })
        
        self.fields['username'].label = 'Username'
        self.fields['password'].label = 'Password'

# Existing view functions
def home(request):
    return render(request, 'index.html')

def all(request):
    return render(request, 'allpro.html')

def smartphone(request):
    return render(request, 'smartphone.html')

def laptop(request):
    return render(request, 'laptop.html')

def monitor(request):
    return render(request, 'monitor.html')

def cpu(request):
    return render(request, 'cpu.html')

def mouse(request):
    return render(request, 'mouse.html')

def keyboard(request):
    return render(request, 'keyboard.html')

def smartwatch(request):
    return render(request, 'smartwatch.html')

@login_required
def cart(request):
    """Cart view - requires user to be logged in"""
    return render(request, 'cart.html')

# Authentication view functions
def login_page(request):
    """
    Handles both login and signup on the same page with improved error handling.
    """
    # Redirect if user is already authenticated
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        # Handle signup form submission
        if 'signup-submit' in request.POST:
            signup_form = CustomUserCreationForm(request.POST)
            login_form = CustomAuthenticationForm()
            
            if signup_form.is_valid():
                user = signup_form.save()
                # Automatically log in the user after successful signup
                username = signup_form.cleaned_data.get('username')
                password = signup_form.cleaned_data.get('password1')
                user = authenticate(username=username, password=password)
                
                if user is not None:
                    auth_login(request, user)
                    messages.success(request, f'Welcome {user.username}! Your account has been created successfully.')
                    return redirect('home')
            else:
                # Handle form errors more gracefully
                messages.error(request, 'Please correct the errors in the signup form.')

        # Handle login form submission
        elif 'login-submit' in request.POST:
            login_form = CustomAuthenticationForm(request, data=request.POST)
            signup_form = CustomUserCreationForm()
            
            if login_form.is_valid():
                username = login_form.cleaned_data.get('username')
                password = login_form.cleaned_data.get('password')
                user = authenticate(username=username, password=password)
                
                if user is not None:
                    auth_login(request, user)
                    messages.success(request, f'Welcome back, {user.username}!')
                    
                    # Redirect to next page if specified, otherwise home
                    next_page = request.GET.get('next', 'home')
                    return redirect(next_page)
                else:
                    messages.error(request, 'Invalid username or password.')
            else:
                messages.error(request, 'Please enter a valid username and password.')
    else:
        # For GET request, create empty forms
        signup_form = CustomUserCreationForm()
        login_form = CustomAuthenticationForm()

    context = {
        'signup_form': signup_form,
        'login_form': login_form,
    }
    return render(request, 'login.html', context)

def signup_only(request):
    """
    Separate signup page
    """
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        signup_form = CustomUserCreationForm(request.POST)
        if signup_form.is_valid():
            user = signup_form.save()
            # Automatically log in the user after successful signup
            username = signup_form.cleaned_data.get('username')
            password = signup_form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            
            if user is not None:
                auth_login(request, user)
                messages.success(request, f'Welcome {user.username}! Your account has been created successfully.')
            return redirect('home')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        signup_form = CustomUserCreationForm()
    
    context = {
        'signup_form': signup_form,
    }
    return render(request, 'signup.html', context)

def login_only(request):
    """
    Separate login page
    """
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        login_form = CustomAuthenticationForm(request, data=request.POST)
        if login_form.is_valid():
            username = login_form.cleaned_data.get('username')
            password = login_form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            
            if user is not None:
                auth_login(request, user)
                messages.success(request, f'Welcome back, {user.username}!')
                
                # Redirect to next page if specified, otherwise home
                next_page = request.GET.get('next', 'home')
                return redirect(next_page)
            else:
                messages.error(request, 'Invalid username or password.')
        else:
            messages.error(request, 'Please enter a valid username and password.')
    else:
        login_form = CustomAuthenticationForm()
    
    context = {
        'login_form': login_form,
    }
    return render(request, 'login_only.html', context)

def logout_user(request):
    """
    Logs the user out and redirects to the home page.
    """
    if request.user.is_authenticated:
        username = request.user.username
        logout(request)
        messages.success(request, f'Goodbye {username}! You have been logged out successfully.')
    return redirect('home')

@login_required
def profile(request):
    """User profile page"""
    return render(request, 'profile.html', {'user': request.user})


# TechHub/views.py
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages

def signup(request):
    """
    Sign-up view using Django's built-in UserCreationForm.
    Renders TechHub/templates/signup.html and passes signup_form.
    """
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Account created — please log in.")
            return redirect('login')   # redirects to URL named 'login'
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'signup_form': form})
# TechHub/views.py
from django.shortcuts import render, get_object_or_404
from .models import Order  # assumes class name Order

def order_detail(request, order_id):
    """
    Simple order detail page for user (admin can view others).
    Adjust permissions/auth as required.
    """
    order = get_object_or_404(Order, id=order_id)
    # If you want to restrict to the logged-in user:
    # if request.user.is_authenticated and order.user != request.user:
    #     return HttpResponseForbidden("You can't view this order.")

    # Build a context: adapt field names to your Order model
    context = {
        'order': order,
        # If you have related items, e.g. order.items.all() adjust accordingly
        'items': getattr(order, 'orderitem_set', order.__class__).__class__ and getattr(order, 'orderitem_set', None) or None,
    }
    return render(request, 'order_detail.html', context)

def checkout(request):
    # render checkout template; the cart.js handles checkout API POST (or you can implement server-side)
    # you may want to prepare a context (address, user profile etc)
    return render(request, 'checkout.html')

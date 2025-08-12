# users/views.py

# --- Imports ---
import random
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from rest_framework import status, generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    User, Sport, Venue, VenuePhoto, Court, TimeSlot, Booking, Review, Notification
)
from .serializers import (
    RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer,
    SportSerializer, VenueSerializer, VenuePhotoSerializer, CourtSerializer,
    TimeSlotSerializer, BookingSerializer, ReviewSerializer, NotificationSerializer,OTPVerifySerializer,ResendOTPSerializer
)

# ===================================================================
# ## Authentication and User Management ##
# ===================================================================

class RegisterView(generics.CreateAPIView):
    """
    Handles new user registration.
    Creates a user, saves an OTP with an expiry time, and sends a formatted HTML email.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Generate a random 6-digit OTP
        otp_code = random.randint(100000, 999999)
        user = serializer.save(otp_verified=False)
        
        # Use the model's method to set OTP and its expiry
        user.set_otp(otp_code)

        # Prepare and send a styled HTML email
        context = {
            'full_name': user.full_name,
            'otp_code': otp_code,
            'current_year': timezone.now().year
        }
        html_content = render_to_string('emails/otp_email.html', context)
        text_content = f'Your OTP code is {otp_code}. It will expire in 10 minutes.'

        subject = 'QuickCourt OTP Verification'
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = [user.email]

        email = EmailMultiAlternatives(subject, text_content, from_email, to_email)
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)


class VerifyOTPView(generics.GenericAPIView):
    """
    Verifies the OTP sent to the user's email.
    """

    serializer_class = OTPVerifySerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')

        if not email or not otp_code:
            return Response(
                {"error": "Email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Use the model's method to verify the OTP (checks code and expiry)
        if user.verify_otp(otp_code):
            user.otp_verified = True
            # Clear OTP fields after successful verification to prevent reuse
            user.otp_code = None
            user.otp_expiry = None
            user.save()
            return Response({"message": "OTP verified successfully. You can now log in."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT login view that uses a custom serializer.
    The serializer adds extra user data to the token payload.
    """
    serializer_class = CustomTokenObtainPairSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """
    Provides a view for the currently authenticated user to see or update their profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Returns the user associated with the current request's token
        return self.request.user


# ===================================================================
# ## Sports App API Endpoints (ViewSets) ##
# Note: In a larger project, these would typically be in a separate `sports/views.py`.
# ===================================================================

class SportViewSet(viewsets.ModelViewSet):
    """API endpoint for sports."""
    queryset = Sport.objects.all()
    serializer_class = SportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class VenueViewSet(viewsets.ModelViewSet):
    """API endpoint for venues."""
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class VenuePhotoViewSet(viewsets.ModelViewSet):
    """API endpoint for venue photos."""
    queryset = VenuePhoto.objects.all()
    serializer_class = VenuePhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CourtViewSet(viewsets.ModelViewSet):
    """API endpoint for courts within a venue."""
    queryset = Court.objects.all()
    serializer_class = CourtSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TimeSlotViewSet(viewsets.ModelViewSet):
    """API endpoint for available time slots."""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class BookingViewSet(viewsets.ModelViewSet):
    """API endpoint for bookings. Requires authentication."""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users should only see their own bookings
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the booking to the current user
        serializer.save(user=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
    """API endpoint for reviews. Anyone can read, but only authenticated users can post."""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Automatically assign the review to the current user
        serializer.save(user=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    """API endpoint for user notifications. Requires authentication."""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users should only see their own notifications
        return Notification.objects.filter(user=self.request.user)
   
class ResendOTPView(generics.GenericAPIView):
    """
    Resends a new OTP to the user's email.
    """
    serializer_class = ResendOTPSerializer  # Reuse the serializer for email input
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.otp_verified:
            return Response({"error": "User already verified."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate new OTP and set expiry
        otp_code = random.randint(100000, 999999)
        user.set_otp(otp_code)  # You can pass expiry_minutes if needed

        # Send OTP email
        context = {
            'full_name': user.full_name,
            'otp_code': otp_code,
            'current_year': timezone.now().year
        }
        html_content = render_to_string('emails/otp_email.html', context)
        text_content = f'Your OTP code is {otp_code}. It will expire in 1 minute.'

        subject = 'QuickCourt OTP Verification'
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = [user.email]

        email_obj = EmailMultiAlternatives(subject, text_content, from_email, to_email)
        email_obj.attach_alternative(html_content, "text/html")
        email_obj.send(fail_silently=False)

        return Response({"message": "OTP resent successfully."}, status=status.HTTP_200_OK)


class AvailableAvatarsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        avatars = []
        if os.path.exists(avatar_dir):
            for filename in os.listdir(avatar_dir):
                avatars.append(request.build_absolute_uri(settings.MEDIA_URL + 'avatars/' + filename))
        return Response({"avatars": avatars})
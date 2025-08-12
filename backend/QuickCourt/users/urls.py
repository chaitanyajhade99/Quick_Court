from django.urls import path
from .views import RegisterView, VerifyOTPView, CustomTokenObtainPairView, MeView
from rest_framework_simplejwt.views import TokenRefreshView
# sports/urls.py
from rest_framework.routers import DefaultRouter
from .views import (
    SportViewSet, VenueViewSet, VenuePhotoViewSet, CourtViewSet,
    TimeSlotViewSet, BookingViewSet, ReviewViewSet, NotificationViewSet,ResendOTPView,AvailableAvatarsView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
       path('available-avatars/', AvailableAvatarsView.as_view(), name='available-avatars'),
]


router = DefaultRouter()
router.register(r'sports', SportViewSet)
router.register(r'venues', VenueViewSet)
router.register(r'venue-photos', VenuePhotoViewSet)
router.register(r'courts', CourtViewSet)
router.register(r'timeslots', TimeSlotViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns += router.urls

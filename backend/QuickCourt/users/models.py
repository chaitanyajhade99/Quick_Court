import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class CustomUserManager(BaseUserManager):
    def create_user(self, email, first_name,last_name,phone, password=None, role='USER', **extra_fields):
        """
        Create and return a regular user with an email and password.
        """
        if not email:
            raise ValueError('The Email field is required')

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone = phone,
            role=role,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_owner(self, email, first_name,last_name,phone, password=None, **extra_fields):
        """
        Create and return a facility owner.
        """
        extra_fields.setdefault('role', 'OWNER')
        return self.create_user(email, first_name,last_name,phone, password, **extra_fields)

    def create_superuser(self, email, first_name,last_name,phone, password=None, **extra_fields):
        """
        Create and return a superuser.
        """
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, first_name,last_name,phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)

    def set_otp(self, code):
        self.otp_code = str(code)
        self.otp_expiry = timezone.now() + timedelta(minutes=10)  # valid for 10 mins
        self.save()

    def verify_otp(self, code):
        return (
            self.otp_code == str(code) and
            self.otp_expiry and
            timezone.now() <= self.otp_expiry
        )
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('OWNER', 'Facility Owner')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.PositiveIntegerField(default=0)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    otp_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name','last_name','phone']

    # ...existing code...

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

# ...existing code...

    def _str_(self):
        return f"{self.first_name} ({self.email})"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'



class Sport(models.Model):
    """
    Represents a sport category that can be used as a tag.
    e.g., Cricket, Football, Badminton
    """
    name = models.CharField(max_length=100, unique=True)
    # You could add an icon field here later if you want
    # icon = models.ImageField(upload_to='sport_icons/', blank=True, null=True)

    def _str_(self):
        return self.name

class Venue(models.Model):
    """
    Represents a physical sports facility owned by a FacilityOwner.
    """
    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='venues')
    name = models.CharField(max_length=255)
    description = models.TextField()
    address = models.CharField(max_length=255)
    tags = models.ManyToManyField(Sport, related_name='venues') # For filtering by sport
    approval_status = models.CharField(max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"{self.name} by {self.owner.first_name}"

class VenuePhoto(models.Model):
    """
    Stores multiple photos for a single venue.
    """
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='venue_photos/')

class Court(models.Model):
    """
    Represents a single bookable court or turf within a Venue.
    """
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='courts')
    name = models.CharField(max_length=100)
    sport = models.ForeignKey(Sport, on_delete=models.PROTECT) # The primary sport for this court
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2)
    # Operating hours can be stored as JSON for flexibility, e.g., {"Monday": ["09:00", "21:00"]}
    operating_hours = models.JSONField(default=dict)

    def _str_(self):
        return f"{self.name} at {self.venue.name}"

class TimeSlot(models.Model):
    """
    Represents an available time slot for a specific court on a specific date.
    This model is key for the AI to check availability.
    """
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='timeslots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('court', 'date', 'start_time') # Ensures no duplicate slots

    def _str_(self):
        return f"{self.court.name} on {self.date} from {self.start_time} to {self.end_time}"

class Booking(models.Model):
    """
    The core model representing a confirmed booking.
    Contains all info for Twilio, Razorpay, and PDF invoices.
    """
    class BookingStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending' # Awaiting payment
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='bookings')
    timeslot = models.OneToOneField(TimeSlot, on_delete=models.PROTECT, related_name='booking')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_status = models.CharField(max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    # Razorpay Integration Fields
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)

    # Twilio Integration Field
    twilio_message_sid = models.CharField(max_length=100, blank=True, null=True) # Stores the SMS SID

    def _str_(self):
        return f"Booking {self.id} for {self.user.email}"

class Review(models.Model):
    """
    Represents a user's review and rating for a Venue.
    """
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('venue', 'user') # One review per user per venue

    def _str_(self):
        return f"Review by {self.user.email} for {self.venue.name}"

class Notification(models.Model):
    """
    A simple model for in-app notifications.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"Notification for {self.user.email}"
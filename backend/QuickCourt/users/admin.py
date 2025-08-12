from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User,
    Sport,
    Venue,
    VenuePhoto,
    Court,
    TimeSlot,
    Booking,
    Review,
    Notification
)

# --- Custom Admin Actions ---

@admin.action(description='Mark selected venues as Approved')
def make_approved(modeladmin, request, queryset):
    """
    Admin action to approve venues in bulk.
    """
    queryset.update(approval_status='APPROVED')

@admin.action(description='Mark selected venues as Rejected')
def make_rejected(modeladmin, request, queryset):
    """
    Admin action to reject venues in bulk.
    """
    queryset.update(approval_status='REJECTED')

# --- Admin Model Configurations ---

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin configuration for the User model.
    """
    # Use the default UserAdmin forms
    # add_form = UserCreationForm
    # form = UserChangeForm
    model = User
    list_display = ('email', 'first_name', 'last_name', 'role', 'phone', 'is_staff', 'otp_verified')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    ordering = ('email',)
    
    # Define the fieldsets for the user creation/edit pages
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Roles & Status', {'fields': ('role', 'otp_verified')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'phone', 'password', 'password2'),
        }),
    )

@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Sport model.
    """
    list_display = ('name',)
    search_fields = ('name',)

class VenuePhotoInline(admin.TabularInline):
    """
    Allows adding and editing VenuePhotos directly within the Venue admin page.
    """
    model = VenuePhoto
    extra = 1  # Number of empty forms to display
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        from django.utils.html import format_html
        if obj.image:
            return format_html('<img src="{}" width="150" height="auto" />', obj.image.url)
        return "(No image)"
    image_preview.short_description = 'Image Preview'


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Venue model.
    """
    list_display = ('name', 'owner', 'address', 'approval_status', 'created_at')
    list_filter = ('approval_status', 'tags', 'created_at')
    search_fields = ('name', 'owner__email', 'address')
    ordering = ('-created_at',)
    inlines = [VenuePhotoInline]
    actions = [make_approved, make_rejected]
    
    # Make owner field searchable with a dropdown
    autocomplete_fields = ['owner']


@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Court model.
    """
    list_display = ('name', 'venue', 'sport', 'price_per_hour')
    list_filter = ('sport', 'venue__name')
    search_fields = ('name', 'venue__name')
    ordering = ('venue', 'name')
    autocomplete_fields = ['venue', 'sport']

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    """
    Admin configuration for the TimeSlot model.
    """
    list_display = ('court', 'date', 'start_time', 'end_time', 'is_booked')
    list_filter = ('is_booked', 'date', 'court__venue__name')
    search_fields = ('court__name', 'date')
    ordering = ('-date', 'start_time')
    autocomplete_fields = ['court']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Booking model.
    """
    list_display = ('id', 'user', 'get_court_name', 'get_venue_name', 'booking_status', 'payment_status', 'created_at')
    list_filter = ('booking_status', 'payment_status', 'created_at', 'timeslot__court__venue__name')
    search_fields = ('user__email', 'timeslot__court__name', 'razorpay_order_id')
    ordering = ('-created_at',)
    
    # Make certain fields read-only as they are set programmatically
    readonly_fields = ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'twilio_message_sid', 'created_at', 'total_price')
    
    autocomplete_fields = ['user', 'timeslot']

    @admin.display(description='Court', ordering='timeslot__court__name')
    def get_court_name(self, obj):
        return obj.timeslot.court.name

    @admin.display(description='Venue', ordering='timeslot__court__venue__name')
    def get_venue_name(self, obj):
        return obj.timeslot.court.venue.name

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Review model.
    """
    list_display = ('venue', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('venue__name', 'user__email', 'comment')
    ordering = ('-created_at',)
    autocomplete_fields = ['venue', 'user']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Notification model.
    """
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__email', 'message')
    ordering = ('-created_at',)
    autocomplete_fields = ['user']

# Note: VenuePhoto is managed via the VenueAdmin inline, so it doesn't need its own separate registration.
# However, if you want to manage photos independently, you can uncomment the line below.
# admin.site.register(VenuePhoto)

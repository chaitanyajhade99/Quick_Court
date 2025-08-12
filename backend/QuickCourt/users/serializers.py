from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from .models import Sport, Venue, VenuePhoto, Court, TimeSlot, Booking, Review, Notification

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name','last_name','full_name','phone', 'role', 'avatar', 'phone']


    def get_full_name(self, obj):
        return obj.full_name

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name','last_name','phone', 'password','avatar', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Get the validated user
        data = super().validate(attrs)

        # Check OTP verification status
        if not self.user.otp_verified:
            raise serializers.ValidationError(
                {"error": "Account not verified. Please verify your OTP."}
            )

        # Attach user info to the response
        data['user'] = {
            "id": str(self.user.id),
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "role": self.user.role,
            "avatar": self.user.avatar.url if self.user.avatar else None
        }
        return data
    


class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = '__all__'


class VenuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenuePhoto
        fields = '__all__'


class VenueSerializer(serializers.ModelSerializer):
    photos = VenuePhotoSerializer(many=True, read_only=True)
    tags = SportSerializer(many=True, read_only=True)
    tags_ids = serializers.PrimaryKeyRelatedField(queryset=Sport.objects.all(), many=True, write_only=True)

    class Meta:
        model = Venue
        fields = ['id', 'owner', 'name', 'description', 'address', 'tags', 'tags_ids', 'approval_status', 'created_at', 'photos']

    def create(self, validated_data):
        tags_ids = validated_data.pop('tags_ids', [])
        venue = Venue.objects.create(**validated_data)
        venue.tags.set(tags_ids)
        return venue

    def update(self, instance, validated_data):
        tags_ids = validated_data.pop('tags_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags_ids is not None:
            instance.tags.set(tags_ids)
        return instance


class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Court
        fields = '__all__'


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

# ...existing code...

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
# ...existing code...


# ...existing code...

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
# ...existing code...
# users/auth_views.py
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from rest_framework import status

class LoginSetRefreshCookieView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        access = serializer.validated_data['access']
        refresh = serializer.validated_data['refresh']

        # Set refresh token in HttpOnly cookie
        response = Response({
            'access': access,
            'user': serializer.validated_data.get('user')
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=refresh,
            httponly=True,
            secure=not settings.DEBUG,  # True in prod
            samesite='Lax',
            max_age=60 * 60 * 24 * 7,  # 7 days
            path='/api/auth/'
        )
        return response

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Job, Student, Application, Evaluation
from .serializers import (
    JobSerializer, StudentSerializer,
    ApplicationSerializer, EvaluationSerializer
)

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = JobSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'organization_name']

    def get_permissions(self):
        # Anyone can read jobs, only admins can create/edit/delete
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['student_id']

    def get_queryset(self):
        queryset = Student.objects.all()
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        # Students can only see their own profile
        if not self.request.user.is_staff:
            try:
                student = self.request.user.student_profile
                queryset = queryset.filter(id=student.id)
            except Student.DoesNotExist:
                queryset = queryset.none()
        return queryset


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        """
        Logic: 
        - Anyone logged in can 'create' (Apply) or 'list'/'retrieve' (See their own status).
        - Only staff/admins can 'update', 'partial_update', or 'destroy'.
        """
        if self.action in ['create', 'list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Application.objects.all()
        job_id = self.request.query_params.get('job')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
            
        # Layer 2 Security: The Queryset Filter
        # Because we used IsAuthenticated above, we MUST filter here 
        # so students don't see other people's applications.
        if not self.request.user.is_staff:
            try:
                student = self.request.user.student_profile
                queryset = queryset.filter(student=student)
            except Student.DoesNotExist:
                queryset = queryset.none()
        return queryset
    
    def perform_create(self, serializer):
        # This automatically links the application to the logged-in student
        serializer.save(student=self.request.user.student_profile)


class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    queryset = Evaluation.objects.all()

    def get_queryset(self):
        """
        Optionally restricts the returned evaluations to a given application,
        by filtering against an `application` query parameter in the URL.
        """
        queryset = Evaluation.objects.all()
        application_id = self.request.query_params.get('application')
        if application_id is not None:
            # This ensures ?application=1 only returns evaluation for App 1
            queryset = queryset.filter(application_id=application_id)
        return queryset


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        identifier = request.data.get('identifier')  # student ID or email
        password = request.data.get('password')

        if not identifier or not password:
            return Response(
                {'error': 'Please provide identifier and password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try finding user by email or username (student ID)
        user = None
        if '@' in identifier:
            try:
                u = User.objects.get(email=identifier)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            user = authenticate(username=identifier, password=password)

        if not user:
            return Response(
                {'error': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Get role and student info
        is_admin = user.is_staff or user.is_superuser
        student_data = None
        if not is_admin:
            try:
                student = user.student_profile
                student_data = {
                    'student_id': student.student_id,
                    'first_name': student.first_name,
                    'last_name': student.last_name,
                    'faculty': student.faculty,
                    'major': student.major,
                }
            except Student.DoesNotExist:
                pass

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': 'ADMIN' if is_admin else 'STUDENT',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': is_admin,
            },
            'student': student_data,
        })

    @action(detail=False, methods=['post'], url_path='refresh')
    def refresh(self, request):
        try:
            refresh = RefreshToken(request.data.get('refresh'))
            return Response({'access': str(refresh.access_token)})
        except Exception:
            return Response(
                {'error': 'Invalid refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Not authenticated.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        is_admin = request.user.is_staff or request.user.is_superuser
        student_data = None
        if not is_admin:
            try:
                student = request.user.student_profile
                student_data = {
                    'id': student.id,
                    'student_id': student.student_id,
                    'first_name': student.first_name,
                    'last_name': student.last_name,
                    'faculty': student.faculty,
                    'major': student.major,
                }
            except Student.DoesNotExist:
                pass

        return Response({
            'role': 'ADMIN' if is_admin else 'STUDENT',
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_admin': is_admin,
            },
            'student': student_data,
        })
    
    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        data = request.data

        # Required fields
        required = ['student_id', 'first_name', 'last_name',
                    'email', 'password', 'faculty', 'major']
        for field in required:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Validate PSU email
        email = data.get('email', '').lower()
        if not (email.endswith('@phuket.psu.ac.th') or email.endswith('@psu.ac.th')):
            return Response(
                {'error': 'Only PSU email addresses are allowed (@phuket.psu.ac.th or @psu.ac.th).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if student ID or email already exists
        if User.objects.filter(username=data['student_id']).exists():
            return Response(
                {'error': 'Student ID already registered.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already registered.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create Django User — username is student ID
            user = User.objects.create_user(
                username=data['student_id'],
                email=email,
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
            )

            # Create linked Student profile
            Student.objects.create(
                user=user,
                student_id=data['student_id'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                faculty=data.get('faculty', ''),
                major=data.get('major', ''),
                religion=data.get('religion', ''),
                allergies=data.get('allergies', ''),
            )

            return Response(
                {'message': 'Registration successful. You can now sign in.'},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
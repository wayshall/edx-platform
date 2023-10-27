"""
Helpers for the course roles app.
"""
from django.contrib.auth.models import AnonymousUser

from openedx.core.djangoapps.course_roles.models import CourseRolesUserRole
from openedx.core.lib.cache_utils import request_cached
from xmodule.modulestore.django import modulestore


@request_cached()
def course_permission_check(user, permission_name, course_id):
    """
    Check if a user has a permission in a course.
    """
    if isinstance(user, AnonymousUser):
        return False
    return CourseRolesUserRole.objects.filter(
        user=user,
        role__permissions__name=permission_name,
        course=course_id,
    ).exists()


@request_cached()
def course_permissions_list_check(user, permission_names, course_id):
    """
    Check if a user has all of the given permissions in a course.
    """
    return all(course_permission_check(user, permission_name, course_id) for permission_name in permission_names)


@request_cached()
def organization_permission_check(user, permission_name, organization_name):
    """
    Check if a user has a permission in an organization.
    """
    if isinstance(user, AnonymousUser):
        return False
    return CourseRolesUserRole.objects.filter(
        user=user,
        role__permissions__name=permission_name,
        course__isnull=True,
        org__name=organization_name,
    ).exists()


@request_cached()
def organization_permissions_list_check(user, permission_names, organization_name):
    """
    Check if a user has all of the given permissions in an organization.
    """
    return all(
        organization_permission_check(user, permission_name, organization_name) for permission_name in permission_names
    )


@request_cached()
def course_or_organization_permission_check(user, permission_name, course_id, organization_name=None):
    """
    Check if a user has a permission in an organization or a course.
    """
    if isinstance(user, AnonymousUser):
        return False
    if organization_name is None:
        organization_name = modulestore().get_course(course_id).org
    return (course_permission_check(user, permission_name, course_id) or
            organization_permission_check(user, permission_name, organization_name)
            )


@request_cached()
def course_or_organization_permission_list_check(user, permission_names, course_id, organization_name=None):
    """
    Check if a user has all of the given permissions in an organization or a course.
    """
    return all(
        course_or_organization_permission_check(user, permission_name, course_id, organization_name)
        for permission_name in permission_names
    )


def get_all_user_permissions_for_a_course(user_id, course_id):
    """
    Get all of a user's permissions for a course, including, if applicable, organization-level permissions
    """
    if user_id is None or course_id is None:
        raise ValueError(_('user_id and course_id must not be None'))
    course_permissions = set(CourseRolesUserRole.objects.filter(
        user__id=user_id,
        course=course_id,
    ).values_list('role__permissions__name', flat=True))
    course = modulestore().get_course(course_id)
    if course:
        organization_name = course.org
    else:
        return course_permissions
    organization_permissions = set(CourseRolesUserRole.objects.filter(
        user__id=user_id,
        course__isnull=True,
        org__name=organization_name,
    ).values_list('role__permissions__name', flat=True))
    permissions = course_permissions.union(organization_permissions)
    return permissions

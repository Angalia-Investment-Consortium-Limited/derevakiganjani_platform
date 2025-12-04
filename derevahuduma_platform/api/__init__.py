"""
Dereva Huduma Platform API Module

This module contains all API endpoints for the platform.
"""

from . import auth
from . import otp
from . import sms

__all__ = ['auth', 'otp', 'sms']

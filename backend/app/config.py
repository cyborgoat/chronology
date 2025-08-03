"""
Simple configuration management for the Chronology backend.
"""

from typing import List

# Application settings
APP_NAME = "Chronology Backend"
APP_VERSION = "0.1.0"
DEBUG = True

# Database settings
DATABASE_URL = "sqlite:///./chronology.db"

# API settings
API_PREFIX = "/api/v1"
CORS_ORIGINS: List[str] = ["*"]

# Pagination settings
DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 100 
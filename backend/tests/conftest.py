import pytest
import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture(scope="session", autouse=True)
def set_test_env():
    os.environ["DB_PATH"] = ":memory:"
    os.environ["WHISPER_MODEL"] = "tiny"

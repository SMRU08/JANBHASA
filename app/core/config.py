import json
from pathlib import Path
from typing import Any, Dict
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class AppSettings(BaseSettings):
    """
    Application-level settings loaded from environment variables and .env file.
    Pydantic v2 style: uses model_config = SettingsConfigDict(...) instead of
    the deprecated inner class Config.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow",
        populate_by_name=True,
    )

    app_name: str = "Janbhasha Offline AI Engine"
    version: str = "1.0.0"
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = 8000
    config_path: str = str(BASE_DIR / "configs" / "janbhasha_mt_config.json")

    # Populated after instantiation by load_json_config()
    raw_config: Dict[str, Any] = {}

    def load_json_config(self) -> Dict[str, Any]:
        """Reads janbhasha_mt_config.json and caches it in raw_config."""
        cfg_path = Path(self.config_path)
        if not cfg_path.is_absolute():
            cfg_path = BASE_DIR / cfg_path
        if cfg_path.exists():
            with open(cfg_path, "r", encoding="utf-8-sig") as f:
                self.raw_config = json.load(f)
        return self.raw_config


settings = AppSettings()
settings.load_json_config()

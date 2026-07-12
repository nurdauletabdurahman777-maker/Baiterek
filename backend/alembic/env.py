from alembic import context
from sqlalchemy import engine_from_config, pool
from pathlib import Path
import sys

# Alembic's console entry point may not include the application root on sys.path.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models import Base, URL
config=context.config
config.set_main_option("sqlalchemy.url", URL.replace("%", "%%"))
target_metadata=Base.metadata
def run_migrations_offline():
    context.configure(url=config.get_main_option("sqlalchemy.url"),target_metadata=target_metadata,literal_binds=True)
    with context.begin_transaction(): context.run_migrations()
def run_migrations_online():
    connectable=engine_from_config(config.get_section(config.config_ini_section),prefix="sqlalchemy.",poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection,target_metadata=target_metadata)
        with context.begin_transaction(): context.run_migrations()
run_migrations_offline() if context.is_offline_mode() else run_migrations_online()

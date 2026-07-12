# Supabase / PostgreSQL

The backend uses standard PostgreSQL through SQLAlchemy. Set `DATABASE_URL` to the Supabase pooler URL and run `alembic upgrade head`. Row-level access is enforced in the API demo; production should additionally enable Supabase RLS policies for user-owned applications and passports.


"""Drop User, ApiKey, AuditLog, Dialog; remove conversation FK cols

Revision ID: c3d4e5f6a7b8
Revises: a1b2c3d4e5f6
Create Date: 2026-03-24

"""
from typing import Sequence, Union

from alembic import op

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_dialog_id_fkey")
    op.execute("ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey")
    op.execute("DROP INDEX IF EXISTS ix_conversations_dialog_id")
    op.execute("DROP INDEX IF EXISTS ix_conversations_user_id")
    op.execute("ALTER TABLE conversations DROP COLUMN IF EXISTS dialog_id")
    op.execute("ALTER TABLE conversations DROP COLUMN IF EXISTS user_id")

    op.execute("ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey")
    op.execute("DROP TABLE IF EXISTS audit_logs")

    op.execute("ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey")
    op.execute("DROP TABLE IF EXISTS api_keys")

    op.execute("DROP TABLE IF EXISTS dialogs")
    op.execute("DROP TABLE IF EXISTS users")


def downgrade() -> None:
    raise NotImplementedError("Không hỗ trợ downgrade — khôi phục từ backup DB.")

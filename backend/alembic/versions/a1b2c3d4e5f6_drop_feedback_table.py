"""Drop feedback table

Revision ID: a1b2c3d4e5f6
Revises: f3724916c943
Create Date: 2026-03-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'f3724916c943'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Drop feedback table and its indexes."""
    # Drop indexes first
    op.drop_index(op.f('ix_feedback_message_id'), table_name='feedback')

    # Drop the table
    op.drop_table('feedback')


def downgrade() -> None:
    """Recreate feedback table and its indexes."""
    # Recreate the feedback table
    op.create_table('feedback',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('message_id', sa.UUID(), nullable=False),
        sa.Column('rating', sa.SmallInteger(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Recreate indexes
    op.create_index(op.f('ix_feedback_message_id'), 'feedback', ['message_id'], unique=False)
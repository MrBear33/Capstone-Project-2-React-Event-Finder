"""Add api_event_id column to SavedEvent table

Revision ID: 06fa1163caf8
Revises: 80264bf1f59e
Create Date: 2025-01-10 02:20:40.285166

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '06fa1163caf8'
down_revision = '80264bf1f59e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('saved_event', schema=None) as batch_op:
        batch_op.add_column(sa.Column('api_event_id', sa.String(length=200), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('saved_event', schema=None) as batch_op:
        batch_op.drop_column('api_event_id')

    # ### end Alembic commands ###

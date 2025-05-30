"""Initial migration after reset

Revision ID: b4d7837a49b7
Revises: 
Create Date: 2024-12-17 20:07:18.658156

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b4d7837a49b7'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Drop dependent tables first if necessary
    op.execute('DROP TABLE IF EXISTS friend CASCADE')
    op.execute('DROP TABLE IF EXISTS saved_event CASCADE')
    op.execute('DROP TABLE IF EXISTS event CASCADE')

    # Drop the user table
    op.execute('DROP TABLE IF EXISTS "user" CASCADE')

    # Add commands to create the tables if needed
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('username', sa.String(80), nullable=False, unique=True),
        sa.Column('email', sa.String(120), nullable=False, unique=True),
        sa.Column('password', sa.String(128), nullable=False),
        sa.Column('profile_picture', sa.String(255)),
        sa.Column('bio', sa.Text())
    )


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('event',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('event_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('location', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('date', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('category', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='event_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_table('friend',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('friend_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], name='friend_user_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='friend_pkey')
    )
    op.create_table('user',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('user_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('username', sa.VARCHAR(length=80), autoincrement=False, nullable=False),
    sa.Column('email', sa.VARCHAR(length=120), autoincrement=False, nullable=False),
    sa.Column('password', sa.VARCHAR(length=128), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='user_pkey'),
    sa.UniqueConstraint('email', name='user_email_key'),
    sa.UniqueConstraint('username', name='user_username_key'),
    postgresql_ignore_search_path=False
    )
    op.create_table('saved_event',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('event_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['event.id'], name='saved_event_event_id_fkey'),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], name='saved_event_user_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='saved_event_pkey')
    )
    # ### end Alembic commands ###

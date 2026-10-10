import psycopg2
conn = psycopg2.connect("postgresql://acme_admin:strongpassword123@db:5432/acme_salary_db")
conn.autocommit = True
cur = conn.cursor()
cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
print("Database schema dropped and recreated.")

import sqlite3
c = sqlite3.connect("data/professors.db")
print("total", c.execute("select count(*) from professors").fetchone()[0])
print("with_rmp", c.execute("select count(*) from professors where num_ratings > 0").fetchone()[0])
print("with_schedule", c.execute("select count(*) from professors where schedule != '[]'").fetchone()[0])

import os
import re
from contextlib import contextmanager

import bcrypt
import mysql.connector
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI()

# Explicit origin list: wildcard + credentials is rejected by browsers and is
# an unnecessary security hole. Configure via ALLOWED_ORIGINS.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# bcrypt silently truncates anything past 72 bytes.
MAX_PASSWORD_BYTES = 72

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def validate_email(email: str) -> str:
    email = email.strip()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    return email


def encode_password(password: str) -> bytes:
    encoded = password.encode("utf-8")
    if len(encoded) > MAX_PASSWORD_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Password must be at most 72 bytes long",
        )
    return encoded


@contextmanager
def db_cursor(dictionary=False):
    """Yields (connection, cursor) and always closes them, even on error."""
    db = None
    cursor = None
    try:
        db = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME", "streamlist_db"),
        )
        cursor = db.cursor(dictionary=dictionary)
        yield db, cursor
    finally:
        if cursor is not None:
            cursor.close()
        if db is not None:
            db.close()


class UserRegister(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=MAX_PASSWORD_BYTES)


class UserLogin(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=MAX_PASSWORD_BYTES)


class MovieRequest(BaseModel):
    user_id: int
    movie_title: str = Field(min_length=1)


class EditMovieRequest(BaseModel):
    user_id: int
    old_title: str = Field(min_length=1)
    new_title: str = Field(min_length=1)


class CompleteRequest(BaseModel):
    user_id: int
    movie_title: str = Field(min_length=1)
    completed: bool

class GoogleToken(BaseModel):
    token: str


@app.get("/api/movies/{user_id}")
def get_user_movies(user_id: int):
    with db_cursor(dictionary=True) as (db, cursor):
        try:
            sql = "SELECT movie_title AS title, completed FROM saved_movies WHERE user_id = %s"
            cursor.execute(sql, (user_id,))
            results = cursor.fetchall()
        except mysql.connector.Error as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to fetch movie list") from e

    for row in results:
        row["completed"] = bool(row["completed"])

    return results

OAUTH_USER_PASSWORD_HASH = "!OAUTH_USER"


@app.post("/auth/google")
def google_auth_login(payload: GoogleToken):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Google sign-in is not configured on the server",
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        # Expired, malformed, wrong audience, wrong issuer, bad signature.
        raise HTTPException(status_code=401, detail="Invalid Google token") from e
    except Exception as e:
        # Network failure reaching Google's tokeninfo endpoint.
        raise HTTPException(
            status_code=503, detail="Could not verify Google token"
        ) from e

    email = idinfo.get("email")
    google_id = idinfo.get("sub")

    if not email or not google_id:
        raise HTTPException(status_code=401, detail="Incomplete Google token claims")
    if not idinfo.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google email is not verified")

    email = validate_email(email)

    with db_cursor(dictionary=True) as (db, cursor):
        try:
            cursor.execute(
                "SELECT id, google_id, password_hash FROM users WHERE email = %s",
                (email,),
            )
            user = cursor.fetchone()

            if user is None:
                cursor.execute(
                    "INSERT INTO users (email, password_hash, google_id) "
                    "VALUES (%s, %s, %s)",
                    (email, OAUTH_USER_PASSWORD_HASH, google_id),
                )
                user_id = cursor.lastrowid
            else:
                user_id = user["id"]
                linked_google_id = user["google_id"]

                if linked_google_id and linked_google_id != google_id:
                    # The email already exists as a different (or local)
                    # account. Refuse rather than silently hijack it.
                    raise HTTPException(
                        status_code=409,
                        detail="An account with this email already exists",
                    )

                if linked_google_id is None:
                    # Only link the first time, and never overwrite an
                    # existing local password with the OAuth sentinel.
                    if not user["password_hash"]:
                        cursor.execute(
                            "UPDATE users SET google_id = %s, password_hash = %s "
                            "WHERE id = %s",
                            (google_id, OAUTH_USER_PASSWORD_HASH, user_id),
                        )
                    else:
                        cursor.execute(
                            "UPDATE users SET google_id = %s WHERE id = %s",
                            (google_id, user_id),
                        )

            db.commit()
        except HTTPException:
            db.rollback()
            raise
        except mysql.connector.IntegrityError as e:
            # Lost a race against a concurrent sign-up for the same email.
            db.rollback()
            raise HTTPException(
                status_code=409, detail="Account already exists"
            ) from e
        except mysql.connector.Error as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail="Database connection error"
            ) from e

    return {"id": user_id, "email": email, "message": "Login successful"}

@app.post("/register")
def register_user(user: UserRegister):
    email = validate_email(user.email)
    encoded = encode_password(user.password)
    hashed_password = bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")

    with db_cursor() as (db, cursor):
        try:
            sql = "INSERT INTO users (email, password_hash) VALUES (%s, %s)"
            cursor.execute(sql, (email, hashed_password))
            db.commit()
        except mysql.connector.IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Email already registered")
        except mysql.connector.Error as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to register user") from e

    return {"message": "User registered!"}


@app.post("/login")
def login_user(user: UserLogin):
    email = validate_email(user.email)
    encoded = encode_password(user.password)

    with db_cursor(dictionary=True) as (db, cursor):
        try:
            sql = "SELECT id, password_hash FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            result = cursor.fetchone()
        except mysql.connector.Error as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Login failed") from e

        # Identical response for unknown email and bad password so the endpoint
        # cannot be used to enumerate registered accounts.
        valid = False
        if result is not None:
            stored_hash = result["password_hash"]
            if stored_hash != OAUTH_USER_PASSWORD_HASH:
                try:
                    valid = bcrypt.checkpw(encoded, stored_hash.encode("utf-8"))
                except ValueError:
                    # Malformed hash in the database.
                    valid = False

        if not valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_id = result["id"]

    return {"id": user_id, "email": email, "message": "Login successful"}


@app.post("/api/add-movie")
def add_movie_to_list(movie: MovieRequest):
    with db_cursor() as (db, cursor):
        try:
            sql = "INSERT INTO saved_movies (user_id, movie_title) VALUES (%s, %s)"
            cursor.execute(sql, (movie.user_id, movie.movie_title))
            db.commit()
        except mysql.connector.IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Movie already in your list")
        except mysql.connector.Error as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to save movie") from e

    return {"message": "Movie saved successfully!"}


@app.put("/api/edit-movie")
def edit_movie_in_list(movie: EditMovieRequest):
    with db_cursor() as (db, cursor):
        try:
            sql = (
                "UPDATE saved_movies SET movie_title = %s "
                "WHERE user_id = %s AND movie_title = %s"
            )
            cursor.execute(sql, (movie.new_title, movie.user_id, movie.old_title))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Movie not found in your list")
            db.commit()
        except HTTPException:
            db.rollback()
            raise
        except mysql.connector.Error as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to update movie") from e

    return {"message": "Movie updated successfully!"}


@app.put("/api/toggle-complete")
def toggle_movie_complete(movie: CompleteRequest):
    with db_cursor() as (db, cursor):
        try:
            sql = (
                "UPDATE saved_movies SET completed = %s "
                "WHERE user_id = %s AND movie_title = %s"
            )
            cursor.execute(sql, (movie.completed, movie.user_id, movie.movie_title))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Movie not found in your list")
            db.commit()
        except HTTPException:
            db.rollback()
            raise
        except mysql.connector.Error as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to update completion status") from e

    return {"message": "Completion status updated!"}


@app.delete("/api/remove-movie")
def remove_movie_from_list(movie: MovieRequest):
    with db_cursor() as (db, cursor):
        try:
            sql = "DELETE FROM saved_movies WHERE user_id = %s AND movie_title = %s"
            cursor.execute(sql, (movie.user_id, movie.movie_title))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Movie not found in your list")
            db.commit()
        except HTTPException:
            db.rollback()
            raise
        except mysql.connector.Error as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to remove movie") from e

    return {"message": "Movie removed successfully!"}
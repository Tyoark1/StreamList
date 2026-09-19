import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
import bcrypt

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database="streamlist_db"
    )

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class MovieRequest(BaseModel):
    user_id: int
    movie_title: str

@app.get("/api/movies/{user_id}")
async def get_user_movies(user_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        sql = "SELECT movie_title FROM saved_movies WHERE user_id = %s"
        cursor.execute(sql, (user_id,))
        results = cursor.fetchall()
        
        movie_list = [row[0] for row in results]
        
        return movie_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()

@app.post("/register")
async def register_user(user: UserRegister):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt)
    
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        sql = "INSERT INTO users (email, password_hash) VALUES (%s, %s)"
        val = (user.email, hashed_password.decode('utf-8'))
        
        cursor.execute(sql, val)
        db.commit()
        
        return {"message": "User securely registered!"}
    
    except mysql.connector.IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    finally:
        cursor.close()
        db.close()

@app.post("/login")
async def login_user(user: UserLogin):
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        sql = "SELECT id, password_hash FROM users WHERE email = %s"
        cursor.execute(sql, (user.email,))
        result = cursor.fetchone()
        
        if result is None:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_id = result[0]
        stored_hash = result[1]
        
        if not bcrypt.checkpw(user.password.encode('utf-8'), stored_hash.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        return {"id": user_id, "email": user.email, "message": "Login successful"}
        
    finally:
        cursor.close()
        db.close()

@app.post("/api/add-movie")
async def add_movie_to_list(movie: MovieRequest):
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        sql = "INSERT INTO saved_movies (user_id, movie_title) VALUES (%s, %s)"
        cursor.execute(sql, (movie.user_id, movie.movie_title))
        db.commit()
        
        return {"message": "Movie saved successfully!"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()

@app.delete("/api/remove-movie")
async def remove_movie_from_list(movie: MovieRequest):
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        sql = "DELETE FROM saved_movies WHERE user_id = %s AND movie_title = %s"
        cursor.execute(sql, (movie.user_id, movie.movie_title))
        db.commit()
        
        return {"message": "Movie removed successfully!"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
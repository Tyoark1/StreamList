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
        sql = "SELECT password_hash FROM users WHERE email = %s"
        cursor.execute(sql, (user.email,))
        result = cursor.fetchone()
        
        if result is None:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        stored_hash = result[0]
        
        if not bcrypt.checkpw(user.password.encode('utf-8'), stored_hash.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        return {"message": "Login successful"}
        
    finally:
        cursor.close()
        db.close()
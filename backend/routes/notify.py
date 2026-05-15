# routes/notify.py
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText

router = APIRouter()

class EmailData(BaseModel):
    to: EmailStr  # Validates email format
    subject: str
    message: str

@router.post("/email")
def send_email(data: EmailData):
    sender_email = "your_email@gmail.com"
    sender_password = "your_app_password_here"  # Use an app password for Gmail

    msg = MIMEText(data.message)
    msg["Subject"] = data.subject
    msg["From"] = sender_email
    msg["To"] = data.to

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, data.to, msg.as_string())
        return {"status": "Email sent successfully"}
    except Exception as e:
        return {"status": "Error sending email", "error": str(e)}
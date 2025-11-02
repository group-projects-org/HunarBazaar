import os, random, sendgrid
from twilio.rest import Client
from sendgrid.helpers.mail import Mail
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from backend.config import logger

otp_router = APIRouter()

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def send_sms(phone: str, message: str) -> bool:
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([twilio_sid, twilio_token, twilio_phone]):
        logger.error("Twilio credentials not set in environment.")
        return False

    client = Client(twilio_sid, twilio_token)
    try:
        message = client.messages.create(body=message, from_=twilio_phone, to=phone)
        logger.info(f"SMS sent successfully. SID: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS: {e}")
        return False

def send_email(receiver_email: str, otp_code: str) -> bool:
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    if not SENDGRID_API_KEY:
        logger.error("SendGrid API key missing.")
        return False
    sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
    html_content = f"""
    <html>
        <body>
            <h3>Welcome to हुनरBazaar 👋</h3>
            <p>Your One-Time Password (OTP) is: <strong>{otp_code}</strong></p>
            <p>Please do not share this OTP with anyone. Valid for 1 minute.</p>
        </body>
    </html>
    """
    message = Mail(from_email='tanujbhatt8279@gmail.com', to_emails=receiver_email, subject="हुनरBazaar OTP Verification", html_content=html_content)
    try:
        response = sg.send(message)
        logger.info(f"Email sent successfully. Status: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

@otp_router.post("/send-email-otp")
async def send_email_otp(request: Request):
    try:
        data = await request.json()
        email = data.get('email')
        if not email: return JSONResponse(content={"message": "Email is required."}, status_code=400)
        otp_code = generate_otp()
        success = await run_in_threadpool(send_email, email, otp_code)
        if success: return JSONResponse(content={"message": "OTP sent to email", "otp": otp_code}, status_code=200)
        else: return JSONResponse(content={"message": "Failed to send email OTP."}, status_code=500)
    except Exception as e:
        logger.error(f"Error in send_email_otp: {e}")
        return JSONResponse(content={"message": "Internal error", "error": str(e)}, status_code=500)

@otp_router.post("/send-sms-otp")
async def send_sms_otp(request: Request):
    try:
        data = await request.json()
        phone = f"{data.get('country_code', '')}{data.get('phone', '')}"
        if not phone: return JSONResponse(content={"message": "Phone number is required."}, status_code=400)
        otp_code = generate_otp()
        message = f"हुनरBazaar: Your OTP is {otp_code}. Do not share this code. Valid for 1 minute."
        success = await run_in_threadpool(send_sms, phone, message)
        if success:
            logger.info("OTP generated and SMS sent.")
            return JSONResponse(content={"otp": otp_code}, status_code=200)
        else: return JSONResponse(content={"message": "Failed to send SMS OTP."}, status_code=500)
    except Exception as e:
        logger.error(f"Error in send_sms_otp: {e}")
        return JSONResponse(content={"message": "Internal error", "error": str(e)}, status_code=500) 
import os, secrets, smtplib, redis, io, base64, random, string, requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from backend.config import logger
from uuid import uuid4
from backend.config import root_path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

otp_router = APIRouter()
REDIS_REST_URL=os.getenv("REDIS_REST_URL")
RECAPTCHA_SECRET_KEY=os.getenv("RECAPTCHA_SECRET_KEY")
redis_client = redis.Redis.from_url(REDIS_REST_URL, decode_responses=True)

def generate_otp():
    return ''.join(str(secrets.randbelow(10)) for _ in range(6))
def random_string(length=5):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def send_email(receiver_email: str, otp_code: str) -> bool:
    sender_email = os.getenv("GMAIL_APP_MAIL")
    app_password = os.getenv("GMAIL_APP_PASSWORD")

    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "हुनरBazaar OTP Verification"
        message["From"] = sender_email
        message["To"] = receiver_email

        html_content = f"""
        <html>
          <head><link href="https://fonts.googleapis.com/css2?family=Eagle+Lake&display=swap" rel="stylesheet"></head>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

              <div style="background: linear-gradient(#3cbf4e, #2ecc71); padding: 20px; text-align: center;">
                <img src="https://raw.githubusercontent.com/group-projects-org/HunarBazaar/master/docs/Hunar_Bazaar.jpeg" alt="हुनरBazaar Logo" style="width: 120px; margin-bottom: 10px;">
                <h2 style="color: white; margin: 0; font-family: &quot;Eagle Lake&quot;, cursive;">हुनरBazaar Verification</h2>
              </div>

              <div style="padding: 25px;">
                <h3 style="color: #333;">Hello from हुनरBazaar 👋</h3>
                <p style="font-size: 15px; color: #555;">
                  Thank you for using <strong>हुनरBazaar</strong>.  
                  To complete your verification, please use the One-Time Password (OTP) below:
                </p>

                <div style="text-align: center; margin: 25px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #ff6600; letter-spacing: 5px;">
                    {otp_code}
                  </span>
                </div>

                <p style="font-size: 14px; color: #777;">
                  This OTP is valid for <strong>3 minutes</strong>.  
                  Please do not share it with anyone for security reasons.
                </p>

                <p style="font-size: 14px; color: #777;">
                  If you did not request this, please ignore this email or contact our support team immediately.
                </p>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

                <p style="font-size: 13px; color: #999; text-align: center;">
                  © {2025} हुनरBazaar. All rights reserved.<br>
                  Craftsmanship you can feel, Luxury you can wear. 🇮🇳
                </p>
              </div>

            </div>
          </body>
        </html>
        """
        message.attach(MIMEText(html_content, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, app_password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        return True
    except Exception as e:
        print("Error sending OTP Email:", e)
        return False

@otp_router.post("/captcha_otp/validate")
def validate(body: dict):
    redis_id = body["id"]
    answer = body["answer"]
    stored_answer = redis_client.get(redis_id)
    if stored_answer is None: return {"valid": False, "reason": "expired or invalid"}
    if stored_answer.lower() == answer.lower():
        redis_client.delete(redis_id)
        return {"valid": True}
    return {"valid": False}

@otp_router.post("/send-email-otp")
async def send_email_otp(request: Request):
    try:
        data = await request.json()
        email = data.get('email')
        if not email: return JSONResponse(content={"message": "Email is required."}, status_code=400)
        otp_id = str(uuid4())
        otp_code = generate_otp()
        success = await run_in_threadpool(send_email, email, otp_code)
        if success:
            redis_client.setex(otp_id, 180, otp_code)
            return JSONResponse(content={"message": "OTP sent to email", "otpId": otp_id}, status_code=200)
        else: return JSONResponse(content={"message": "Failed to send email OTP."}, status_code=500)
    except Exception as e:
        logger.error(f"Error in send_email_otp: {e}")
        return JSONResponse(content={"message": "Internal error", "error": str(e)}, status_code=500)

def generate_image(text):
    width, height = 180, 70
    image = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)
    for x in range(width):
        for y in range(height):
            if random.random() < 0.02:
                draw.point((x, y), fill=(random.randint(200,255), random.randint(200,255), random.randint(200,255)))
    font_path = os.path.join(root_path, "dependencies", "arial.ttf")
    try: font = ImageFont.truetype(font_path, 40)
    except: font = ImageFont.load_default()
    def random_dark():
        return (random.randint(0, 120), random.randint(0, 120), random.randint(0, 120))
    for _ in range(5):
        start = (random.randint(0, width), random.randint(0, height))
        end = (random.randint(0, width), random.randint(0, height))
        draw.line([start, end], fill=random_dark(), width=2)
    for _ in range(300):
        x = random.randint(0, width)
        y = random.randint(0, height)
        draw.point((x, y), fill=random_dark())
    x_offset = 15
    for char in text:
        char_img = Image.new("RGBA", (50, 70), (255, 255, 255, 0))
        char_draw = ImageDraw.Draw(char_img)
        char_draw.text((10, 5), char, font=font, fill=random_dark())
        rotated = char_img.rotate(random.randint(-25, 25), resample=Image.BICUBIC, expand=1)
        image.paste(rotated, (x_offset, random.randint(0, 10)), rotated)
        x_offset += 30
    image = image.filter(ImageFilter.GaussianBlur(0.5))
    image = image.filter(ImageFilter.SMOOTH_MORE)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()

@otp_router.get("/captcha/new")
def new_captcha():
    text = random_string()
    captcha_id = str(uuid4())
    image_data = generate_image(text)
    redis_client.setex(captcha_id, 120, text)
    return {"captchaId": captcha_id, "image": image_data}

@otp_router.post("/captcha_otp/recaptcha")
async def recaptcha(request: Request):
    try:
        data = await request.json()
        token = data.get("token")
        if not token:
            return JSONResponse(content={"error": "Captcha token missing"}, status_code=400)
        captcha_url = "https://www.google.com/recaptcha/api/siteverify"
        captcha_data = {"secret": RECAPTCHA_SECRET_KEY, "response": token}
        captcha_res = requests.post(captcha_url, data=captcha_data).json()
        if not captcha_res.get("success"):
            return JSONResponse(content={"error": "reCAPTCHA verification failed"}, status_code=400)
        return {"message": "Captcha verified", "success": True}
    except Exception as e:
        return JSONResponse(content={"error": f"Internal Server Error: {str(e)}"}, status_code=500)
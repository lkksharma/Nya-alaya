from django.conf import settings
try:
    from twilio.rest import Client
except ImportError:
    Client = None

def send_sms(phone_number, message):
    """
    Sends an SMS to the given phone number using Twilio.
    """
    if not phone_number:
        print(f"SMS SKIPPED: No phone number provided.")
        return

    if not Client:
        print("Twilio library not installed. Skipping SMS.")
        print(f"Mock Send -> To: {phone_number}, Msg: {message}")
        return

    if not settings.TWILIO_AUTH_TOKEN:
        print("Twilio Auth Token not configured. Skipping SMS.")
        print(f"Mock Send -> To: {phone_number}, Msg: {message}")
        return

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        sent_message = client.messages.create(
            from_=settings.TWILIO_PHONE_NUMBER,
            body=message,
            to=phone_number
        )
        print(f"--- SMS SENT ---")
        print(f"SID: {sent_message.sid}")
        print(f"To: {phone_number}")
        print(f"----------------")
    except Exception as e:
        print(f"Failed to send SMS: {e}")

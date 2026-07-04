# WhatsApp Notification Fix for Appointment Booking

## Steps:
- [ ] 1. Create .env file with:
  - TWILIO_ACCOUNT_SID=your_sid
  - TWILIO_AUTH_TOKEN=your_token  
  - CLINIC_WHATSAPP=whatsapp:+916352071040
- [ ] 2. Run: pip install twilio python-dotenv
- [ ] 3. Update app.py to send WhatsApp after booking save
- [ ] 4. Test: python app.py → book appointment → check WhatsApp
- [ ] 5. Verify in admin dashboard and data/appointments.json


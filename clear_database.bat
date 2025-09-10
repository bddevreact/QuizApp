@echo off
echo 🗄️ Firebase Database Clear Tool
echo ================================

echo 📦 Installing Python dependencies...
pip install -r requirements.txt

echo.
echo 🚀 Starting database clear script...
python clear_firebase_data.py

echo.
echo ✅ Script completed!
pause

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "requests": "Vehicle Requests",
      "fleet": "Fleet Status",
      "users": "User Management",
      "settings": "Settings",
      "fuel_requests": "Fuel Requests",
      "fuel": "Fuel Requests",
      "new_request": "New Request",
      "total_vehicles": "Total Vehicles",
      "available": "Available",
      "pending": "Pending Approvals",
      "maintenance": "Maintenance Due",
      "purpose": "Purpose of Trip",
      "destination": "Destination",
      "start_date": "Start Date & Time",
      "end_date": "End Date & Time",
      "vehicle_type": "Vehicle Type",
      "priority": "Priority",
      "static_assignment": "Static Assignment (Permanent Lock)",
      "submit": "Submit Request",
      "cancel": "Cancel",
      "login": "Login",
      "username": "Username",
      "password": "Password",
      "change_password": "Change Password",
      "change_username": "Change Username",
      "new_password": "New Password",
      "new_username": "New Username",
      "save_changes": "Save Changes",
      "register_user": "Register New User",
      "full_name": "Full Name",
      "email": "Email Address",
      "role": "Role",
      "department": "Department",
      "region": "Region",
      "branch": "Branch",
      "branch_phone": "Branch Phone Number",
      "reset_password": "Reset Password",
      "hq": "Headquarters (HQ)"
    }
  },
  am: {
    translation: {
      "dashboard": "ዳሽቦርድ",
      "requests": "የተሽከርካሪ ጥያቄዎች",
      "fleet": "የተሽከርካሪዎች ሁኔታ",
      "users": "የተጠቃሚዎች አስተዳደር",
      "settings": "ቅንብሮች",
      "fuel_requests": "የነዳጅ ጥያቄዎች",
      "fuel": "የነዳጅ ጥያቄዎች",
      "new_request": "አዲስ ጥያቄ",
      "total_vehicles": "ጠቅላላ ተሽከርካሪዎች",
      "available": "ዝግጁ",
      "pending": "በመጠባበቅ ላይ ያሉ",
      "maintenance": "ጥገና የሚያስፈልጋቸው",
      "purpose": "የጉዞው ዓላማ",
      "destination": "መድረሻ",
      "start_date": "መነሻ ቀን እና ሰዓት",
      "end_date": "መመለሻ ቀን እና ሰዓት",
      "vehicle_type": "የተሽከርካሪ ዓይነት",
      "priority": "ቅድሚያ የሚሰጠው",
      "static_assignment": "ቋሚ ምደባ (ቋሚ መቆለፊያ)",
      "submit": "ጥያቄውን ላክ",
      "cancel": "ሰርዝ",
      "login": "ግባ",
      "username": "የተጠቃሚ ስም",
      "password": "የይለፍ ቃል",
      "change_password": "የይለፍ ቃል ቀይር",
      "change_username": "የተጠቃሚ ስም ቀይር",
      "new_password": "አዲስ የይለፍ ቃል",
      "new_username": "አዲስ የተጠቃሚ ስም",
      "save_changes": "ለውጦችን አስቀምጥ",
      "register_user": "አዲስ ተጠቃሚ መዝግብ",
      "full_name": "ሙሉ ስም",
      "email": "ኢሜይል አድራሻ",
      "role": "ሚና",
      "department": "ክፍል",
      "region": "ክልል",
      "branch": "ቅርንጫፍ",
      "branch_phone": "የቅርንጫፍ ስልክ ቁጥር",
      "reset_password": "የይለፍ ቃል መልስ",
      "hq": "ዋና መሥሪያ ቤት (HQ)"
    }
  },
  om: {
    translation: {
      "dashboard": "Daashboordii",
      "requests": "Gaaffii Konkolaataa",
      "fleet": "Haala Konkolaataa",
      "users": "Bulchiinsa Fayyadamtootaa",
      "settings": "Sajata",
      "fuel_requests": "Gaaffii Bobaa",
      "fuel": "Gaaffii Bobaa",
      "new_request": "Gaaffii Haaraa",
      "total_vehicles": "Waliigala Konkolaataa",
      "available": "Qophii",
      "pending": "Eeggannoo Irra",
      "maintenance": "Suphaa Kan Barbaadan",
      "purpose": "Kaayyoo Imalaa",
      "destination": "Bakka Ga'umsaa",
      "start_date": "Guyyaa fi Sa'aatii Jalqabaa",
      "end_date": "Guyyaa fi Sa'aatii Xumuraa",
      "vehicle_type": "Gosa Konkolaataa",
      "priority": "Dursi",
      "static_assignment": "Ramaddii Dhaabbataa",
      "submit": "Gaaffii Ergi",
      "cancel": "Haquu",
      "login": "Seenuu",
      "username": "Maqaa Fayyadamaa",
      "password": "Jecha Icchitii",
      "change_password": "Jecha Icchitii Jijjiiri",
      "change_username": "Maqaa Fayyadamaa Jijjiiri",
      "new_password": "Jecha Icchitii Haaraa",
      "new_username": "Maqaa Fayyadamaa Haaraa",
      "save_changes": "Jijjiirama Olkaayi",
      "register_user": "Fayyadamaa Haaraa Galmeessi",
      "full_name": "Maqaa Guutuu",
      "email": "Teessoo I-meelii",
      "role": "Gahee",
      "department": "Kutaa",
      "region": "Naannoo",
      "branch": "Damee",
      "branch_phone": "Lakkoofsa Bilbila Damee",
      "reset_password": "Jecha Icchitii Deebisi",
      "hq": "Waajjira Muummee (HQ)"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

// MongoDB Restore Script for animal_hospital_db
// Generated on: 2025-09-18T02:32:35.627028
// Use: mongo animal_hospital_db < this_script.js

print("🚀 Starting database restoration for animal_hospital_db");

// Switch to the target database
use animal_hospital_db;

// Clear existing collections (optional - remove these lines to preserve existing data)
print("🗑️ Clearing existing collections...");
db.timesheet_config.drop();
db.ai_settings.drop();
db.appointment_slot_config.drop();
db.business_services.drop();
db.ai_agents.drop();
db.pay_period_progression.drop();
db.customers.drop();
db.templates.drop();
db.hospital_hours.drop();
db.shift_presets.drop();
db.global_placeholders.drop();
db.ai_posts.drop();
db.holidays.drop();
db.users.drop();
db.paystub_config.drop();
db.email_config.drop();
db.blocked_slots.drop();
db.timesheet_reports.drop();
db.employee_configs.drop();
db.time_entries.drop();
db.ai_usage_logs.drop();
db.pay_period_settings.drop();
db.shifts.drop();
db.business_info.drop();
db.urgent_care_hours.drop();
db.time_adjustments.drop();
db.cms_settings.drop();
db.reviews.drop();
db.timesheet_ai_agents.drop();

// Inserting data into collections

print('📦 Restoring collection: timesheet_config (1 documents)');
db.timesheet_config.insertMany([
  {
  "_id": "ObjectId('68b8f261b01e05b270a73461')",
  "id": "32be28d8-ef81-4a4f-a781-a7b156a17fea",
  "location_tracking_enabled": false,
  "overtime_cutoff_time": "17:00",
  "overtime_multiplier": 1.5,
  "auto_clockout_grace_minutes": 30,
  "pay_period_type": "biweekly",
  "created_at": "2025-09-03 21:58:57.167000",
  "updated_at": "2025-09-05 17:57:19.146000",
  "updated_by": "f763c809-f046-4bec-9592-f078076d8f6a",
  "after_hours_cutoff_time": "17:00",
  "original_pay_period_start_date": "2025-09-05"
}
]);
print('✅ timesheet_config restored successfully');

print('📦 Restoring collection: ai_settings (1 documents)');
db.ai_settings.insertMany([
  {
  "_id": "ObjectId('68b8e075a647772544c963ea')",
  "id": "d3325eac-6856-4bd7-b7f1-98d3b1594907",
  "llm_settings": {
    "provider": "emergent",
    "model": "gpt-4o-mini",
    "temperature": 0.8,
    "max_tokens": 1200
  },
  "image_settings": {
    "provider": "openai",
    "model": "dall-e-3",
    "quality": "hd",
    "size": "1024x1024"
  },
  "social_settings": {
    "facebook": {
      "app_id": "test_app_id",
      "app_secret": "test_secret",
      "access_token": "test_token",
      "page_id": "test_page"
    }
  },
  "news_settings": {
    "update_frequency": "3"
  },
  "created_at": "2025-09-01 14:21:28.204000",
  "updated_at": "2025-09-03 00:31:14.085000"
}
]);
print('✅ ai_settings restored successfully');

print('📦 Restoring collection: appointment_slot_config (1 documents)');
db.appointment_slot_config.insertMany([
  {
  "_id": "ObjectId('68b8e148a647772544c963ec')",
  "id": "e0b94762-665c-4ec6-8d72-724239ec24c1",
  "slot_interval_minutes": 30,
  "first_appointment_delay_minutes": 0,
  "last_appointment_cutoff_minutes": 30,
  "created_at": "2025-09-04 00:46:00.613000",
  "updated_at": "2025-09-04 00:46:00.613000",
  "updated_by": "f763c809-f046-4bec-9592-f078076d8f6a"
}
]);
print('✅ appointment_slot_config restored successfully');

print('📦 Restoring collection: ai_agents (12 documents)');
db.ai_agents.insertMany([
  {
  "_id": "ObjectId('68bdf17d01872c100137db82')",
  "id": "4fc15509-f1f1-4966-87c5-9df5b5dd87e6",
  "agent_type": "social_media",
  "agent_name": "Social Media - Recurring",
  "mode": "recurring",
  "topic": "Pet Care Tips",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "none",
  "uploaded_images": [],
  "frequency": "24",
  "schedule_type": "selected_days",
  "social_platforms": {
    "facebook": true,
    "instagram": true,
    "twitter": true,
    "whatsapp": true
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": {
    "monday": true,
    "tuesday": false,
    "wednesday": false,
    "thursday": false,
    "friday": false,
    "saturday": false,
    "sunday": false
  },
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": null,
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 16:49:33.274000",
  "selected_holidays": [],
  "created_at": "2025-09-07 16:56:29.628000",
  "updated_at": "2025-09-11 02:07:57.790000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "email_content": "",
  "email_content_template": "",
  "email_subject": "",
  "email_type": "bulk",
  "include_summary": true,
  "run_every_pay_period": "current_week",
  "selected_customer": "",
  "selected_sms_customer": "",
  "sms_character_limit": 160,
  "sms_content": "",
  "sms_link": "https://petsandvetsanimalhospital.com",
  "sms_provider": "twilio",
  "sms_subject": "",
  "sms_template": "",
  "sms_type": "bulk",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "use_sms_chatgpt_formatting": true
},
  {
  "_id": "ObjectId('68be2cd02b1277ead48126d6')",
  "id": "70f8ac46-4e49-4771-9b40-39a5ee552ff2",
  "agent_type": "social_media",
  "agent_name": "Social Media - Adhoc",
  "mode": "adhoc",
  "topic": "Trending Pet Health News",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "none",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "all_days",
  "social_platforms": {
    "facebook": true,
    "instagram": true,
    "twitter": true,
    "whatsapp": true
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": null,
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": "2025-09-11",
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 17:02:58.024000",
  "selected_holidays": [],
  "created_at": "2025-09-07 21:09:36.085000",
  "updated_at": "2025-09-14 21:02:52.130000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "email_content": "",
  "email_content_template": "",
  "email_subject": "",
  "email_type": "bulk",
  "include_summary": true,
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review",
  "run_every_pay_period": "current_week",
  "selected_customer": "",
  "selected_sms_customer": "",
  "sms_character_limit": 160,
  "sms_content": "",
  "sms_link": "https://petsandvetsanimalhospital.com",
  "sms_provider": "twilio",
  "sms_subject": "",
  "sms_template": "",
  "sms_type": "bulk",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "use_sms_chatgpt_formatting": true
},
  {
  "_id": "ObjectId('68be2d1c2b1277ead48126d8')",
  "id": "ca481c10-b9a2-4577-b01e-bae6839f5b8e",
  "agent_type": "social_media",
  "agent_name": "My Post",
  "mode": "write",
  "topic": "",
  "custom_topic": "",
  "post_title": "Urgent Care is Opening Soon",
  "post_content": "Pets and Vets Animal Hospital is going to start Urgent Care along with existing General Practice to better server our community for extended hours care for the pets",
  "use_web_research": true,
  "image_option": "none",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "all_days",
  "social_platforms": {
    "facebook": true,
    "instagram": true,
    "twitter": true,
    "whatsapp": true
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "75",
  "days_of_week": null,
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": "2025-09-09",
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 17:06:52.890000",
  "selected_holidays": [],
  "created_at": "2025-09-07 21:10:52.684000",
  "updated_at": "2025-09-14 21:06:41.155000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "email_content": "",
  "email_content_template": "",
  "email_subject": "",
  "email_type": "bulk",
  "include_summary": true,
  "run_every_pay_period": "current_week",
  "selected_customer": "",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review",
  "selected_sms_customer": "",
  "sms_character_limit": 160,
  "sms_content": "",
  "sms_link": "https://petsandvetsanimalhospital.com",
  "sms_provider": "twilio",
  "sms_subject": "",
  "sms_template": "",
  "sms_type": "bulk",
  "use_sms_chatgpt_formatting": true
},
  {
  "_id": "ObjectId('68be2ff52b1277ead48126da')",
  "id": "f87096ff-7453-4e29-ba63-1913f1937c24",
  "agent_type": "time_sheet",
  "agent_name": "Biweekly - Timesheet",
  "mode": "recurring",
  "topic": "Timesheet Report",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "ai_generate",
  "uploaded_images": [],
  "frequency": "bi_weekly",
  "schedule_type": "all_days",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": {
    "monday": true,
    "tuesday": false,
    "wednesday": false,
    "thursday": false,
    "friday": false,
    "saturday": false,
    "sunday": false
  },
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": null,
  "immediate": false,
  "selected_employees": [
    "54f33c4b-bd57-4fd3-b748-b420e417a83f",
    "f763c809-f046-4bec-9592-f078076d8f6a"
  ],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [
    "stephenpallamshop@gmail.com"
  ],
  "auto_email": true,
  "schedule_time": "10:00",
  "last_manual_run": "2025-09-17 17:08:44.163000",
  "selected_holidays": [],
  "created_at": "2025-09-07 21:23:01.641000",
  "updated_at": "2025-09-08 01:23:28.993000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 2,
  "include_summary": true,
  "run_every_pay_period": "bi_weekly"
},
  {
  "_id": "ObjectId('68bf0f9ea06ed256abb45cd8')",
  "id": "8271969c-48c1-483b-a165-723e3c7266bb",
  "agent_type": "time_sheet",
  "agent_name": "Adhoc - Timesheet",
  "mode": "adhoc",
  "topic": "Timesheet Report",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "ai_generate",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "all_days",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": null,
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": null,
  "immediate": false,
  "selected_employees": [
    "f763c809-f046-4bec-9592-f078076d8f6a"
  ],
  "report_period": "custom",
  "custom_start_date": "2025-09-04",
  "custom_end_date": "2025-09-19",
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [
    "stephenpallamshop@gmail.com"
  ],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-17 17:57:49.590000",
  "selected_holidays": [],
  "created_at": "2025-09-08 13:17:18.883000",
  "updated_at": "2025-09-17 21:08:00.929000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "email_content": "",
  "email_content_template": "",
  "email_subject": "",
  "email_type": "bulk",
  "include_summary": true,
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review",
  "run_every_pay_period": "current_week",
  "selected_customer": "",
  "selected_sms_customer": "",
  "sms_character_limit": 160,
  "sms_content": "",
  "sms_link": "https://petsandvetsanimalhospital.com",
  "sms_provider": "twilio",
  "sms_subject": "",
  "sms_template": "",
  "sms_type": "bulk",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "use_sms_chatgpt_formatting": true
},
  {
  "_id": "ObjectId('68bf733fc0df5ff0bbc10926')",
  "id": "9e936886-4d17-4c3a-9987-51c63c1a6486",
  "agent_type": "email",
  "agent_name": "Weekly Newsletter",
  "mode": "recurring",
  "topic": "Trending Pet Health News",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "none",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "weekly",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": {
    "monday": true,
    "tuesday": false,
    "wednesday": false,
    "thursday": false,
    "friday": false,
    "saturday": false,
    "sunday": false
  },
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": null,
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 17:10:26.289000",
  "selected_holidays": [],
  "email_content_template": "Dear [CUSTOMER_NAME],\n\nHope [PET_NAME] are doing well. \n\n[CHATGPT_CONTENT]\n\nWe appreciate your trust in our care for your beloved pets. For any questions or to schedule an appointment, please contact us.\n\nWarm regards,\n[BUSINESS_NAME]\n\ud83d\udcde [PHONE_NUMBER]\n\ud83c\udf10 [WEBSITE_LINK]\n\ud83d\udcc5 [BOOK_NOW_LINK]\n[BUSINESS_ADDRESS]",
  "email_subject": "",
  "email_content": "",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "email_type": "bulk",
  "selected_customer": "",
  "created_at": "2025-09-08 20:22:23.610000",
  "updated_at": "2025-09-14 00:10:05.012000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "include_summary": true,
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review",
  "run_every_pay_period": "current_week",
  "selected_sms_customer": "",
  "sms_character_limit": 160,
  "sms_content": "",
  "sms_link": "https://petsandvetsanimalhospital.com",
  "sms_provider": "twilio",
  "sms_subject": "",
  "sms_template": "",
  "sms_type": "bulk",
  "use_sms_chatgpt_formatting": true
},
  {
  "_id": "ObjectId('68bf8879d897731bce6a91b6')",
  "id": "1fc0e17f-f506-44b4-91b7-8f30f4a2eae2",
  "agent_type": "email",
  "agent_name": "Write Email Agent",
  "mode": "write",
  "topic": "",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "none",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "all_days",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "post_time": "10:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": null,
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": "2025-09-10",
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 17:55:07.588000",
  "selected_holidays": [],
  "email_content_template": "",
  "email_subject": "Urgent Care is opening soon",
  "email_content": "Dear CUSTOMER_NAME,\n\nI hope this message finds you and PET_NAMES in great health and spirits!\n\n[CHATGPT_CONTENT]\n\n\nWe appreciate your trust in our care for your beloved pets. For any questions or to schedule an appointment, please contact us.\n\nWarm regards,\n[BUSINESS_NAME]\n\ud83d\udcde [PHONE_NUMBER]\n\ud83c\udf10 [WEBSITE_LINK]\n\ud83d\udcc5 [BOOK_NOW_LINK]\n[BUSINESS_ADDRESS]",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "email_type": "bulk",
  "selected_customer": "",
  "created_at": "2025-09-08 21:52:57.796000",
  "updated_at": "2025-09-14 00:19:00.922000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "include_summary": true,
  "run_every_pay_period": "current_week",
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review",
  "selected_sms_customer": "",
  "sms_character_limit": 160,
  "sms_content": "",
  "sms_link": "https://petsandvetsanimalhospital.com",
  "sms_provider": "twilio",
  "sms_subject": "",
  "sms_template": "",
  "sms_type": "bulk",
  "use_sms_chatgpt_formatting": true
},
  {
  "_id": "ObjectId('68c0a456898d1c69d76ef3cd')",
  "id": "287dfd1b-51ec-4a62-9fd4-0fc7489d73b0",
  "agent_type": "sms_agent",
  "agent_name": "Scheduled - SMS",
  "mode": "recurring",
  "topic": "",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "ai_generate",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "all_days",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": null,
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": null,
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 17:56:23.770000",
  "selected_holidays": [
    "21c5c86f-577a-465f-aaeb-6d69441617ba",
    "371d5c15-0169-4644-9b90-3746e49f2a3b",
    "dd8471d4-7963-4a22-8a5c-161c8401f5eb",
    "d7180f4b-9372-440b-90ce-de59e72410b2"
  ],
  "email_content_template": "",
  "email_subject": "",
  "email_content": "",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "email_type": "bulk",
  "selected_customer": "",
  "sms_template": "Hi [CUSTOMER_NAME]! Parent of [PET_NAMES] -  [CHATGPT_CONTENT] -  [BUSINESS_NAME]. Book now: [BOOK_NOW_LINK] or call [PHONE_NUMBER]",
  "sms_subject": "",
  "sms_content": "",
  "sms_provider": "twilio",
  "use_sms_chatgpt_formatting": true,
  "sms_type": "bulk",
  "selected_sms_customer": null,
  "sms_character_limit": 160,
  "created_at": "2025-09-09 18:04:06.297000",
  "updated_at": "2025-09-14 21:56:13.615000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "include_summary": true,
  "run_every_pay_period": "current_week",
  "sms_link": "https://petsandvetsanimalhospital.com",
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review"
},
  {
  "_id": "ObjectId('68c194ac6bd57cfa82062280')",
  "id": "e024f4b4-f3c1-4432-b0c6-551fd0b185f0",
  "agent_type": "sms_agent",
  "agent_name": "Recurring - Weekly - SMS",
  "mode": "recurring",
  "topic": "Health checkup alerts",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "ai_generate",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "weekly",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": {
    "monday": true,
    "tuesday": false,
    "wednesday": false,
    "thursday": false,
    "friday": false,
    "saturday": false,
    "sunday": false
  },
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": null,
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 18:27:38.546000",
  "selected_holidays": [],
  "email_content_template": "",
  "email_subject": "",
  "email_content": "",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "email_type": "bulk",
  "selected_customer": "",
  "sms_template": "Hi [CUSTOMER_NAME]! Parent of [PET_NAME] -  [CHATGPT_CONTENT] -  [BUSINESS_NAME]. Book now: [BOOK_NOW_LINK] or call [PHONE_NUMBER]",
  "sms_subject": "",
  "sms_content": "",
  "sms_provider": "twilio",
  "use_sms_chatgpt_formatting": true,
  "sms_type": "bulk",
  "selected_sms_customer": null,
  "sms_character_limit": 160,
  "sms_link": "https://petsandvetsanimalhospital.com",
  "created_at": "2025-09-10 11:09:32.926000",
  "updated_at": "2025-09-14 14:49:24.009000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "include_summary": true,
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review",
  "run_every_pay_period": "current_week"
},
  {
  "_id": "ObjectId('68c198966bd57cfa82062285')",
  "id": "0a6893a5-6388-49d1-b5b5-cad0fe0596aa",
  "agent_type": "sms_agent",
  "agent_name": "My SMS",
  "mode": "write",
  "topic": "",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "ai_generate",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "all_days",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "post_time": "09:00",
  "image_text": "",
  "word_count": "100",
  "days_of_week": null,
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": "2025-09-12",
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 18:27:31.480000",
  "selected_holidays": [],
  "email_content_template": "",
  "email_subject": "",
  "email_content": "",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "email_type": "bulk",
  "selected_customer": "",
  "sms_template": "Hi [CUSTOMER_NAME]! Parent of [PET_NAMES] -  [CHATGPT_CONTENT] -  [BUSINESS_NAME]. Book now: [BOOK_NOW_LINK] or call [PHONE_NUMBER]",
  "sms_subject": "Urgent Care is oping soon",
  "sms_content": "Urgent Care is oping soon",
  "sms_provider": "twilio",
  "use_sms_chatgpt_formatting": true,
  "sms_type": "bulk",
  "selected_sms_customer": null,
  "sms_character_limit": 160,
  "sms_link": "https://petsandvetsanimalhospital.com",
  "created_at": "2025-09-10 11:26:14.451000",
  "updated_at": "2025-09-14 17:01:35.016000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "include_summary": true,
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review",
  "run_every_pay_period": "current_week"
},
  {
  "_id": "ObjectId('68c1ccfc03d8548a79ad9273')",
  "id": "1e7a5320-d57a-46c2-8959-fd481305ded9",
  "agent_name": "Holiday Email Agent",
  "agent_type": "email",
  "mode": "recurring",
  "selected_holidays": [
    "21c5c86f-577a-465f-aaeb-6d69441617ba",
    "3e0800b6-8f30-4d33-8cd9-2ce26fdf96c1",
    "0692c620-69e0-4507-91a5-f00b79c085f9",
    "dd8471d4-7963-4a22-8a5c-161c8401f5eb"
  ],
  "is_active": true,
  "email_content_template": "Dear Valued Customer,\n\n[CHATGPT_CONTENT]\n\nWe appreciate your trust in our care for your beloved pets. For any questions or to schedule an appointment, please contact us.\n\nWarm regards,\n[BUSINESS_NAME]\n\ud83d\udcde [PHONE_NUMBER]\n\ud83c\udf10 [WEBSITE_LINK]\n\ud83d\udcc5 [BOOK_NOW_LINK]\n[BUSINESS_ADDRESS]",
  "use_chatgpt_formatting": true,
  "post_time": "09:00",
  "created_at": "2025-09-10 19:09:48.186000",
  "updated_at": "2025-09-14 12:45:11.461000",
  "auto_email": false,
  "auto_post": false,
  "custom_end_date": null,
  "custom_start_date": null,
  "custom_topic": "",
  "days_after_period_end": 1,
  "days_of_week": null,
  "email_content": "",
  "email_recipients": [],
  "email_subject": "",
  "email_type": "bulk",
  "frequency": null,
  "image_option": "none",
  "image_text": "",
  "immediate": false,
  "include_billing_rates": true,
  "include_summary": true,
  "initial_status": "in_review",
  "last_post_published": null,
  "post_content": "",
  "post_date": null,
  "post_destination": "in_review",
  "post_title": "",
  "report_period": "current_week",
  "run_every_pay_period": "current_week",
  "schedule_time": "09:00",
  "schedule_type": "all_days",
  "selected_customer": "",
  "selected_employees": [],
  "selected_sms_customer": "",
  "sms_character_limit": 160,
  "sms_content": "",
  "sms_link": "https://petsandvetsanimalhospital.com",
  "sms_provider": "twilio",
  "sms_subject": "",
  "sms_template": "",
  "sms_type": "bulk",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "topic": "",
  "uploaded_images": [],
  "use_customer_database": true,
  "use_sms_chatgpt_formatting": true,
  "use_web_research": false,
  "word_count": "150",
  "last_manual_run": "2025-09-14 18:26:30.581000",
  "marketing_channels": [],
  "marketing_content_type": "topic",
  "marketing_custom_campaign": "",
  "marketing_email_personalized": true,
  "marketing_email_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_post_time": null,
  "marketing_scheduled_date": null,
  "marketing_selected_holidays": [],
  "marketing_selected_topic": "",
  "marketing_sms_personalized": true,
  "marketing_sms_template": "",
  "marketing_social_platforms": {},
  "marketing_workflow_mode": "in_review"
},
  {
  "_id": "ObjectId('68c59f5fb3f15c061e4c837b')",
  "id": "40e365da-f4f0-4dcb-8e84-d2fe4739fff8",
  "agent_type": "marketing_agent",
  "agent_name": "My Campaign",
  "mode": "adhoc",
  "topic": "",
  "custom_topic": "",
  "post_title": "",
  "post_content": "",
  "use_web_research": false,
  "image_option": "none",
  "uploaded_images": [],
  "frequency": null,
  "schedule_type": "all_days",
  "social_platforms": {
    "facebook": false,
    "instagram": false,
    "twitter": false,
    "whatsapp": false
  },
  "post_time": "11:00",
  "image_text": "Happy pets getting veterinary care, professional clinic setting",
  "word_count": "100",
  "days_of_week": null,
  "auto_post": false,
  "post_destination": "in_review",
  "last_post_published": null,
  "post_date": "2025-09-18",
  "immediate": false,
  "selected_employees": [],
  "report_period": "current_week",
  "custom_start_date": null,
  "custom_end_date": null,
  "include_billing_rates": true,
  "initial_status": "in_review",
  "email_recipients": [],
  "auto_email": false,
  "schedule_time": "09:00",
  "last_manual_run": "2025-09-14 18:19:27.673000",
  "selected_holidays": [
    "d7180f4b-9372-440b-90ce-de59e72410b2",
    "fc995a23-226d-4b53-8022-17eb4ccce977",
    "60a70b30-3a16-4d48-807f-72fd331ae34f",
    "89ab93bf-0dbf-4b40-80c9-c209de443dc6"
  ],
  "email_content_template": "Dear [CUSTOMER_NAME],\n\nHope [PET_NAME] are doing well. \n\n[CHATGPT_CONTENT]\n\nWe appreciate your trust in our care for your beloved pets. For any questions or to schedule an appointment, please contact us.\n\nWarm regards,\n[BUSINESS_NAME]\n\ud83d\udcde [PHONE_NUMBER]\n\ud83c\udf10 [WEBSITE_LINK]\n\ud83d\udcc5 [BOOK_NOW_LINK]\n[BUSINESS_ADDRESS]",
  "email_subject": "",
  "email_content": "",
  "use_chatgpt_formatting": true,
  "use_customer_database": true,
  "email_type": "bulk",
  "selected_customer": "",
  "sms_template": "Hi [CUSTOMER_NAME]! Parent of [PET_NAMES] -  [CHATGPT_CONTENT] -  [BUSINESS_NAME]. Book now: [BOOK_NOW_LINK] or call [PHONE_NUMBER]",
  "sms_subject": "",
  "sms_content": "",
  "sms_provider": "twilio",
  "use_sms_chatgpt_formatting": true,
  "sms_type": "bulk",
  "selected_sms_customer": "",
  "sms_character_limit": 160,
  "sms_link": "https://petsandvetsanimalhospital.com",
  "marketing_content_type": "holidays",
  "marketing_selected_topic": "",
  "marketing_selected_holidays": [],
  "marketing_custom_campaign": "",
  "marketing_channels": [
    "sms",
    "email",
    "social_media"
  ],
  "marketing_social_platforms": {
    "facebook": true,
    "instagram": true,
    "twitter": true,
    "whatsapp": true
  },
  "marketing_email_personalized": true,
  "marketing_sms_personalized": true,
  "marketing_email_template": "",
  "marketing_sms_template": "",
  "marketing_link": "https://petsandvetsanimalhospital.com",
  "marketing_scheduled_date": null,
  "marketing_post_time": null,
  "marketing_workflow_mode": "in_review",
  "created_at": "2025-09-13 12:44:15.700000",
  "updated_at": "2025-09-14 22:19:20.906000",
  "created_by": null,
  "is_active": true,
  "days_after_period_end": 1,
  "include_summary": true,
  "run_every_pay_period": "current_week"
}
]);
print('✅ ai_agents restored successfully');

print('📦 Restoring collection: pay_period_progression (2 documents)');
db.pay_period_progression.insertMany([
  {
  "_id": "ObjectId('68bc71a506ed5141ce6903fc')",
  "id": "b88bde79-d928-4e50-8d98-1114e49999f5",
  "agent_id": "01af1b65-80dc-410b-a744-298dddba0e7b",
  "start_date": "2025-09-01",
  "end_date": "2025-09-14",
  "pay_period_setting": "bi_weekly",
  "created_at": "2025-09-06 13:38:45.250000"
},
  {
  "_id": "ObjectId('68bc74acd30f80c3a58bc960')",
  "id": "50fff650-fa15-4840-95eb-186810261170",
  "agent_id": "01af1b65-80dc-410b-a744-298dddba0e7b",
  "start_date": "2025-09-01",
  "end_date": "2025-09-14",
  "pay_period_setting": "bi_weekly",
  "created_at": "2025-09-06 13:51:40.043000"
}
]);
print('✅ pay_period_progression restored successfully');

print('📦 Restoring collection: customers (1 documents)');
db.customers.insertMany([
  {
  "_id": "ObjectId('68bcb2d03898ad52cd568462')",
  "id": "9142a6c0-758a-4608-8189-4661fa139239",
  "name": "Stephen Pallam",
  "pet_name": "Molly, Dolly",
  "phone": "2022907262",
  "email": "stephenpallamshop@gmail.com",
  "sms_opt_in": true,
  "email_subscribed": true,
  "created_at": "2025-09-06 18:16:48.912000",
  "updated_at": "2025-09-08 17:41:04.967000",
  "pets": [
    {
      "name": "Molly"
    },
    {
      "name": "Dolly"
    }
  ]
}
]);
print('✅ customers restored successfully');

print('📦 Restoring collection: templates (25 documents)');
db.templates.insertMany([
  {
  "_id": "ObjectId('68c4d4527cf82524a6207979')",
  "id": "dbea6f40-d332-4183-9dd4-99a8c17b1642",
  "name": "Appointment Reminder",
  "type": "email",
  "content": "Dear [CUSTOMER_NAME],\n\nThis is a reminder that [PET_NAME] has an appointment scheduled with us.\n\nIf you need to reschedule, please contact us at [PHONE_NUMBER] or visit [WEBSITE_LINK].\n\nThank you,\n[BUSINESS_NAME]",
  "description": "Standard appointment reminder email",
  "created_at": "2025-09-12 22:17:54.027000",
  "updated_at": "2025-09-12 22:17:54.027000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a620797a')",
  "id": "af4c170d-a4d9-439f-b542-84a799e1bd39",
  "name": "Welcome New Customer",
  "type": "email",
  "content": "Welcome to [BUSINESS_NAME], [CUSTOMER_NAME]!\n\nWe're excited to provide the best care for [PET_NAMES]. Our team is dedicated to keeping your furry family members healthy and happy.\n\nYou can book appointments online at [BOOK_NOW_LINK] or call us at [PHONE_NUMBER].\n\nWelcome to our family!",
  "description": "Welcome email for new customers",
  "created_at": "2025-09-12 22:17:54.043000",
  "updated_at": "2025-09-12 22:17:54.043000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a620797b')",
  "id": "cdc0117e-4c41-4345-8d02-8cb33f9c48f3",
  "name": "Marketing Promotion",
  "type": "email",
  "content": "Hello [CUSTOMER_NAME],\n\nWe have a special offer for [PET_NAME]! Take advantage of our current promotions and give [PET_NAMES] the care they deserve.\n\nBook your appointment today: [BOOK_NOW_LINK]\n\nContact us: [PHONE_NUMBER]\nVisit us: [BUSINESS_ADDRESS]\n\nBest regards,\n[BUSINESS_NAME]",
  "description": "General marketing promotion email",
  "created_at": "2025-09-12 22:17:54.045000",
  "updated_at": "2025-09-12 22:17:54.045000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a620797c')",
  "id": "be4f45d7-19d5-45a7-8831-16faf87447ff",
  "name": "Appointment Reminder",
  "type": "sms",
  "content": "Hi [CUSTOMER_NAME]! [PET_NAME] has an appointment with us soon. Need to reschedule? Call [PHONE_NUMBER]. Thanks!",
  "description": "Standard appointment reminder SMS",
  "created_at": "2025-09-12 22:17:54.046000",
  "updated_at": "2025-09-12 22:17:54.046000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a620797d')",
  "id": "3271d479-3612-44c0-8e78-9c31060a4c37",
  "name": "Welcome New Customer",
  "type": "sms",
  "content": "Welcome to [BUSINESS_NAME], [CUSTOMER_NAME]! We're excited to care for [PET_NAME]. Book online: [BOOK_NOW_LINK]",
  "description": "Welcome SMS for new customers",
  "created_at": "2025-09-12 22:17:54.048000",
  "updated_at": "2025-09-12 22:17:54.048000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a620797e')",
  "id": "c819c5bd-6ab1-483f-bfb7-3d1f5cd989bf",
  "name": "Marketing Promotion",
  "type": "sms",
  "content": "Hi [CUSTOMER_NAME]! Special offer for [PET_NAME] at [BUSINESS_NAME]. Book now: [BOOK_NOW_LINK] or call [PHONE_NUMBER]",
  "description": "General marketing promotion SMS",
  "created_at": "2025-09-12 22:17:54.050000",
  "updated_at": "2025-09-12 22:17:54.050000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc41f')",
  "id": "15bb74d1-9803-40d9-9768-60617f84c71c",
  "name": "Personalized Appointment Reminder",
  "type": "email",
  "content": "Dear [CUSTOMER_NAME],\n\nThis is a reminder that [PET_NAME] has an appointment scheduled with us.\n\nIf you need to reschedule, please contact us at [PHONE_NUMBER] or visit [WEBSITE_LINK].\n\nThank you,\n[BUSINESS_NAME]",
  "description": "Personalized appointment reminder with customer and pet names",
  "created_at": "2025-09-13 09:19:05.132000",
  "updated_at": "2025-09-13 09:19:05.132000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc420')",
  "id": "9f713ad2-6d9f-43b5-ab0c-9421410c19f0",
  "name": "Personalized Welcome Email",
  "type": "email",
  "content": "Welcome to [BUSINESS_NAME], [CUSTOMER_NAME]!\n\nWe're excited to provide the best care for [PET_NAMES]. Our team is dedicated to keeping your furry family members healthy and happy.\n\nYou can book appointments online at [BOOK_NOW_LINK] or call us at [PHONE_NUMBER].\n\nWelcome to our family!",
  "description": "Personalized welcome email for new customers",
  "created_at": "2025-09-13 09:19:05.139000",
  "updated_at": "2025-09-13 09:19:05.139000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc421')",
  "id": "162d503b-a6d8-409f-8218-e2fe7378d371",
  "name": "Personalized Marketing Offer",
  "type": "email",
  "content": "Hello [CUSTOMER_NAME],\n\nWe have a special offer for [PET_NAME]! Take advantage of our current promotions and give [PET_NAMES] the care they deserve.\n\nBook your appointment today: [BOOK_NOW_LINK]\n\nContact us: [PHONE_NUMBER]\nVisit us: [BUSINESS_ADDRESS]\n\nBest regards,\n[BUSINESS_NAME]",
  "description": "Personalized marketing promotion with customer and pet names",
  "created_at": "2025-09-13 09:19:05.141000",
  "updated_at": "2025-09-13 09:19:05.141000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc422')",
  "id": "d0a52ebd-ece2-4d35-b4a0-08a378132198",
  "name": "General Service Announcement",
  "type": "email",
  "content": "Dear Valued Customer,\n\nWe wanted to inform you about our comprehensive veterinary services at [BUSINESS_NAME].\n\nOur services include:\n\u2022 Routine checkups and vaccinations\n\u2022 Emergency care services\n\u2022 Dental care and surgery\n\u2022 Grooming and boarding\n\nSchedule your appointment today!\n\ud83d\udcde Phone: [PHONE_NUMBER]\n\ud83c\udf10 Website: [WEBSITE_LINK]\n\ud83d\udcc5 Book Online: [BOOK_NOW_LINK]\n\nVisit us at: [BUSINESS_ADDRESS]\n\nThank you for choosing [BUSINESS_NAME]!",
  "description": "General service announcement without personalization",
  "created_at": "2025-09-13 09:19:05.143000",
  "updated_at": "2025-09-13 09:19:05.143000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc423')",
  "id": "ae740eb3-220a-4a1e-83f0-0cdb959f905c",
  "name": "Holiday Hours Notice",
  "type": "email",
  "content": "Dear Customers,\n\nWe hope this message finds you well! We wanted to inform you about our holiday hours and services.\n\n[BUSINESS_NAME] will have modified hours during the holiday season. Please check our website for the most up-to-date schedule.\n\nFor urgent care needs, please contact us at [PHONE_NUMBER].\n\nRegular appointments can be scheduled online at [BOOK_NOW_LINK].\n\nThank you for your understanding and continued trust in our services.\n\nWarm regards,\nThe [BUSINESS_NAME] Team\n\n\ud83d\udccd [BUSINESS_ADDRESS]\n\ud83d\udcde [PHONE_NUMBER]\n\ud83c\udf10 [WEBSITE_LINK]",
  "description": "Holiday hours notification for all customers",
  "created_at": "2025-09-13 09:19:05.145000",
  "updated_at": "2025-09-13 09:19:05.145000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc424')",
  "id": "6388f492-80bc-480f-a8e0-b9b0417037a9",
  "name": "Monthly Health Tips",
  "type": "email",
  "content": "Monthly Pet Health Tips from [BUSINESS_NAME]\n\nDear Pet Owners,\n\nHere are this month's essential pet health tips to keep your furry friends happy and healthy:\n\n\ud83d\udc3e Regular Exercise: Ensure your pets get adequate daily exercise\n\ud83d\udc3e Balanced Nutrition: Feed age-appropriate, high-quality food\n\ud83d\udc3e Preventive Care: Stay up-to-date with vaccinations and checkups\n\ud83d\udc3e Dental Health: Regular brushing prevents dental disease\n\ud83d\udc3e Parasite Prevention: Keep up with flea, tick, and worm prevention\n\nNeed professional advice or care? We're here to help!\n\n\ud83d\udcde Call us: [PHONE_NUMBER]\n\ud83c\udf10 Visit: [WEBSITE_LINK]\n\ud83d\udcc5 Book online: [BOOK_NOW_LINK]\n\nYour trusted partner in pet health,\n[BUSINESS_NAME]\n[BUSINESS_ADDRESS]",
  "description": "Monthly health tips newsletter for all pet owners",
  "created_at": "2025-09-13 09:19:05.147000",
  "updated_at": "2025-09-13 09:19:05.147000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc425')",
  "id": "ed6fe2b5-6105-47c0-8711-a32825739888",
  "name": "Seasonal Pet Care Reminder",
  "type": "email",
  "content": "Seasonal Pet Care Tips from [BUSINESS_NAME]\n\nAs the seasons change, so do your pet's needs!\n\nImportant reminders for this season:\n\u2022 Schedule your seasonal checkup\n\u2022 Update parasite prevention protocols\n\u2022 Review dietary needs for seasonal changes\n\u2022 Check for seasonal allergies or skin issues\n\nOur experienced veterinary team is ready to help ensure your pets stay healthy all year round.\n\nContact [BUSINESS_NAME] today:\n\ud83d\udcde [PHONE_NUMBER]\n\ud83c\udf10 [WEBSITE_LINK]\n\ud83d\udcc5 [BOOK_NOW_LINK]\n\nLocated at: [BUSINESS_ADDRESS]\n\nCaring for your pets through every season!",
  "description": "Seasonal care reminders for all pet owners",
  "created_at": "2025-09-13 09:19:05.148000",
  "updated_at": "2025-09-13 09:19:05.148000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc426')",
  "id": "2dda10ce-2984-49f4-bbf8-a8f40ff12687",
  "name": "Personalized Appointment Reminder",
  "type": "sms",
  "content": "Hi [CUSTOMER_NAME]! [PET_NAME] has an appointment with us soon. Need to reschedule? Call [PHONE_NUMBER]. Thanks!",
  "description": "Personalized appointment reminder with customer and pet names",
  "created_at": "2025-09-13 09:19:05.150000",
  "updated_at": "2025-09-13 09:19:05.150000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc427')",
  "id": "0eeba65a-4dc1-4f20-8764-58205a479299",
  "name": "Personalized Welcome SMS",
  "type": "sms",
  "content": "Welcome to [BUSINESS_NAME], [CUSTOMER_NAME]! We're excited to care for [PET_NAME]. Book online: [BOOK_NOW_LINK]",
  "description": "Personalized welcome SMS for new customers",
  "created_at": "2025-09-13 09:19:05.152000",
  "updated_at": "2025-09-13 09:19:05.152000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc428')",
  "id": "1f18f075-59a6-4f37-9eea-a88d8539b5bb",
  "name": "Personalized Special Offer",
  "type": "sms",
  "content": "Hi [CUSTOMER_NAME]! Special offer for [PET_NAME] at [BUSINESS_NAME]. Book now: [BOOK_NOW_LINK] or call [PHONE_NUMBER]",
  "description": "Personalized marketing promotion SMS",
  "created_at": "2025-09-13 09:19:05.154000",
  "updated_at": "2025-09-13 09:19:05.154000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc429')",
  "id": "2691a939-1c08-4892-b657-52f1330cd67d",
  "name": "General Appointment Reminder",
  "type": "sms",
  "content": "Reminder: Your pet has an upcoming appointment at [BUSINESS_NAME]. Call [PHONE_NUMBER] to reschedule if needed.",
  "description": "General appointment reminder without personalization",
  "created_at": "2025-09-13 09:19:05.156000",
  "updated_at": "2025-09-13 09:19:05.156000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc42a')",
  "id": "81414919-81e6-48ee-b08e-909bed5ded0c",
  "name": "Service Announcement",
  "type": "sms",
  "content": "Important update from [BUSINESS_NAME]! Check our website [WEBSITE_LINK] or call [PHONE_NUMBER] for details.",
  "description": "General service announcement SMS",
  "created_at": "2025-09-13 09:19:05.157000",
  "updated_at": "2025-09-13 09:19:05.158000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc42b')",
  "id": "6b52733e-d128-4061-a676-c08683d618ea",
  "name": "Holiday Hours Alert",
  "type": "sms",
  "content": "Holiday hours update from [BUSINESS_NAME]. Check [WEBSITE_LINK] or call [PHONE_NUMBER] for our schedule. Emergency care available!",
  "description": "Holiday hours notification SMS",
  "created_at": "2025-09-13 09:19:05.159000",
  "updated_at": "2025-09-13 09:19:05.159000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc42c')",
  "id": "d401b856-a335-476a-ba8e-a337a5d85905",
  "name": "Health Tip of the Month",
  "type": "sms",
  "content": "Monthly pet health tip from [BUSINESS_NAME]: Regular checkups keep pets healthy! Schedule yours: [BOOK_NOW_LINK] or call [PHONE_NUMBER]",
  "description": "Monthly health tip SMS for all customers",
  "created_at": "2025-09-13 09:19:05.161000",
  "updated_at": "2025-09-13 09:19:05.161000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c56f498ba5267e607bc42d')",
  "id": "87f8bb3e-bbaf-4237-a07f-e73e086b0e68",
  "name": "Special Promotion Alert",
  "type": "sms",
  "content": "\ud83c\udf89 Special offer at [BUSINESS_NAME]! Limited time promotion on pet care services. Book now: [BOOK_NOW_LINK] or call [PHONE_NUMBER]",
  "description": "General promotion alert without personalization",
  "created_at": "2025-09-13 09:19:05.163000",
  "updated_at": "2025-09-13 09:19:05.163000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c5786c1763187a32898d39')",
  "id": "e474e891-9a1d-4352-a216-b46bc7278551",
  "name": "Campaign Email - Personalized (ChatGPT)",
  "type": "email",
  "content": "Dear [CUSTOMER_NAME],\n\n[CHATGPT_CONTENT]\n\nWe hope [PET_NAME] is doing well! If you have any questions or would like to schedule an appointment, please don't hesitate to reach out.\n\nBest regards,\n[BUSINESS_NAME]\n\ud83d\udcde [PHONE_NUMBER]\n\ud83c\udf10 [WEBSITE_LINK]\n\ud83d\udcc5 [BOOK_NOW_LINK]\n\nVisit us at: [BUSINESS_ADDRESS]",
  "description": "Campaign email template with ChatGPT generated content - personalized with customer and pet names",
  "created_at": "2025-09-13 09:58:04.078000",
  "updated_at": "2025-09-13 09:58:04.078000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c5786c1763187a32898d3a')",
  "id": "0bab915c-bc68-4331-9824-ae5b3ef199ac",
  "name": "Campaign Email - General (ChatGPT)",
  "type": "email",
  "content": "Dear Valued Customer,\n\n[CHATGPT_CONTENT]\n\nWe appreciate your trust in our care for your beloved pets. For any questions or to schedule an appointment, please contact us.\n\nWarm regards,\n[BUSINESS_NAME]\n\ud83d\udcde [PHONE_NUMBER]\n\ud83c\udf10 [WEBSITE_LINK]\n\ud83d\udcc5 [BOOK_NOW_LINK]\n\nLocated at: [BUSINESS_ADDRESS]",
  "description": "Campaign email template with ChatGPT generated content - general without personalization",
  "created_at": "2025-09-13 09:58:04.080000",
  "updated_at": "2025-09-13 09:58:04.080000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c5786c1763187a32898d3b')",
  "id": "9991f477-3152-4d3a-8293-7af2fb71024c",
  "name": "Campaign SMS - Personalized (ChatGPT)",
  "type": "sms",
  "content": "Hi [CUSTOMER_NAME]! [CHATGPT_CONTENT] Questions about [PET_NAME]? Call [PHONE_NUMBER] or visit [BOOK_NOW_LINK]",
  "description": "Campaign SMS template with ChatGPT generated content - personalized with customer and pet names",
  "created_at": "2025-09-13 09:58:04.088000",
  "updated_at": "2025-09-13 09:58:04.088000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c5786c1763187a32898d3c')",
  "id": "e45defed-1547-4307-afc7-07771c8c5cd6",
  "name": "Campaign SMS - General (ChatGPT)",
  "type": "sms",
  "content": "[CHATGPT_CONTENT] Contact [BUSINESS_NAME]: [PHONE_NUMBER] or book online: [BOOK_NOW_LINK]",
  "description": "Campaign SMS template with ChatGPT generated content - general without personalization",
  "created_at": "2025-09-13 09:58:04.090000",
  "updated_at": "2025-09-13 09:58:04.090000",
  "created_by": "admin@hospital.com"
}
]);
print('✅ templates restored successfully');

print('📦 Restoring collection: hospital_hours (1 documents)');
db.hospital_hours.insertMany([
  {
  "_id": "ObjectId('68b8e075a647772544c963e5')",
  "id": "553628cf-3d8a-4c66-8856-2db8169f7dbd",
  "monday": {
    "is_open": true,
    "open_time": "08:00",
    "close_time": "19:00"
  },
  "tuesday": {
    "is_open": true,
    "open_time": "08:00",
    "close_time": "19:00"
  },
  "wednesday": {
    "is_open": true,
    "open_time": "08:00",
    "close_time": "19:00"
  },
  "thursday": {
    "is_open": true,
    "open_time": "08:00",
    "close_time": "19:00"
  },
  "friday": {
    "is_open": true,
    "open_time": "08:00",
    "close_time": "19:00"
  },
  "saturday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "17:00"
  },
  "sunday": {
    "is_open": false,
    "open_time": null,
    "close_time": null
  },
  "updated_at": "2025-09-03 00:30:41.834000",
  "updated_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
}
]);
print('✅ hospital_hours restored successfully');

print('📦 Restoring collection: shift_presets (2 documents)');
db.shift_presets.insertMany([
  {
  "_id": "ObjectId('68b9b08990ef9230c51d46fc')",
  "id": "38455597-5add-4533-b1d4-ae2359175248",
  "name": "Morning Shift",
  "start_time": "09:00",
  "end_time": "17:00",
  "description": "Standard 8-hour morning shift",
  "is_active": true,
  "created_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "created_at": "2025-09-04 11:30:17.464000",
  "updated_at": "2025-09-04 11:30:17.464000"
},
  {
  "_id": "ObjectId('68b9b08990ef9230c51d46fd')",
  "id": "a2c17611-736a-4725-b0bf-42fded1be013",
  "name": "Evening Shift",
  "start_time": "17:00",
  "end_time": "01:00",
  "description": "8-hour evening shift",
  "is_active": true,
  "created_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "created_at": "2025-09-04 11:30:17.497000",
  "updated_at": "2025-09-04 11:30:17.498000"
}
]);
print('✅ shift_presets restored successfully');

print('📦 Restoring collection: global_placeholders (5 documents)');
db.global_placeholders.insertMany([
  {
  "_id": "ObjectId('68c4d4527cf82524a6207974')",
  "id": "4cf66bd5-fa91-4a1d-bf79-645f976fcb66",
  "name": "Website Link",
  "placeholder": "[WEBSITE_LINK]",
  "value": "https://petsandvetsanimalhospital.com",
  "description": "Main website URL",
  "created_at": "2025-09-12 22:17:54.006000",
  "updated_at": "2025-09-12 22:17:54.006000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a6207975')",
  "id": "ac6faa6d-e919-4df4-ab3d-dc3eb1070ec2",
  "name": "Book Now Link",
  "placeholder": "[BOOK_NOW_LINK]",
  "value": "https://petsandvetsanimalhospital.com/book",
  "description": "Online booking URL",
  "created_at": "2025-09-12 22:17:54.021000",
  "updated_at": "2025-09-13 07:55:35.835000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a6207976')",
  "id": "d4ea9a3f-2a7a-4f1d-9b41-60f80c195520",
  "name": "Phone Number",
  "placeholder": "[PHONE_NUMBER]",
  "value": "(703) 957-3297",
  "description": "Main contact phone number",
  "created_at": "2025-09-12 22:17:54.023000",
  "updated_at": "2025-09-13 08:02:55.590000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a6207977')",
  "id": "2c8ef056-fab0-4715-b457-e9f1b6fa43e7",
  "name": "Business Name",
  "placeholder": "[BUSINESS_NAME]",
  "value": "Pets and Vets Animal Hospital",
  "description": "Business name",
  "created_at": "2025-09-12 22:17:54.024000",
  "updated_at": "2025-09-12 22:17:54.024000",
  "created_by": "admin@hospital.com"
},
  {
  "_id": "ObjectId('68c4d4527cf82524a6207978')",
  "id": "87c2bbf4-4711-48f2-a0e0-7bc1b23bb591",
  "name": "Business Address",
  "placeholder": "[BUSINESS_ADDRESS]",
  "value": "43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
  "description": "Business address",
  "created_at": "2025-09-12 22:17:54.026000",
  "updated_at": "2025-09-13 07:37:47.554000",
  "created_by": "admin@hospital.com"
}
]);
print('✅ global_placeholders restored successfully');

print('📦 Restoring collection: ai_posts (10 documents)');
db.ai_posts.insertMany([
  {
  "_id": "ObjectId('68bb5d561f5c2f238fea87f4')",
  "id": "e0aa91e3-e3f0-46c3-a05e-0604e7604272",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 17:59:50.756000",
  "updated_at": "2025-09-05 17:59:50.756000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68bb5ecd48fd6e20e3668dcb')",
  "id": "f27e5449-2e05-47f0-9a9b-3b804febd0cc",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 18:06:05.361000",
  "updated_at": "2025-09-05 18:06:05.361000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68bb5f1c6308d9404eea57b4')",
  "id": "504631d0-71f7-49d9-9820-dd440904c1e0",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 18:07:24.219000",
  "updated_at": "2025-09-05 18:07:24.219000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68bb5f356308d9404eea57b5')",
  "id": "caf71bd8-0d07-42aa-a4f4-d6caeff2e0b5",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 18:07:49.436000",
  "updated_at": "2025-09-05 18:07:49.436000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68bb5f656308d9404eea57b6')",
  "id": "0be9c218-22d6-4e3e-ad3a-21a9f9a89540",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 18:08:37.501000",
  "updated_at": "2025-09-05 18:08:37.501000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68bb602f6308d9404eea57b7')",
  "id": "0c947da2-1ec7-401f-a5c0-2f6e91eeacf9",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 18:11:59.991000",
  "updated_at": "2025-09-05 18:11:59.991000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68bb60a56308d9404eea57b8')",
  "id": "4f830e7d-102b-4c99-9a63-b864c50860f5",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 18:13:57.229000",
  "updated_at": "2025-09-05 18:13:57.229000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68bb60e35a67953c5d120362')",
  "id": "6fd6bfb2-32ae-4687-ba9e-5b5c0d09f70f",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 18:14:59.052000",
  "updated_at": "2025-09-05 18:14:59.052000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68bb61035a67953c5d120363')",
  "id": "edd7b8f5-a34e-441a-bc3e-cb59a0b4604f",
  "agent_id": "39706e07-f878-41af-a876-a3c416bd7e90",
  "agent_name": "Recurring Timesheets for CPA",
  "topic": "Timesheet Report",
  "content": "Timesheet Report: 2025-09-01 to 2025-09-07\nTotal Employees: 2\nTotal Hours: 8.86\nTotal Cost: $159.36\n",
  "image_url": "",
  "image_text": "",
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "ready_to_publish",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-05 18:15:31.318000",
  "updated_at": "2025-09-05 18:15:31.318000",
  "timesheet_data": {
    "report_period": "current_week",
    "start_date": "2025-09-01",
    "end_date": "2025-09-07",
    "employee_data": [
      {
        "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
        "user_name": "Penny",
        "user_email": "penny@petsandvetsanimalhospital.com",
        "user_role": "technician",
        "total_hours": 0.03,
        "regular_hours": 0.03,
        "after_hours_hours": 0.0,
        "hourly_rate": 14.0,
        "after_hours_rate": 16.0,
        "regular_pay": 0.42,
        "after_hours_pay": 0.0,
        "total_pay": 0.42,
        "days_worked": 1
      },
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 8.83,
        "regular_hours": 8.83,
        "after_hours_hours": 0.0,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 158.94,
        "after_hours_pay": 0.0,
        "total_pay": 158.94,
        "days_worked": 4
      }
    ],
    "total_hours": 8.86,
    "total_employees": 2,
    "total_cost": 159.35999999999999,
    "regular_hours": 8.86,
    "after_hours_hours": 0.0,
    "regular_pay": 159.35999999999999,
    "after_hours_pay": 0.0,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
},
  {
  "_id": "ObjectId('68cb2eddb2b4546fe14bf938')",
  "id": "1da32b33-38c6-4d30-a5dd-633ee67f4fae",
  "agent_id": "8271969c-48c1-483b-a165-723e3c7266bb",
  "agent_name": "Adhoc - Timesheet",
  "agent_type": "time_sheet",
  "topic": "Timesheet Report: 2025-09-04 to 2025-09-19",
  "content": "Timesheet Report: 2025-09-04 to 2025-09-19\nTotal Employees: 1\nTotal Hours: 124.64\nTotal Cost: $2463.70",
  "image_url": null,
  "image_text": null,
  "hashtags": [],
  "platforms": [
    "timesheet"
  ],
  "status": "in_review",
  "workflow_status": "in_review",
  "scheduled_for": null,
  "published_at": null,
  "social_media_links": [],
  "error_message": "",
  "created_at": "2025-09-17 17:57:49.606000",
  "updated_at": "2025-09-17 17:57:49.606000",
  "timesheet_data": {
    "report_period": "custom",
    "start_date": "2025-09-04",
    "end_date": "2025-09-19",
    "employee_data": [
      {
        "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
        "user_name": "Katie",
        "user_email": "katie@petsandvetsanimalhospital.com",
        "user_role": "manager",
        "total_hours": 124.64,
        "regular_hours": 14.55,
        "after_hours_hours": 110.09,
        "hourly_rate": 18.0,
        "after_hours_rate": 20.0,
        "regular_pay": 261.90000000000003,
        "after_hours_pay": 2201.8,
        "total_pay": 2463.7000000000003,
        "days_worked": 3,
        "daily_entries": [
          {
            "date": "2025-09-04",
            "regular_hours": 6.55,
            "after_hours": 0.0,
            "total_hours": 6.55
          },
          {
            "date": "2025-09-05",
            "regular_hours": 2.28,
            "after_hours": 0.0,
            "total_hours": 2.28
          },
          {
            "date": "2025-09-06",
            "regular_hours": 5.72,
            "after_hours": 110.09,
            "total_hours": 115.81
          }
        ]
      }
    ],
    "total_hours": 124.64,
    "total_employees": 1,
    "total_cost": 2463.7000000000003,
    "regular_hours": 14.55,
    "after_hours_hours": 110.09,
    "regular_pay": 261.90000000000003,
    "after_hours_pay": 2201.8,
    "email_recipients": [
      "stephenpallamshop@gmail.com"
    ],
    "include_summary": false,
    "include_billing_rates": true
  }
}
]);
print('✅ ai_posts restored successfully');

print('📦 Restoring collection: holidays (18 documents)');
db.holidays.insertMany([
  {
  "_id": "ObjectId('68bcd841814745c1ef1efadf')",
  "id": "21c5c86f-577a-465f-aaeb-6d69441617ba",
  "name": "New Year's Day 2026",
  "date": "2026-01-01",
  "month_day": "01-01",
  "is_recurring": true,
  "is_enabled": true,
  "category": "general",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-08 14:42:08.958000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae0')",
  "id": "3e0800b6-8f30-4d33-8cd9-2ce26fdf96c1",
  "name": "Valentine's Day 2026",
  "date": "2026-02-14",
  "month_day": "02-14",
  "is_recurring": true,
  "is_enabled": true,
  "category": "general",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae1')",
  "id": "0692c620-69e0-4507-91a5-f00b79c085f9",
  "name": "Easter Sunday 2026",
  "date": "2026-03-31",
  "month_day": "03-31",
  "is_recurring": true,
  "is_enabled": true,
  "category": "general",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae2')",
  "id": "89ab93bf-0dbf-4b40-80c9-c209de443dc6",
  "name": "Mother's Day 2026",
  "date": "2026-05-12",
  "month_day": "05-12",
  "is_recurring": true,
  "is_enabled": true,
  "category": "family",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae3')",
  "id": "60a70b30-3a16-4d48-807f-72fd331ae34f",
  "name": "Father's Day 2026",
  "date": "2026-06-16",
  "month_day": "06-16",
  "is_recurring": true,
  "is_enabled": true,
  "category": "family",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae4')",
  "id": "25190bc8-ee40-4468-a7b5-3c4034e00404",
  "name": "Independence Day 2026",
  "date": "2026-07-04",
  "month_day": "07-04",
  "is_recurring": true,
  "is_enabled": true,
  "category": "general",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae5')",
  "id": "d7180f4b-9372-440b-90ce-de59e72410b2",
  "name": "Halloween 2025",
  "date": "2025-10-31",
  "month_day": "10-31",
  "is_recurring": true,
  "is_enabled": true,
  "category": "general",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae6')",
  "id": "dd8471d4-7963-4a22-8a5c-161c8401f5eb",
  "name": "Thanksgiving 2025",
  "date": "2025-11-27",
  "month_day": "11-27",
  "is_recurring": true,
  "is_enabled": true,
  "category": "general",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae7')",
  "id": "371d5c15-0169-4644-9b90-3746e49f2a3b",
  "name": "Christmas Day 2025",
  "date": "2025-12-25",
  "month_day": "12-25",
  "is_recurring": true,
  "is_enabled": true,
  "category": "general",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae8')",
  "id": "19e55b1d-ef6f-42d0-9f84-b468427fb133",
  "name": "National Pet Day 2026",
  "date": "2026-04-11",
  "month_day": "04-11",
  "is_recurring": true,
  "is_enabled": true,
  "category": "pet",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efae9')",
  "id": "4e80a8b2-6a31-431f-bcd6-079454c71fd7",
  "name": "National Dog Day 2026",
  "date": "2026-08-26",
  "month_day": "08-26",
  "is_recurring": true,
  "is_enabled": true,
  "category": "pet",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efaea')",
  "id": "7a7596a4-9d94-4d5d-ba45-d0676304f2e5",
  "name": "National Cat Day 2025",
  "date": "2025-10-29",
  "month_day": "10-29",
  "is_recurring": true,
  "is_enabled": true,
  "category": "pet",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efaeb')",
  "id": "415c9663-1572-4454-9b05-2c5f9ed451a9",
  "name": "National Puppy Day 2026",
  "date": "2026-03-23",
  "month_day": "03-23",
  "is_recurring": true,
  "is_enabled": true,
  "category": "pet",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efaec')",
  "id": "fc995a23-226d-4b53-8022-17eb4ccce977",
  "name": "International Dog Day 2026",
  "date": "2026-08-26",
  "month_day": "08-26",
  "is_recurring": true,
  "is_enabled": true,
  "category": "pet",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efaed')",
  "id": "f5ae251d-8d02-4e29-8b48-892d4c722cae",
  "name": "World Animal Day 2025",
  "date": "2025-10-04",
  "month_day": "10-04",
  "is_recurring": true,
  "is_enabled": true,
  "category": "pet",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efaee')",
  "id": "19895548-e8dd-40ee-8085-08d6e38b29b2",
  "name": "World Veterinary Day 2026",
  "date": "2026-04-27",
  "month_day": "04-27",
  "is_recurring": true,
  "is_enabled": true,
  "category": "veterinary",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efaef')",
  "id": "dc5714d3-1db6-4f60-88b7-cded215a30fd",
  "name": "Veterinary Technician Week 2025",
  "date": "2025-10-15",
  "month_day": "10-15",
  "is_recurring": true,
  "is_enabled": true,
  "category": "veterinary",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
},
  {
  "_id": "ObjectId('68bcd841814745c1ef1efaf0')",
  "id": "79516913-ec4c-40cf-8c9a-db8c922a30c5",
  "name": "National Veterinary Technician Week 2025",
  "date": "2025-10-15",
  "month_day": "10-15",
  "is_recurring": true,
  "is_enabled": true,
  "category": "veterinary",
  "created_at": "2025-09-06 20:56:33.625000",
  "updated_at": "2025-09-06 20:56:33.625000"
}
]);
print('✅ holidays restored successfully');

print('📦 Restoring collection: users (5 documents)');
db.users.insertMany([
  {
  "_id": "ObjectId('68b8e075a647772544c963db')",
  "id": "118f4a9a-ed90-4958-ab23-08c9da0a2369",
  "email": "admin@hospital.com",
  "full_name": "Hospital Administrator",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-08-27 14:58:40.963000",
  "password_hash": "$2b$12$K1UXmnFXdR4J1hAVs3z2KeK0JlZCjn6HgotyCWy7C55h/S0Mxp6fe"
},
  {
  "_id": "ObjectId('68b8e075a647772544c963dc')",
  "id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
  "email": "penny@petsandvetsanimalhospital.com",
  "full_name": "Penny",
  "role": "technician",
  "is_active": true,
  "created_at": "2025-08-30 18:13:15.712000",
  "password_hash": "$2b$12$pERv8UCl/mEBiiW.eK3Zq.ojyjTmbI/id5Ju//a74TsSM21Vn3ME.",
  "updatedAt": "2025-08-31T00:41:17.250727",
  "hashed_password": "$2b$12$Pu5Gh.OvZpXzfuN/T9G8Vu6XZKy2mPHzYdKf0XDPr6cq4pJM/XGMW",
  "updated_at": "2025-09-04 17:13:06.689000"
},
  {
  "_id": "ObjectId('68b8e075a647772544c963dd')",
  "id": "f763c809-f046-4bec-9592-f078076d8f6a",
  "email": "katie@petsandvetsanimalhospital.com",
  "full_name": "Katie",
  "role": "manager",
  "is_active": true,
  "created_at": "2025-08-30 18:22:27.728000",
  "password_hash": "$2b$12$LohwjzJzjGWX0vAUqpnCTuqp/myBH55AblzP.RzyTtv5EuBjScW0e",
  "updated_at": "2025-09-04 17:55:01.634000",
  "hashed_password": "$2b$12$t/qOcMKSZYRoZhFPc4w/qOdrx0YLIOpPagNjiXnvZswPVlMF0jhJq"
},
  {
  "_id": "ObjectId('68b8e075a647772544c963de')",
  "id": "6df16525-222b-49cb-b690-f27045200794",
  "email": "admin@primepixel.com",
  "full_name": "Stephen Pallam",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-08-31 00:17:30.912000",
  "password_hash": "$2b$12$SMUvgrD3O.UEK/KGtlBgxeXzp/KDwhVDZTUfIgKQfHr4F40Kk3BC6"
},
  {
  "_id": "ObjectId('68b8e075a647772544c963e2')",
  "id": "51d2886a-1297-404f-a4a0-58bea0beab86",
  "email": "newadmin@veterinary.com",
  "full_name": "Dr. John Smith",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-08-31 23:08:15.157000",
  "password_hash": "$2b$12$JImucEITzc8qMsyj6Snwv.sZcywks7DRayItQ4d9iJdk0yV5EFk8G"
}
]);
print('✅ users restored successfully');

print('📦 Restoring collection: paystub_config (1 documents)');
db.paystub_config.insertMany([
  {
  "_id": "ObjectId('68cb6f3cc70ccd46a6e7d1fa')",
  "id": "67f7042f-5c9f-4af0-aa8b-773cb7eff71d",
  "social_security_rate": 6.2,
  "medicare_rate": 1.45,
  "federal_income_tax_rate": 12.0,
  "state": "VA",
  "state_income_tax_rate": 5.75,
  "employer_name": "Pets and Vets Animal Hospital & Urgent Care",
  "employer_address_line1": "43114 Peacock Market Plaza, Suite F110",
  "employer_address_line2": "",
  "employer_city": "South Riding",
  "employer_state": "VA",
  "employer_zip_code": "20152",
  "employer_ein": "12-3456789",
  "deduction_categories": [
    {
      "name": "Health Insurance",
      "is_active": true
    },
    {
      "name": "Dental Insurance",
      "is_active": true
    },
    {
      "name": "Vision Insurance",
      "is_active": true
    },
    {
      "name": "401(k)",
      "is_active": true
    },
    {
      "name": "Life Insurance",
      "is_active": true
    },
    {
      "name": "Parking",
      "is_active": false
    },
    {
      "name": "Other",
      "is_active": true
    }
  ],
  "created_at": "2025-09-18 02:32:28.308000",
  "updated_at": "2025-09-18 02:32:28.308000",
  "updated_by": "system"
}
]);
print('✅ paystub_config restored successfully');

print('📦 Restoring collection: email_config (1 documents)');
db.email_config.insertMany([
  {
  "_id": "ObjectId('68b8e075a647772544c963eb')",
  "id": "e657c109-0bc3-430b-9b7e-1437c306bb28",
  "notification_email": "invalid-email-format",
  "email_provider": "gmail",
  "is_enabled": true,
  "smtp_email": "ZW5jcnlwdGlvbi10ZXN0QGdtYWlsLmNvbQ==",
  "smtp_password": "dmVyeV9zZWNyZXRfcGFzc3dvcmRfMTIz",
  "sendgrid_api_key": "U0cudGVzdF9hcGlfa2V5XzEyMzQ1Njc4OQ==",
  "sender_email": "noreply@veterinary.com",
  "created_at": "2025-08-31 13:55:15.733000",
  "updated_at": "2025-09-03 00:30:48.315000"
}
]);
print('✅ email_config restored successfully');

print('📦 Restoring collection: blocked_slots (11 documents)');
db.blocked_slots.insertMany([
  {
  "_id": "ObjectId('68b9bdc2d82f3694e8572cf3')",
  "id": "af6767dd-ba1d-44cb-9eef-bf165487c54a",
  "date": "2025-09-04",
  "time": "14:00",
  "reason": "Staff meeting scheduled",
  "blocked_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "blocked_by_name": "Dr. Maria Garcia",
  "blocked_at": "2025-09-04 16:26:42.652000",
  "is_active": true
},
  {
  "_id": "ObjectId('68b9bdd3d82f3694e8572cf4')",
  "id": "415b9993-878d-4cf8-9687-e03d64bba6f2",
  "date": "2025-09-04",
  "time": "15:00",
  "reason": "Staff blocked slot",
  "blocked_by": "f763c809-f046-4bec-9592-f078076d8f6a",
  "blocked_by_name": "Katie",
  "blocked_at": "2025-09-04 16:26:59.783000",
  "is_active": true
},
  {
  "_id": "ObjectId('68b9bdded82f3694e8572cf5')",
  "id": "c48588e3-0969-4293-ab91-722a4a80bca9",
  "date": "2025-09-04",
  "time": "17:30",
  "reason": "Staff blocked slot",
  "blocked_by": "f763c809-f046-4bec-9592-f078076d8f6a",
  "blocked_by_name": "Katie",
  "blocked_at": "2025-09-04 16:27:10.054000",
  "is_active": true
},
  {
  "_id": "ObjectId('68b9c0678f0b7e5b6bd49e72')",
  "id": "cc44f83b-1b1a-41bb-9649-31669f6e85dc",
  "date": "2025-09-04",
  "time": "14:30",
  "reason": "Equipment maintenance required",
  "blocked_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "blocked_by_name": "Dr. Maria Garcia",
  "blocked_at": "2025-09-04 16:37:59.104000",
  "is_active": true
},
  {
  "_id": "ObjectId('68b9c3478f0b7e5b6bd49e73')",
  "id": "db52f5e8-a529-46e4-b436-7ea520f30809",
  "date": "2025-09-04",
  "time": "16:00",
  "reason": "Staff blocked slot",
  "blocked_by": "f763c809-f046-4bec-9592-f078076d8f6a",
  "blocked_by_name": "Katie",
  "blocked_at": "2025-09-04 16:50:15.410000",
  "is_active": true
},
  {
  "_id": "ObjectId('68b9c34c8f0b7e5b6bd49e74')",
  "id": "55f2dfcd-4abb-4361-b759-4b4c3f01ad83",
  "date": "2025-09-04",
  "time": "16:30",
  "reason": "Staff blocked slot",
  "blocked_by": "f763c809-f046-4bec-9592-f078076d8f6a",
  "blocked_by_name": "Katie",
  "blocked_at": "2025-09-04 16:50:20.334000",
  "is_active": false
},
  {
  "_id": "ObjectId('68b9c4fb2b5972ee2fab5e48')",
  "id": "2cfdcc1a-a137-4e91-88e6-5bf0bfa8a223",
  "date": "2025-09-04",
  "time": "15:30",
  "reason": "Testing if slot remains visible",
  "blocked_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "blocked_by_name": "Dr. Maria Garcia",
  "blocked_at": "2025-09-04 16:57:31.710000",
  "is_active": true
},
  {
  "_id": "ObjectId('68b9ca2a963c251b7b5cda09')",
  "id": "d914fa1b-b314-4f4f-9acd-cd6ad761cd07",
  "date": "2025-09-04",
  "time": "16:30",
  "reason": "Staff meeting - testing blocked slots visibility",
  "blocked_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "blocked_by_name": "Dr. Maria Garcia",
  "blocked_at": "2025-09-04 17:19:38.518000",
  "is_active": false
},
  {
  "_id": "ObjectId('68b9ca53144e5e3e72944e39')",
  "id": "4334a118-51e3-4260-bd47-d397a7ef7598",
  "date": "2025-09-04",
  "time": "16:30",
  "reason": "Staff meeting - testing blocked slots visibility",
  "blocked_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "blocked_by_name": "Dr. Maria Garcia",
  "blocked_at": "2025-09-04 17:20:19.909000",
  "is_active": false
},
  {
  "_id": "ObjectId('68b9ca90144e5e3e72944e3a')",
  "id": "1e84e2d8-75b6-4e8e-b64a-d971b251d12c",
  "date": "2025-09-04",
  "time": "17:00",
  "reason": "Comprehensive test - blocked slot creation",
  "blocked_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "blocked_by_name": "Dr. Maria Garcia",
  "blocked_at": "2025-09-04 17:21:20.648000",
  "is_active": false
},
  {
  "_id": "ObjectId('68ba012cfd7c8157ed10f25f')",
  "id": "953e704b-8a0a-41c5-8362-439d9897048c",
  "date": "2025-09-04",
  "time": "20:00",
  "reason": "Staff blocked slot",
  "blocked_by": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
  "blocked_by_name": "Penny",
  "blocked_at": "2025-09-04 21:14:20.982000",
  "is_active": true
}
]);
print('✅ blocked_slots restored successfully');

print('📦 Restoring collection: timesheet_reports (19 documents)');
db.timesheet_reports.insertMany([
  {
  "_id": "ObjectId('68bae500e451a3b35508e2e3')",
  "id": "21255c07-ce6d-4fae-9b77-902e47253aba",
  "agent_id": "0aad4ed1-ddb0-47dd-bddb-8aabe76e14c4",
  "agent_name": "Updated Weekly Payroll Report Agent",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "ready_to_publish",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [
    "updated@veterinary.com"
  ],
  "report_url": "/timesheet-reports/21255c07-ce6d-4fae-9b77-902e47253aba",
  "pdf_url": null,
  "created_at": "2025-09-05 09:26:24.695000",
  "updated_at": "2025-09-05 09:26:25.026000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae507e451a3b35508e2e5')",
  "id": "cb6c3cac-b366-46d3-938a-f204bc3263eb",
  "agent_id": "5b1173e7-860a-4a92-9749-31ee7a8cf074",
  "agent_name": "Workflow Test Agent",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": "**Summary of Timesheet Analysis (Period: 2025-09-01 to 2025-09-07)**\n\nDuring the specified period, a total of 2 employees logged 6.58 hours, generating a labor cost of $118.32. The average hours worked per employee was 3.29, indicating that while one employee (Katie) was highly productive, the other (Penny) contributed negligibly with only 0.03 hours logged. This disparity suggests a potential issue with engagement or workload assignment that merits further investigation.\n\nKatie's significant contribution reflects strong individual performance, but the overall productivity appears low given the expectation of more uniform work distribution. The high concentration of hours from one employee raises concerns about workload balance and potential employee burnout. Conversely, Penny's minimal hours raise questions regarding her role's relevance or possible barriers to her ability to contribute effectively.\n\nNotably, the data indicates a concerning trend of uneven productivity, where one individual's performance dominates the metrics. Such outliers can affect team dynamics and skew perceptions of overall productivity. It\u2019s crucial to explore the reasons behind Penny\u2019s limited hours, which could stem from personal circumstances, lack of resources, or unclear job expectations.\n\nTo improve overall productivity and employee engagement, management should consider conducting one-on-one reviews to understand the challenges facing underperforming employees. It may also be beneficial to assess task allocations and ensure that workloads are balanced to promote equitable performance across the team. Encouraging open dialogue about workload expectations and barriers could foster a more cohesive and productive work environment.",
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "published",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/cb6c3cac-b366-46d3-938a-f204bc3263eb",
  "pdf_url": null,
  "created_at": "2025-09-05 09:26:31.735000",
  "updated_at": "2025-09-05 09:26:31.870000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae507e451a3b35508e2e7')",
  "id": "a6773959-a51f-456d-8c64-3bf1cb527c35",
  "agent_id": "d91becaa-50d3-4e6e-a9ed-c7ffb5480e29",
  "agent_name": "Test Agent - current_week",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/a6773959-a51f-456d-8c64-3bf1cb527c35",
  "pdf_url": null,
  "created_at": "2025-09-05 09:26:31.995000",
  "updated_at": "2025-09-05 09:26:31.995000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae508e451a3b35508e2e9')",
  "id": "2537edeb-8c91-4246-a6f2-bf92a540a385",
  "agent_id": "2fbf7773-c1a1-40c7-8bd2-29db548a0fdb",
  "agent_name": "Test Agent - last_week",
  "report_period": "last_week",
  "start_date": "2025-08-25",
  "end_date": "2025-08-31",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    }
  ],
  "summary": null,
  "total_hours": 0.0,
  "total_employees": 2,
  "total_cost": 0.0,
  "regular_hours": 0.0,
  "after_hours_hours": 0.0,
  "regular_pay": 0.0,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/2537edeb-8c91-4246-a6f2-bf92a540a385",
  "pdf_url": null,
  "created_at": "2025-09-05 09:26:32.117000",
  "updated_at": "2025-09-05 09:26:32.117000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae508e451a3b35508e2eb')",
  "id": "c18c7081-73fe-4651-b1ac-e9eca4788ccf",
  "agent_id": "682f492c-bb7c-48fd-b4b6-4e1650e2aeb0",
  "agent_name": "Test Agent - current_month",
  "report_period": "current_month",
  "start_date": "2025-09-01",
  "end_date": "2025-09-30",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/c18c7081-73fe-4651-b1ac-e9eca4788ccf",
  "pdf_url": null,
  "created_at": "2025-09-05 09:26:32.243000",
  "updated_at": "2025-09-05 09:26:32.243000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae508e451a3b35508e2ed')",
  "id": "7536cd03-e7e6-4d9d-831a-a3e45b754395",
  "agent_id": "200cd082-f22f-4e38-ba36-6b751a9abc34",
  "agent_name": "Test Agent - last_month",
  "report_period": "last_month",
  "start_date": "2025-08-01",
  "end_date": "2025-08-31",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    }
  ],
  "summary": null,
  "total_hours": 0.0,
  "total_employees": 2,
  "total_cost": 0.0,
  "regular_hours": 0.0,
  "after_hours_hours": 0.0,
  "regular_pay": 0.0,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/7536cd03-e7e6-4d9d-831a-a3e45b754395",
  "pdf_url": null,
  "created_at": "2025-09-05 09:26:32.361000",
  "updated_at": "2025-09-05 09:26:32.361000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae531e451a3b35508e2f1')",
  "id": "f73355c7-90a8-4eae-903a-0f230547d8bb",
  "agent_id": "1d720812-74b3-4275-80d7-954db1c0e03e",
  "agent_name": "Updated Weekly Payroll Report Agent",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "ready_to_publish",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [
    "updated@veterinary.com"
  ],
  "report_url": "/timesheet-reports/f73355c7-90a8-4eae-903a-0f230547d8bb",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:13.538000",
  "updated_at": "2025-09-05 09:27:13.873000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae539e451a3b35508e2f3')",
  "id": "d6b6a70f-4460-4d04-ae90-86c4ad22fcf9",
  "agent_id": "f3838b60-31d9-49e7-8803-9a78767788d5",
  "agent_name": "Workflow Test Agent",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": "**Summary of Timesheet Data (Period: 2025-09-01 to 2025-09-07)**\n\nDuring the specified period, a total of 2 employees logged 6.58 hours of work, incurring a total labor cost of $118.32. The average hours worked per employee was 3.29, indicating that one employee, Katie, significantly contributed to the overall productivity with 6.55 hours worked, while the other employee, Penny, contributed minimally with only 0.03 hours.\n\nThis data highlights marked disparity in productivity levels among the employees. Katie's high hours worked suggest engagement and commitment to her responsibilities, while Penny\u2019s exceptionally low hours raise concerns about her work engagement or work assignment clarity. It is crucial to understand the reasons behind this discrepancy to ensure equitable workload distribution and address any potential issues that could impact team dynamics and morale.\n\nFrom a trend perspective, this data period indicates an unusual pattern where one employee contributed nearly all of the logged hours. Such outliers can lead to potential burnout for the high performer and disengagement for the underperformer. It is essential to regularly monitor timesheet patterns to identify similar instances in the future and support employees as needed.\n\nBased on these insights, management should consider reviewing individual workload assignments to ensure that tasks are aligned with employee capacities. Additionally, a check-in with Penny may be beneficial to ascertain her challenges, as well as to explore training or mentorship opportunities aimed at boosting her productivity. Lastly, fostering a balanced work environment will contribute to sustaining overall team effectiveness and morale.",
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "published",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/d6b6a70f-4460-4d04-ae90-86c4ad22fcf9",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:21.146000",
  "updated_at": "2025-09-05 09:27:21.278000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae539e451a3b35508e2f5')",
  "id": "e4d825b0-3aa9-442d-990f-2eb3e32c505b",
  "agent_id": "1f66c70d-46c0-4443-a334-e15a7451e793",
  "agent_name": "Test Agent - current_week",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/e4d825b0-3aa9-442d-990f-2eb3e32c505b",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:21.403000",
  "updated_at": "2025-09-05 09:27:21.403000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae539e451a3b35508e2f7')",
  "id": "9de13fab-b770-49f3-b6e5-4e1595f911a6",
  "agent_id": "bd1d9aa1-b572-4d16-83c2-28ccc5c88f09",
  "agent_name": "Test Agent - last_week",
  "report_period": "last_week",
  "start_date": "2025-08-25",
  "end_date": "2025-08-31",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    }
  ],
  "summary": null,
  "total_hours": 0.0,
  "total_employees": 2,
  "total_cost": 0.0,
  "regular_hours": 0.0,
  "after_hours_hours": 0.0,
  "regular_pay": 0.0,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/9de13fab-b770-49f3-b6e5-4e1595f911a6",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:21.523000",
  "updated_at": "2025-09-05 09:27:21.523000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae539e451a3b35508e2f9')",
  "id": "cedea9a9-07a5-45ce-a460-8f89396211ff",
  "agent_id": "b672b358-ee83-4a58-9e88-25cc8c90c1ce",
  "agent_name": "Test Agent - current_month",
  "report_period": "current_month",
  "start_date": "2025-09-01",
  "end_date": "2025-09-30",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/cedea9a9-07a5-45ce-a460-8f89396211ff",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:21.656000",
  "updated_at": "2025-09-05 09:27:21.656000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae539e451a3b35508e2fb')",
  "id": "1ba71d27-8551-4b6a-9fcd-0be93ee4cc58",
  "agent_id": "a94f7abb-62b7-46fd-b34a-2fe641a1d955",
  "agent_name": "Test Agent - last_month",
  "report_period": "last_month",
  "start_date": "2025-08-01",
  "end_date": "2025-08-31",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    }
  ],
  "summary": null,
  "total_hours": 0.0,
  "total_employees": 2,
  "total_cost": 0.0,
  "regular_hours": 0.0,
  "after_hours_hours": 0.0,
  "regular_pay": 0.0,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/1ba71d27-8551-4b6a-9fcd-0be93ee4cc58",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:21.781000",
  "updated_at": "2025-09-05 09:27:21.781000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae552e451a3b35508e2ff')",
  "id": "d56c1e93-bf8f-4c1e-a183-2dae9caf6884",
  "agent_id": "aa7d071d-45cd-4c08-9957-0c1c465fdea1",
  "agent_name": "Updated Weekly Payroll Report Agent",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "ready_to_publish",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [
    "updated@veterinary.com"
  ],
  "report_url": "/timesheet-reports/d56c1e93-bf8f-4c1e-a183-2dae9caf6884",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:46.434000",
  "updated_at": "2025-09-05 09:27:46.761000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae559e451a3b35508e301')",
  "id": "572307ac-30aa-4579-8f75-353f6547bf1a",
  "agent_id": "5e67aa31-19e8-489a-a98f-7bc6786f001a",
  "agent_name": "Workflow Test Agent",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": "**Summary of Timesheet Data for Period: 2025-09-01 to 2025-09-07**\n\nDuring the analyzed period, a total of 2 employees worked for a combined total of 6.58 hours, resulting in a total labor cost of $118.32. The average hours worked per employee stands at 3.29, indicative of limited engagement within this timeframe. The majority of the hours were concentrated with Katie, who accounted for 99.5% of the total hours worked, while Penny logged only 0.03 hours.\n\nThe data indicates a significant disparity in workload distribution between the two employees. Katie's high contribution of 6.55 hours suggests that she was either engaged in tasks requiring attention or perhaps working overtime, while Penny's minimal contribution raises concerns about job engagement or capacity. This imbalance could potentially lead to burnout for Katie and feelings of exclusion or disengagement for Penny.\n\nThe striking difference between the hours recorded by Katie and Penny is a notable trend that warrants further investigation. It may hint at uneven distribution of responsibilities or personal circumstances affecting Penny's availability. Understanding the reasons behind this disparity can aid in optimizing workforce allocation and ensuring that all employees feel valued and connected to their roles.\n\n**Recommendations for Management:**\n1. Conduct a one-on-one discussion with Penny to understand her current workload, engagement, or any obstacles preventing her from contributing more hours. \n2. Evaluate the workload assignments to ensure an equitable distribution of tasks among employees to prevent burnout and promote team cohesion.\n3. Consider cross-training initiatives or team-building exercises to enhance overall productivity and engagement among employees.\n4. Regularly monitor timesheet data to identify trends over time and support timely interventions for any drastic discrepancies in workloads.",
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "published",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/572307ac-30aa-4579-8f75-353f6547bf1a",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:53.261000",
  "updated_at": "2025-09-05 09:27:53.400000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae559e451a3b35508e303')",
  "id": "08216036-dfab-4e6d-aea1-cce592a519c6",
  "agent_id": "7b448450-ba70-49df-bdbc-57d3c121e64f",
  "agent_name": "Test Agent - current_week",
  "report_period": "current_week",
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/08216036-dfab-4e6d-aea1-cce592a519c6",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:53.531000",
  "updated_at": "2025-09-05 09:27:53.531000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae559e451a3b35508e305')",
  "id": "55cf0740-b145-4ff5-afbf-ef027a246512",
  "agent_id": "4c1e3c42-ba71-47a6-9b87-ef4ba79b2807",
  "agent_name": "Test Agent - last_week",
  "report_period": "last_week",
  "start_date": "2025-08-25",
  "end_date": "2025-08-31",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    }
  ],
  "summary": null,
  "total_hours": 0.0,
  "total_employees": 2,
  "total_cost": 0.0,
  "regular_hours": 0.0,
  "after_hours_hours": 0.0,
  "regular_pay": 0.0,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/55cf0740-b145-4ff5-afbf-ef027a246512",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:53.650000",
  "updated_at": "2025-09-05 09:27:53.650000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae559e451a3b35508e307')",
  "id": "8578fa33-ee8d-4d00-b9b3-22287a2e2cee",
  "agent_id": "472f9f66-9796-45f8-9f51-0f10dbd5a42a",
  "agent_name": "Test Agent - current_month",
  "report_period": "current_month",
  "start_date": "2025-09-01",
  "end_date": "2025-09-30",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.03,
      "regular_hours": 0.03,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.42,
      "after_hours_pay": 0.0,
      "total_pay": 0.42,
      "days_worked": 1
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 6.55,
      "regular_hours": 6.55,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 117.89999999999999,
      "after_hours_pay": 0.0,
      "total_pay": 117.89999999999999,
      "days_worked": 3
    }
  ],
  "summary": null,
  "total_hours": 6.58,
  "total_employees": 2,
  "total_cost": 118.32,
  "regular_hours": 6.58,
  "after_hours_hours": 0.0,
  "regular_pay": 118.32,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/8578fa33-ee8d-4d00-b9b3-22287a2e2cee",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:53.773000",
  "updated_at": "2025-09-05 09:27:53.773000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bae559e451a3b35508e309')",
  "id": "f2d4ca0c-aefe-4e4e-80ec-03d032d408b3",
  "agent_id": "247e4bb4-d5eb-4929-bc46-7a0e7b8e2e9e",
  "agent_name": "Test Agent - last_month",
  "report_period": "last_month",
  "start_date": "2025-08-01",
  "end_date": "2025-08-31",
  "employee_data": [
    {
      "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
      "user_name": "Penny",
      "user_email": "penny@petsandvetsanimalhospital.com",
      "user_role": "technician",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 14.0,
      "after_hours_rate": 16.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    },
    {
      "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
      "user_name": "Katie",
      "user_email": "katie@petsandvetsanimalhospital.com",
      "user_role": "manager",
      "total_hours": 0.0,
      "regular_hours": 0.0,
      "after_hours_hours": 0.0,
      "hourly_rate": 18.0,
      "after_hours_rate": 20.0,
      "regular_pay": 0.0,
      "after_hours_pay": 0.0,
      "total_pay": 0.0,
      "days_worked": 0
    }
  ],
  "summary": null,
  "total_hours": 0.0,
  "total_employees": 2,
  "total_cost": 0.0,
  "regular_hours": 0.0,
  "after_hours_hours": 0.0,
  "regular_pay": 0.0,
  "after_hours_pay": 0.0,
  "status": "in_review",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [],
  "report_url": "/timesheet-reports/f2d4ca0c-aefe-4e4e-80ec-03d032d408b3",
  "pdf_url": null,
  "created_at": "2025-09-05 09:27:53.899000",
  "updated_at": "2025-09-05 09:27:53.899000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
},
  {
  "_id": "ObjectId('68bb8b91d0ee1689e24ae4ec')",
  "id": "f979a24b-52b1-4fe6-ab04-7d5f286e4d53",
  "agent_id": "d49e1f9a-5338-4691-90ae-4f1318aac9c1",
  "agent_name": "UPDATED - Debug Test Agent",
  "report_period": "current_month",
  "start_date": "2025-09-01",
  "end_date": "2025-09-30",
  "employee_data": [],
  "summary": null,
  "total_hours": 0.0,
  "total_employees": 0,
  "total_cost": 0.0,
  "regular_hours": 0.0,
  "after_hours_hours": 0.0,
  "regular_pay": 0.0,
  "after_hours_pay": 0.0,
  "status": "ready_to_publish",
  "email_sent": false,
  "email_sent_at": null,
  "email_recipients": [
    "test1@example.com",
    "test2@example.com"
  ],
  "report_url": "/timesheet-reports/f979a24b-52b1-4fe6-ab04-7d5f286e4d53",
  "pdf_url": null,
  "created_at": "2025-09-05 21:17:05.006000",
  "updated_at": "2025-09-05 21:17:05.006000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
}
]);
print('✅ timesheet_reports restored successfully');

print('📦 Restoring collection: employee_configs (2 documents)');
db.employee_configs.insertMany([
  {
  "_id": "ObjectId('68b992a856519a42ffe76a4a')",
  "id": "91a0dcdc-a056-455f-b302-48c4728b3ac4",
  "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
  "hourly_rate": 14.0,
  "after_hours_rate": 16.0,
  "is_active": true,
  "created_at": "2025-09-04 09:22:48.129000",
  "updated_at": "2025-09-04 19:11:12.470000",
  "updated_by": "f763c809-f046-4bec-9592-f078076d8f6a"
},
  {
  "_id": "ObjectId('68b9b53310c54feb105dd3fb')",
  "id": "b94bbdb4-3801-4106-87c4-ead90d5c611e",
  "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
  "hourly_rate": 18.0,
  "after_hours_rate": 20.0,
  "is_active": true,
  "created_at": "2025-09-04 11:50:11.289000",
  "updated_at": "2025-09-04 17:55:01.695000",
  "updated_by": "f763c809-f046-4bec-9592-f078076d8f6a"
}
]);
print('✅ employee_configs restored successfully');

print('📦 Restoring collection: time_entries (7 documents)');
db.time_entries.insertMany([
  {
  "_id": "ObjectId('68b9920217611390ce764ca9')",
  "id": "e4b30d87-d842-4d89-bd01-39993ce5427e",
  "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
  "clock_in_time": "2025-09-04 09:20:02.200000",
  "clock_out_time": "2025-09-04T11:26:44.183286",
  "breaks": [],
  "location_data": {
    "latitude": 38.90741074954937,
    "longitude": -77.49510913975087,
    "accuracy": 48,
    "timestamp": "2025-09-04T13:20:02.094Z",
    "ip_address": null
  },
  "total_hours": 0,
  "regular_hours": 0,
  "after_hours_hours": 0,
  "is_auto_clockout": false,
  "notes": null,
  "status": "completed",
  "created_at": "2025-09-04 09:20:02.201000",
  "updated_at": "2025-09-04T11:26:44.183286"
},
  {
  "_id": "ObjectId('68b9b91dfb81d53545abf581')",
  "id": "5005d2fb-9f68-40dd-8af5-f5a1dd703ce3",
  "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
  "clock_in_time": "2025-09-04 12:06:53.391000",
  "clock_out_time": "2025-09-04T14:16:02.641603",
  "breaks": [],
  "location_data": null,
  "total_hours": 0,
  "regular_hours": 0,
  "after_hours_hours": 0,
  "is_auto_clockout": false,
  "notes": null,
  "status": "completed",
  "created_at": "2025-09-04 12:06:53.391000",
  "updated_at": "2025-09-04T14:16:02.641603"
},
  {
  "_id": "ObjectId('68ba0120fd7c8157ed10f25e')",
  "id": "943d8fc3-8546-4b4a-8940-554fd5aef0fc",
  "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
  "clock_in_time": "2025-09-04 17:14:08.302000",
  "clock_out_time": "2025-09-04T17:16:05.945909",
  "breaks": [],
  "location_data": null,
  "total_hours": 0.03,
  "regular_hours": 0.03,
  "after_hours_hours": 0,
  "is_auto_clockout": false,
  "notes": null,
  "status": "completed",
  "created_at": "2025-09-04 17:14:08.303000",
  "updated_at": "2025-09-04T17:16:05.945909"
},
  {
  "_id": "ObjectId('68ba0ad6c35256802481e472')",
  "id": "55848335-bd51-43b5-b278-f7a23172a857",
  "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
  "clock_in_time": "2025-09-04 17:55:34.808000",
  "clock_out_time": "2025-09-04T20:13:06.870641",
  "breaks": [],
  "location_data": {
    "latitude": 38.90770159669068,
    "longitude": -77.49517455490337,
    "accuracy": 55,
    "timestamp": "2025-09-04T21:55:34.728Z",
    "ip_address": null
  },
  "total_hours": 2.29,
  "regular_hours": 2.29,
  "after_hours_hours": 0,
  "is_auto_clockout": false,
  "notes": null,
  "status": "completed",
  "created_at": "2025-09-04 17:55:34.809000",
  "updated_at": "2025-09-04T20:13:06.870641"
},
  {
  "_id": "ObjectId('68bb39216471ef78dda1f9e7')",
  "id": "16f0fcc7-822f-408f-85e2-b9c82e35ec36",
  "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
  "clock_in_time": "2025-09-05 15:25:21.370000",
  "clock_out_time": "2025-09-05T17:42:26.659815",
  "breaks": [],
  "location_data": null,
  "total_hours": 2.28,
  "regular_hours": 2.28,
  "after_hours_hours": 0,
  "is_auto_clockout": false,
  "notes": null,
  "status": "completed",
  "created_at": "2025-09-05 15:25:21.371000",
  "updated_at": "2025-09-05T17:42:26.659815"
},
  {
  "_id": "ObjectId('68bc88a5c0d433111089f507')",
  "id": "89ee8cd0-8fd8-48b3-9ffa-cb9a8e76e417",
  "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
  "clock_in_time": "2025-09-06 15:16:53.673000",
  "clock_out_time": "2025-09-11T11:05:16.042389",
  "breaks": [],
  "location_data": null,
  "total_hours": 115.81,
  "regular_hours": 5.72,
  "after_hours_hours": 110.09,
  "is_auto_clockout": false,
  "notes": null,
  "status": "completed",
  "created_at": "2025-09-06 15:16:53.673000",
  "updated_at": "2025-09-11T11:05:16.042389"
},
  {
  "_id": "ObjectId('68cb3b28633b094ace882503')",
  "id": "9b5c0f8d-1dc7-4ae5-a409-5467fcfb1171",
  "user_id": "f763c809-f046-4bec-9592-f078076d8f6a",
  "clock_in_time": "2025-09-17 18:50:16.127000",
  "clock_out_time": null,
  "breaks": [],
  "location_data": null,
  "total_hours": null,
  "regular_hours": null,
  "after_hours_hours": null,
  "is_auto_clockout": false,
  "notes": null,
  "status": "active",
  "created_at": "2025-09-17 18:50:16.128000",
  "updated_at": "2025-09-17 18:50:16.129000"
}
]);
print('✅ time_entries restored successfully');

print('📦 Restoring collection: ai_usage_logs (9 documents)');
db.ai_usage_logs.insertMany([
  {
  "_id": "ObjectId('68bb58fa47596666ef501915')",
  "id": "ec00afdc-a946-470e-a47a-5d5a86474396",
  "user_id": "admin",
  "agent_id": "d907ba4c-4214-4dd8-b8a9-06290d679d68",
  "cost_type": "image_generation",
  "provider": "openai",
  "model": "dall-e-3",
  "tokens_used": null,
  "images_generated": 1,
  "prompt_tokens": null,
  "completion_tokens": null,
  "cost_usd": 0.04,
  "request_details": {
    "size": "1024x1024",
    "quality": "standard",
    "topic": "Trending Pet Health News"
  },
  "created_at": "2025-09-05 17:41:14.553000"
},
  {
  "_id": "ObjectId('68bb9b028ed111a1681615e8')",
  "id": "39b358ff-0ba5-4403-a51c-e591d623047c",
  "user_id": "admin",
  "agent_id": "d907ba4c-4214-4dd8-b8a9-06290d679d68",
  "cost_type": "image_generation",
  "provider": "openai",
  "model": "dall-e-3",
  "tokens_used": null,
  "images_generated": 1,
  "prompt_tokens": null,
  "completion_tokens": null,
  "cost_usd": 0.04,
  "request_details": {
    "size": "1024x1024",
    "quality": "standard",
    "topic": "Trending Pet Health News"
  },
  "created_at": "2025-09-05 22:22:58.963000"
},
  {
  "_id": "ObjectId('68bca1a011c05e1da877cb91')",
  "id": "2bd853b3-f395-46c6-9873-db7754a72c19",
  "user_id": "admin",
  "agent_id": "d907ba4c-4214-4dd8-b8a9-06290d679d68",
  "cost_type": "image_generation",
  "provider": "openai",
  "model": "dall-e-3",
  "tokens_used": null,
  "images_generated": 1,
  "prompt_tokens": null,
  "completion_tokens": null,
  "cost_usd": 0.04,
  "request_details": {
    "size": "1024x1024",
    "quality": "standard",
    "topic": "Trending Pet Health News"
  },
  "created_at": "2025-09-06 17:03:28.484000"
},
  {
  "_id": "ObjectId('68bdf5284dae6dd2a9e9a018')",
  "id": "a3bf3d7f-cc57-4e80-b33f-4fd91c74c9a5",
  "user_id": "admin",
  "agent_id": "a26b8b9d-f3e1-4a46-9071-e59fd0fe0430",
  "cost_type": "image_generation",
  "provider": "openai",
  "model": "dall-e-3",
  "tokens_used": null,
  "images_generated": 1,
  "prompt_tokens": null,
  "completion_tokens": null,
  "cost_usd": 0.04,
  "request_details": {
    "size": "1024x1024",
    "quality": "standard",
    "topic": ""
  },
  "created_at": "2025-09-07 17:12:08.981000"
},
  {
  "_id": "ObjectId('68bdf8c5d9c0d9b264335a12')",
  "id": "f88ad113-5e6a-4fd2-a62c-b6a11c2b1d99",
  "user_id": "admin",
  "agent_id": "2ad4386d-df66-4697-9b6c-b088c4caf269",
  "cost_type": "image_generation",
  "provider": "openai",
  "model": "dall-e-3",
  "tokens_used": null,
  "images_generated": 1,
  "prompt_tokens": null,
  "completion_tokens": null,
  "cost_usd": 0.04,
  "request_details": {
    "size": "1024x1024",
    "quality": "standard",
    "topic": "Amazing Pet Care Tips"
  },
  "created_at": "2025-09-07 17:27:33.892000"
},
  {
  "_id": "ObjectId('68c0de0fbaf4a2703a0dd585')",
  "id": "cb70b19e-7fbb-4b42-b45d-8ba6608ccc1c",
  "user_id": "admin",
  "agent_id": "538257d0-40d5-48f0-96b6-f1cbf35af0a5",
  "cost_type": "text_generation",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "tokens_used": 0,
  "images_generated": null,
  "prompt_tokens": 0,
  "completion_tokens": 0,
  "cost_usd": 0.0,
  "request_details": {
    "topic": "Pet Health Tips"
  },
  "created_at": "2025-09-09 22:10:23.905000"
},
  {
  "_id": "ObjectId('68c195c46bd57cfa82062282')",
  "id": "df2cd0eb-b68f-453c-aad3-65981e699b4c",
  "user_id": "admin",
  "agent_id": "e024f4b4-f3c1-4432-b0c6-551fd0b185f0",
  "cost_type": "text_generation",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "tokens_used": 0,
  "images_generated": null,
  "prompt_tokens": 0,
  "completion_tokens": 0,
  "cost_usd": 0.0,
  "request_details": {
    "topic": "Health checkup alerts"
  },
  "created_at": "2025-09-10 11:14:12.061000"
},
  {
  "_id": "ObjectId('68c1e24eeb48bb9237de45ca')",
  "id": "14844c68-75a2-4b6b-9c7e-a4cf73638b62",
  "user_id": "admin",
  "agent_id": "e024f4b4-f3c1-4432-b0c6-551fd0b185f0",
  "cost_type": "text_generation",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "tokens_used": 0,
  "images_generated": null,
  "prompt_tokens": 0,
  "completion_tokens": 0,
  "cost_usd": 0.0,
  "request_details": {
    "topic": "Health checkup alerts"
  },
  "created_at": "2025-09-10 16:40:46.243000"
},
  {
  "_id": "ObjectId('68c6cfab75674572e4259d64')",
  "id": "1d2738c8-98fe-42d7-98bf-f08e88cb2857",
  "user_id": "admin",
  "agent_id": "e024f4b4-f3c1-4432-b0c6-551fd0b185f0",
  "cost_type": "text_generation",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "tokens_used": 0,
  "images_generated": null,
  "prompt_tokens": 0,
  "completion_tokens": 0,
  "cost_usd": 0.0,
  "request_details": {
    "topic": "Health checkup alerts"
  },
  "created_at": "2025-09-14 10:22:35.486000"
}
]);
print('✅ ai_usage_logs restored successfully');

print('📦 Restoring collection: pay_period_settings (3 documents)');
db.pay_period_settings.insertMany([
  {
  "_id": "ObjectId('68bb00c75efcac680bed37b8')",
  "id": "4ab58bb0-2065-467b-ab80-0783be49dad8",
  "period_type": "bi_weekly",
  "config_name": "Bi-Weekly",
  "weekly_config": null,
  "bi_weekly_config": {
    "start_day": "saturday",
    "end_day": "friday",
    "name": "Saturday to Friday"
  },
  "monthly_config": null,
  "is_default": true,
  "created_at": "2025-09-05 11:24:55.954000",
  "updated_at": "2025-09-05 11:24:55.954000",
  "created_by": "f763c809-f046-4bec-9592-f078076d8f6a"
},
  {
  "_id": "ObjectId('68bb00dc5efcac680bed37b9')",
  "id": "1ec20128-40ca-436c-ab3f-6539ca3d58c4",
  "period_type": "weekly",
  "config_name": "Weekly",
  "weekly_config": {
    "start_day": "monday",
    "end_day": "sunday",
    "name": "Monday to Sunday"
  },
  "bi_weekly_config": null,
  "monthly_config": null,
  "is_default": false,
  "created_at": "2025-09-05 11:25:16.331000",
  "updated_at": "2025-09-05 11:25:16.331000",
  "created_by": "f763c809-f046-4bec-9592-f078076d8f6a"
},
  {
  "_id": "ObjectId('68bb0b739ffb1fb4c31bc205')",
  "id": "83a75861-bffd-466c-a4c5-d2fd93b26707",
  "period_type": "monthly",
  "config_name": "Monthly",
  "weekly_config": null,
  "bi_weekly_config": null,
  "monthly_config": {
    "start_day": 1,
    "end_day": -1,
    "name": "1st to Last Day"
  },
  "is_default": false,
  "created_at": "2025-09-05 12:10:27.058000",
  "updated_at": "2025-09-05 13:07:59.485000",
  "created_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
}
]);
print('✅ pay_period_settings restored successfully');

print('📦 Restoring collection: shifts (2 documents)');
db.shifts.insertMany([
  {
  "_id": "ObjectId('68b9a12fc7b51e09bbbc956f')",
  "id": "41520614-cb1f-47a7-9170-33e7e62e997f",
  "user_id": "07fd5fe0-b753-4ca0-8110-731b86d7efce",
  "schedule_date": "2025-09-02",
  "start_time": "09:00",
  "end_time": "17:00",
  "shift_type": "regular",
  "position": "Front Desk",
  "location": "Main Office",
  "notes": "Regular weekday shift",
  "status": "scheduled",
  "created_by": "b99415d6-fd00-48d7-9ae0-77a333c9dd68",
  "created_at": "2025-09-04 10:24:47.654000",
  "updated_at": "2025-09-04 10:24:47.655000"
},
  {
  "_id": "ObjectId('68c2336e5e3d34db203665dc')",
  "id": "913b3a8c-cf6e-4242-b790-7411abeddd7e",
  "user_id": "54f33c4b-bd57-4fd3-b748-b420e417a83f",
  "schedule_date": "2025-09-09",
  "start_time": "17:00",
  "end_time": "01:00",
  "shift_type": "regular",
  "position": null,
  "location": null,
  "notes": "",
  "status": "scheduled",
  "created_by": "6df16525-222b-49cb-b690-f27045200794",
  "created_at": "2025-09-10 22:26:54.138000",
  "updated_at": "2025-09-10 22:26:54.139000"
}
]);
print('✅ shifts restored successfully');

print('📦 Restoring collection: business_info (1 documents)');
db.business_info.insertMany([
  {
  "_id": "ObjectId('68b8e075a647772544c963da')",
  "id": "8351ba67-5db2-4e72-8207-8dad202ec4be",
  "hospital_name": "Pets and Vets Animal Hospital & Urgent Care",
  "tagline": "Compassionate Care for Your Beloved Pets",
  "phone": "(703) 957-3297",
  "email": "vet@petsandvetsanimalhospital.com",
  "address": "43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
  "timezone": "America/New_York",
  "referral_hospital_name": "VCA SouthPaws",
  "referral_hospital_phone": "(703) 752-9100",
  "facebook_link": "",
  "instagram_link": "",
  "twitter_link": "",
  "whatsapp_group_link": "",
  "google_reviews_link": "",
  "yelp_reviews_link": "",
  "facebook_reviews_link": "",
  "hero_images": [
    "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
    "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png"
  ],
  "created_at": "2025-09-03 12:55:42.083000",
  "updated_at": "2025-09-03 12:55:42.083000"
}
]);
print('✅ business_info restored successfully');

print('📦 Restoring collection: urgent_care_hours (1 documents)');
db.urgent_care_hours.insertMany([
  {
  "_id": "ObjectId('68b8e075a647772544c963e6')",
  "id": "421e5a0c-cee0-4080-880f-9461106d9b7c",
  "monday": {
    "is_open": true,
    "open_time": "14:00",
    "close_time": "23:00"
  },
  "tuesday": {
    "is_open": true,
    "open_time": "14:00",
    "close_time": "23:00"
  },
  "wednesday": {
    "is_open": true,
    "open_time": "14:00",
    "close_time": "23:00"
  },
  "thursday": {
    "is_open": true,
    "open_time": "14:00",
    "close_time": "23:00"
  },
  "friday": {
    "is_open": true,
    "open_time": "14:00",
    "close_time": "23:00"
  },
  "saturday": {
    "is_open": true,
    "open_time": "14:00",
    "close_time": "23:00"
  },
  "sunday": {
    "is_open": true,
    "open_time": "14:00",
    "close_time": "23:00"
  },
  "updated_at": "2025-09-03 00:30:41.950000",
  "updated_by": "118f4a9a-ed90-4958-ab23-08c9da0a2369"
}
]);
print('✅ urgent_care_hours restored successfully');

print('📦 Restoring collection: cms_settings (1 documents)');
db.cms_settings.insertMany([
  {
  "_id": "ObjectId('68bcbf41d7bdd67edc282f3f')",
  "id": "09607006-c88c-4cc5-8b00-2b1bbf79e396",
  "google_sync_enabled": true,
  "google_business_sync_enabled": true,
  "google_calendar_sync_enabled": true,
  "updated_at": "2025-09-06 19:09:53.110000",
  "updated_by": "admin@hospital.com"
}
]);
print('✅ cms_settings restored successfully');

print('📦 Restoring collection: reviews (3 documents)');
db.reviews.insertMany([
  {
  "_id": "ObjectId('68b8e075a647772544c963e7')",
  "id": "28ab8535-7076-48f1-b531-5e044d14d160",
  "text": "I cannot speak highly enough about Dr. Vanama and the team at Pets and Vets Animal Hospital. Our dog has been patient of Dr Vanama for 6 years. We are always greeted with warmth and genuine concern for our furry baby's well-being. Dr. Vanama is incredibly knowledgeable and took the time to explain every step of the treatment process, making sure we felt comfortable and informed.",
  "pet_name": "S Gill",
  "owner_name": "Surinder Bhambra",
  "rating": 5,
  "created_at": "2025-08-30 12:36:30.929000",
  "updated_at": "2025-08-30 12:36:30.929000"
},
  {
  "_id": "ObjectId('68b8e075a647772544c963e8')",
  "id": "f0a84b21-b0c1-4afa-b351-93a05beb44d7",
  "text": "Dr. Vanama and her staff are highly educated, attentive, caring, and professional. I have personally taken my cats and dogs to her facility for over 5 years now and have never been dissatisfied and I have felt that my animals were always getting the care they deserved.",
  "pet_name": "Dog",
  "owner_name": "Zach Smith",
  "rating": 5,
  "created_at": "2025-08-30 12:37:45.633000",
  "updated_at": "2025-08-30 12:37:45.633000"
},
  {
  "_id": "ObjectId('68b8e075a647772544c963e9')",
  "id": "599ece7d-171e-4445-a8c8-11bde9a08c49",
  "text": "We recently got a Corgi puppy and have been bringing her here for the past couple of months. Dr. Vanama and Katie are both so nice and knowledgeable about what our pup needs to live a healthy life. We really appreciated all the info about what food/treats and toys are best. We can\u2019t recommend them highly enough",
  "pet_name": "Corgi",
  "owner_name": " Stephen Reiter",
  "rating": 5,
  "created_at": "2025-08-30 12:39:19.777000",
  "updated_at": "2025-08-30 12:39:19.777000"
}
]);
print('✅ reviews restored successfully');

print("🎉 Database restoration completed!");
print("📊 Restoration Summary:");
print("  • timesheet_config: " + db.timesheet_config.count() + " documents");
print("  • ai_settings: " + db.ai_settings.count() + " documents");
print("  • appointment_slot_config: " + db.appointment_slot_config.count() + " documents");
print("  • business_services: " + db.business_services.count() + " documents");
print("  • ai_agents: " + db.ai_agents.count() + " documents");
print("  • pay_period_progression: " + db.pay_period_progression.count() + " documents");
print("  • customers: " + db.customers.count() + " documents");
print("  • templates: " + db.templates.count() + " documents");
print("  • hospital_hours: " + db.hospital_hours.count() + " documents");
print("  • shift_presets: " + db.shift_presets.count() + " documents");
print("  • global_placeholders: " + db.global_placeholders.count() + " documents");
print("  • ai_posts: " + db.ai_posts.count() + " documents");
print("  • holidays: " + db.holidays.count() + " documents");
print("  • users: " + db.users.count() + " documents");
print("  • paystub_config: " + db.paystub_config.count() + " documents");
print("  • email_config: " + db.email_config.count() + " documents");
print("  • blocked_slots: " + db.blocked_slots.count() + " documents");
print("  • timesheet_reports: " + db.timesheet_reports.count() + " documents");
print("  • employee_configs: " + db.employee_configs.count() + " documents");
print("  • time_entries: " + db.time_entries.count() + " documents");
print("  • ai_usage_logs: " + db.ai_usage_logs.count() + " documents");
print("  • pay_period_settings: " + db.pay_period_settings.count() + " documents");
print("  • shifts: " + db.shifts.count() + " documents");
print("  • business_info: " + db.business_info.count() + " documents");
print("  • urgent_care_hours: " + db.urgent_care_hours.count() + " documents");
print("  • time_adjustments: " + db.time_adjustments.count() + " documents");
print("  • cms_settings: " + db.cms_settings.count() + " documents");
print("  • reviews: " + db.reviews.count() + " documents");
print("  • timesheet_ai_agents: " + db.timesheet_ai_agents.count() + " documents");

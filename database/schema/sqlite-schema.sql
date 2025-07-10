CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE IF NOT EXISTS "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE IF NOT EXISTS "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" text not null,
  "queue" text not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE IF NOT EXISTS "permissions"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "guard_name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  "display_name" varchar,
  "category" varchar,
  "resource" varchar,
  "action" varchar,
  "description" text,
  "department" varchar,
  "is_active" tinyint(1) not null default '1'
);
CREATE UNIQUE INDEX "permissions_name_guard_name_unique" on "permissions"(
  "name",
  "guard_name"
);
CREATE TABLE IF NOT EXISTS "roles"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "guard_name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  "display_name" varchar,
  "level" integer,
  "department_access" text,
  "description" text,
  "max_institutions" integer,
  "is_active" tinyint(1) not null default '1'
);
CREATE UNIQUE INDEX "roles_name_guard_name_unique" on "roles"(
  "name",
  "guard_name"
);
CREATE TABLE IF NOT EXISTS "model_has_permissions"(
  "permission_id" integer not null,
  "model_type" varchar not null,
  "model_id" integer not null,
  foreign key("permission_id") references "permissions"("id") on delete cascade,
  primary key("permission_id", "model_id", "model_type")
);
CREATE INDEX "model_has_permissions_model_id_model_type_index" on "model_has_permissions"(
  "model_id",
  "model_type"
);
CREATE TABLE IF NOT EXISTS "model_has_roles"(
  "role_id" integer not null,
  "model_type" varchar not null,
  "model_id" integer not null,
  foreign key("role_id") references "roles"("id") on delete cascade,
  primary key("role_id", "model_id", "model_type")
);
CREATE INDEX "model_has_roles_model_id_model_type_index" on "model_has_roles"(
  "model_id",
  "model_type"
);
CREATE TABLE IF NOT EXISTS "role_has_permissions"(
  "permission_id" integer not null,
  "role_id" integer not null,
  foreign key("permission_id") references "permissions"("id") on delete cascade,
  foreign key("role_id") references "roles"("id") on delete cascade,
  primary key("permission_id", "role_id")
);
CREATE TABLE IF NOT EXISTS "institutions"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "short_name" varchar,
  "type" varchar not null,
  "parent_id" integer,
  "level" integer not null,
  "region_code" varchar,
  "institution_code" varchar,
  "contact_info" text not null default '{}',
  "location" text not null default '{}',
  "metadata" text not null default '{}',
  "is_active" tinyint(1) not null default '1',
  "established_date" date,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("parent_id") references "institutions"("id")
);
CREATE UNIQUE INDEX "institutions_institution_code_unique" on "institutions"(
  "institution_code"
);
CREATE TABLE IF NOT EXISTS "survey_templates"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "description" text,
  "questions" text not null default '{}',
  "settings" text not null default '{}',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "school_staff"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "school_id" integer not null,
  "role" varchar not null,
  "departments" text not null default '[]', "subjects" text not null default '[]', "schedule_preferences" text not null default '{}',
  "employment_type" varchar not null default 'full_time',
  "employment_status" varchar not null default 'active',
  "start_date" date not null,
  "end_date" date,
  "salary_info" text not null default '{}',
  "qualifications" text not null default '[]', "performance_metrics" text not null default '{}',
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id"),
  foreign key("school_id") references "institutions"("id")
);
CREATE UNIQUE INDEX "school_staff_user_id_school_id_role_unique" on "school_staff"(
  "user_id",
  "school_id",
  "role"
);
CREATE TABLE IF NOT EXISTS "system_config"(
  "key" varchar not null,
  "value" text not null default '{}',
  "description" text,
  "is_public" tinyint(1) not null default '0',
  "updated_at" datetime not null default CURRENT_TIMESTAMP,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "academic_terms"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "start_date" date not null,
  "end_date" date not null,
  "is_active" tinyint(1) not null default '0',
  "academic_year" varchar not null,
  "created_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "role_user"(
  "role_id" integer not null,
  "user_id" integer not null,
  foreign key("role_id") references "roles"("id") on delete cascade,
  foreign key("user_id") references "users"("id") on delete cascade,
  primary key("role_id", "user_id")
);
CREATE TABLE IF NOT EXISTS "permission_role"(
  "permission_id" integer not null,
  "role_id" integer not null,
  foreign key("permission_id") references "permissions"("id") on delete cascade,
  foreign key("role_id") references "roles"("id") on delete cascade,
  primary key("permission_id", "role_id")
);
CREATE TABLE IF NOT EXISTS "user_profiles"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "first_name" varchar,
  "last_name" varchar,
  "patronymic" varchar,
  "birth_date" date,
  "gender" varchar,
  "national_id" varchar,
  "profile_image_path" varchar,
  "contact_phone" varchar,
  "emergency_contact" varchar,
  "address" text not null default '{}',
  "education_history" text not null default '[]', "employment_history" text not null default '[]', "certifications" text not null default '[]', "preferences" text not null default '{}',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE INDEX "user_profiles_last_name_first_name_index" on "user_profiles"(
  "last_name",
  "first_name"
);
CREATE INDEX "user_profiles_national_id_index" on "user_profiles"(
  "national_id"
);
CREATE UNIQUE INDEX "user_profiles_user_id_unique" on "user_profiles"(
  "user_id"
);
CREATE TABLE IF NOT EXISTS "departments"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "short_name" varchar,
  "institution_id" integer not null,
  "parent_department_id" integer,
  "description" text,
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  "department_type" varchar not null default 'general',
  "metadata" text,
  "capacity" integer,
  "budget_allocation" numeric,
  "functional_scope" text,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("parent_department_id") references "departments"("id") on delete cascade
);
CREATE INDEX "departments_institution_id_index" on "departments"(
  "institution_id"
);
CREATE INDEX "departments_parent_department_id_index" on "departments"(
  "parent_department_id"
);
CREATE TABLE IF NOT EXISTS "regions"(
  "id" integer primary key autoincrement not null,
  "institution_id" integer not null,
  "code" varchar not null,
  "name" varchar not null,
  "area_km2" numeric,
  "population" integer,
  "metadata" text not null default '{}',
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id") on delete cascade
);
CREATE INDEX "regions_code_index" on "regions"("code");
CREATE UNIQUE INDEX "regions_institution_id_unique" on "regions"(
  "institution_id"
);
CREATE UNIQUE INDEX "regions_code_unique" on "regions"("code");
CREATE TABLE IF NOT EXISTS "sectors"(
  "id" integer primary key autoincrement not null,
  "institution_id" integer not null,
  "region_id" integer not null,
  "code" varchar not null,
  "name" varchar not null,
  "area_km2" numeric,
  "population" integer,
  "metadata" text not null default '{}',
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("region_id") references "regions"("id") on delete cascade
);
CREATE INDEX "sectors_region_id_index" on "sectors"("region_id");
CREATE INDEX "sectors_code_index" on "sectors"("code");
CREATE UNIQUE INDEX "sectors_institution_id_unique" on "sectors"(
  "institution_id"
);
CREATE UNIQUE INDEX "sectors_code_unique" on "sectors"("code");
CREATE TABLE IF NOT EXISTS "academic_years"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "start_date" date not null,
  "end_date" date not null,
  "is_active" tinyint(1) not null default '0',
  "metadata" text not null default '{}',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "academic_years_start_date_end_date_index" on "academic_years"(
  "start_date",
  "end_date"
);
CREATE INDEX "academic_years_is_active_index" on "academic_years"("is_active");
CREATE UNIQUE INDEX "academic_years_name_unique" on "academic_years"("name");
CREATE TABLE IF NOT EXISTS "rooms"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "room_number" varchar,
  "institution_id" integer not null,
  "building" varchar,
  "floor" integer,
  "room_type" varchar,
  "capacity" integer,
  "facilities" text not null default '[]', "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id")
);
CREATE UNIQUE INDEX "rooms_room_number_institution_id_unique" on "rooms"(
  "room_number",
  "institution_id"
);
CREATE INDEX "rooms_institution_id_index" on "rooms"("institution_id");
CREATE INDEX "rooms_room_type_index" on "rooms"("room_type");
CREATE INDEX "rooms_is_active_index" on "rooms"("is_active");
CREATE TABLE IF NOT EXISTS "grades"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "class_level" integer not null,
  "academic_year_id" integer not null,
  "institution_id" integer not null,
  "room_id" integer,
  "homeroom_teacher_id" integer,
  "student_count" integer not null default '0',
  "specialty" varchar,
  "metadata" text not null default '{}',
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("academic_year_id") references "academic_years"("id"),
  foreign key("institution_id") references "institutions"("id"),
  foreign key("room_id") references "rooms"("id"),
  foreign key("homeroom_teacher_id") references "users"("id")
);
CREATE UNIQUE INDEX "grades_name_academic_year_id_institution_id_unique" on "grades"(
  "name",
  "academic_year_id",
  "institution_id"
);
CREATE INDEX "grades_institution_id_index" on "grades"("institution_id");
CREATE INDEX "grades_academic_year_id_index" on "grades"("academic_year_id");
CREATE INDEX "grades_homeroom_teacher_id_index" on "grades"(
  "homeroom_teacher_id"
);
CREATE INDEX "grades_class_level_index" on "grades"("class_level");
CREATE INDEX "grades_is_active_index" on "grades"("is_active");
CREATE TABLE IF NOT EXISTS "reports"(
  "id" integer primary key autoincrement not null,
  "title" varchar not null,
  "description" text,
  "creator_id" integer not null,
  "report_type" varchar not null,
  "query_parameters" text not null,
  "data_sources" text not null,
  "visualization_config" text,
  "access_level" varchar not null default 'private',
  "format" varchar not null default 'web',
  "schedule" varchar,
  "last_generated_at" datetime,
  "expiration_date" datetime,
  "is_featured" tinyint(1) not null default '0',
  "metadata" text not null default '{}',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("creator_id") references "users"("id")
);
CREATE INDEX "reports_creator_id_index" on "reports"("creator_id");
CREATE INDEX "reports_report_type_index" on "reports"("report_type");
CREATE INDEX "reports_access_level_index" on "reports"("access_level");
CREATE INDEX "reports_last_generated_at_index" on "reports"(
  "last_generated_at"
);
CREATE TABLE IF NOT EXISTS "report_results"(
  "id" integer primary key autoincrement not null,
  "report_id" integer not null,
  "result_data" text not null,
  "file_path" varchar,
  "generation_duration" integer,
  "is_latest" tinyint(1) not null default '1',
  "metadata" text not null default '{}',
  "generated_at" datetime not null default CURRENT_TIMESTAMP,
  foreign key("report_id") references "reports"("id") on delete cascade
);
CREATE INDEX "report_results_report_id_index" on "report_results"("report_id");
CREATE INDEX "report_results_report_id_is_latest_index" on "report_results"(
  "report_id",
  "is_latest"
);
CREATE INDEX "report_results_generated_at_index" on "report_results"(
  "generated_at"
);
CREATE TABLE IF NOT EXISTS "indicators"(
  "id" integer primary key autoincrement not null,
  "code" varchar not null,
  "name" varchar not null,
  "description" text,
  "category" varchar not null,
  "data_type" varchar not null,
  "unit" varchar,
  "calculation_method" text,
  "data_source" varchar,
  "frequency" varchar,
  "benchmark" text,
  "metadata" text not null default '{}',
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "indicators_code_index" on "indicators"("code");
CREATE INDEX "indicators_category_index" on "indicators"("category");
CREATE INDEX "indicators_is_active_index" on "indicators"("is_active");
CREATE UNIQUE INDEX "indicators_code_unique" on "indicators"("code");
CREATE TABLE IF NOT EXISTS "indicator_values"(
  "id" integer primary key autoincrement not null,
  "indicator_id" integer not null,
  "institution_id" integer not null,
  "time_period" varchar not null,
  "value_numeric" numeric,
  "value_text" text,
  "source" varchar,
  "is_estimated" tinyint(1) not null default '0',
  "is_approved" tinyint(1) not null default '0',
  "approved_by" integer,
  "metadata" text not null default '{}',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("indicator_id") references "indicators"("id"),
  foreign key("institution_id") references "institutions"("id"),
  foreign key("approved_by") references "users"("id")
);
CREATE UNIQUE INDEX "indicator_values_indicator_id_institution_id_time_period_unique" on "indicator_values"(
  "indicator_id",
  "institution_id",
  "time_period"
);
CREATE INDEX "indicator_values_indicator_id_index" on "indicator_values"(
  "indicator_id"
);
CREATE INDEX "indicator_values_institution_id_index" on "indicator_values"(
  "institution_id"
);
CREATE INDEX "indicator_values_time_period_index" on "indicator_values"(
  "time_period"
);
CREATE INDEX "indicator_values_is_approved_index" on "indicator_values"(
  "is_approved"
);
CREATE TABLE IF NOT EXISTS "uploads"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "entity_type" varchar,
  "entity_id" integer,
  "original_filename" varchar not null,
  "stored_filename" varchar not null,
  "file_path" varchar not null,
  "file_type" varchar not null,
  "file_size" integer not null,
  "mime_type" varchar not null,
  "is_public" tinyint(1) not null default '0',
  "metadata" text not null default '{}',
  "created_at" datetime not null default CURRENT_TIMESTAMP,
  foreign key("user_id") references "users"("id")
);
CREATE INDEX "uploads_user_id_index" on "uploads"("user_id");
CREATE INDEX "uploads_entity_type_entity_id_index" on "uploads"(
  "entity_type",
  "entity_id"
);
CREATE INDEX "uploads_file_type_index" on "uploads"("file_type");
CREATE TABLE IF NOT EXISTS "activity_logs"(
  "id" integer primary key autoincrement not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "activity_type" varchar not null,
  "entity_type" varchar,
  "entity_id" integer,
  "description" text,
  "properties" text not null default '{}',
  "before_state" text not null default '{}',
  "after_state" text not null default '{}',
  "institution_id" integer,
  "created_at" datetime not null default CURRENT_TIMESTAMP,
  foreign key("user_id") references "users"("id"),
  foreign key("institution_id") references "institutions"("id")
);
CREATE INDEX "activity_logs_user_id_index" on "activity_logs"("user_id");
CREATE INDEX "activity_logs_activity_type_index" on "activity_logs"(
  "activity_type"
);
CREATE INDEX "activity_logs_entity_type_entity_id_index" on "activity_logs"(
  "entity_type",
  "entity_id"
);
CREATE INDEX "activity_logs_institution_id_index" on "activity_logs"(
  "institution_id"
);
CREATE INDEX "activity_logs_created_at_index" on "activity_logs"("created_at");
CREATE TABLE IF NOT EXISTS "audit_logs"(
  "id" integer primary key autoincrement not null,
  "user_id" integer,
  "event" varchar not null,
  "auditable_type" varchar,
  "auditable_id" integer,
  "old_values" text not null default '{}',
  "new_values" text not null default '{}',
  "url" text,
  "ip_address" varchar,
  "user_agent" text,
  "tags" text not null default '[]', "institution_id" integer,
  "created_at" datetime not null default CURRENT_TIMESTAMP,
  foreign key("user_id") references "users"("id"),
  foreign key("institution_id") references "institutions"("id")
);
CREATE INDEX "audit_logs_user_id_index" on "audit_logs"("user_id");
CREATE INDEX "audit_logs_event_index" on "audit_logs"("event");
CREATE INDEX "audit_logs_auditable_type_auditable_id_index" on "audit_logs"(
  "auditable_type",
  "auditable_id"
);
CREATE INDEX "audit_logs_institution_id_index" on "audit_logs"(
  "institution_id"
);
CREATE INDEX "audit_logs_created_at_index" on "audit_logs"("created_at");
CREATE TABLE IF NOT EXISTS "security_events"(
  "id" integer primary key autoincrement not null,
  "event_type" varchar not null,
  "severity" varchar not null,
  "user_id" integer,
  "target_user_id" integer,
  "ip_address" varchar,
  "location_data" text not null default '{}',
  "user_agent" text,
  "description" text,
  "event_data" text not null default '{}',
  "resolution" varchar,
  "resolution_notes" text,
  "resolved_by" integer,
  "resolved_at" datetime,
  "institution_id" integer,
  "created_at" datetime not null default CURRENT_TIMESTAMP,
  foreign key("user_id") references "users"("id"),
  foreign key("target_user_id") references "users"("id"),
  foreign key("resolved_by") references "users"("id"),
  foreign key("institution_id") references "institutions"("id")
);
CREATE INDEX "security_events_event_type_index" on "security_events"(
  "event_type"
);
CREATE INDEX "security_events_user_id_index" on "security_events"("user_id");
CREATE INDEX "security_events_target_user_id_index" on "security_events"(
  "target_user_id"
);
CREATE INDEX "security_events_severity_index" on "security_events"("severity");
CREATE INDEX "security_events_created_at_index" on "security_events"(
  "created_at"
);
CREATE INDEX "security_events_resolution_index" on "security_events"(
  "resolution"
);
CREATE INDEX "security_events_institution_id_index" on "security_events"(
  "institution_id"
);
CREATE TABLE IF NOT EXISTS "survey_responses"(
  "id" integer primary key autoincrement not null,
  "survey_id" integer not null,
  "respondent_id" integer not null,
  "institution_id" integer not null,
  "department" varchar,
  "responses" text not null default('{}'),
  "status" varchar not null default('draft'),
  "progress_percentage" integer not null default('0'),
  "submitted_at" datetime,
  "approved_at" datetime,
  "approved_by" integer,
  "rejection_reason" text,
  "created_at" datetime,
  "updated_at" datetime,
  "department_id" integer,
  "respondent_role" varchar,
  "is_complete" tinyint(1) not null default '0',
  "ip_address" varchar,
  "user_agent" text,
  "started_at" datetime,
  "metadata" text not null default '{}',
  foreign key("approved_by") references users("id") on delete no action on update no action,
  foreign key("institution_id") references institutions("id") on delete no action on update no action,
  foreign key("respondent_id") references users("id") on delete no action on update no action,
  foreign key("survey_id") references surveys("id") on delete no action on update no action,
  foreign key("department_id") references "departments"("id")
);
CREATE UNIQUE INDEX "survey_responses_survey_id_institution_id_department_unique" on "survey_responses"(
  "survey_id",
  "institution_id",
  "department"
);
CREATE TABLE IF NOT EXISTS "survey_versions"(
  "id" integer primary key autoincrement not null,
  "survey_id" integer not null,
  "version_number" integer not null,
  "structure" text not null,
  "created_by" integer not null,
  "created_at" datetime not null default CURRENT_TIMESTAMP,
  foreign key("survey_id") references "surveys"("id") on delete cascade,
  foreign key("created_by") references "users"("id")
);
CREATE UNIQUE INDEX "survey_versions_survey_id_version_number_unique" on "survey_versions"(
  "survey_id",
  "version_number"
);
CREATE INDEX "survey_versions_survey_id_version_number_index" on "survey_versions"(
  "survey_id",
  "version_number"
);
CREATE TABLE IF NOT EXISTS "survey_audit_logs"(
  "id" integer primary key autoincrement not null,
  "survey_id" integer not null,
  "response_id" integer,
  "user_id" integer,
  "action" varchar not null,
  "details" text,
  "ip_address" varchar,
  "created_at" datetime not null default CURRENT_TIMESTAMP,
  foreign key("survey_id") references "surveys"("id") on delete cascade,
  foreign key("response_id") references "survey_responses"("id") on delete set null,
  foreign key("user_id") references "users"("id") on delete set null
);
CREATE INDEX "survey_audit_logs_survey_id_index" on "survey_audit_logs"(
  "survey_id"
);
CREATE INDEX "survey_audit_logs_action_index" on "survey_audit_logs"("action");
CREATE INDEX "survey_audit_logs_created_at_index" on "survey_audit_logs"(
  "created_at"
);
CREATE TABLE IF NOT EXISTS "statistics"(
  "id" integer primary key autoincrement not null,
  "institution_id" integer not null,
  "time_period" varchar not null,
  "category" varchar not null,
  "data" text not null,
  "source" varchar,
  "is_verified" tinyint(1) not null default '0',
  "verified_by" integer,
  "verified_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id"),
  foreign key("verified_by") references "users"("id")
);
CREATE UNIQUE INDEX "statistics_institution_id_time_period_category_unique" on "statistics"(
  "institution_id",
  "time_period",
  "category"
);
CREATE INDEX "statistics_institution_id_index" on "statistics"(
  "institution_id"
);
CREATE INDEX "statistics_time_period_index" on "statistics"("time_period");
CREATE INDEX "statistics_category_index" on "statistics"("category");
CREATE INDEX "statistics_is_verified_index" on "statistics"("is_verified");
CREATE TABLE IF NOT EXISTS "personal_access_tokens"(
  "id" integer primary key autoincrement not null,
  "tokenable_type" varchar not null,
  "tokenable_id" integer not null,
  "name" varchar not null,
  "token" varchar not null,
  "abilities" text,
  "last_used_at" datetime,
  "expires_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" on "personal_access_tokens"(
  "tokenable_type",
  "tokenable_id"
);
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" on "personal_access_tokens"(
  "token"
);
CREATE TABLE IF NOT EXISTS "subjects"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "code" varchar,
  "category" varchar,
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  "short_name" varchar,
  "class_level_start" integer,
  "class_level_end" integer,
  "description" text
);
CREATE UNIQUE INDEX "subjects_code_unique" on "subjects"("code");
CREATE TABLE IF NOT EXISTS "tasks"(
  "id" integer primary key autoincrement not null,
  "title" varchar not null,
  "description" text not null,
  "category" varchar check("category" in('hesabat', 'temir', 'tedbir', 'audit', 'telimat')) not null,
  "priority" varchar check("priority" in('asagi', 'orta', 'yuksek', 'tecili')) not null default 'orta',
  "status" varchar check("status" in('pending', 'in_progress', 'review', 'completed', 'cancelled')) not null default 'pending',
  "progress" integer not null default '0',
  "deadline" datetime,
  "started_at" datetime,
  "completed_at" datetime,
  "created_by" integer not null,
  "assigned_to" integer not null,
  "assigned_institution_id" integer,
  "target_institutions" text,
  "target_scope" varchar check("target_scope" in('specific', 'regional', 'sectoral', 'all')) not null default 'specific',
  "notes" text,
  "attachments" text,
  "requires_approval" tinyint(1) not null default '0',
  "approved_by" integer,
  "approved_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("created_by") references "users"("id") on delete cascade,
  foreign key("assigned_to") references "users"("id") on delete cascade,
  foreign key("assigned_institution_id") references "institutions"("id") on delete cascade,
  foreign key("approved_by") references "users"("id") on delete set null
);
CREATE INDEX "tasks_status_priority_index" on "tasks"("status", "priority");
CREATE INDEX "tasks_assigned_to_status_index" on "tasks"(
  "assigned_to",
  "status"
);
CREATE INDEX "tasks_created_by_created_at_index" on "tasks"(
  "created_by",
  "created_at"
);
CREATE INDEX "tasks_deadline_index" on "tasks"("deadline");
CREATE TABLE IF NOT EXISTS "task_comments"(
  "id" integer primary key autoincrement not null,
  "task_id" integer not null,
  "user_id" integer not null,
  "comment" text not null,
  "attachments" text,
  "type" varchar check("type" in('comment', 'status_change', 'progress_update', 'system')) not null default 'comment',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("task_id") references "tasks"("id") on delete cascade,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE INDEX "task_comments_task_id_created_at_index" on "task_comments"(
  "task_id",
  "created_at"
);
CREATE TABLE IF NOT EXISTS "notifications"(
  "id" integer primary key autoincrement not null,
  "title" varchar not null,
  "message" text not null,
  "type" varchar check("type" in('task_assigned', 'task_updated', 'task_deadline', 'survey_published', 'survey_deadline', 'survey_approved', 'survey_rejected', 'system_alert', 'maintenance', 'security_alert')) not null,
  "priority" varchar check("priority" in('low', 'normal', 'high', 'critical')) not null default 'normal',
  "channel" varchar check("channel" in('in_app', 'email', 'sms', 'push')) not null default 'in_app',
  "user_id" integer,
  "target_users" text,
  "target_institutions" text,
  "target_roles" text,
  "related_type" varchar,
  "related_id" integer,
  "is_sent" tinyint(1) not null default '0',
  "is_read" tinyint(1) not null default '0',
  "sent_at" datetime,
  "read_at" datetime,
  "scheduled_at" datetime,
  "email_status" varchar,
  "sms_status" varchar,
  "delivery_error" text,
  "language" varchar not null default 'az',
  "translations" text,
  "metadata" text,
  "action_data" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE INDEX "notifications_user_id_is_read_created_at_index" on "notifications"(
  "user_id",
  "is_read",
  "created_at"
);
CREATE INDEX "notifications_type_channel_index" on "notifications"(
  "type",
  "channel"
);
CREATE INDEX "notifications_is_sent_scheduled_at_index" on "notifications"(
  "is_sent",
  "scheduled_at"
);
CREATE INDEX "notifications_related_type_related_id_index" on "notifications"(
  "related_type",
  "related_id"
);
CREATE INDEX "notifications_priority_created_at_index" on "notifications"(
  "priority",
  "created_at"
);
CREATE TABLE IF NOT EXISTS "notification_templates"(
  "id" integer primary key autoincrement not null,
  "key" varchar not null,
  "name" varchar not null,
  "type" varchar check("type" in('task_assigned', 'task_updated', 'task_deadline', 'survey_published', 'survey_deadline', 'survey_approved', 'survey_rejected', 'system_alert', 'maintenance', 'security_alert')) not null,
  "subject_template" varchar not null,
  "title_template" text not null,
  "message_template" text not null,
  "email_template" text,
  "sms_template" text,
  "translations" text,
  "channels" text not null,
  "priority" varchar check("priority" in('low', 'normal', 'high', 'critical')) not null default 'normal',
  "is_active" tinyint(1) not null default '1',
  "available_variables" text,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "notification_templates_type_is_active_index" on "notification_templates"(
  "type",
  "is_active"
);
CREATE UNIQUE INDEX "notification_templates_key_unique" on "notification_templates"(
  "key"
);
CREATE TABLE IF NOT EXISTS "survey_questions"(
  "id" integer primary key autoincrement not null,
  "survey_id" integer not null,
  "title" varchar not null,
  "description" text,
  "type" varchar check("type" in('text', 'number', 'date', 'single_choice', 'multiple_choice', 'file_upload', 'rating', 'table_matrix')) not null,
  "order_index" integer not null default '0',
  "is_required" tinyint(1) not null default '0',
  "is_active" tinyint(1) not null default '1',
  "options" text,
  "validation_rules" text,
  "metadata" text,
  "min_value" numeric,
  "max_value" numeric,
  "min_length" integer,
  "max_length" integer,
  "allowed_file_types" text,
  "max_file_size" integer not null default '10240',
  "rating_min" integer not null default '1',
  "rating_max" integer not null default '10',
  "rating_min_label" varchar,
  "rating_max_label" varchar,
  "table_headers" text,
  "table_rows" text,
  "translations" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("survey_id") references "surveys"("id") on delete cascade
);
CREATE INDEX "survey_questions_survey_id_order_index_index" on "survey_questions"(
  "survey_id",
  "order_index"
);
CREATE INDEX "survey_questions_survey_id_is_active_index" on "survey_questions"(
  "survey_id",
  "is_active"
);
CREATE TABLE IF NOT EXISTS "survey_question_responses"(
  "id" integer primary key autoincrement not null,
  "survey_response_id" integer not null,
  "survey_question_id" integer not null,
  "text_response" text,
  "number_response" numeric,
  "date_response" date,
  "choice_response" text,
  "rating_response" integer,
  "table_response" text,
  "file_response" text,
  "metadata" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("survey_response_id") references "survey_responses"("id") on delete cascade,
  foreign key("survey_question_id") references "survey_questions"("id") on delete cascade
);
CREATE INDEX "survey_question_responses_survey_response_id_survey_question_id_index" on "survey_question_responses"(
  "survey_response_id",
  "survey_question_id"
);
CREATE UNIQUE INDEX "unique_response_question" on "survey_question_responses"(
  "survey_response_id",
  "survey_question_id"
);
CREATE TABLE IF NOT EXISTS "surveys"(
  "id" integer primary key autoincrement not null,
  "title" varchar not null,
  "description" text,
  "creator_id" integer not null,
  "target_institutions" text not null default('[]'), "target_departments" text not null default('[]'), "structure" text not null default('{}'),
  "metadata" text not null default('{}'),
  "is_active" tinyint(1) not null default('1'),
  "template_id" integer,
  "status" varchar not null default('draft'),
  "published_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  "survey_type" varchar not null default('form'),
  "is_anonymous" tinyint(1) not null default('0'),
  "allow_multiple_responses" tinyint(1) not null default('0'),
  "start_date" datetime,
  "end_date" datetime,
  "archived_at" datetime,
  "response_count" integer not null default('0'),
  "completion_threshold" integer,
  "template_name" varchar,
  "auto_archive" tinyint(1) not null default '1',
  "archive_reason" varchar,
  "approval_status" varchar check("approval_status" in('pending', 'school_approved', 'sector_approved', 'region_approved', 'rejected')) not null default 'pending',
  "school_approved_by" integer,
  "school_approved_at" datetime,
  "sector_approved_by" integer,
  "sector_approved_at" datetime,
  "region_approved_by" integer,
  "region_approved_at" datetime,
  "rejection_reason" text,
  "targeting_summary" text,
  "estimated_recipients" integer not null default '0',
  "actual_responses" integer not null default '0',
  foreign key("template_id") references survey_templates("id") on delete no action on update no action,
  foreign key("creator_id") references users("id") on delete no action on update no action,
  foreign key("school_approved_by") references "users"("id") on delete set null,
  foreign key("sector_approved_by") references "users"("id") on delete set null,
  foreign key("region_approved_by") references "users"("id") on delete set null
);
CREATE TABLE IF NOT EXISTS "documents"(
  "id" integer primary key autoincrement not null,
  "title" varchar not null,
  "description" text,
  "original_filename" varchar not null,
  "stored_filename" varchar not null,
  "file_path" varchar not null,
  "file_extension" varchar not null,
  "mime_type" varchar not null,
  "file_size" integer not null,
  "file_hash" varchar,
  "file_type" varchar check("file_type" in('pdf', 'excel', 'word', 'image', 'other')) not null default 'other',
  "access_level" varchar check("access_level" in('public', 'regional', 'sectoral', 'institution')) not null default 'institution',
  "uploaded_by" integer not null,
  "institution_id" integer,
  "allowed_users" text,
  "allowed_roles" text,
  "allowed_institutions" text,
  "parent_document_id" integer,
  "version" varchar not null default '1.0',
  "is_latest_version" tinyint(1) not null default '1',
  "version_notes" text,
  "category" varchar check("category" in('administrative', 'financial', 'educational', 'hr', 'technical', 'legal', 'reports', 'forms', 'other')) not null default 'other',
  "tags" text,
  "status" varchar check("status" in('draft', 'active', 'archived', 'deleted')) not null default 'active',
  "is_public" tinyint(1) not null default '0',
  "is_downloadable" tinyint(1) not null default '1',
  "is_viewable_online" tinyint(1) not null default '1',
  "expires_at" datetime,
  "published_at" datetime,
  "archived_at" datetime,
  "metadata" text,
  "content_preview" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("uploaded_by") references "users"("id") on delete cascade,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("parent_document_id") references "documents"("id") on delete cascade
);
CREATE INDEX "documents_uploaded_by_status_index" on "documents"(
  "uploaded_by",
  "status"
);
CREATE INDEX "documents_institution_id_access_level_index" on "documents"(
  "institution_id",
  "access_level"
);
CREATE INDEX "documents_category_status_index" on "documents"(
  "category",
  "status"
);
CREATE INDEX "documents_file_type_status_index" on "documents"(
  "file_type",
  "status"
);
CREATE INDEX "documents_parent_document_id_version_index" on "documents"(
  "parent_document_id",
  "version"
);
CREATE INDEX "documents_is_latest_version_status_index" on "documents"(
  "is_latest_version",
  "status"
);
CREATE INDEX "documents_expires_at_index" on "documents"("expires_at");
CREATE TABLE IF NOT EXISTS "document_shares"(
  "id" integer primary key autoincrement not null,
  "document_id" integer not null,
  "shared_by" integer not null,
  "share_token" varchar not null,
  "share_name" varchar,
  "expires_at" datetime not null,
  "max_downloads" integer,
  "download_count" integer not null default '0',
  "view_count" integer not null default '0',
  "requires_password" tinyint(1) not null default '0',
  "password_hash" varchar,
  "allowed_ips" text,
  "is_active" tinyint(1) not null default '1',
  "can_download" tinyint(1) not null default '1',
  "can_view_online" tinyint(1) not null default '1',
  "can_share" tinyint(1) not null default '0',
  "last_accessed_at" datetime,
  "last_accessed_ip" varchar,
  "access_notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("document_id") references "documents"("id") on delete cascade,
  foreign key("shared_by") references "users"("id") on delete cascade
);
CREATE INDEX "document_shares_document_id_is_active_index" on "document_shares"(
  "document_id",
  "is_active"
);
CREATE INDEX "document_shares_shared_by_created_at_index" on "document_shares"(
  "shared_by",
  "created_at"
);
CREATE INDEX "document_shares_expires_at_is_active_index" on "document_shares"(
  "expires_at",
  "is_active"
);
CREATE UNIQUE INDEX "document_shares_share_token_unique" on "document_shares"(
  "share_token"
);
CREATE TABLE IF NOT EXISTS "document_downloads"(
  "id" integer primary key autoincrement not null,
  "document_id" integer not null,
  "user_id" integer,
  "document_share_id" integer,
  "ip_address" varchar not null,
  "user_agent" text,
  "download_type" varchar check("download_type" in('direct', 'shared_link', 'preview', 'api')) not null default 'direct',
  "file_size_downloaded" integer,
  "download_completed" tinyint(1) not null default '1',
  "download_method" varchar,
  "metadata" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("document_id") references "documents"("id") on delete cascade,
  foreign key("user_id") references "users"("id") on delete set null,
  foreign key("document_share_id") references "document_shares"("id") on delete set null
);
CREATE INDEX "document_downloads_document_id_created_at_index" on "document_downloads"(
  "document_id",
  "created_at"
);
CREATE INDEX "document_downloads_user_id_created_at_index" on "document_downloads"(
  "user_id",
  "created_at"
);
CREATE INDEX "document_downloads_ip_address_created_at_index" on "document_downloads"(
  "ip_address",
  "created_at"
);
CREATE INDEX "document_downloads_download_type_created_at_index" on "document_downloads"(
  "download_type",
  "created_at"
);
CREATE TABLE IF NOT EXISTS "user_storage_quotas"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "monthly_quota" integer not null default '104857600',
  "current_usage" integer not null default '0',
  "file_count" integer not null default '0',
  "quota_period_start" date not null,
  "quota_period_end" date not null,
  "last_reset_at" datetime,
  "total_uploaded" integer not null default '0',
  "total_downloaded" integer not null default '0',
  "total_files_uploaded" integer not null default '0',
  "total_files_deleted" integer not null default '0',
  "quota_exceeded" tinyint(1) not null default '0',
  "quota_exceeded_at" datetime,
  "quota_warning_sent" tinyint(1) not null default '0',
  "usage_history" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE INDEX "user_storage_quotas_user_id_quota_period_start_index" on "user_storage_quotas"(
  "user_id",
  "quota_period_start"
);
CREATE INDEX "user_storage_quotas_quota_exceeded_current_usage_index" on "user_storage_quotas"(
  "quota_exceeded",
  "current_usage"
);
CREATE UNIQUE INDEX "user_storage_quotas_user_id_unique" on "user_storage_quotas"(
  "user_id"
);
CREATE TABLE IF NOT EXISTS "user_devices"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "device_id" varchar not null,
  "device_name" varchar not null,
  "device_type" varchar not null default 'unknown',
  "browser_name" varchar,
  "browser_version" varchar,
  "operating_system" varchar,
  "platform" varchar,
  "user_agent" text,
  "screen_resolution" varchar,
  "timezone" varchar,
  "language" varchar,
  "device_fingerprint" text,
  "last_ip_address" varchar not null,
  "registration_ip" varchar not null,
  "last_location_country" varchar,
  "last_location_city" varchar,
  "is_trusted" tinyint(1) not null default '0',
  "is_active" tinyint(1) not null default '1',
  "trusted_at" datetime,
  "last_seen_at" datetime not null,
  "registered_at" datetime not null,
  "requires_verification" tinyint(1) not null default '0',
  "failed_verification_attempts" integer not null default '0',
  "verification_blocked_until" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  "last_login_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE INDEX "user_devices_user_id_is_active_index" on "user_devices"(
  "user_id",
  "is_active"
);
CREATE INDEX "user_devices_device_id_index" on "user_devices"("device_id");
CREATE INDEX "user_devices_last_ip_address_created_at_index" on "user_devices"(
  "last_ip_address",
  "created_at"
);
CREATE INDEX "user_devices_last_seen_at_index" on "user_devices"(
  "last_seen_at"
);
CREATE UNIQUE INDEX "user_devices_device_id_unique" on "user_devices"(
  "device_id"
);
CREATE TABLE IF NOT EXISTS "user_sessions"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "user_device_id" integer not null,
  "session_token" varchar not null,
  "session_id" varchar,
  "session_name" varchar,
  "session_type" varchar check("session_type" in('web', 'api', 'mobile')) not null default 'web',
  "session_data" text,
  "started_at" datetime not null,
  "last_activity_at" datetime not null,
  "expires_at" datetime not null,
  "ip_address" varchar not null,
  "user_agent" text,
  "session_fingerprint" varchar,
  "security_context" text,
  "status" varchar check("status" in('active', 'expired', 'terminated', 'suspended', 'hijacked')) not null default 'active',
  "is_suspicious" tinyint(1) not null default '0',
  "security_score" integer not null default '100',
  "termination_reason" varchar check("termination_reason" in('logout', 'timeout', 'admin_action', 'device_limit', 'security_concern', 'system_maintenance')),
  "terminated_at" datetime,
  "terminated_by" integer,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade,
  foreign key("user_device_id") references "user_devices"("id") on delete cascade,
  foreign key("terminated_by") references "users"("id") on delete set null
);
CREATE INDEX "user_sessions_user_id_status_index" on "user_sessions"(
  "user_id",
  "status"
);
CREATE INDEX "user_sessions_user_device_id_status_index" on "user_sessions"(
  "user_device_id",
  "status"
);
CREATE INDEX "user_sessions_session_token_index" on "user_sessions"(
  "session_token"
);
CREATE INDEX "user_sessions_expires_at_status_index" on "user_sessions"(
  "expires_at",
  "status"
);
CREATE INDEX "user_sessions_last_activity_at_index" on "user_sessions"(
  "last_activity_at"
);
CREATE INDEX "user_sessions_ip_address_created_at_index" on "user_sessions"(
  "ip_address",
  "created_at"
);
CREATE UNIQUE INDEX "user_sessions_session_token_unique" on "user_sessions"(
  "session_token"
);
CREATE TABLE IF NOT EXISTS "session_activities"(
  "id" integer primary key autoincrement not null,
  "user_session_id" integer not null,
  "user_id" integer not null,
  "activity_type" varchar check("activity_type" in('login', 'logout', 'heartbeat', 'api_call', 'page_view', 'download', 'upload', 'password_change', 'settings_change', 'security_event')) not null,
  "activity_description" varchar,
  "endpoint" varchar,
  "http_method" varchar,
  "response_status" integer,
  "ip_address" varchar not null,
  "user_agent" text,
  "referer" varchar,
  "request_data" text,
  "is_suspicious" tinyint(1) not null default '0',
  "risk_score" integer not null default '0',
  "security_flags" text,
  "response_time_ms" integer,
  "memory_usage_mb" integer,
  "debug_data" text,
  "location_country" varchar,
  "location_city" varchar,
  "device_type" varchar,
  "created_at" datetime not null,
  "updated_at" datetime,
  foreign key("user_session_id") references "user_sessions"("id") on delete cascade,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE INDEX "session_activities_user_session_id_created_at_index" on "session_activities"(
  "user_session_id",
  "created_at"
);
CREATE INDEX "session_activities_user_id_activity_type_created_at_index" on "session_activities"(
  "user_id",
  "activity_type",
  "created_at"
);
CREATE INDEX "session_activities_ip_address_created_at_index" on "session_activities"(
  "ip_address",
  "created_at"
);
CREATE INDEX "session_activities_is_suspicious_created_at_index" on "session_activities"(
  "is_suspicious",
  "created_at"
);
CREATE INDEX "session_activities_activity_type_created_at_index" on "session_activities"(
  "activity_type",
  "created_at"
);
CREATE INDEX "session_activities_endpoint_created_at_index" on "session_activities"(
  "endpoint",
  "created_at"
);
CREATE TABLE IF NOT EXISTS "security_alerts"(
  "id" integer primary key autoincrement not null,
  "user_id" integer,
  "user_session_id" integer,
  "alert_type" varchar check("alert_type" in('failed_login', 'account_lockout', 'suspicious_activity', 'session_hijacking', 'multiple_devices', 'geographic_anomaly', 'brute_force_attack', 'privilege_escalation', 'unauthorized_access', 'data_breach_attempt', 'system_intrusion')) not null,
  "severity" varchar check("severity" in('low', 'medium', 'high', 'critical')) not null default 'medium',
  "status" varchar check("status" in('open', 'investigating', 'resolved', 'false_positive')) not null default 'open',
  "title" varchar not null,
  "description" text not null,
  "alert_data" text,
  "evidence" text,
  "source_ip" varchar,
  "source_location" varchar,
  "source_user_agent" text,
  "affected_resource" varchar,
  "risk_score" integer not null default '50',
  "requires_immediate_action" tinyint(1) not null default '0',
  "auto_generated" tinyint(1) not null default '1',
  "assigned_to" integer,
  "detected_at" datetime not null,
  "acknowledged_at" datetime,
  "resolved_at" datetime,
  "resolution_notes" text,
  "resolution_action" varchar check("resolution_action" in('no_action', 'user_notified', 'account_locked', 'session_terminated', 'access_restricted', 'password_reset_forced', 'security_review_required')),
  "notifications_sent" text,
  "escalation_level" integer not null default '0',
  "last_escalated_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade,
  foreign key("user_session_id") references "user_sessions"("id") on delete set null,
  foreign key("assigned_to") references "users"("id") on delete set null
);
CREATE INDEX "security_alerts_alert_type_severity_status_index" on "security_alerts"(
  "alert_type",
  "severity",
  "status"
);
CREATE INDEX "security_alerts_user_id_detected_at_index" on "security_alerts"(
  "user_id",
  "detected_at"
);
CREATE INDEX "security_alerts_status_severity_detected_at_index" on "security_alerts"(
  "status",
  "severity",
  "detected_at"
);
CREATE INDEX "security_alerts_source_ip_detected_at_index" on "security_alerts"(
  "source_ip",
  "detected_at"
);
CREATE INDEX "security_alerts_requires_immediate_action_status_index" on "security_alerts"(
  "requires_immediate_action",
  "status"
);
CREATE INDEX "security_alerts_assigned_to_status_index" on "security_alerts"(
  "assigned_to",
  "status"
);
CREATE TABLE IF NOT EXISTS "account_lockouts"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "lockout_type" varchar check("lockout_type" in('failed_attempts', 'suspicious_activity', 'admin_action', 'security_breach', 'multiple_devices', 'geographic_anomaly', 'brute_force_protection')) not null,
  "lockout_level" varchar check("lockout_level" in('temporary', 'extended', 'manual', 'permanent')) not null default 'temporary',
  "trigger_ip" varchar,
  "trigger_user_agent" text,
  "trigger_data" text,
  "failed_attempts_count" integer not null default '0',
  "locked_at" datetime not null,
  "unlock_at" datetime,
  "unlocked_at" datetime,
  "status" varchar check("status" in('active', 'expired', 'unlocked', 'escalated')) not null default 'active',
  "unlock_method" varchar check("unlock_method" in('automatic', 'admin_unlock', 'user_verification', 'time_expiry', 'security_clearance')),
  "locked_by" integer,
  "unlocked_by" integer,
  "admin_notes" text,
  "unlock_reason" text,
  "escalated_to_admin" tinyint(1) not null default '0',
  "user_notified" tinyint(1) not null default '0',
  "notification_history" text,
  "risk_score" integer not null default '50',
  "requires_manual_review" tinyint(1) not null default '0',
  "lockout_duration_minutes" integer,
  "actual_duration_minutes" integer,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade,
  foreign key("locked_by") references "users"("id") on delete set null,
  foreign key("unlocked_by") references "users"("id") on delete set null
);
CREATE INDEX "account_lockouts_user_id_status_index" on "account_lockouts"(
  "user_id",
  "status"
);
CREATE INDEX "account_lockouts_locked_at_status_index" on "account_lockouts"(
  "locked_at",
  "status"
);
CREATE INDEX "account_lockouts_unlock_at_status_index" on "account_lockouts"(
  "unlock_at",
  "status"
);
CREATE INDEX "account_lockouts_lockout_type_locked_at_index" on "account_lockouts"(
  "lockout_type",
  "locked_at"
);
CREATE INDEX "account_lockouts_trigger_ip_locked_at_index" on "account_lockouts"(
  "trigger_ip",
  "locked_at"
);
CREATE INDEX "account_lockouts_requires_manual_review_status_index" on "account_lockouts"(
  "requires_manual_review",
  "status"
);
CREATE TABLE IF NOT EXISTS "time_slots"(
  "id" integer primary key autoincrement not null,
  "institution_id" integer not null,
  "name" varchar not null,
  "code" varchar,
  "start_time" time not null,
  "end_time" time not null,
  "duration_minutes" integer not null,
  "slot_type" varchar check("slot_type" in('class', 'break', 'lunch', 'assembly', 'activity', 'exam', 'preparation')) not null default 'class',
  "applicable_days" text not null,
  "order_index" integer not null default '0',
  "is_active" tinyint(1) not null default '1',
  "is_teaching_period" tinyint(1) not null default '1',
  "allow_conflicts" tinyint(1) not null default '0',
  "metadata" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id") on delete cascade
);
CREATE INDEX "time_slots_institution_id_is_active_index" on "time_slots"(
  "institution_id",
  "is_active"
);
CREATE INDEX "time_slots_start_time_end_time_index" on "time_slots"(
  "start_time",
  "end_time"
);
CREATE INDEX "time_slots_slot_type_is_active_index" on "time_slots"(
  "slot_type",
  "is_active"
);
CREATE INDEX "time_slots_order_index_index" on "time_slots"("order_index");
CREATE UNIQUE INDEX "unique_institution_time_slot" on "time_slots"(
  "institution_id",
  "start_time",
  "end_time"
);
CREATE TABLE IF NOT EXISTS "academic_calendars"(
  "id" integer primary key autoincrement not null,
  "academic_year_id" integer not null,
  "institution_id" integer not null,
  "name" varchar not null,
  "calendar_type" varchar check("calendar_type" in('school', 'exam', 'holiday', 'event', 'training')) not null default 'school',
  "start_date" date not null,
  "end_date" date not null,
  "first_semester_start" date,
  "first_semester_end" date,
  "second_semester_start" date,
  "second_semester_end" date,
  "working_days" text not null default '[1,2,3,4,5]', "working_hours" text,
  "holidays" text,
  "special_events" text,
  "exam_periods" text,
  "min_teaching_days" integer not null default '180',
  "max_daily_periods" integer not null default '8',
  "calendar_rules" text,
  "status" varchar check("status" in('draft', 'pending_approval', 'approved', 'active', 'archived')) not null default 'draft',
  "is_default" tinyint(1) not null default '0',
  "created_by" integer not null,
  "approved_by" integer,
  "approved_at" datetime,
  "metadata" text,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("created_by") references "users"("id") on delete cascade,
  foreign key("approved_by") references "users"("id") on delete set null
);
CREATE INDEX "academic_calendars_academic_year_id_institution_id_index" on "academic_calendars"(
  "academic_year_id",
  "institution_id"
);
CREATE INDEX "academic_calendars_calendar_type_status_index" on "academic_calendars"(
  "calendar_type",
  "status"
);
CREATE INDEX "academic_calendars_start_date_end_date_index" on "academic_calendars"(
  "start_date",
  "end_date"
);
CREATE INDEX "academic_calendars_is_default_status_index" on "academic_calendars"(
  "is_default",
  "status"
);
CREATE UNIQUE INDEX "unique_default_calendar" on "academic_calendars"(
  "academic_year_id",
  "institution_id",
  "is_default"
);
CREATE TABLE IF NOT EXISTS "teacher_subjects"(
  "id" integer primary key autoincrement not null,
  "teacher_id" integer not null,
  "subject_id" integer not null,
  "grade_levels" text not null,
  "specialization_level" varchar check("specialization_level" in('basic', 'intermediate', 'advanced', 'expert', 'master')) not null default 'basic',
  "max_hours_per_week" integer not null default '18',
  "max_classes_per_day" integer not null default '6',
  "max_consecutive_classes" integer not null default '3',
  "preferred_time_slots" text,
  "unavailable_time_slots" text,
  "preferred_days" text,
  "requires_lab" tinyint(1) not null default '0',
  "requires_projector" tinyint(1) not null default '0',
  "requires_computer" tinyint(1) not null default '0',
  "room_requirements" text,
  "qualified_since" date,
  "last_training_date" date,
  "certification_number" varchar,
  "teaching_notes" text,
  "is_active" tinyint(1) not null default '1',
  "is_primary_subject" tinyint(1) not null default '0',
  "valid_from" date not null default '2025-07-08 00:00:00',
  "valid_until" date,
  "performance_rating" numeric,
  "years_experience" integer not null default '0',
  "teaching_statistics" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("teacher_id") references "users"("id") on delete cascade,
  foreign key("subject_id") references "subjects"("id") on delete cascade
);
CREATE INDEX "teacher_subjects_teacher_id_is_active_index" on "teacher_subjects"(
  "teacher_id",
  "is_active"
);
CREATE INDEX "teacher_subjects_subject_id_is_active_index" on "teacher_subjects"(
  "subject_id",
  "is_active"
);
CREATE INDEX "teacher_subjects_specialization_level_index" on "teacher_subjects"(
  "specialization_level"
);
CREATE INDEX "teacher_subjects_is_primary_subject_is_active_index" on "teacher_subjects"(
  "is_primary_subject",
  "is_active"
);
CREATE INDEX "teacher_subjects_valid_from_valid_until_index" on "teacher_subjects"(
  "valid_from",
  "valid_until"
);
CREATE UNIQUE INDEX "unique_teacher_subject" on "teacher_subjects"(
  "teacher_id",
  "subject_id"
);
CREATE TABLE IF NOT EXISTS "teacher_availability"(
  "id" integer primary key autoincrement not null,
  "teacher_id" integer not null,
  "day_of_week" varchar check("day_of_week" in('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) not null,
  "start_time" time not null,
  "end_time" time not null,
  "availability_type" varchar check("availability_type" in('available', 'unavailable', 'preferred', 'restricted', 'meeting', 'training', 'preparation', 'examination', 'consultation')) not null default 'available',
  "recurrence_type" varchar check("recurrence_type" in('weekly', 'bi_weekly', 'monthly', 'one_time', 'term', 'year')) not null default 'weekly',
  "effective_date" date not null default '2025-07-08 00:00:00',
  "end_date" date,
  "priority" integer not null default '5',
  "is_flexible" tinyint(1) not null default '0',
  "is_mandatory" tinyint(1) not null default '0',
  "reason" varchar,
  "description" text,
  "location" varchar,
  "created_by" integer not null,
  "approved_by" integer,
  "approved_at" datetime,
  "status" varchar check("status" in('pending', 'approved', 'rejected', 'active', 'expired')) not null default 'pending',
  "conflict_resolution_priority" integer not null default '5',
  "allow_emergency_override" tinyint(1) not null default '0',
  "metadata" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("teacher_id") references "users"("id") on delete cascade,
  foreign key("created_by") references "users"("id") on delete cascade,
  foreign key("approved_by") references "users"("id") on delete set null
);
CREATE INDEX "teacher_availability_teacher_id_day_of_week_index" on "teacher_availability"(
  "teacher_id",
  "day_of_week"
);
CREATE INDEX "teacher_availability_availability_type_status_index" on "teacher_availability"(
  "availability_type",
  "status"
);
CREATE INDEX "teacher_availability_effective_date_end_date_index" on "teacher_availability"(
  "effective_date",
  "end_date"
);
CREATE INDEX "teacher_availability_start_time_end_time_index" on "teacher_availability"(
  "start_time",
  "end_time"
);
CREATE INDEX "teacher_availability_recurrence_type_status_index" on "teacher_availability"(
  "recurrence_type",
  "status"
);
CREATE INDEX "teacher_availability_is_mandatory_priority_index" on "teacher_availability"(
  "is_mandatory",
  "priority"
);
CREATE TABLE IF NOT EXISTS "schedules"(
  "id" integer primary key autoincrement not null,
  "academic_year_id" integer not null,
  "academic_term_id" integer,
  "institution_id" integer not null,
  "grade_id" integer,
  "name" varchar not null,
  "code" varchar,
  "description" text,
  "schedule_type" varchar check("schedule_type" in('regular', 'exam', 'holiday', 'special', 'temporary', 'makeup', 'summer')) not null default 'regular',
  "effective_date" date not null,
  "end_date" date,
  "total_periods_per_day" integer not null default '8',
  "total_teaching_periods" integer not null default '6',
  "working_days" text not null default '[1,2,3,4,5]', "generation_method" varchar check("generation_method" in('manual', 'template', 'automated', 'imported', 'copied')) not null default 'manual',
  "template_id" integer,
  "copied_from_schedule_id" integer,
  "status" varchar check("status" in('draft', 'pending_review', 'under_review', 'approved', 'active', 'suspended', 'archived', 'rejected')) not null default 'draft',
  "created_by" integer not null,
  "reviewed_by" integer,
  "approved_by" integer,
  "submitted_at" datetime,
  "reviewed_at" datetime,
  "approved_at" datetime,
  "activated_at" datetime,
  "optimization_score" numeric,
  "conflict_count" integer not null default '0',
  "total_sessions" integer not null default '0',
  "teacher_utilization" numeric,
  "room_utilization" numeric,
  "scheduling_constraints" text,
  "scheduling_preferences" text,
  "optimization_parameters" text,
  "notify_teachers" tinyint(1) not null default '1',
  "notify_students" tinyint(1) not null default '0',
  "last_notification_sent" datetime,
  "version" integer not null default '1',
  "previous_version_id" integer,
  "change_log" text,
  "metadata" text,
  "notes" text,
  "rejection_reason" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("academic_term_id") references "academic_terms"("id") on delete cascade,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("grade_id") references "grades"("id") on delete cascade,
  foreign key("copied_from_schedule_id") references "schedules"("id") on delete set null,
  foreign key("created_by") references "users"("id") on delete cascade,
  foreign key("reviewed_by") references "users"("id") on delete set null,
  foreign key("approved_by") references "users"("id") on delete set null,
  foreign key("previous_version_id") references "schedules"("id") on delete set null
);
CREATE INDEX "schedules_academic_year_id_academic_term_id_index" on "schedules"(
  "academic_year_id",
  "academic_term_id"
);
CREATE INDEX "schedules_institution_id_status_index" on "schedules"(
  "institution_id",
  "status"
);
CREATE INDEX "schedules_grade_id_status_index" on "schedules"(
  "grade_id",
  "status"
);
CREATE INDEX "schedules_schedule_type_status_index" on "schedules"(
  "schedule_type",
  "status"
);
CREATE INDEX "schedules_effective_date_end_date_index" on "schedules"(
  "effective_date",
  "end_date"
);
CREATE INDEX "schedules_status_activated_at_index" on "schedules"(
  "status",
  "activated_at"
);
CREATE INDEX "schedules_created_by_status_index" on "schedules"(
  "created_by",
  "status"
);
CREATE INDEX "schedules_conflict_count_index" on "schedules"("conflict_count");
CREATE UNIQUE INDEX "unique_active_schedule_per_grade" on "schedules"(
  "grade_id",
  "effective_date",
  "schedule_type"
);
CREATE TABLE IF NOT EXISTS "schedule_sessions"(
  "id" integer primary key autoincrement not null,
  "schedule_id" integer not null,
  "subject_id" integer not null,
  "teacher_id" integer not null,
  "room_id" integer,
  "time_slot_id" integer not null,
  "day_of_week" varchar check("day_of_week" in('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) not null,
  "period_number" integer not null,
  "start_time" time not null,
  "end_time" time not null,
  "duration_minutes" integer not null,
  "session_type" varchar check("session_type" in('regular', 'lab', 'practical', 'exam', 'quiz', 'review', 'makeup', 'substitution', 'assembly', 'activity', 'consultation', 'preparation')) not null default 'regular',
  "recurrence_pattern" varchar check("recurrence_pattern" in('weekly', 'bi_weekly', 'monthly', 'one_time', 'custom')) not null default 'weekly',
  "recurrence_config" text,
  "topic" varchar,
  "description" text,
  "lesson_plan_reference" varchar,
  "requires_projector" tinyint(1) not null default '0',
  "requires_computer" tinyint(1) not null default '0',
  "requires_lab_equipment" tinyint(1) not null default '0',
  "requires_special_setup" tinyint(1) not null default '0',
  "required_resources" text,
  "room_setup_requirements" text,
  "expected_student_count" integer,
  "student_groups" text,
  "is_mandatory" tinyint(1) not null default '1',
  "status" varchar check("status" in('scheduled', 'confirmed', 'cancelled', 'moved', 'substituted', 'completed', 'in_progress')) not null default 'scheduled',
  "substitute_teacher_id" integer,
  "original_teacher_id" integer,
  "substitution_reason" varchar,
  "last_modified_at" datetime,
  "last_modified_by" integer,
  "actual_student_count" integer,
  "attendance_percentage" numeric,
  "session_started_at" datetime,
  "session_ended_at" datetime,
  "completion_notes" text,
  "has_conflicts" tinyint(1) not null default '0',
  "conflict_details" text,
  "conflict_severity" varchar check("conflict_severity" in('none', 'low', 'medium', 'high', 'critical')) not null default 'none',
  "session_rating" numeric,
  "teacher_feedback" text,
  "student_feedback" text,
  "session_analytics" text,
  "notify_students" tinyint(1) not null default '1',
  "notify_parents" tinyint(1) not null default '0',
  "notifications_sent_at" datetime,
  "notification_history" text,
  "external_reference" varchar,
  "integration_data" text,
  "metadata" text,
  "administrative_notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("schedule_id") references "schedules"("id") on delete cascade,
  foreign key("subject_id") references "subjects"("id") on delete cascade,
  foreign key("teacher_id") references "users"("id") on delete cascade,
  foreign key("room_id") references "rooms"("id") on delete set null,
  foreign key("time_slot_id") references "time_slots"("id") on delete cascade,
  foreign key("substitute_teacher_id") references "users"("id") on delete set null,
  foreign key("original_teacher_id") references "users"("id") on delete set null,
  foreign key("last_modified_by") references "users"("id") on delete set null
);
CREATE INDEX "schedule_sessions_schedule_id_day_of_week_index" on "schedule_sessions"(
  "schedule_id",
  "day_of_week"
);
CREATE INDEX "schedule_sessions_teacher_id_day_of_week_start_time_index" on "schedule_sessions"(
  "teacher_id",
  "day_of_week",
  "start_time"
);
CREATE INDEX "schedule_sessions_room_id_day_of_week_start_time_index" on "schedule_sessions"(
  "room_id",
  "day_of_week",
  "start_time"
);
CREATE INDEX "schedule_sessions_subject_id_session_type_index" on "schedule_sessions"(
  "subject_id",
  "session_type"
);
CREATE INDEX "schedule_sessions_time_slot_id_day_of_week_index" on "schedule_sessions"(
  "time_slot_id",
  "day_of_week"
);
CREATE INDEX "schedule_sessions_status_day_of_week_index" on "schedule_sessions"(
  "status",
  "day_of_week"
);
CREATE INDEX "schedule_sessions_period_number_day_of_week_index" on "schedule_sessions"(
  "period_number",
  "day_of_week"
);
CREATE INDEX "schedule_sessions_start_time_end_time_index" on "schedule_sessions"(
  "start_time",
  "end_time"
);
CREATE INDEX "schedule_sessions_has_conflicts_conflict_severity_index" on "schedule_sessions"(
  "has_conflicts",
  "conflict_severity"
);
CREATE INDEX "schedule_sessions_recurrence_pattern_status_index" on "schedule_sessions"(
  "recurrence_pattern",
  "status"
);
CREATE UNIQUE INDEX "unique_teacher_time_slot" on "schedule_sessions"(
  "teacher_id",
  "day_of_week",
  "time_slot_id",
  "schedule_id"
);
CREATE UNIQUE INDEX "unique_room_time_slot" on "schedule_sessions"(
  "room_id",
  "day_of_week",
  "time_slot_id",
  "schedule_id"
);
CREATE TABLE IF NOT EXISTS "schedule_templates"(
  "id" integer primary key autoincrement not null,
  "institution_id" integer not null,
  "name" varchar not null,
  "code" varchar,
  "description" text,
  "template_type" varchar check("template_type" in('weekly', 'daily', 'subject_specific', 'grade_level', 'institutional', 'seasonal')) not null default 'weekly',
  "grade_level_start" integer,
  "grade_level_end" integer,
  "applicable_grades" text,
  "subject_allocations" text,
  "daily_subject_distribution" text,
  "time_slot_preferences" text,
  "periods_per_day" integer not null default '8',
  "teaching_periods_per_day" integer not null default '6',
  "break_periods" text,
  "working_days" text not null default '[1,2,3,4,5]', "scheduling_rules" text,
  "teacher_workload_rules" text,
  "room_allocation_rules" text,
  "conflict_resolution_rules" text,
  "template_data" text not null,
  "default_settings" text,
  "customization_options" text,
  "term_variations" text,
  "seasonal_adjustments" text,
  "allow_term_customization" tinyint(1) not null default '1',
  "success_rate" numeric,
  "usage_count" integer not null default '0',
  "user_rating" numeric,
  "last_used_at" datetime,
  "visibility" varchar check("visibility" in('private', 'institution', 'regional', 'public')) not null default 'institution',
  "is_system_template" tinyint(1) not null default '0',
  "is_approved" tinyint(1) not null default '0',
  "is_featured" tinyint(1) not null default '0',
  "status" varchar check("status" in('draft', 'testing', 'active', 'deprecated', 'archived')) not null default 'draft',
  "is_default" tinyint(1) not null default '0',
  "version" varchar not null default '1.0',
  "parent_template_id" integer,
  "version_history" text,
  "change_notes" text,
  "created_by" integer not null,
  "approved_by" integer,
  "approved_at" datetime,
  "last_updated_at" datetime,
  "usage_analytics" text,
  "feedback_summary" text,
  "performance_metrics" text,
  "is_exportable" tinyint(1) not null default '1',
  "is_importable" tinyint(1) not null default '1',
  "export_format" varchar,
  "import_mapping" text,
  "metadata" text,
  "usage_instructions" text,
  "administrative_notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("parent_template_id") references "schedule_templates"("id") on delete set null,
  foreign key("created_by") references "users"("id") on delete cascade,
  foreign key("approved_by") references "users"("id") on delete set null
);
CREATE INDEX "schedule_templates_institution_id_status_index" on "schedule_templates"(
  "institution_id",
  "status"
);
CREATE INDEX "schedule_templates_template_type_status_index" on "schedule_templates"(
  "template_type",
  "status"
);
CREATE INDEX "schedule_templates_grade_level_start_grade_level_end_index" on "schedule_templates"(
  "grade_level_start",
  "grade_level_end"
);
CREATE INDEX "schedule_templates_visibility_is_approved_index" on "schedule_templates"(
  "visibility",
  "is_approved"
);
CREATE INDEX "schedule_templates_is_default_status_index" on "schedule_templates"(
  "is_default",
  "status"
);
CREATE INDEX "schedule_templates_is_system_template_is_featured_index" on "schedule_templates"(
  "is_system_template",
  "is_featured"
);
CREATE INDEX "schedule_templates_usage_count_user_rating_index" on "schedule_templates"(
  "usage_count",
  "user_rating"
);
CREATE INDEX "schedule_templates_created_by_status_index" on "schedule_templates"(
  "created_by",
  "status"
);
CREATE UNIQUE INDEX "unique_template_name_version" on "schedule_templates"(
  "institution_id",
  "name",
  "version"
);
CREATE TABLE IF NOT EXISTS "student_enrollments"(
  "id" integer primary key autoincrement not null,
  "student_id" integer not null,
  "grade_id" integer not null,
  "academic_year_id" integer not null,
  "enrollment_date" date not null,
  "student_number" varchar not null,
  "enrollment_status" varchar check("enrollment_status" in('active', 'inactive', 'transferred_out', 'transferred_in', 'graduated', 'dropped', 'suspended', 'expelled')) not null default 'active',
  "enrollment_type" varchar check("enrollment_type" in('regular', 'transfer', 'special_needs', 'gifted', 'remedial', 'exchange', 'international')) not null default 'regular',
  "primary_guardian_id" integer,
  "secondary_guardian_id" integer,
  "emergency_contacts" text,
  "medical_information" text,
  "transportation_info" text,
  "special_requirements" text,
  "previous_school" varchar,
  "previous_grades" text,
  "entrance_score" numeric,
  "attendance_target_percentage" integer not null default '95',
  "behavior_notes" text,
  "enrollment_notes" text,
  "photo_permission" tinyint(1) not null default '1',
  "medical_consent" tinyint(1) not null default '0',
  "trip_permission" tinyint(1) not null default '0',
  "expected_graduation_date" date,
  "withdrawal_date" date,
  "withdrawal_reason" varchar,
  "fee_amount" numeric,
  "fee_status" varchar check("fee_status" in('paid', 'partial', 'unpaid', 'exempt')) not null default 'unpaid',
  "fee_due_date" date,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("student_id") references "users"("id") on delete cascade,
  foreign key("grade_id") references "grades"("id") on delete cascade,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("primary_guardian_id") references "users"("id") on delete set null,
  foreign key("secondary_guardian_id") references "users"("id") on delete set null
);
CREATE INDEX "student_enrollments_student_id_academic_year_id_index" on "student_enrollments"(
  "student_id",
  "academic_year_id"
);
CREATE INDEX "student_enrollments_grade_id_enrollment_status_index" on "student_enrollments"(
  "grade_id",
  "enrollment_status"
);
CREATE INDEX "student_enrollments_enrollment_status_enrollment_date_index" on "student_enrollments"(
  "enrollment_status",
  "enrollment_date"
);
CREATE INDEX "student_enrollments_student_number_index" on "student_enrollments"(
  "student_number"
);
CREATE INDEX "student_enrollments_enrollment_date_index" on "student_enrollments"(
  "enrollment_date"
);
CREATE UNIQUE INDEX "unique_active_enrollment" on "student_enrollments"(
  "student_id",
  "academic_year_id",
  "enrollment_status"
);
CREATE UNIQUE INDEX "student_enrollments_student_number_unique" on "student_enrollments"(
  "student_number"
);
CREATE TABLE IF NOT EXISTS "subject_enrollments"(
  "id" integer primary key autoincrement not null,
  "student_id" integer not null,
  "subject_id" integer not null,
  "grade_id" integer not null,
  "academic_year_id" integer not null,
  "academic_term_id" integer,
  "enrollment_date" date not null,
  "completion_date" date,
  "status" varchar check("status" in('enrolled', 'completed', 'dropped', 'transferred', 'failed', 'exempt')) not null default 'enrolled',
  "enrollment_reason" varchar check("enrollment_reason" in('required', 'elective', 'remedial', 'advanced', 'makeup')) not null default 'required',
  "prerequisites_met" text,
  "placement_level" varchar,
  "placement_score" numeric,
  "expected_grade" numeric,
  "required_attendance_percentage" integer not null default '80',
  "primary_teacher_id" integer,
  "section" varchar,
  "max_students" integer,
  "class_schedule" text,
  "weekly_hours" integer,
  "total_hours" integer,
  "assessment_weights" text,
  "requires_lab" tinyint(1) not null default '0',
  "requires_project" tinyint(1) not null default '0',
  "has_practical_exam" tinyint(1) not null default '0',
  "accommodations" text,
  "extended_time" tinyint(1) not null default '0',
  "modified_curriculum" tinyint(1) not null default '0',
  "current_grade" numeric,
  "assignments_completed" integer not null default '0',
  "assignments_total" integer,
  "attendance_rate" numeric,
  "withdrawal_date" date,
  "withdrawal_reason" varchar,
  "withdrawal_approved" tinyint(1) not null default '0',
  "withdrawal_approved_by" integer,
  "enrollment_notes" text,
  "metadata" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("student_id") references "users"("id") on delete cascade,
  foreign key("subject_id") references "subjects"("id") on delete cascade,
  foreign key("grade_id") references "grades"("id") on delete cascade,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("academic_term_id") references "academic_terms"("id") on delete cascade,
  foreign key("primary_teacher_id") references "users"("id") on delete set null,
  foreign key("withdrawal_approved_by") references "users"("id") on delete set null
);
CREATE INDEX "subject_enrollments_student_id_academic_year_id_index" on "subject_enrollments"(
  "student_id",
  "academic_year_id"
);
CREATE INDEX "subject_enrollments_subject_id_grade_id_index" on "subject_enrollments"(
  "subject_id",
  "grade_id"
);
CREATE INDEX "subject_enrollments_status_enrollment_date_index" on "subject_enrollments"(
  "status",
  "enrollment_date"
);
CREATE INDEX "subject_enrollments_primary_teacher_id_status_index" on "subject_enrollments"(
  "primary_teacher_id",
  "status"
);
CREATE INDEX "subject_enrollments_academic_term_id_status_index" on "subject_enrollments"(
  "academic_term_id",
  "status"
);
CREATE UNIQUE INDEX "unique_subject_enrollment" on "subject_enrollments"(
  "student_id",
  "subject_id",
  "academic_year_id",
  "academic_term_id"
);
CREATE TABLE IF NOT EXISTS "attendance_records"(
  "id" integer primary key autoincrement not null,
  "student_id" integer not null,
  "subject_id" integer,
  "teacher_id" integer not null,
  "academic_year_id" integer not null,
  "academic_term_id" integer,
  "attendance_date" date not null,
  "period_start_time" time,
  "period_end_time" time,
  "period_number" integer,
  "status" varchar check("status" in('present', 'absent', 'late', 'excused', 'medical', 'authorized', 'suspended', 'early_dismissal')) not null,
  "arrival_time" time,
  "departure_time" time,
  "minutes_late" integer not null default '0',
  "minutes_absent" integer not null default '0',
  "recording_method" varchar check("recording_method" in('manual', 'rfid_card', 'biometric', 'qr_code', 'mobile_app', 'automated')) not null default 'manual',
  "device_id" varchar,
  "location" varchar,
  "recorded_by" integer not null,
  "recorded_at" datetime not null default CURRENT_TIMESTAMP,
  "approved_by" integer,
  "approved_at" datetime,
  "absence_reason" text,
  "absence_request_id" integer,
  "supporting_documents" text,
  "parent_notified" tinyint(1) not null default '0',
  "parent_notified_at" datetime,
  "notification_method" varchar check("notification_method" in('sms', 'email', 'phone', 'app')),
  "notes" text,
  "metadata" text,
  "affects_grade" tinyint(1) not null default '1',
  "attendance_weight" numeric,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("student_id") references "users"("id") on delete cascade,
  foreign key("subject_id") references "subjects"("id") on delete cascade,
  foreign key("teacher_id") references "users"("id") on delete cascade,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("academic_term_id") references "academic_terms"("id") on delete cascade,
  foreign key("recorded_by") references "users"("id") on delete cascade,
  foreign key("approved_by") references "users"("id") on delete set null
);
CREATE INDEX "attendance_records_student_id_attendance_date_index" on "attendance_records"(
  "student_id",
  "attendance_date"
);
CREATE INDEX "attendance_records_subject_id_attendance_date_index" on "attendance_records"(
  "subject_id",
  "attendance_date"
);
CREATE INDEX "attendance_records_teacher_id_attendance_date_index" on "attendance_records"(
  "teacher_id",
  "attendance_date"
);
CREATE INDEX "attendance_records_status_attendance_date_index" on "attendance_records"(
  "status",
  "attendance_date"
);
CREATE INDEX "attendance_records_recording_method_recorded_at_index" on "attendance_records"(
  "recording_method",
  "recorded_at"
);
CREATE INDEX "attendance_records_academic_year_id_academic_term_id_index" on "attendance_records"(
  "academic_year_id",
  "academic_term_id"
);
CREATE INDEX "attendance_records_attendance_date_period_number_index" on "attendance_records"(
  "attendance_date",
  "period_number"
);
CREATE UNIQUE INDEX "unique_attendance_record" on "attendance_records"(
  "student_id",
  "subject_id",
  "attendance_date",
  "period_number"
);
CREATE TABLE IF NOT EXISTS "daily_attendance_summary"(
  "id" integer primary key autoincrement not null,
  "student_id" integer not null,
  "grade_id" integer not null,
  "academic_year_id" integer not null,
  "academic_term_id" integer,
  "attendance_date" date not null,
  "day_type" varchar check("day_type" in('regular', 'holiday', 'weekend', 'exam_day', 'activity_day', 'half_day', 'snow_day', 'emergency_closure')) not null default 'regular',
  "daily_status" varchar check("daily_status" in('full_present', 'partial_present', 'full_absent', 'excused_absent', 'late_arrival', 'early_departure', 'suspended', 'not_scheduled')) not null,
  "first_period_start" time,
  "last_period_end" time,
  "actual_arrival_time" time,
  "actual_departure_time" time,
  "total_periods_scheduled" integer not null default '0',
  "periods_present" integer not null default '0',
  "periods_absent" integer not null default '0',
  "periods_late" integer not null default '0',
  "periods_excused" integer not null default '0',
  "daily_attendance_rate" numeric not null default '0',
  "total_minutes_scheduled" integer not null default '0',
  "minutes_present" integer not null default '0',
  "minutes_late" integer not null default '0',
  "minutes_absent" integer not null default '0',
  "absence_reason" text,
  "absence_authorized" tinyint(1) not null default '0',
  "authorized_by" integer,
  "authorized_at" datetime,
  "parent_notified" tinyint(1) not null default '0',
  "parent_notified_at" datetime,
  "notification_details" text,
  "parent_acknowledged" tinyint(1) not null default '0',
  "parent_acknowledged_at" datetime,
  "affected_subjects" text,
  "makeup_required" tinyint(1) not null default '0',
  "makeup_assignments" text,
  "daily_notes" text,
  "discipline_incidents" text,
  "reported_by" integer,
  "summary_generated_at" datetime not null default CURRENT_TIMESTAMP,
  "temperature_check" numeric,
  "health_screening_passed" tinyint(1) not null default '1',
  "health_notes" text,
  "transportation_status" varchar check("transportation_status" in('normal', 'bus_late', 'bus_missed', 'parent_pickup', 'walking', 'bicycle', 'absent')),
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("student_id") references "users"("id") on delete cascade,
  foreign key("grade_id") references "grades"("id") on delete cascade,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("academic_term_id") references "academic_terms"("id") on delete cascade,
  foreign key("authorized_by") references "users"("id") on delete set null,
  foreign key("reported_by") references "users"("id") on delete set null
);
CREATE INDEX "daily_attendance_summary_student_id_attendance_date_index" on "daily_attendance_summary"(
  "student_id",
  "attendance_date"
);
CREATE INDEX "daily_attendance_summary_grade_id_attendance_date_index" on "daily_attendance_summary"(
  "grade_id",
  "attendance_date"
);
CREATE INDEX "daily_attendance_summary_daily_status_attendance_date_index" on "daily_attendance_summary"(
  "daily_status",
  "attendance_date"
);
CREATE INDEX "daily_attendance_summary_academic_year_id_academic_term_id_index" on "daily_attendance_summary"(
  "academic_year_id",
  "academic_term_id"
);
CREATE INDEX "daily_attendance_summary_attendance_date_day_type_index" on "daily_attendance_summary"(
  "attendance_date",
  "day_type"
);
CREATE INDEX "daily_attendance_summary_absence_authorized_attendance_date_index" on "daily_attendance_summary"(
  "absence_authorized",
  "attendance_date"
);
CREATE INDEX "daily_attendance_summary_parent_notified_attendance_date_index" on "daily_attendance_summary"(
  "parent_notified",
  "attendance_date"
);
CREATE UNIQUE INDEX "unique_daily_summary" on "daily_attendance_summary"(
  "student_id",
  "attendance_date"
);
CREATE TABLE IF NOT EXISTS "absence_requests"(
  "id" integer primary key autoincrement not null,
  "student_id" integer not null,
  "requested_by" integer not null,
  "academic_year_id" integer not null,
  "absence_start_date" date not null,
  "absence_end_date" date not null,
  "total_days_requested" integer not null,
  "absence_type" varchar check("absence_type" in('medical', 'family_emergency', 'bereavement', 'religious', 'educational', 'family_vacation', 'personal', 'other')) not null,
  "reason_description" text not null,
  "affected_periods" text,
  "supporting_documents" text,
  "status" varchar check("status" in('pending', 'approved', 'partially_approved', 'denied', 'cancelled', 'expired', 'under_review')) not null default 'pending',
  "reviewed_by_teacher" integer,
  "teacher_review_at" datetime,
  "teacher_recommendation" varchar check("teacher_recommendation" in('approve', 'deny', 'refer')),
  "teacher_notes" text,
  "reviewed_by_admin" integer,
  "admin_review_at" datetime,
  "admin_decision" varchar check("admin_decision" in('approve', 'deny', 'refer_higher')),
  "admin_notes" text,
  "final_approved_by" integer,
  "final_approval_at" datetime,
  "final_decision_notes" text,
  "affected_subjects" text,
  "missed_assessments" text,
  "makeup_required" tinyint(1) not null default '0',
  "makeup_plan" text,
  "makeup_deadline" date,
  "approval_conditions" text,
  "requires_medical_clearance" tinyint(1) not null default '0',
  "requires_parent_meeting" tinyint(1) not null default '0',
  "affects_attendance_record" tinyint(1) not null default '1',
  "parent_notified" tinyint(1) not null default '0',
  "parent_notified_at" datetime,
  "communication_log" text,
  "submitted_at" datetime not null default CURRENT_TIMESTAMP,
  "due_response_by" datetime,
  "processing_priority" integer not null default '3',
  "follow_up_required" tinyint(1) not null default '0',
  "follow_up_date" date,
  "follow_up_notes" text,
  "student_returned" tinyint(1) not null default '0',
  "actual_return_date" date,
  "approval_history" text,
  "metadata" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("student_id") references "users"("id") on delete cascade,
  foreign key("requested_by") references "users"("id") on delete cascade,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("reviewed_by_teacher") references "users"("id") on delete set null,
  foreign key("reviewed_by_admin") references "users"("id") on delete set null,
  foreign key("final_approved_by") references "users"("id") on delete set null
);
CREATE INDEX "absence_requests_student_id_absence_start_date_index" on "absence_requests"(
  "student_id",
  "absence_start_date"
);
CREATE INDEX "absence_requests_status_submitted_at_index" on "absence_requests"(
  "status",
  "submitted_at"
);
CREATE INDEX "absence_requests_absence_type_status_index" on "absence_requests"(
  "absence_type",
  "status"
);
CREATE INDEX "absence_requests_requested_by_submitted_at_index" on "absence_requests"(
  "requested_by",
  "submitted_at"
);
CREATE INDEX "absence_requests_academic_year_id_status_index" on "absence_requests"(
  "academic_year_id",
  "status"
);
CREATE INDEX "absence_requests_processing_priority_submitted_at_index" on "absence_requests"(
  "processing_priority",
  "submitted_at"
);
CREATE INDEX "absence_requests_due_response_by_status_index" on "absence_requests"(
  "due_response_by",
  "status"
);
CREATE INDEX "absence_requests_follow_up_required_follow_up_date_index" on "absence_requests"(
  "follow_up_required",
  "follow_up_date"
);
CREATE INDEX "absence_requests_student_id_academic_year_id_status_index" on "absence_requests"(
  "student_id",
  "academic_year_id",
  "status"
);
CREATE INDEX "absence_requests_absence_start_date_absence_end_date_status_index" on "absence_requests"(
  "absence_start_date",
  "absence_end_date",
  "status"
);
CREATE TABLE IF NOT EXISTS "attendance_patterns"(
  "id" integer primary key autoincrement not null,
  "student_id" integer not null,
  "academic_year_id" integer not null,
  "academic_term_id" integer,
  "analysis_start_date" date not null,
  "analysis_end_date" date not null,
  "total_school_days" integer not null,
  "pattern_calculated_at" datetime not null default CURRENT_TIMESTAMP,
  "total_present_days" integer not null default '0',
  "total_absent_days" integer not null default '0',
  "total_late_days" integer not null default '0',
  "total_excused_days" integer not null default '0',
  "overall_attendance_rate" numeric not null default '0',
  "weekly_attendance_rates" text,
  "daily_patterns" text,
  "monthly_trends" text,
  "attendance_trend" varchar check("attendance_trend" in('improving', 'declining', 'stable', 'irregular', 'concerning', 'excellent')) not null,
  "trend_coefficient" numeric,
  "consecutive_absences_max" integer not null default '0',
  "frequent_tardiness_count" integer not null default '0',
  "subject_attendance_rates" text,
  "period_attendance_patterns" text,
  "most_missed_subject" varchar,
  "best_attendance_subject" varchar,
  "risk_level" varchar check("risk_level" in('low', 'moderate', 'high', 'critical')) not null default 'low',
  "risk_score" numeric not null default '0',
  "risk_factors" text,
  "protective_factors" text,
  "predicted_final_rate" numeric,
  "at_risk_graduation" tinyint(1) not null default '0',
  "intervention_priority" integer not null default '3',
  "recommended_interventions" text,
  "implemented_interventions" text,
  "last_intervention_date" date,
  "intervention_notes" text,
  "parent_notifications_sent" integer not null default '0',
  "parent_responses_received" integer not null default '0',
  "parent_engagement_rate" numeric not null default '0',
  "last_parent_contact_date" date,
  "grade_average_attendance" numeric,
  "school_average_attendance" numeric,
  "district_average_attendance" numeric,
  "percentile_ranking" integer,
  "weather_correlation" text,
  "transportation_issues" text,
  "health_patterns" text,
  "family_factors" text,
  "attendance_grade_correlation" numeric,
  "grade_impact_by_subject" text,
  "academic_performance_at_risk" tinyint(1) not null default '0',
  "seasonal_trends" text,
  "holiday_patterns" text,
  "exam_period_patterns" text,
  "pattern_summary" text,
  "anomalies_detected" text,
  "next_analysis_due" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("student_id") references "users"("id") on delete cascade,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("academic_term_id") references "academic_terms"("id") on delete cascade
);
CREATE INDEX "attendance_patterns_student_id_academic_year_id_index" on "attendance_patterns"(
  "student_id",
  "academic_year_id"
);
CREATE INDEX "attendance_patterns_risk_level_intervention_priority_index" on "attendance_patterns"(
  "risk_level",
  "intervention_priority"
);
CREATE INDEX "attendance_patterns_attendance_trend_overall_attendance_rate_index" on "attendance_patterns"(
  "attendance_trend",
  "overall_attendance_rate"
);
CREATE INDEX "attendance_patterns_academic_year_id_academic_term_id_index" on "attendance_patterns"(
  "academic_year_id",
  "academic_term_id"
);
CREATE INDEX "attendance_patterns_pattern_calculated_at_index" on "attendance_patterns"(
  "pattern_calculated_at"
);
CREATE INDEX "attendance_patterns_at_risk_graduation_risk_level_index" on "attendance_patterns"(
  "at_risk_graduation",
  "risk_level"
);
CREATE INDEX "attendance_patterns_intervention_priority_last_intervention_date_index" on "attendance_patterns"(
  "intervention_priority",
  "last_intervention_date"
);
CREATE UNIQUE INDEX "unique_pattern_analysis" on "attendance_patterns"(
  "student_id",
  "academic_year_id",
  "academic_term_id"
);
CREATE TABLE IF NOT EXISTS "attendance_reports"(
  "id" integer primary key autoincrement not null,
  "report_title" varchar not null,
  "report_type" varchar check("report_type" in('daily_summary', 'weekly_summary', 'monthly_summary', 'term_summary', 'annual_summary', 'student_individual', 'class_summary', 'subject_attendance', 'teacher_summary', 'parent_notification', 'truancy_report', 'intervention_report', 'comparative_analysis', 'custom_query')) not null,
  "institution_id" integer,
  "academic_year_id" integer not null,
  "academic_term_id" integer,
  "grade_id" integer,
  "subject_id" integer,
  "report_start_date" date not null,
  "report_end_date" date not null,
  "total_days_included" integer not null,
  "generated_by" integer not null,
  "generated_at" datetime not null default CURRENT_TIMESTAMP,
  "generation_method" varchar check("generation_method" in('manual', 'scheduled', 'api_request', 'bulk_export')) not null default 'manual',
  "filter_criteria" text,
  "included_students" text,
  "excluded_students" text,
  "report_parameters" text,
  "summary_data" text not null,
  "total_students_included" integer not null default '0',
  "average_attendance_rate" numeric not null default '0',
  "total_present_instances" integer not null default '0',
  "total_absent_instances" integer not null default '0',
  "total_late_instances" integer not null default '0',
  "total_excused_instances" integer not null default '0',
  "attendance_breakdown" text,
  "trend_analysis" text,
  "risk_assessment" text,
  "intervention_recommendations" text,
  "comparative_statistics" text,
  "benchmark_data" text,
  "improvement_percentage" numeric,
  "output_format" varchar check("output_format" in('pdf', 'excel', 'csv', 'json', 'html', 'dashboard')) not null default 'pdf',
  "file_path" varchar,
  "file_size" integer,
  "download_token" varchar,
  "file_expires_at" datetime,
  "shared_with" text,
  "is_public" tinyint(1) not null default '0',
  "auto_distribute" tinyint(1) not null default '0',
  "distribution_list" text,
  "last_accessed_at" datetime,
  "access_count" integer not null default '0',
  "is_scheduled" tinyint(1) not null default '0',
  "schedule_frequency" varchar check("schedule_frequency" in('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'custom')),
  "schedule_config" text,
  "next_generation_at" datetime,
  "schedule_active" tinyint(1) not null default '1',
  "report_status" varchar check("report_status" in('generating', 'completed', 'failed', 'cancelled', 'expired', 'archived')) not null default 'generating',
  "generation_log" text,
  "validation_results" text,
  "data_quality_passed" tinyint(1) not null default '1',
  "quality_notes" text,
  "report_description" text,
  "tags" text,
  "is_confidential" tinyint(1) not null default '0',
  "retention_period" varchar check("retention_period" in('30_days', '90_days', '1_year', '3_years', 'permanent')) not null default '1_year',
  "archive_after" datetime,
  "delete_after" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("academic_term_id") references "academic_terms"("id") on delete cascade,
  foreign key("grade_id") references "grades"("id") on delete cascade,
  foreign key("subject_id") references "subjects"("id") on delete cascade,
  foreign key("generated_by") references "users"("id") on delete cascade
);
CREATE INDEX "attendance_reports_report_type_generated_at_index" on "attendance_reports"(
  "report_type",
  "generated_at"
);
CREATE INDEX "attendance_reports_institution_id_report_type_index" on "attendance_reports"(
  "institution_id",
  "report_type"
);
CREATE INDEX "attendance_reports_academic_year_id_academic_term_id_index" on "attendance_reports"(
  "academic_year_id",
  "academic_term_id"
);
CREATE INDEX "attendance_reports_generated_by_generated_at_index" on "attendance_reports"(
  "generated_by",
  "generated_at"
);
CREATE INDEX "attendance_reports_report_status_generated_at_index" on "attendance_reports"(
  "report_status",
  "generated_at"
);
CREATE INDEX "attendance_reports_is_scheduled_next_generation_at_index" on "attendance_reports"(
  "is_scheduled",
  "next_generation_at"
);
CREATE INDEX "attendance_reports_file_expires_at_report_status_index" on "attendance_reports"(
  "file_expires_at",
  "report_status"
);
CREATE INDEX "attendance_reports_archive_after_report_status_index" on "attendance_reports"(
  "archive_after",
  "report_status"
);
CREATE INDEX "attendance_reports_report_type_academic_year_id_institution_id_index" on "attendance_reports"(
  "report_type",
  "academic_year_id",
  "institution_id"
);
CREATE INDEX "attendance_reports_report_start_date_report_end_date_report_type_index" on "attendance_reports"(
  "report_start_date",
  "report_end_date",
  "report_type"
);
CREATE TABLE IF NOT EXISTS "academic_assessments"(
  "id" integer primary key autoincrement not null,
  "assessment_title" varchar not null,
  "assessment_type" varchar check("assessment_type" in('ksq_national', 'bsq_national', 'entrance_exam', 'mid_term_exam', 'final_exam', 'diagnostic_test', 'benchmark_test', 'competency_test', 'certification_exam', 'placement_test', 'standardized_test', 'school_internal')) not null,
  "assessment_level" varchar check("assessment_level" in('national', 'regional', 'district', 'school', 'class', 'individual')) not null,
  "institution_id" integer,
  "academic_year_id" integer not null,
  "academic_term_id" integer,
  "grade_id" integer,
  "subject_id" integer,
  "assessment_date" date not null,
  "start_time" time not null,
  "end_time" time not null,
  "duration_minutes" integer not null,
  "registration_deadline" date,
  "results_release_date" date,
  "assessment_description" text,
  "assessment_objectives" text,
  "assessment_standards" text,
  "total_questions" integer,
  "total_points" integer,
  "passing_score" numeric,
  "question_breakdown" text,
  "difficulty_distribution" text,
  "topic_coverage" text,
  "participation_type" varchar check("participation_type" in('mandatory', 'voluntary', 'selected', 'remedial', 'advanced')) not null default 'mandatory',
  "eligibility_criteria" text,
  "max_participants" integer,
  "participation_fee" numeric,
  "status" varchar check("status" in('planning', 'scheduled', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'grading', 'results_ready', 'archived', 'cancelled')) not null default 'planning',
  "proctoring_type" varchar check("proctoring_type" in('in_person', 'online_proctored', 'online_self', 'hybrid')) not null default 'in_person',
  "security_measures" text,
  "requires_id_verification" tinyint(1) not null default '1',
  "allows_calculator" tinyint(1) not null default '0',
  "allows_reference_materials" tinyint(1) not null default '0',
  "allowed_materials" text,
  "scoring_method" varchar check("scoring_method" in('raw_score', 'scaled_score', 'percentile_rank', 'grade_equivalent', 'standard_score', 'rubric_based', 'competency_based')) not null default 'raw_score',
  "mean_score" numeric,
  "median_score" numeric,
  "standard_deviation" numeric,
  "highest_score" numeric,
  "lowest_score" numeric,
  "score_distribution" text,
  "performance_analytics" text,
  "question_analysis" text,
  "reliability_coefficient" numeric,
  "historical_comparison" text,
  "regional_comparison" text,
  "national_benchmarks" text,
  "improvement_percentage" numeric,
  "created_by" integer not null,
  "approved_by" integer,
  "approved_at" datetime,
  "conducted_by" integer,
  "administrative_notes" text,
  "quality_reviewed" tinyint(1) not null default '0',
  "quality_reviewer" integer,
  "quality_review_date" datetime,
  "quality_notes" text,
  "quality_rating" varchar check("quality_rating" in('excellent', 'good', 'satisfactory', 'needs_improvement')),
  "required_resources" text,
  "venue_assignments" text,
  "proctors_required" integer,
  "proctor_assignments" text,
  "uses_technology" tinyint(1) not null default '0',
  "technology_requirements" text,
  "online_platform" varchar,
  "digital_delivery_config" text,
  "accessibility_features" text,
  "supports_screen_reader" tinyint(1) not null default '0',
  "supports_extended_time" tinyint(1) not null default '0',
  "special_accommodations" text,
  "communication_plan" text,
  "auto_generate_reports" tinyint(1) not null default '1',
  "report_templates" text,
  "parent_access_enabled" tinyint(1) not null default '1',
  "student_access_enabled" tinyint(1) not null default '1',
  "provides_certification" tinyint(1) not null default '0',
  "certificate_template" varchar,
  "certification_criteria" text,
  "certificate_expiry_date" date,
  "triggers_intervention" tinyint(1) not null default '0',
  "intervention_thresholds" text,
  "recommended_actions" text,
  "intervention_review_date" date,
  "retention_period" varchar check("retention_period" in('1_year', '3_years', '5_years', '10_years', 'permanent')) not null default '5_years',
  "archive_date" date,
  "results_published" tinyint(1) not null default '0',
  "results_published_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("academic_year_id") references "academic_years"("id") on delete cascade,
  foreign key("academic_term_id") references "academic_terms"("id") on delete cascade,
  foreign key("grade_id") references "grades"("id") on delete cascade,
  foreign key("subject_id") references "subjects"("id") on delete cascade,
  foreign key("created_by") references "users"("id") on delete cascade,
  foreign key("approved_by") references "users"("id") on delete set null,
  foreign key("conducted_by") references "users"("id") on delete set null,
  foreign key("quality_reviewer") references "users"("id") on delete set null
);
CREATE INDEX "academic_assessments_assessment_type_assessment_date_index" on "academic_assessments"(
  "assessment_type",
  "assessment_date"
);
CREATE INDEX "academic_assessments_institution_id_academic_year_id_index" on "academic_assessments"(
  "institution_id",
  "academic_year_id"
);
CREATE INDEX "academic_assessments_status_assessment_date_index" on "academic_assessments"(
  "status",
  "assessment_date"
);
CREATE INDEX "academic_assessments_grade_id_subject_id_index" on "academic_assessments"(
  "grade_id",
  "subject_id"
);
CREATE INDEX "academic_assessments_assessment_level_assessment_type_index" on "academic_assessments"(
  "assessment_level",
  "assessment_type"
);
CREATE INDEX "academic_assessments_created_by_created_at_index" on "academic_assessments"(
  "created_by",
  "created_at"
);
CREATE INDEX "academic_assessments_assessment_date_start_time_index" on "academic_assessments"(
  "assessment_date",
  "start_time"
);
CREATE INDEX "academic_assessments_results_release_date_status_index" on "academic_assessments"(
  "results_release_date",
  "status"
);
CREATE INDEX "academic_assessments_academic_year_id_assessment_type_grade_id_index" on "academic_assessments"(
  "academic_year_id",
  "assessment_type",
  "grade_id"
);
CREATE INDEX "academic_assessments_institution_id_assessment_date_status_index" on "academic_assessments"(
  "institution_id",
  "assessment_date",
  "status"
);
CREATE TABLE IF NOT EXISTS "assessment_participants"(
  "id" integer primary key autoincrement not null,
  "assessment_id" integer not null,
  "participant_id" integer not null,
  "institution_id" integer,
  "registered_at" datetime not null default CURRENT_TIMESTAMP,
  "registered_by" integer not null,
  "registration_status" varchar check("registration_status" in('pending', 'confirmed', 'waitlisted', 'cancelled', 'no_show', 'transferred', 'expelled')) not null default 'pending',
  "participant_number" varchar,
  "participant_info" text,
  "current_grade_id" integer,
  "current_class_section" varchar,
  "seat_number" varchar,
  "room_assignment" varchar,
  "session_group" varchar,
  "assigned_proctor" integer,
  "attendance_status" varchar check("attendance_status" in('present', 'absent', 'late', 'early_departure', 'medical_emergency', 'technical_issue', 'disqualified')),
  "arrival_time" time,
  "start_time" time,
  "submission_time" time,
  "departure_time" time,
  "time_used_minutes" integer,
  "accommodations_requested" text,
  "accommodations_provided" text,
  "extended_time" tinyint(1) not null default '0',
  "additional_time_minutes" integer not null default '0',
  "separate_room" tinyint(1) not null default '0',
  "reader_assistance" tinyint(1) not null default '0',
  "scribe_assistance" tinyint(1) not null default '0',
  "assistive_technology" text,
  "raw_score" numeric,
  "scaled_score" numeric,
  "percentile_rank" numeric,
  "grade_equivalent" varchar,
  "standard_score" numeric,
  "performance_level" varchar check("performance_level" in('below_basic', 'basic', 'proficient', 'advanced', 'distinguished')),
  "section_scores" text,
  "topic_scores" text,
  "skill_scores" text,
  "question_responses" text,
  "correct_answers" integer,
  "incorrect_answers" integer,
  "unanswered_questions" integer,
  "z_score" numeric,
  "rank_in_class" integer,
  "rank_in_grade" integer,
  "rank_in_school" integer,
  "rank_in_region" integer,
  "rank_nationally" integer,
  "class_average_difference" numeric,
  "grade_average_difference" numeric,
  "school_average_difference" numeric,
  "national_average_difference" numeric,
  "previous_assessment_score" numeric,
  "growth_score" numeric,
  "growth_category" varchar check("growth_category" in('high_growth', 'typical_growth', 'low_growth', 'no_growth', 'decline')),
  "incidents_reported" text,
  "cheating_suspected" tinyint(1) not null default '0',
  "proctor_notes" text,
  "irregularities" text,
  "validity_questioned" tinyint(1) not null default '0',
  "validity_notes" text,
  "answer_sheet_id" varchar,
  "submission_method" varchar check("submission_method" in('paper', 'digital', 'hybrid', 'oral', 'practical')) not null default 'paper',
  "answer_sheet_received" tinyint(1) not null default '0',
  "answer_sheet_received_at" datetime,
  "submission_metadata" text,
  "scored_by" integer,
  "scored_at" datetime,
  "reviewed_by" integer,
  "reviewed_at" datetime,
  "scoring_verified" tinyint(1) not null default '0',
  "scoring_notes" text,
  "appeal_submitted" tinyint(1) not null default '0',
  "appeal_submitted_at" datetime,
  "appeal_reason" text,
  "appeal_status" varchar check("appeal_status" in('pending', 'under_review', 'upheld', 'denied', 'partially_upheld')),
  "revised_score" numeric,
  "appeal_resolved_at" datetime,
  "appeal_resolution_notes" text,
  "certificate_earned" tinyint(1) not null default '0',
  "certificate_number" varchar,
  "certificate_issued_date" date,
  "certificate_expiry_date" date,
  "certificate_file_path" varchar,
  "requires_intervention" tinyint(1) not null default '0',
  "intervention_recommendations" text,
  "intervention_priority" varchar check("intervention_priority" in('immediate', 'high', 'medium', 'low', 'monitoring')),
  "intervention_plan_created" tinyint(1) not null default '0',
  "intervention_start_date" date,
  "intervention_coordinator" integer,
  "results_shared_with_parents" tinyint(1) not null default '0',
  "results_shared_at" datetime,
  "parent_communication_method" varchar check("parent_communication_method" in('email', 'sms', 'phone', 'meeting', 'portal')),
  "parent_conference_requested" tinyint(1) not null default '0',
  "parent_conference_date" date,
  "results_confidential" tinyint(1) not null default '0',
  "access_permissions" text,
  "results_published" tinyint(1) not null default '0',
  "results_released_to_participant" datetime,
  "digital_behavior_data" text,
  "tab_switches" integer,
  "copy_paste_attempts" integer,
  "keystroke_patterns" text,
  "ip_address" varchar,
  "user_agent" text,
  "response_pattern_score" numeric,
  "unusual_response_pattern" tinyint(1) not null default '0',
  "engagement_score" numeric,
  "question_review_count" integer,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("assessment_id") references "academic_assessments"("id") on delete cascade,
  foreign key("participant_id") references "users"("id") on delete cascade,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("registered_by") references "users"("id") on delete cascade,
  foreign key("current_grade_id") references "grades"("id") on delete set null,
  foreign key("assigned_proctor") references "users"("id") on delete set null,
  foreign key("scored_by") references "users"("id") on delete set null,
  foreign key("reviewed_by") references "users"("id") on delete set null,
  foreign key("intervention_coordinator") references "users"("id") on delete set null
);
CREATE INDEX "assessment_participants_assessment_id_participant_id_index" on "assessment_participants"(
  "assessment_id",
  "participant_id"
);
CREATE INDEX "assessment_participants_registration_status_registered_at_index" on "assessment_participants"(
  "registration_status",
  "registered_at"
);
CREATE INDEX "assessment_participants_attendance_status_participant_id_index" on "assessment_participants"(
  "attendance_status",
  "participant_id"
);
CREATE INDEX "assessment_participants_performance_level_raw_score_index" on "assessment_participants"(
  "performance_level",
  "raw_score"
);
CREATE INDEX "assessment_participants_institution_id_current_grade_id_index" on "assessment_participants"(
  "institution_id",
  "current_grade_id"
);
CREATE INDEX "assessment_participants_percentile_rank_assessment_id_index" on "assessment_participants"(
  "percentile_rank",
  "assessment_id"
);
CREATE INDEX "assessment_participants_requires_intervention_intervention_priority_index" on "assessment_participants"(
  "requires_intervention",
  "intervention_priority"
);
CREATE INDEX "assessment_participants_certificate_earned_certificate_issued_date_index" on "assessment_participants"(
  "certificate_earned",
  "certificate_issued_date"
);
CREATE UNIQUE INDEX "unique_assessment_participation" on "assessment_participants"(
  "assessment_id",
  "participant_id"
);
CREATE INDEX "assessment_participants_assessment_id_performance_level_raw_score_index" on "assessment_participants"(
  "assessment_id",
  "performance_level",
  "raw_score"
);
CREATE INDEX "assessment_participants_participant_id_assessment_id_raw_score_index" on "assessment_participants"(
  "participant_id",
  "assessment_id",
  "raw_score"
);
CREATE INDEX "assessment_participants_institution_id_assessment_id_percentile_rank_index" on "assessment_participants"(
  "institution_id",
  "assessment_id",
  "percentile_rank"
);
CREATE TABLE IF NOT EXISTS "teacher_certifications"(
  "id" integer primary key autoincrement not null,
  "teacher_id" integer not null,
  "certification_name" varchar not null,
  "certification_type" varchar check("certification_type" in('teaching_license', 'subject_certification', 'grade_level_cert', 'special_education', 'bilingual_cert', 'technology_cert', 'leadership_cert', 'counseling_cert', 'administrative_cert', 'continuing_education', 'professional_development', 'competency_assessment', 'national_standard', 'international_cert')) not null,
  "certification_code" varchar,
  "issuing_organization" varchar not null,
  "issuing_country" varchar not null default 'Azerbaijan',
  "issuing_region" varchar,
  "issue_date" date not null,
  "effective_date" date,
  "expiry_date" date,
  "is_renewable" tinyint(1) not null default '1',
  "renewal_period_years" integer,
  "next_renewal_due" date,
  "certification_level" varchar check("certification_level" in('entry_level', 'standard', 'advanced', 'expert', 'master', 'specialist')) not null default 'standard',
  "subject_areas" text,
  "grade_levels" text,
  "specializations" text,
  "prerequisites_met" text,
  "education_requirements" text,
  "experience_years_required" integer,
  "experience_years_at_issue" integer,
  "training_hours_required" text,
  "training_completed" text,
  "requires_examination" tinyint(1) not null default '0',
  "examination_type" varchar,
  "examination_date" date,
  "examination_score" numeric,
  "passing_score_required" numeric,
  "examination_result" varchar check("examination_result" in('passed', 'failed', 'pending', 'retake_required', 'waived')),
  "requires_portfolio" tinyint(1) not null default '0',
  "portfolio_components" text,
  "portfolio_submitted" tinyint(1) not null default '0',
  "portfolio_submission_date" date,
  "portfolio_status" varchar check("portfolio_status" in('not_required', 'pending', 'submitted', 'under_review', 'approved', 'revision_required', 'rejected')) not null default 'not_required',
  "requires_observation" tinyint(1) not null default '0',
  "observation_hours_required" integer,
  "observation_hours_completed" integer,
  "observation_results" text,
  "observed_by" integer,
  "observation_date" date,
  "observation_rating" varchar check("observation_rating" in('unsatisfactory', 'developing', 'proficient', 'distinguished')),
  "status" varchar check("status" in('active', 'inactive', 'expired', 'suspended', 'revoked', 'pending', 'denied', 'under_review', 'provisional')) not null default 'pending',
  "status_notes" text,
  "status_change_date" date,
  "status_changed_by" integer,
  "renewal_requirements" text,
  "continuing_education_hours_required" integer,
  "continuing_education_hours_completed" integer,
  "last_renewal_date" date,
  "renewal_count" integer not null default '0',
  "auto_renewal_eligible" tinyint(1) not null default '0',
  "professional_development_log" text,
  "pd_hours_current_period" numeric not null default '0',
  "pd_hours_required_period" numeric,
  "pd_period_start" date,
  "pd_period_end" date,
  "performance_evaluations" text,
  "latest_evaluation_score" numeric,
  "last_evaluation_date" date,
  "performance_rating" varchar check("performance_rating" in('exceptional', 'proficient', 'developing', 'unsatisfactory')),
  "supporting_documents" text,
  "documents_verified" tinyint(1) not null default '0',
  "verified_by" integer,
  "verification_date" date,
  "verification_notes" text,
  "disciplinary_action_history" tinyint(1) not null default '0',
  "disciplinary_records" text,
  "background_check_required" tinyint(1) not null default '1',
  "background_check_completed" tinyint(1) not null default '0',
  "background_check_date" date,
  "background_check_result" varchar check("background_check_result" in('clear', 'conditional', 'pending', 'failed')),
  "student_achievement_data" text,
  "student_growth_percentile" numeric,
  "peer_evaluations" text,
  "student_feedback" text,
  "parent_feedback" text,
  "awards_recognition" text,
  "leadership_roles" text,
  "committee_memberships" text,
  "research_publications" text,
  "technology_certifications" text,
  "digital_competencies" text,
  "online_teaching_certified" tinyint(1) not null default '0',
  "online_teaching_cert_date" date,
  "application_submitted_by" integer,
  "application_submitted_at" datetime,
  "reviewed_by" integer,
  "reviewed_at" datetime,
  "approved_by" integer,
  "approved_at" datetime,
  "included_in_reports" tinyint(1) not null default '1',
  "certification_analytics" text,
  "certification_score" numeric,
  "certification_rank" integer,
  "internationally_recognized" tinyint(1) not null default '0',
  "international_equivalencies" text,
  "reciprocity_agreements" text,
  "audit_required" tinyint(1) not null default '0',
  "last_audit_date" date,
  "audit_result" varchar check("audit_result" in('compliant', 'minor_issues', 'major_issues', 'non_compliant')),
  "audit_notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("teacher_id") references "users"("id") on delete cascade,
  foreign key("observed_by") references "users"("id") on delete set null,
  foreign key("status_changed_by") references "users"("id") on delete set null,
  foreign key("verified_by") references "users"("id") on delete set null,
  foreign key("application_submitted_by") references "users"("id") on delete set null,
  foreign key("reviewed_by") references "users"("id") on delete set null,
  foreign key("approved_by") references "users"("id") on delete set null
);
CREATE INDEX "teacher_certifications_teacher_id_certification_type_index" on "teacher_certifications"(
  "teacher_id",
  "certification_type"
);
CREATE INDEX "teacher_certifications_status_expiry_date_index" on "teacher_certifications"(
  "status",
  "expiry_date"
);
CREATE INDEX "teacher_certifications_certification_type_certification_level_index" on "teacher_certifications"(
  "certification_type",
  "certification_level"
);
CREATE INDEX "teacher_certifications_issue_date_expiry_date_index" on "teacher_certifications"(
  "issue_date",
  "expiry_date"
);
CREATE INDEX "teacher_certifications_next_renewal_due_status_index" on "teacher_certifications"(
  "next_renewal_due",
  "status"
);
CREATE INDEX "teacher_certifications_issuing_organization_certification_type_index" on "teacher_certifications"(
  "issuing_organization",
  "certification_type"
);
CREATE INDEX "teacher_certifications_performance_rating_latest_evaluation_score_index" on "teacher_certifications"(
  "performance_rating",
  "latest_evaluation_score"
);
CREATE INDEX "teacher_certifications_documents_verified_verification_date_index" on "teacher_certifications"(
  "documents_verified",
  "verification_date"
);
CREATE INDEX "teacher_certifications_teacher_id_status_expiry_date_index" on "teacher_certifications"(
  "teacher_id",
  "status",
  "expiry_date"
);
CREATE INDEX "teacher_certifications_certification_type_status_issue_date_index" on "teacher_certifications"(
  "certification_type",
  "status",
  "issue_date"
);
CREATE INDEX "teacher_certifications_issuing_organization_status_certification_level_index" on "teacher_certifications"(
  "issuing_organization",
  "status",
  "certification_level"
);
CREATE TABLE IF NOT EXISTS "assessment_analytics"(
  "id" integer primary key autoincrement not null,
  "assessment_id" integer not null,
  "analytics_type" varchar not null,
  "aggregation_level" varchar check("aggregation_level" in('national', 'regional', 'district', 'institution', 'grade', 'class', 'subject', 'demographic')) not null,
  "institution_id" integer,
  "grade_id" integer,
  "subject_id" integer,
  "demographic_filters" text,
  "inclusion_criteria" text,
  "total_eligible_participants" integer not null default '0',
  "total_registered_participants" integer not null default '0',
  "total_actual_participants" integer not null default '0',
  "participation_rate" numeric not null default '0',
  "no_shows" integer not null default '0',
  "late_arrivals" integer not null default '0',
  "early_departures" integer not null default '0',
  "disqualified_participants" integer not null default '0',
  "mean_score" numeric,
  "median_score" numeric,
  "mode_score" numeric,
  "standard_deviation" numeric,
  "variance" numeric,
  "minimum_score" numeric,
  "maximum_score" numeric,
  "range_score" numeric,
  "percentile_25" numeric,
  "percentile_75" numeric,
  "percentile_90" numeric,
  "percentile_95" numeric,
  "percentile_99" numeric,
  "interquartile_range" numeric,
  "score_distribution" text,
  "performance_level_distribution" text,
  "skewness" numeric,
  "kurtosis" numeric,
  "normal_distribution" tinyint(1),
  "passing_score_threshold" numeric,
  "participants_passed" integer not null default '0',
  "participants_failed" integer not null default '0',
  "pass_rate" numeric not null default '0',
  "excellence_threshold" numeric,
  "participants_excellent" integer not null default '0',
  "excellence_rate" numeric not null default '0',
  "below_basic_count" integer not null default '0',
  "basic_count" integer not null default '0',
  "proficient_count" integer not null default '0',
  "advanced_count" integer not null default '0',
  "distinguished_count" integer not null default '0',
  "below_basic_percentage" numeric not null default '0',
  "basic_percentage" numeric not null default '0',
  "proficient_percentage" numeric not null default '0',
  "advanced_percentage" numeric not null default '0',
  "distinguished_percentage" numeric not null default '0',
  "reliability_coefficient" numeric,
  "cronbach_alpha" numeric,
  "sem_score" numeric,
  "item_difficulty_analysis" text,
  "item_discrimination_analysis" text,
  "distractor_analysis" text,
  "historical_comparison" text,
  "year_over_year_change" numeric,
  "peer_comparison" text,
  "national_benchmark_comparison" text,
  "international_comparison" text,
  "gender_performance_analysis" text,
  "socioeconomic_analysis" text,
  "language_background_analysis" text,
  "special_needs_analysis" text,
  "rural_urban_analysis" text,
  "expected_growth" numeric,
  "actual_growth" numeric,
  "value_added_score" numeric,
  "growth_classification" varchar check("growth_classification" in('exceeded_expectations', 'met_expectations', 'approaching_expectations', 'below_expectations')),
  "achievement_gaps" text,
  "gender_gap" numeric,
  "socioeconomic_gap" numeric,
  "language_gap" numeric,
  "gap_trend_analysis" text,
  "assessment_quality_score" numeric,
  "validity_indicators" text,
  "fairness_indicators" text,
  "bias_analysis" text,
  "meets_technical_standards" tinyint(1),
  "predictive_models" text,
  "risk_factors" text,
  "success_factors" text,
  "intervention_recommendations" text,
  "average_completion_time" numeric,
  "median_completion_time" numeric,
  "completion_time_analysis" text,
  "time_score_correlation" numeric,
  "rushed_completions" integer not null default '0',
  "digital_behavior_patterns" text,
  "average_tab_switches" numeric,
  "navigation_patterns" text,
  "response_revision_patterns" text,
  "engagement_score" numeric,
  "learning_progression_analysis" text,
  "skill_mastery_analysis" text,
  "knowledge_gap_analysis" text,
  "competency_mapping" text,
  "chart_data" text,
  "dashboard_metrics" text,
  "infographic_data" text,
  "executive_summary" text,
  "analysis_methodology" text,
  "statistical_assumptions" text,
  "limitations" text,
  "confidence_interval" numeric,
  "margin_of_error" numeric,
  "generated_by" integer not null,
  "generated_at" datetime not null default CURRENT_TIMESTAMP,
  "data_as_of_date" datetime,
  "preliminary_results" tinyint(1) not null default '0',
  "final_results" tinyint(1) not null default '0',
  "finalized_at" datetime,
  "reviewed_by" integer,
  "reviewed_at" datetime,
  "review_status" varchar check("review_status" in('pending', 'approved', 'revision_required', 'rejected')) not null default 'pending',
  "review_notes" text,
  "published" tinyint(1) not null default '0',
  "published_at" datetime,
  "access_permissions" text,
  "public_release_approved" tinyint(1) not null default '0',
  "embargo_until" date,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("assessment_id") references "academic_assessments"("id") on delete cascade,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("grade_id") references "grades"("id") on delete cascade,
  foreign key("subject_id") references "subjects"("id") on delete cascade,
  foreign key("generated_by") references "users"("id") on delete cascade,
  foreign key("reviewed_by") references "users"("id") on delete set null
);
CREATE INDEX "assessment_analytics_assessment_id_aggregation_level_index" on "assessment_analytics"(
  "assessment_id",
  "aggregation_level"
);
CREATE INDEX "assessment_analytics_institution_id_grade_id_index" on "assessment_analytics"(
  "institution_id",
  "grade_id"
);
CREATE INDEX "assessment_analytics_analytics_type_generated_at_index" on "assessment_analytics"(
  "analytics_type",
  "generated_at"
);
CREATE INDEX "assessment_analytics_published_published_at_index" on "assessment_analytics"(
  "published",
  "published_at"
);
CREATE INDEX "assessment_analytics_final_results_finalized_at_index" on "assessment_analytics"(
  "final_results",
  "finalized_at"
);
CREATE INDEX "assessment_analytics_review_status_reviewed_at_index" on "assessment_analytics"(
  "review_status",
  "reviewed_at"
);
CREATE INDEX "assessment_analytics_assessment_id_aggregation_level_institution_id_index" on "assessment_analytics"(
  "assessment_id",
  "aggregation_level",
  "institution_id"
);
CREATE INDEX "assessment_analytics_assessment_id_grade_id_subject_id_index" on "assessment_analytics"(
  "assessment_id",
  "grade_id",
  "subject_id"
);
CREATE INDEX "assessment_analytics_aggregation_level_published_generated_at_index" on "assessment_analytics"(
  "aggregation_level",
  "published",
  "generated_at"
);
CREATE TABLE IF NOT EXISTS "competency_frameworks"(
  "id" integer primary key autoincrement not null,
  "framework_name" varchar not null,
  "framework_code" varchar not null,
  "framework_version" varchar not null default '1.0',
  "framework_type" varchar check("framework_type" in('academic_standards', 'teaching_standards', 'leadership_standards', 'digital_literacy', 'language_proficiency', 'career_readiness', 'life_skills', 'assessment_standards', 'curriculum_standards', 'special_education')) not null,
  "scope_level" varchar check("scope_level" in('national', 'regional', 'institutional', 'subject_specific', 'grade_specific', 'role_specific')) not null default 'national',
  "applicable_grades" text,
  "applicable_subjects" text,
  "applicable_roles" text,
  "target_audience" varchar,
  "framework_description" text not null,
  "purpose_statement" text,
  "guiding_principles" text,
  "theoretical_foundation" text,
  "developing_organization" varchar not null,
  "development_team" text,
  "development_start_date" date,
  "development_completion_date" date,
  "approval_date" date,
  "approved_by" integer,
  "effective_date" date not null,
  "review_date" date,
  "expiry_date" date,
  "version_history" text,
  "recent_changes" text,
  "change_rationale" text,
  "framework_structure" text not null,
  "total_domains" integer not null default '0',
  "total_competencies" integer not null default '0',
  "total_indicators" integer not null default '0',
  "total_levels" integer not null default '0',
  "proficiency_levels" text,
  "level_descriptors" text,
  "progression_criteria" text,
  "aligned_frameworks" text,
  "alignment_mapping" text,
  "curriculum_alignment" text,
  "assessment_alignment" text,
  "implementation_guidelines" text,
  "training_requirements" text,
  "resource_requirements" text,
  "timeline_recommendations" text,
  "pilot_tested" tinyint(1) not null default '0',
  "pilot_test_results" text,
  "expert_reviewed" tinyint(1) not null default '0',
  "expert_review_feedback" text,
  "stakeholder_validated" tinyint(1) not null default '0',
  "stakeholder_feedback" text,
  "research_foundation" text,
  "evidence_sources" text,
  "validity_studies" text,
  "reliability_data" text,
  "adoption_count" integer not null default '0',
  "adoption_statistics" text,
  "usage_patterns" text,
  "implementation_challenges" text,
  "assessment_methods" text,
  "measurement_tools" text,
  "rubrics_available" text,
  "digital_badges_supported" tinyint(1) not null default '0',
  "certification_pathways" text,
  "available_languages" text,
  "primary_language" varchar not null default 'azerbaijani',
  "translation_status" text,
  "cultural_adaptations" text,
  "digital_format_available" tinyint(1) not null default '0',
  "api_endpoint" varchar,
  "integration_specifications" text,
  "machine_readable" tinyint(1) not null default '0',
  "data_format" varchar,
  "support_materials" text,
  "training_modules" text,
  "exemplars_provided" text,
  "support_contact_email" varchar,
  "support_website" varchar,
  "license_type" varchar,
  "copyright_notice" text,
  "usage_restrictions" text,
  "attribution_requirements" text,
  "status" varchar check("status" in('draft', 'under_review', 'approved', 'published', 'deprecated', 'archived', 'superseded')) not null default 'draft',
  "publicly_available" tinyint(1) not null default '1',
  "requires_permission" tinyint(1) not null default '0',
  "access_restrictions" text,
  "usage_analytics" text,
  "effectiveness_metrics" text,
  "impact_studies" text,
  "satisfaction_rating" numeric,
  "maintained_by" integer,
  "maintenance_schedule" text,
  "last_maintenance_date" date,
  "known_issues" text,
  "enhancement_requests" text,
  "community_contributions_allowed" tinyint(1) not null default '0',
  "contributor_guidelines" text,
  "review_process" text,
  "community_feedback" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("approved_by") references "users"("id") on delete set null,
  foreign key("maintained_by") references "users"("id") on delete set null
);
CREATE INDEX "competency_frameworks_framework_type_scope_level_index" on "competency_frameworks"(
  "framework_type",
  "scope_level"
);
CREATE INDEX "competency_frameworks_status_effective_date_index" on "competency_frameworks"(
  "status",
  "effective_date"
);
CREATE INDEX "competency_frameworks_developing_organization_framework_type_index" on "competency_frameworks"(
  "developing_organization",
  "framework_type"
);
CREATE INDEX "competency_frameworks_publicly_available_status_index" on "competency_frameworks"(
  "publicly_available",
  "status"
);
CREATE INDEX "competency_frameworks_approval_date_effective_date_index" on "competency_frameworks"(
  "approval_date",
  "effective_date"
);
CREATE INDEX "competency_frameworks_framework_name_framework_version_index" on "competency_frameworks"(
  "framework_name",
  "framework_version"
);
CREATE UNIQUE INDEX "competency_frameworks_framework_code_unique" on "competency_frameworks"(
  "framework_code"
);
CREATE TABLE IF NOT EXISTS "access_tracking"(
  "id" integer primary key autoincrement not null,
  "tracking_id" varchar not null,
  "user_id" integer,
  "session_id" varchar,
  "access_time" datetime not null default CURRENT_TIMESTAMP,
  "last_activity" datetime not null default CURRENT_TIMESTAMP,
  "session_duration" integer,
  "access_type" varchar check("access_type" in('login', 'page_view', 'api_call', 'file_access', 'feature_use', 'search', 'export', 'report_view', 'download', 'upload', 'form_submission', 'logout')) not null,
  "resource_type" varchar,
  "resource_id" varchar,
  "resource_name" varchar,
  "resource_path" text,
  "http_method" varchar,
  "full_url" text,
  "route_name" varchar,
  "request_parameters" text,
  "query_parameters" text,
  "referrer_url" text,
  "ip_address" varchar not null,
  "user_agent" text,
  "device_type" varchar,
  "operating_system" varchar,
  "browser" varchar,
  "browser_version" varchar,
  "screen_resolution" varchar,
  "device_fingerprint" varchar,
  "country" varchar,
  "region" varchar,
  "city" varchar,
  "timezone" varchar,
  "latitude" numeric,
  "longitude" numeric,
  "vpn_detected" tinyint(1) not null default '0',
  "proxy_detected" tinyint(1) not null default '0',
  "auth_method" varchar check("auth_method" in('password', 'token', 'sso', 'api_key', 'oauth', 'saml', 'biometric', 'multi_factor')),
  "auth_provider" varchar,
  "user_roles" text,
  "user_permissions" text,
  "elevated_privileges" tinyint(1) not null default '0',
  "institution_id" integer,
  "academic_year_id" integer,
  "academic_term_id" integer,
  "academic_context" varchar,
  "page_views_in_session" integer not null default '1',
  "actions_in_session" integer not null default '1',
  "navigation_path" text,
  "time_on_page" integer,
  "bounce_session" tinyint(1) not null default '0',
  "page_load_time" integer,
  "server_response_time" integer,
  "database_query_time" integer,
  "memory_usage" integer,
  "form_interactions" text,
  "click_tracking" text,
  "scroll_tracking" text,
  "search_terms" text,
  "filters_applied" text,
  "risk_score" varchar check("risk_score" in('very_low', 'low', 'medium', 'high', 'very_high')) not null default 'low',
  "security_indicators" text,
  "anomaly_detected" tinyint(1) not null default '0',
  "anomaly_score" numeric,
  "risk_factors" text,
  "data_sensitivity" varchar check("data_sensitivity" in('public', 'internal', 'confidential', 'restricted', 'classified')) not null default 'internal',
  "pii_accessed" tinyint(1) not null default '0',
  "financial_data_accessed" tinyint(1) not null default '0',
  "health_data_accessed" tinyint(1) not null default '0',
  "academic_records_accessed" tinyint(1) not null default '0',
  "data_categories" text,
  "access_result" varchar check("access_result" in('successful', 'denied', 'timeout', 'error', 'blocked', 'redirected', 'partial')) not null default 'successful',
  "http_status_code" integer,
  "error_message" text,
  "response_headers" text,
  "response_size" integer,
  "campaign_source" varchar,
  "utm_parameters" varchar,
  "feature_flag" varchar,
  "ab_test_variant" varchar,
  "gdpr_applicable" tinyint(1) not null default '0',
  "consent_given" tinyint(1) not null default '0',
  "legal_basis" text,
  "anonymized" tinyint(1) not null default '0',
  "integration_source" varchar,
  "api_version" varchar,
  "client_application" varchar,
  "sdk_version" varchar,
  "workflow_step" varchar,
  "process_id" varchar,
  "workflow_context" text,
  "automated_access" tinyint(1) not null default '0',
  "learning_objective" varchar,
  "assessment_context" varchar,
  "study_time" integer,
  "learning_progress" text,
  "mobile_app" tinyint(1) not null default '0',
  "app_version" varchar,
  "offline_sync" tinyint(1) not null default '0',
  "offline_data" text,
  "collaboration_context" text,
  "shared_resource_id" varchar,
  "social_interactions" text,
  "custom_metrics" text,
  "event_sequence" text,
  "engagement_score" numeric,
  "behavioral_tags" text,
  "alert_triggered" tinyint(1) not null default '0',
  "alert_type" varchar,
  "alert_details" text,
  "investigation_required" tinyint(1) not null default '0',
  "retention_category" varchar check("retention_category" in('short_term', 'medium_term', 'long_term', 'regulatory', 'permanent')) not null default 'medium_term',
  "purge_after" date,
  "archived" tinyint(1) not null default '0',
  "archived_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete set null,
  foreign key("institution_id") references "institutions"("id") on delete set null,
  foreign key("academic_year_id") references "academic_years"("id") on delete set null,
  foreign key("academic_term_id") references "academic_terms"("id") on delete set null
);
CREATE INDEX "access_tracking_user_id_access_time_index" on "access_tracking"(
  "user_id",
  "access_time"
);
CREATE INDEX "access_tracking_access_type_access_time_index" on "access_tracking"(
  "access_type",
  "access_time"
);
CREATE INDEX "access_tracking_session_id_access_time_index" on "access_tracking"(
  "session_id",
  "access_time"
);
CREATE INDEX "access_tracking_ip_address_access_time_index" on "access_tracking"(
  "ip_address",
  "access_time"
);
CREATE INDEX "access_tracking_institution_id_access_time_index" on "access_tracking"(
  "institution_id",
  "access_time"
);
CREATE INDEX "access_tracking_resource_type_resource_id_index" on "access_tracking"(
  "resource_type",
  "resource_id"
);
CREATE INDEX "access_tracking_risk_score_anomaly_detected_index" on "access_tracking"(
  "risk_score",
  "anomaly_detected"
);
CREATE INDEX "access_tracking_access_result_access_time_index" on "access_tracking"(
  "access_result",
  "access_time"
);
CREATE INDEX "access_tracking_device_type_access_time_index" on "access_tracking"(
  "device_type",
  "access_time"
);
CREATE INDEX "access_tracking_country_access_time_index" on "access_tracking"(
  "country",
  "access_time"
);
CREATE INDEX "access_tracking_pii_accessed_access_time_index" on "access_tracking"(
  "pii_accessed",
  "access_time"
);
CREATE INDEX "access_tracking_archived_purge_after_index" on "access_tracking"(
  "archived",
  "purge_after"
);
CREATE INDEX "access_tracking_user_id_access_type_access_time_index" on "access_tracking"(
  "user_id",
  "access_type",
  "access_time"
);
CREATE INDEX "access_tracking_institution_id_user_id_access_time_index" on "access_tracking"(
  "institution_id",
  "user_id",
  "access_time"
);
CREATE INDEX "access_tracking_access_time_access_type_access_result_index" on "access_tracking"(
  "access_time",
  "access_type",
  "access_result"
);
CREATE INDEX "access_tracking_user_id_session_id_access_time_index" on "access_tracking"(
  "user_id",
  "session_id",
  "access_time"
);
CREATE INDEX "access_tracking_resource_type_user_id_access_time_index" on "access_tracking"(
  "resource_type",
  "user_id",
  "access_time"
);
CREATE UNIQUE INDEX "access_tracking_tracking_id_unique" on "access_tracking"(
  "tracking_id"
);
CREATE TABLE IF NOT EXISTS "security_incidents"(
  "id" integer primary key autoincrement not null,
  "incident_id" varchar not null,
  "incident_title" varchar not null,
  "detected_at" datetime not null default CURRENT_TIMESTAMP,
  "occurred_at" datetime,
  "detected_by" integer,
  "detection_method" varchar check("detection_method" in('automated', 'user_report', 'admin_discovery', 'external_report', 'audit_discovery', 'monitoring_alert', 'threat_intelligence', 'manual_review')) not null default 'automated',
  "incident_type" varchar check("incident_type" in('unauthorized_access', 'data_breach', 'malware', 'phishing', 'ddos_attack', 'brute_force', 'sql_injection', 'xss_attack', 'privilege_escalation', 'data_corruption', 'service_disruption', 'policy_violation', 'insider_threat', 'social_engineering', 'physical_security', 'compliance_violation', 'system_compromise', 'network_intrusion', 'credential_theft', 'ransomware', 'other')) not null,
  "severity_level" varchar check("severity_level" in('critical', 'high', 'medium', 'low', 'informational')) not null default 'medium',
  "impact_level" varchar check("impact_level" in('catastrophic', 'major', 'moderate', 'minor', 'negligible')) not null default 'minor',
  "incident_description" text not null,
  "technical_details" text,
  "affected_systems" text,
  "affected_users" text,
  "affected_data" text,
  "estimated_affected_records" integer,
  "attack_vectors" text,
  "threat_actors" text,
  "indicators_of_compromise" text,
  "attack_timeline" text,
  "attack_signature" text,
  "source_ip_addresses" text,
  "target_systems" text,
  "network_logs" text,
  "system_logs" text,
  "security_tool_alerts" text,
  "compromised_accounts" text,
  "privilege_levels_involved" text,
  "access_patterns" text,
  "insider_involvement" tinyint(1) not null default '0',
  "confidentiality_impact" varchar check("confidentiality_impact" in('none', 'low', 'medium', 'high')) not null default 'none',
  "integrity_impact" varchar check("integrity_impact" in('none', 'low', 'medium', 'high')) not null default 'none',
  "availability_impact" varchar check("availability_impact" in('none', 'low', 'medium', 'high')) not null default 'none',
  "financial_impact" numeric,
  "business_disruption" text,
  "downtime_minutes" integer,
  "status" varchar check("status" in('new', 'assigned', 'investigating', 'containing', 'eradicating', 'recovering', 'resolved', 'closed', 'false_positive')) not null default 'new',
  "assigned_to" integer,
  "assigned_at" datetime,
  "incident_commander" integer,
  "response_team" text,
  "response_started_at" datetime,
  "contained_at" datetime,
  "eradicated_at" datetime,
  "recovered_at" datetime,
  "resolved_at" datetime,
  "closed_at" datetime,
  "containment_actions" text,
  "eradication_actions" text,
  "recovery_actions" text,
  "communication_log" text,
  "evidence_collected" text,
  "forensic_artifacts" text,
  "forensic_investigation_required" tinyint(1) not null default '0',
  "forensic_investigator" integer,
  "chain_of_custody" text,
  "root_cause" text,
  "contributing_factors" text,
  "vulnerabilities_exploited" text,
  "security_control_failures" text,
  "remediation_actions" text,
  "preventive_measures" text,
  "lessons_learned" text,
  "recommendations" text,
  "policy_changes_required" tinyint(1) not null default '0',
  "training_required" tinyint(1) not null default '0',
  "regulatory_notification_required" tinyint(1) not null default '0',
  "regulatory_bodies_notified" text,
  "regulatory_notification_sent" datetime,
  "customer_notification_required" tinyint(1) not null default '0',
  "customer_notification_sent" datetime,
  "law_enforcement_involved" tinyint(1) not null default '0',
  "legal_considerations" text,
  "personal_data_involved" tinyint(1) not null default '0',
  "gdpr_applicable" tinyint(1) not null default '0',
  "gdpr_notification_deadline" datetime,
  "data_subject_notification_required" tinyint(1) not null default '0',
  "affected_data_categories" text,
  "third_party_vendors_involved" text,
  "cyber_insurance_claim" tinyint(1) not null default '0',
  "insurance_claim_number" varchar,
  "external_counsel_engaged" tinyint(1) not null default '0',
  "public_relations_involved" tinyint(1) not null default '0',
  "time_to_detection_minutes" integer,
  "time_to_response_minutes" integer,
  "time_to_containment_minutes" integer,
  "time_to_resolution_minutes" integer,
  "follow_up_required" tinyint(1) not null default '0',
  "follow_up_date" date,
  "follow_up_actions" text,
  "vulnerability_patched" tinyint(1) not null default '0',
  "vulnerability_patch_date" date,
  "security_testing_completed" tinyint(1) not null default '0',
  "related_incidents" text,
  "similar_incidents" text,
  "threat_intelligence_updates" text,
  "playbook_updated" tinyint(1) not null default '0',
  "knowledge_base_entry" text,
  "response_cost" numeric,
  "staff_hours_spent" integer,
  "external_consultant_cost" numeric,
  "technology_cost" numeric,
  "business_loss" numeric,
  "stakeholders_notified" text,
  "executive_briefings" text,
  "board_notification_required" tinyint(1) not null default '0',
  "public_disclosure_required" tinyint(1) not null default '0',
  "public_disclosure_date" date,
  "reviewed_by" integer,
  "reviewed_at" datetime,
  "review_status" varchar check("review_status" in('pending', 'approved', 'revision_required')) not null default 'pending',
  "review_comments" text,
  "retention_period" varchar check("retention_period" in('1_year', '3_years', '7_years', 'permanent')) not null default '3_years',
  "archived" tinyint(1) not null default '0',
  "archived_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("detected_by") references "users"("id") on delete set null,
  foreign key("assigned_to") references "users"("id") on delete set null,
  foreign key("incident_commander") references "users"("id") on delete set null,
  foreign key("forensic_investigator") references "users"("id") on delete set null,
  foreign key("reviewed_by") references "users"("id") on delete set null
);
CREATE INDEX "security_incidents_incident_type_severity_level_index" on "security_incidents"(
  "incident_type",
  "severity_level"
);
CREATE INDEX "security_incidents_status_detected_at_index" on "security_incidents"(
  "status",
  "detected_at"
);
CREATE INDEX "security_incidents_detected_by_detected_at_index" on "security_incidents"(
  "detected_by",
  "detected_at"
);
CREATE INDEX "security_incidents_assigned_to_status_index" on "security_incidents"(
  "assigned_to",
  "status"
);
CREATE INDEX "security_incidents_severity_level_impact_level_index" on "security_incidents"(
  "severity_level",
  "impact_level"
);
CREATE INDEX "security_incidents_occurred_at_detected_at_index" on "security_incidents"(
  "occurred_at",
  "detected_at"
);
CREATE INDEX "security_incidents_regulatory_notification_required_detected_at_index" on "security_incidents"(
  "regulatory_notification_required",
  "detected_at"
);
CREATE INDEX "security_incidents_personal_data_involved_detected_at_index" on "security_incidents"(
  "personal_data_involved",
  "detected_at"
);
CREATE INDEX "security_incidents_follow_up_required_follow_up_date_index" on "security_incidents"(
  "follow_up_required",
  "follow_up_date"
);
CREATE INDEX "security_incidents_archived_detected_at_index" on "security_incidents"(
  "archived",
  "detected_at"
);
CREATE INDEX "security_incidents_incident_type_status_detected_at_index" on "security_incidents"(
  "incident_type",
  "status",
  "detected_at"
);
CREATE INDEX "security_incidents_severity_level_status_detected_at_index" on "security_incidents"(
  "severity_level",
  "status",
  "detected_at"
);
CREATE INDEX "security_incidents_assigned_to_status_detected_at_index" on "security_incidents"(
  "assigned_to",
  "status",
  "detected_at"
);
CREATE UNIQUE INDEX "security_incidents_incident_id_unique" on "security_incidents"(
  "incident_id"
);
CREATE TABLE IF NOT EXISTS "compliance_monitoring"(
  "id" integer primary key autoincrement not null,
  "monitoring_id" varchar not null,
  "compliance_framework" varchar check("compliance_framework" in('gdpr', 'ferpa', 'coppa', 'hipaa', 'iso27001', 'nist', 'sox', 'pci_dss', 'azerbaijan_data_protection', 'education_data_privacy', 'student_records_act', 'accessibility_act', 'procurement_regulations', 'audit_standards', 'information_security', 'data_localization', 'cybersecurity_law', 'privacy_protection', 'internal_policy', 'custom')) not null,
  "framework_version" varchar,
  "control_id" varchar not null,
  "control_name" varchar not null,
  "control_description" text not null,
  "institution_id" integer,
  "scope_level" varchar check("scope_level" in('organization', 'department', 'system', 'process', 'project', 'individual')) not null default 'organization',
  "monitored_entity" varchar,
  "entity_type" varchar,
  "monitoring_scope" text,
  "assessment_date" datetime not null default CURRENT_TIMESTAMP,
  "next_assessment_due" datetime,
  "assessed_by" integer not null,
  "assessment_type" varchar check("assessment_type" in('self_assessment', 'internal_audit', 'external_audit', 'automated_check', 'peer_review', 'third_party_assessment', 'regulatory_inspection', 'certification_audit')) not null default 'self_assessment',
  "compliance_status" varchar check("compliance_status" in('compliant', 'partial_compliance', 'non_compliant', 'not_applicable', 'compensating_control', 'exception_approved', 'in_progress', 'under_review')) not null default 'under_review',
  "compliance_score" numeric,
  "risk_rating" varchar check("risk_rating" in('critical', 'high', 'medium', 'low', 'negligible')),
  "evidence_provided" text,
  "documentation_reviewed" text,
  "artifacts_collected" text,
  "assessment_methodology" text,
  "compliance_gaps" text,
  "findings" text,
  "deficiencies" text,
  "root_cause_analysis" text,
  "recommendations" text,
  "remediation_plan" text,
  "corrective_actions" text,
  "target_remediation_date" date,
  "actual_remediation_date" date,
  "implemented_controls" text,
  "control_effectiveness" text,
  "compensating_controls" text,
  "implementation_notes" text,
  "control_tested" tinyint(1) not null default '0',
  "last_test_date" date,
  "next_test_due" date,
  "test_result" varchar check("test_result" in('passed', 'failed', 'partial', 'not_tested')),
  "test_methodology" text,
  "test_results" text,
  "compliance_metrics" text,
  "performance_indicators" text,
  "target_compliance_level" numeric,
  "actual_compliance_level" numeric,
  "trend_data" text,
  "inherent_risk_score" numeric,
  "residual_risk_score" numeric,
  "risk_factors" text,
  "risk_mitigation_strategy" text,
  "risk_acceptable" tinyint(1),
  "control_owner" integer,
  "stakeholders" text,
  "business_owner" integer,
  "technical_owner" integer,
  "monitoring_frequency" varchar check("monitoring_frequency" in('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'semi_annually', 'annually', 'ad_hoc', 'event_driven')) not null default 'quarterly',
  "monitoring_schedule" text,
  "automated_monitoring" tinyint(1) not null default '0',
  "automation_tool" varchar,
  "applicable_regulations" text,
  "regulatory_citations" text,
  "mandatory_requirement" tinyint(1) not null default '1',
  "compliance_deadline" date,
  "penalties_for_non_compliance" text,
  "regulatory_body" varchar,
  "auditor_firm" varchar,
  "auditor_contact" integer,
  "third_party_validation" tinyint(1) not null default '0',
  "last_regulatory_review" date,
  "training_required" tinyint(1) not null default '0',
  "training_completed" text,
  "last_training_date" date,
  "next_training_due" date,
  "training_completion_rate" numeric,
  "communication_plan" text,
  "reporting_requirements" text,
  "executive_reporting" tinyint(1) not null default '0',
  "board_reporting" tinyint(1) not null default '0',
  "regulatory_reporting" tinyint(1) not null default '0',
  "change_log" text,
  "last_status_change" datetime,
  "status_changed_by" integer,
  "change_justification" text,
  "supporting_systems" text,
  "data_sources" text,
  "automated_evidence_collection" tinyint(1) not null default '0',
  "integration_points" text,
  "compliance_cost" numeric,
  "effort_hours" integer,
  "resource_allocation" text,
  "cost_of_non_compliance" numeric,
  "improvement_opportunities" text,
  "best_practices" text,
  "lessons_learned" text,
  "process_optimization" tinyint(1) not null default '0',
  "exception_requested" tinyint(1) not null default '0',
  "exception_justification" text,
  "exception_approved_by" integer,
  "exception_expiry_date" date,
  "exception_conditions" text,
  "certification_required" tinyint(1) not null default '0',
  "certification_body" varchar,
  "certification_date" date,
  "certification_expiry" date,
  "certificate_number" varchar,
  "compliance_analytics" text,
  "benchmark_data" text,
  "peer_comparison" text,
  "maturity_level" numeric,
  "retention_period" varchar check("retention_period" in('3_years', '7_years', '10_years', 'permanent')) not null default '7_years',
  "archived" tinyint(1) not null default '0',
  "archived_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("assessed_by") references "users"("id") on delete cascade,
  foreign key("control_owner") references "users"("id") on delete set null,
  foreign key("business_owner") references "users"("id") on delete set null,
  foreign key("technical_owner") references "users"("id") on delete set null,
  foreign key("auditor_contact") references "users"("id") on delete set null,
  foreign key("status_changed_by") references "users"("id") on delete set null,
  foreign key("exception_approved_by") references "users"("id") on delete set null
);
CREATE INDEX "compliance_monitoring_compliance_framework_compliance_status_index" on "compliance_monitoring"(
  "compliance_framework",
  "compliance_status"
);
CREATE INDEX "compliance_monitoring_institution_id_assessment_date_index" on "compliance_monitoring"(
  "institution_id",
  "assessment_date"
);
CREATE INDEX "compliance_monitoring_compliance_status_risk_rating_index" on "compliance_monitoring"(
  "compliance_status",
  "risk_rating"
);
CREATE INDEX "compliance_monitoring_next_assessment_due_compliance_status_index" on "compliance_monitoring"(
  "next_assessment_due",
  "compliance_status"
);
CREATE INDEX "compliance_monitoring_control_owner_compliance_status_index" on "compliance_monitoring"(
  "control_owner",
  "compliance_status"
);
CREATE INDEX "compliance_monitoring_assessment_date_assessment_type_index" on "compliance_monitoring"(
  "assessment_date",
  "assessment_type"
);
CREATE INDEX "compliance_monitoring_compliance_framework_control_id_index" on "compliance_monitoring"(
  "compliance_framework",
  "control_id"
);
CREATE INDEX "compliance_monitoring_target_remediation_date_compliance_status_index" on "compliance_monitoring"(
  "target_remediation_date",
  "compliance_status"
);
CREATE INDEX "compliance_monitoring_mandatory_requirement_compliance_deadline_index" on "compliance_monitoring"(
  "mandatory_requirement",
  "compliance_deadline"
);
CREATE INDEX "compliance_monitoring_archived_assessment_date_index" on "compliance_monitoring"(
  "archived",
  "assessment_date"
);
CREATE INDEX "compliance_monitoring_compliance_framework_institution_id_compliance_status_index" on "compliance_monitoring"(
  "compliance_framework",
  "institution_id",
  "compliance_status"
);
CREATE INDEX "compliance_monitoring_compliance_status_risk_rating_assessment_date_index" on "compliance_monitoring"(
  "compliance_status",
  "risk_rating",
  "assessment_date"
);
CREATE INDEX "compliance_monitoring_control_owner_next_assessment_due_compliance_status_index" on "compliance_monitoring"(
  "control_owner",
  "next_assessment_due",
  "compliance_status"
);
CREATE UNIQUE INDEX "compliance_monitoring_monitoring_id_unique" on "compliance_monitoring"(
  "monitoring_id"
);
CREATE TABLE IF NOT EXISTS "monitoring_dashboards"(
  "id" integer primary key autoincrement not null,
  "dashboard_id" varchar not null,
  "dashboard_name" varchar not null,
  "dashboard_description" text,
  "dashboard_type" varchar check("dashboard_type" in('security_overview', 'compliance_status', 'audit_summary', 'incident_tracking', 'access_analytics', 'performance_metrics', 'user_activity', 'data_protection', 'threat_intelligence', 'vulnerability_mgmt', 'risk_assessment', 'policy_compliance', 'training_compliance', 'executive_summary', 'operational_metrics', 'financial_compliance', 'academic_integrity', 'student_privacy', 'system_health', 'custom')) not null,
  "owner_id" integer not null,
  "created_by" integer not null,
  "visibility" varchar check("visibility" in('private', 'shared', 'department', 'institution', 'public')) not null default 'private',
  "shared_with" text,
  "permission_levels" text,
  "layout_config" text not null,
  "widget_config" text not null,
  "data_sources" text not null,
  "filter_config" text,
  "refresh_config" text,
  "refresh_frequency" varchar check("refresh_frequency" in('real_time', 'every_minute', 'every_5_minutes', 'every_15_minutes', 'every_30_minutes', 'hourly', 'daily', 'manual')) not null default 'every_15_minutes',
  "last_refreshed_at" datetime,
  "next_refresh_at" datetime,
  "auto_refresh_enabled" tinyint(1) not null default '1',
  "refresh_timeout_seconds" integer not null default '300',
  "key_metrics" text,
  "kpi_thresholds" text,
  "alert_conditions" text,
  "trend_indicators" text,
  "data_aggregation_level" varchar check("data_aggregation_level" in('real_time', 'hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annually')) not null default 'daily',
  "aggregation_rules" text,
  "data_retention_days" integer not null default '90',
  "calculation_formulas" text,
  "alerts_enabled" tinyint(1) not null default '0',
  "alert_recipients" text,
  "alert_rules" text,
  "notification_method" varchar check("notification_method" in('email', 'sms', 'in_app', 'webhook', 'slack', 'teams')),
  "cache_enabled" tinyint(1) not null default '1',
  "cache_duration_minutes" integer not null default '15',
  "performance_metrics" text,
  "load_time_ms" integer,
  "query_execution_time_ms" integer,
  "export_enabled" tinyint(1) not null default '1',
  "export_formats" text,
  "scheduled_reports" text,
  "pdf_export_enabled" tinyint(1) not null default '1',
  "excel_export_enabled" tinyint(1) not null default '1',
  "csv_export_enabled" tinyint(1) not null default '1',
  "user_preferences" text,
  "theme_config" text,
  "localization_settings" text,
  "personalization_enabled" tinyint(1) not null default '1',
  "security_classifications" text,
  "audit_trail_enabled" tinyint(1) not null default '1',
  "compliance_frameworks" text,
  "data_sensitivity" varchar check("data_sensitivity" in('public', 'internal', 'confidential', 'restricted')) not null default 'internal',
  "institution_id" integer,
  "academic_scope" text,
  "department_scope" text,
  "role_scope" text,
  "drill_down_enabled" tinyint(1) not null default '1',
  "filtering_enabled" tinyint(1) not null default '1',
  "search_enabled" tinyint(1) not null default '1',
  "interactive_features" text,
  "bookmark_config" text,
  "mobile_optimized" tinyint(1) not null default '1',
  "mobile_layout_config" text,
  "responsive_design" tinyint(1) not null default '1',
  "breakpoint_config" text,
  "embeddable" tinyint(1) not null default '0',
  "embed_token" varchar,
  "api_endpoints" text,
  "external_sharing_enabled" tinyint(1) not null default '0',
  "webhook_config" text,
  "view_count" integer not null default '0',
  "last_viewed_at" datetime,
  "usage_statistics" text,
  "average_session_duration" numeric,
  "user_engagement_metrics" text,
  "version" varchar not null default '1.0',
  "version_history" text,
  "last_modified_at" datetime,
  "last_modified_by" integer,
  "change_log" text,
  "is_template" tinyint(1) not null default '0',
  "template_category" varchar,
  "template_variables" text,
  "standardized" tinyint(1) not null default '0',
  "standard_version" varchar,
  "data_quality_checks" tinyint(1) not null default '1',
  "validation_rules" text,
  "last_validation_at" datetime,
  "validation_passed" tinyint(1) not null default '1',
  "validation_errors" text,
  "backup_enabled" tinyint(1) not null default '1',
  "last_backup_at" datetime,
  "backup_config" text,
  "backup_location" varchar,
  "status" varchar check("status" in('active', 'inactive', 'draft', 'archived', 'deprecated', 'maintenance')) not null default 'active',
  "status_notes" text,
  "status_changed_at" datetime,
  "expiry_date" date,
  "auto_archive" tinyint(1) not null default '0',
  "development_cost" numeric,
  "maintenance_cost" numeric,
  "compute_resources_used" integer,
  "storage_used_mb" numeric,
  "user_rating" numeric,
  "user_feedback" text,
  "improvement_suggestions" text,
  "feedback_enabled" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("owner_id") references "users"("id") on delete cascade,
  foreign key("created_by") references "users"("id") on delete cascade,
  foreign key("institution_id") references "institutions"("id") on delete cascade,
  foreign key("last_modified_by") references "users"("id") on delete set null
);
CREATE INDEX "monitoring_dashboards_dashboard_type_status_index" on "monitoring_dashboards"(
  "dashboard_type",
  "status"
);
CREATE INDEX "monitoring_dashboards_owner_id_status_index" on "monitoring_dashboards"(
  "owner_id",
  "status"
);
CREATE INDEX "monitoring_dashboards_institution_id_dashboard_type_index" on "monitoring_dashboards"(
  "institution_id",
  "dashboard_type"
);
CREATE INDEX "monitoring_dashboards_visibility_status_index" on "monitoring_dashboards"(
  "visibility",
  "status"
);
CREATE INDEX "monitoring_dashboards_created_by_created_at_index" on "monitoring_dashboards"(
  "created_by",
  "created_at"
);
CREATE INDEX "monitoring_dashboards_last_refreshed_at_auto_refresh_enabled_index" on "monitoring_dashboards"(
  "last_refreshed_at",
  "auto_refresh_enabled"
);
CREATE INDEX "monitoring_dashboards_is_template_template_category_index" on "monitoring_dashboards"(
  "is_template",
  "template_category"
);
CREATE INDEX "monitoring_dashboards_status_expiry_date_index" on "monitoring_dashboards"(
  "status",
  "expiry_date"
);
CREATE INDEX "monitoring_dashboards_view_count_last_viewed_at_index" on "monitoring_dashboards"(
  "view_count",
  "last_viewed_at"
);
CREATE INDEX "monitoring_dashboards_dashboard_type_institution_id_status_index" on "monitoring_dashboards"(
  "dashboard_type",
  "institution_id",
  "status"
);
CREATE INDEX "monitoring_dashboards_owner_id_dashboard_type_status_index" on "monitoring_dashboards"(
  "owner_id",
  "dashboard_type",
  "status"
);
CREATE INDEX "monitoring_dashboards_visibility_institution_id_status_index" on "monitoring_dashboards"(
  "visibility",
  "institution_id",
  "status"
);
CREATE UNIQUE INDEX "monitoring_dashboards_dashboard_id_unique" on "monitoring_dashboards"(
  "dashboard_id"
);
CREATE TABLE IF NOT EXISTS "system_configs"(
  "id" integer primary key autoincrement not null,
  "key" varchar not null,
  "value" text not null,
  "type" varchar not null default 'string',
  "description" text,
  "updated_by" integer,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("updated_by") references "users"("id") on delete set null
);
CREATE INDEX "system_configs_key_index" on "system_configs"("key");
CREATE UNIQUE INDEX "system_configs_key_unique" on "system_configs"("key");
CREATE TABLE IF NOT EXISTS "report_schedules"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "description" text,
  "report_type" varchar check("report_type" in('overview', 'institutional', 'survey', 'user_activity')) not null,
  "frequency" varchar check("frequency" in('daily', 'weekly', 'monthly', 'quarterly')) not null,
  "format" varchar check("format" in('csv', 'json', 'pdf')) not null,
  "recipients" text not null,
  "filters" text,
  "time" time not null,
  "day_of_week" integer,
  "day_of_month" integer,
  "next_run" datetime,
  "last_run" datetime,
  "status" varchar check("status" in('active', 'paused', 'disabled')) not null default 'active',
  "created_by" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("created_by") references "users"("id") on delete cascade
);
CREATE INDEX "report_schedules_status_next_run_index" on "report_schedules"(
  "status",
  "next_run"
);
CREATE INDEX "report_schedules_created_by_index" on "report_schedules"(
  "created_by"
);
CREATE INDEX "departments_department_type_index" on "departments"(
  "department_type"
);
CREATE INDEX "departments_is_active_index" on "departments"("is_active");
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "remember_token" varchar,
  "created_at" datetime not null default(CURRENT_TIMESTAMP),
  "updated_at" datetime not null default(CURRENT_TIMESTAMP),
  "username" varchar not null,
  "role_id" integer,
  "institution_id" integer,
  "is_active" tinyint(1) not null default('1'),
  "last_login_at" datetime,
  "password_changed_at" datetime not null default(CURRENT_TIMESTAMP),
  "failed_login_attempts" integer not null default('0'),
  "locked_until" datetime,
  "departments" text not null default('[]'), "department_id" integer,
  "password_change_required" tinyint(1) not null default '0',
  foreign key("institution_id") references institutions("id") on delete no action on update no action,
  foreign key("department_id") references "departments"("id")
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE UNIQUE INDEX "users_username_unique" on "users"("username");
CREATE INDEX "users_department_id_index" on "users"("department_id");

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO migrations VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO migrations VALUES(4,'2025_07_03_040000_create_permission_tables',1);
INSERT INTO migrations VALUES(5,'2025_07_03_050353_create_institutions_table',1);
INSERT INTO migrations VALUES(6,'2025_07_03_050524_create_survey_templates_table',1);
INSERT INTO migrations VALUES(7,'2025_07_03_050525_create_surveys_table',1);
INSERT INTO migrations VALUES(8,'2025_07_03_050817_create_survey_responses_table',1);
INSERT INTO migrations VALUES(9,'2025_07_03_050834_create_school_staff_table',1);
INSERT INTO migrations VALUES(10,'2025_07_03_051137_create_system_config_table',1);
INSERT INTO migrations VALUES(11,'2025_07_03_051517_create_academic_terms_table',1);
INSERT INTO migrations VALUES(12,'2025_07_03_052326_add_missing_columns_to_users_table',1);
INSERT INTO migrations VALUES(13,'2025_07_03_052327_add_departments_to_users_table',1);
INSERT INTO migrations VALUES(14,'2025_07_03_052328_update_users_username_and_add_constraints',1);
INSERT INTO migrations VALUES(15,'2025_07_03_052516_create_role_user_table',1);
INSERT INTO migrations VALUES(16,'2025_07_03_052729_create_permission_role_table',1);
INSERT INTO migrations VALUES(17,'2025_07_03_055000_create_user_profiles_table',1);
INSERT INTO migrations VALUES(18,'2025_07_03_055200_create_departments_table',1);
INSERT INTO migrations VALUES(19,'2025_07_03_055300_create_regions_table',1);
INSERT INTO migrations VALUES(20,'2025_07_03_055400_create_sectors_table',1);
INSERT INTO migrations VALUES(21,'2025_07_03_055500_create_academic_years_table',1);
INSERT INTO migrations VALUES(22,'2025_07_03_055600_create_rooms_table',1);
INSERT INTO migrations VALUES(23,'2025_07_03_055700_create_grades_table',1);
INSERT INTO migrations VALUES(24,'2025_07_03_055800_create_reports_table',1);
INSERT INTO migrations VALUES(25,'2025_07_03_055900_create_report_results_table',1);
INSERT INTO migrations VALUES(26,'2025_07_03_060000_create_indicators_table',1);
INSERT INTO migrations VALUES(27,'2025_07_03_060100_create_indicator_values_table',1);
INSERT INTO migrations VALUES(28,'2025_07_03_060200_create_uploads_table',1);
INSERT INTO migrations VALUES(29,'2025_07_03_060300_create_activity_logs_table',1);
INSERT INTO migrations VALUES(30,'2025_07_03_060400_create_audit_logs_table',1);
INSERT INTO migrations VALUES(31,'2025_07_03_060500_create_security_events_table',1);
INSERT INTO migrations VALUES(32,'2025_07_03_060600_update_surveys_table_structure',1);
INSERT INTO migrations VALUES(33,'2025_07_03_060700_update_survey_responses_table',1);
INSERT INTO migrations VALUES(34,'2025_07_03_060800_create_survey_versions_table',1);
INSERT INTO migrations VALUES(35,'2025_07_03_060900_create_survey_audit_logs_table',1);
INSERT INTO migrations VALUES(36,'2025_07_03_061000_create_statistics_table',1);
INSERT INTO migrations VALUES(37,'2025_07_03_155411_create_personal_access_tokens_table',1);
INSERT INTO migrations VALUES(38,'2025_07_03_160645_add_custom_columns_to_roles_table',1);
INSERT INTO migrations VALUES(39,'2025_07_03_160707_add_custom_columns_to_permissions_table',1);
INSERT INTO migrations VALUES(40,'2025_07_03_200000_create_subjects_table',1);
INSERT INTO migrations VALUES(41,'2025_07_03_200001_update_subjects_table',1);
INSERT INTO migrations VALUES(42,'2025_07_04_200353_add_fields_to_roles_table',1);
INSERT INTO migrations VALUES(43,'2025_07_05_235700_create_tasks_table',1);
INSERT INTO migrations VALUES(44,'2025_07_05_235800_create_task_comments_table',1);
INSERT INTO migrations VALUES(45,'2025_07_06_003200_create_notifications_table',1);
INSERT INTO migrations VALUES(46,'2025_07_06_003300_create_notification_templates_table',1);
INSERT INTO migrations VALUES(47,'2025_07_06_004500_create_survey_questions_table',1);
INSERT INTO migrations VALUES(48,'2025_07_06_004600_create_survey_question_responses_table',1);
INSERT INTO migrations VALUES(49,'2025_07_06_005000_add_missing_survey_columns',1);
INSERT INTO migrations VALUES(50,'2025_07_06_005500_create_documents_table',1);
INSERT INTO migrations VALUES(51,'2025_07_06_005600_create_document_shares_table',1);
INSERT INTO migrations VALUES(52,'2025_07_06_005700_create_document_downloads_table',1);
INSERT INTO migrations VALUES(53,'2025_07_06_005800_create_user_storage_quotas_table',1);
INSERT INTO migrations VALUES(54,'2025_07_06_040000_create_user_devices_table',1);
INSERT INTO migrations VALUES(55,'2025_07_06_040100_create_user_sessions_table',1);
INSERT INTO migrations VALUES(56,'2025_07_06_040200_create_session_activities_table',1);
INSERT INTO migrations VALUES(57,'2025_07_06_040300_create_security_alerts_table',1);
INSERT INTO migrations VALUES(58,'2025_07_06_040400_create_account_lockouts_table',1);
INSERT INTO migrations VALUES(59,'2025_07_06_050000_create_time_slots_table',1);
INSERT INTO migrations VALUES(60,'2025_07_06_050100_create_academic_calendars_table',1);
INSERT INTO migrations VALUES(61,'2025_07_06_050200_create_teacher_subjects_table',1);
INSERT INTO migrations VALUES(62,'2025_07_06_050300_create_teacher_availability_table',1);
INSERT INTO migrations VALUES(63,'2025_07_06_050400_create_schedules_table',1);
INSERT INTO migrations VALUES(64,'2025_07_06_050500_create_schedule_sessions_table',1);
INSERT INTO migrations VALUES(65,'2025_07_06_050600_create_schedule_templates_table',1);
INSERT INTO migrations VALUES(66,'2025_07_06_060000_create_student_enrollments_table',1);
INSERT INTO migrations VALUES(67,'2025_07_06_060100_create_subject_enrollments_table',1);
INSERT INTO migrations VALUES(68,'2025_07_06_060200_create_attendance_records_table',1);
INSERT INTO migrations VALUES(69,'2025_07_06_060300_create_daily_attendance_summary_table',1);
INSERT INTO migrations VALUES(70,'2025_07_06_060400_create_absence_requests_table',1);
INSERT INTO migrations VALUES(71,'2025_07_06_060500_create_attendance_patterns_table',1);
INSERT INTO migrations VALUES(72,'2025_07_06_060600_create_attendance_reports_table',1);
INSERT INTO migrations VALUES(73,'2025_07_06_070000_create_academic_assessments_table',1);
INSERT INTO migrations VALUES(74,'2025_07_06_070100_create_assessment_participants_table',1);
INSERT INTO migrations VALUES(75,'2025_07_06_070200_create_teacher_certifications_table',1);
INSERT INTO migrations VALUES(76,'2025_07_06_070300_create_assessment_analytics_table',1);
INSERT INTO migrations VALUES(77,'2025_07_06_070400_create_competency_frameworks_table',1);
INSERT INTO migrations VALUES(78,'2025_07_06_080100_create_access_tracking_table',1);
INSERT INTO migrations VALUES(79,'2025_07_06_080200_create_security_incidents_table',1);
INSERT INTO migrations VALUES(80,'2025_07_06_080300_create_compliance_monitoring_table',1);
INSERT INTO migrations VALUES(81,'2025_07_06_080400_create_monitoring_dashboards_table',1);
INSERT INTO migrations VALUES(82,'2025_07_07_162022_create_system_configs_table',1);
INSERT INTO migrations VALUES(83,'2025_07_07_162028_create_report_schedules_table',1);
INSERT INTO migrations VALUES(84,'2025_07_08_063003_update_roles_table_structure',1);
INSERT INTO migrations VALUES(85,'2025_07_08_063237_update_permissions_table_structure',1);
INSERT INTO migrations VALUES(86,'2025_07_08_064529_add_last_login_at_to_user_devices_table',1);
INSERT INTO migrations VALUES(87,'2025_07_08_065919_add_timestamps_to_session_activities_table',1);
INSERT INTO migrations VALUES(88,'2025_07_08_092541_enhance_departments_table_with_types_and_metadata',1);
INSERT INTO migrations VALUES(89,'2025_07_08_101500_add_department_id_to_users_table',1);
INSERT INTO migrations VALUES(90,'2025_07_08_122908_add_password_change_required_to_users_table',1);
INSERT INTO migrations VALUES(91,'2025_07_08_122938_add_severity_to_security_events_table',1);

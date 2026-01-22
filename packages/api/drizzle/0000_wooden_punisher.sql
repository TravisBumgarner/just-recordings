CREATE TABLE "recordings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"duration" integer NOT NULL,
	"file_size" bigint NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"path" varchar(500) NOT NULL,
	"thumbnail_path" varchar(500),
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
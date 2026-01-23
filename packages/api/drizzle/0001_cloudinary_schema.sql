-- Rename path to video_url
ALTER TABLE "recordings" RENAME COLUMN "path" TO "video_url";
--> statement-breakpoint
-- Rename thumbnail_path to thumbnail_url
ALTER TABLE "recordings" RENAME COLUMN "thumbnail_path" TO "thumbnail_url";
--> statement-breakpoint
-- Add video_public_id column (required for Cloudinary deletion)
ALTER TABLE "recordings" ADD COLUMN "video_public_id" varchar(255) NOT NULL DEFAULT '';
--> statement-breakpoint
-- Add thumbnail_public_id column (optional)
ALTER TABLE "recordings" ADD COLUMN "thumbnail_public_id" varchar(255);
--> statement-breakpoint
-- Remove the default from video_public_id after adding it
ALTER TABLE "recordings" ALTER COLUMN "video_public_id" DROP DEFAULT;

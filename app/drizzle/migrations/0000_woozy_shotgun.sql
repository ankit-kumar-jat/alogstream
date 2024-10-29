CREATE SCHEMA "algostream_schema";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "algostream_schema"."passwords" (
	"hash" text NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "algostream_schema"."sessions" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "algostream_schema"."trade_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" varchar(256) DEFAULT 'ANGLEONE' NOT NULL,
	"name" varchar(256),
	"client_id" varchar(256) NOT NULL,
	"auth_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"feed_token" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "algostream_schema"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"email" varchar(256) NOT NULL,
	"is_email_verified" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "algostream_schema"."passwords" ADD CONSTRAINT "passwords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "algostream_schema"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "algostream_schema"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "algostream_schema"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "algostream_schema"."trade_accounts" ADD CONSTRAINT "trade_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "algostream_schema"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

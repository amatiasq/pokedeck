DO $$ BEGIN
 CREATE TYPE "public"."CardSupertype" AS ENUM('Energy', 'Pokémon', 'Trainer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Language" AS ENUM('EN', 'ES', 'PT', 'FR', 'DE', 'IT', 'JA', 'KO', 'ZH', 'XX');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Legality" AS ENUM('Unlimited', 'Expanded', 'Standard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"legality" "Legality" NOT NULL,
	"supertype" "CardSupertype",
	"subtypes" text[] NOT NULL,
	"set_id" text,
	"number" text,
	"img_thumb" text NOT NULL,
	"img_large" text NOT NULL,
	"more" json,
	CONSTRAINT "cards_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deck_cards" (
	"deck_id" integer NOT NULL,
	"card_id" text NOT NULL,
	"language" "Language" NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" integer NOT NULL,
	CONSTRAINT "decks_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"legality" "Legality" NOT NULL,
	"series" text NOT NULL,
	"printed_total" integer NOT NULL,
	"total" integer NOT NULL,
	"ptcgo_code" text,
	"release_date" date NOT NULL,
	"updated_at" timestamp NOT NULL,
	"img_symbol" text NOT NULL,
	"img_logo" text NOT NULL,
	CONSTRAINT "sets_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"salt" text NOT NULL,
	"hash" text NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

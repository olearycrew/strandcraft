CREATE TABLE "puzzles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(6) NOT NULL,
	"title" varchar(100) NOT NULL,
	"author" varchar(50) NOT NULL,
	"theme_clue" varchar(200) NOT NULL,
	"grid_letters" char(48) NOT NULL,
	"spangram_word" varchar(20) NOT NULL,
	"spangram_path" jsonb NOT NULL,
	"theme_words" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"completion_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "puzzles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "idx_puzzles_slug" ON "puzzles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_puzzles_created_at" ON "puzzles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_puzzles_like_count" ON "puzzles" USING btree ("like_count");--> statement-breakpoint
CREATE INDEX "idx_puzzles_completion_count" ON "puzzles" USING btree ("completion_count");
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedNews from "./newsSeeder.js";
import seedEvents from "./eventsSeeder.js";
import seedCategories from "./categoriesSeeder.js";
import logger from "../../utils/logger.js";

dotenv.config();

/**
 * Master Seeder - Runs all seeders in the correct order
 * Usage: npm run seed
 */

const runAllSeeders = async () => {
  const startTime = Date.now();

  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("   HUEACC Database Seeding");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  try {
    // Connect to MongoDB
    console.log("📊 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      "✅ Connected to MongoDB:",
      process.env.MONGODB_URI?.split("@")[1] || "database"
    );
    console.log("");

    // Track results
    const results = {
      categories: null,
      news: null,
      events: null,
      errors: [],
    };

    // Run seeders in order
    console.log("─────────────────────────────────────────────────────");
    console.log("1️⃣  Seeding Report Categories");
    console.log("─────────────────────────────────────────────────────");
    try {
      results.categories = await seedCategories();
    } catch (error) {
      console.error("❌ Categories seeding failed:", error.message);
      results.errors.push({ seeder: "categories", error: error.message });
    }
    console.log("");

    console.log("─────────────────────────────────────────────────────");
    console.log("2️⃣  Seeding News Articles");
    console.log("─────────────────────────────────────────────────────");
    try {
      results.news = await seedNews();
    } catch (error) {
      console.error("❌ News seeding failed:", error.message);
      results.errors.push({ seeder: "news", error: error.message });
    }
    console.log("");

    console.log("─────────────────────────────────────────────────────");
    console.log("3️⃣  Seeding Events");
    console.log("─────────────────────────────────────────────────────");
    try {
      results.events = await seedEvents();
    } catch (error) {
      console.error("❌ Events seeding failed:", error.message);
      results.errors.push({ seeder: "events", error: error.message });
    }
    console.log("");

    // Summary
    console.log("═══════════════════════════════════════════════════════");
    console.log("   Seeding Summary");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");

    if (results.categories) {
      console.log(
        `✅ Report Categories: ${results.categories.length || "Already seeded"}`
      );
    } else {
      console.log("ℹ️  Report Categories: Already exist or skipped");
    }

    if (results.news) {
      console.log(
        `✅ News Articles: ${results.news.length || "Already seeded"}`
      );
    } else {
      console.log("ℹ️  News Articles: Already exist or skipped");
    }

    if (results.events) {
      console.log(`✅ Events: ${results.events.length || "Already seeded"}`);
    } else {
      console.log("ℹ️  Events: Already exist or skipped");
    }

    console.log("");

    if (results.errors.length > 0) {
      console.log("⚠️  Errors encountered:");
      results.errors.forEach(({ seeder, error }) => {
        console.log(`   - ${seeder}: ${error}`);
      });
      console.log("");
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Completed in ${duration}s`);
    console.log("");

    // Close connection
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    console.log("");

    console.log("═══════════════════════════════════════════════════════");

    // Exit with appropriate code
    if (results.errors.length > 0) {
      console.log("⚠️  Seeding completed with errors");
      process.exit(1);
    } else {
      console.log("✅ All seeders completed successfully");
      process.exit(0);
    }
  } catch (error) {
    console.error("");
    console.log("═══════════════════════════════════════════════════════");
    console.error("❌ Fatal Error During Seeding");
    console.log("═══════════════════════════════════════════════════════");
    console.error("");
    console.error("Error:", error.message);
    console.error("");

    if (error.stack) {
      console.error("Stack trace:");
      console.error(error.stack);
    }

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error("Failed to close database connection:", closeError.message);
    }

    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllSeeders();
}

export default runAllSeeders;

import mongoose from "mongoose";
import dotenv from "dotenv";
import ReportCategory from "../../models/ReportCategory.js";
import logger from "../../utils/logger.js";

dotenv.config();

/**
 * Report Categories Seeder
 * Creates standard categories for anonymous reporting system
 */

const categoriesData = [
  {
    name: "Academic Misconduct",
    description:
      "Cheating, plagiarism, exam fraud, falsification of academic records, unauthorized collaboration, or other violations of academic integrity.",
    status: "ACTIVE",
    displayOrder: 1,
  },
  {
    name: "Financial Corruption",
    description:
      "Embezzlement, misappropriation of funds, unauthorized financial transactions, budget manipulation, or fraudulent financial reporting.",
    status: "ACTIVE",
    displayOrder: 2,
  },
  {
    name: "Nepotism",
    description:
      "Favoritism shown to relatives or friends in hiring, promotions, admissions, or other opportunities, especially when unqualified.",
    status: "ACTIVE",
    displayOrder: 3,
  },
  {
    name: "Bribery",
    description:
      "Offering, giving, receiving, or soliciting something of value to influence decisions, actions, or outcomes improperly.",
    status: "ACTIVE",
    displayOrder: 4,
  },
  {
    name: "Fraud",
    description:
      "Intentional deception for personal gain or to damage another, including identity fraud, document forgery, or false representation.",
    status: "ACTIVE",
    displayOrder: 5,
  },
  {
    name: "Abuse of Power",
    description:
      "Misuse of authority or position for personal benefit, harassment, intimidation, or to harm others unfairly.",
    status: "ACTIVE",
    displayOrder: 6,
  },
  {
    name: "Conflict of Interest",
    description:
      "Situations where personal interests interfere with professional duties, compromising objectivity in decision-making.",
    status: "ACTIVE",
    displayOrder: 7,
  },
];

/**
 * Seed report categories
 */
const seedCategories = async () => {
  try {
    console.log("🌱 Starting report categories seeding...");

    // Check if categories already exist
    const existingCategories = await ReportCategory.countDocuments();
    if (existingCategories > 0) {
      console.log(
        `ℹ️  Found ${existingCategories} existing categories. Skipping seed to prevent duplicates.`
      );
      console.log("   To reseed, delete existing categories first.");
      return;
    }

    // Insert categories
    const created = await ReportCategory.insertMany(categoriesData);

    console.log(`✅ Successfully seeded ${created.length} report categories`);
    created.forEach((cat) => {
      console.log(`   - ${cat.name}`);
    });

    return created;
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runSeeder = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("📊 Connected to MongoDB");

      await seedCategories();

      await mongoose.connection.close();
      console.log("👋 Database connection closed");
      process.exit(0);
    } catch (error) {
      console.error("Fatal error:", error);
      process.exit(1);
    }
  };

  runSeeder();
}

export default seedCategories;

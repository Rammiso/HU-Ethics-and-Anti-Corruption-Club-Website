import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../../models/Event.js";
import Admin from "../../models/Admin.js";
import logger from "../../utils/logger.js";

dotenv.config();

/**
 * Events Seeder - Creates realistic events (past and upcoming) for demo/production
 */

const createEventDate = (daysOffset, hours = 14, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const eventsData = [
  // Upcoming Events
  {
    title: "Ethics Awareness Week Opening Ceremony",
    description: `Join us for the grand opening of Ethics Awareness Week, a five-day series of events dedicated to promoting integrity and ethical conduct across the university.

The opening ceremony will feature:
- Keynote address by the University President
- Launch of the new Ethics Charter
- Student performance on the theme "Integrity in Action"
- Exhibition of student anti-corruption posters

This event marks the beginning of a week-long celebration of ethical values, with workshops, panel discussions, competitions, and community outreach activities planned throughout the week.

All students, faculty, and staff are warmly invited to attend. Light refreshments will be served.`,
    location: "Main University Auditorium, Building A",
    startDate: createEventDate(7, 9, 0),
    endDate: createEventDate(7, 11, 30),
    capacity: 500,
    eventType: "CONFERENCE",
    status: "PUBLISHED",
    tags: ["awareness", "ceremony", "ethics", "university-wide"],
    registrationRequired: true,
    registrationDeadline: createEventDate(5),
    contactEmail: "events@hueacc.edu.et",
    contactPhone: "+251-91-234-5678",
    featuredImage: {
      filename: "awareness-week.jpg",
      originalName: "https://source.unsplash.com/800x600/?ceremony,university",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
    agenda: [
      {
        time: "9:00 AM",
        activity: "Registration and Welcome",
        speaker: "HUEACC Team",
      },
      {
        time: "9:30 AM",
        activity: "Opening Remarks",
        speaker: "Club President",
      },
      {
        time: "10:00 AM",
        activity: "Keynote Address: Building an Ethical University",
        speaker: "University President",
      },
      {
        time: "10:45 AM",
        activity: "Launch of Ethics Charter",
        speaker: "Ethics Committee",
      },
      {
        time: "11:15 AM",
        activity: "Student Performance",
        speaker: "Drama Club",
      },
    ],
  },
  {
    title: "Corruption Case Studies Discussion Panel",
    description: `Join expert panelists for an engaging discussion analyzing real-world corruption cases and their implications for Ethiopia's development.

This interactive session will examine high-profile corruption cases from various sectors including public procurement, healthcare, education, and infrastructure. Panelists will discuss how these cases were uncovered, prosecuted, and what lessons can be learned for prevention.

The panel includes:
- Former federal prosecutor specializing in corruption cases
- Investigative journalist with experience exposing corruption
- Academic expert on anti-corruption strategies
- Civil society anti-corruption advocate

Audience participation is encouraged. Come prepared with questions and join the conversation about how we can create a corruption-free Ethiopia.`,
    location: "Ethics Center Conference Room",
    startDate: createEventDate(14, 14, 0),
    endDate: createEventDate(14, 17, 0),
    capacity: 80,
    eventType: "SEMINAR",
    status: "PUBLISHED",
    tags: ["case-studies", "discussion", "panel", "corruption"],
    registrationRequired: false,
    contactEmail: "seminars@hueacc.edu.et",
    featuredImage: {
      filename: "panel-discussion.jpg",
      originalName: "https://source.unsplash.com/800x600/?panel,discussion",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Academic Integrity Workshop for Graduate Students",
    description: `Essential workshop for graduate students covering research ethics, plagiarism prevention, proper citation practices, and maintaining integrity in academic work.

Topics covered:
- Understanding plagiarism and how to avoid it
- Proper citation methods (APA, Chicago, MLA)
- Research ethics and responsible conduct
- Managing authorship and collaboration
- Handling ethical dilemmas in research

This hands-on workshop includes practical exercises, case study analysis, and Q&A sessions with faculty advisors and ethics experts.

Certificate of completion will be provided to all participants who attend the full workshop.`,
    location: "Graduate School Computer Lab",
    startDate: createEventDate(21, 9, 0),
    endDate: createEventDate(21, 13, 0),
    capacity: 40,
    eventType: "WORKSHOP",
    status: "PUBLISHED",
    tags: [
      "workshop",
      "academic-integrity",
      "graduate-students",
      "research-ethics",
    ],
    registrationRequired: true,
    registrationDeadline: createEventDate(19),
    requirements:
      "Participants should bring laptops. Prior completion of Research Methods course recommended.",
    contactEmail: "workshops@hueacc.edu.et",
    featuredImage: {
      filename: "academic-workshop.jpg",
      originalName: "https://source.unsplash.com/800x600/?workshop,academic",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Integrity Pledge Signing for Student Leaders",
    description: `Formal ceremony for newly elected student leaders to sign the Haramaya University Integrity Pledge, committing to ethical leadership and transparency.

This solemn ceremony recognizes the crucial role of student leaders in promoting integrity across campus. Signatories commit to:
- Leading by example in ethical conduct
- Promoting transparency in student organizations
- Rejecting all forms of corruption and favoritism
- Supporting peers in making ethical choices
- Serving the student body with honesty and dedication

The ceremony will be followed by a leadership training session on ethical decision-making and accountability.

Family and friends are welcome to attend and witness this important commitment.`,
    location: "Student Union Main Hall",
    startDate: createEventDate(28, 15, 0),
    endDate: createEventDate(28, 17, 30),
    capacity: 200,
    eventType: "OTHER",
    status: "PUBLISHED",
    tags: ["integrity-pledge", "student-leaders", "ceremony", "leadership"],
    registrationRequired: true,
    registrationDeadline: createEventDate(26),
    contactEmail: "leaders@hueacc.edu.et",
    featuredImage: {
      filename: "pledge-signing.jpg",
      originalName: "https://source.unsplash.com/800x600/?ceremony,pledge",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: 'Anti-Corruption Film Night: "The Informant"',
    description: `Monthly film screening and discussion event featuring "The Informant," a gripping thriller based on true events about corporate fraud and whistleblowing.

The film follows a corporate executive who becomes a whistleblower, exposing massive price-fixing schemes while dealing with personal ethical compromises. It provides a nuanced look at the complexities of corruption and the courage required to expose it.

After the screening, join us for a panel discussion featuring:
- Legal expert on whistleblower protection
- Former corporate compliance officer
- Ethics professor

Free popcorn and refreshments will be provided. This event is part of our ongoing Anti-Corruption Film Series.`,
    location: "University Cinema Hall",
    startDate: createEventDate(35, 18, 30),
    endDate: createEventDate(35, 21, 30),
    capacity: 150,
    eventType: "OTHER",
    status: "PUBLISHED",
    tags: ["film", "whistleblower", "discussion", "awareness"],
    registrationRequired: false,
    contactEmail: "events@hueacc.edu.et",
    featuredImage: {
      filename: "film-night.jpg",
      originalName: "https://source.unsplash.com/800x600/?cinema,movie",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Ethics Training for Department Representatives",
    description: `Mandatory training session for department ethics representatives covering reporting procedures, confidentiality protocols, and conflict resolution.

This comprehensive training prepares department representatives to:
- Receive and document ethics concerns from students and faculty
- Maintain confidentiality appropriately
- Navigate the reporting and escalation process
- Provide initial guidance to concerned individuals
- Recognize situations requiring immediate intervention

Training materials and reference guides will be provided. Participants will receive certification upon completion.

Light lunch will be served.`,
    location: "Administration Building, Conference Room 3B",
    startDate: createEventDate(42, 10, 0),
    endDate: createEventDate(42, 15, 0),
    capacity: 30,
    eventType: "TRAINING",
    status: "PUBLISHED",
    tags: ["training", "representatives", "procedures", "confidentiality"],
    registrationRequired: true,
    registrationDeadline: createEventDate(40),
    requirements:
      "Must be officially designated department ethics representative",
    contactEmail: "training@hueacc.edu.et",
    featuredImage: {
      filename: "ethics-training.jpg",
      originalName:
        "https://source.unsplash.com/800x600/?training,professional",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },

  // Past Events (for credibility)
  {
    title: "Inaugural Anti-Corruption Summit",
    description: `Landmark event bringing together students, faculty, administrators, and community leaders to launch HUEACC and commit to building a culture of integrity.

The summit featured inspiring keynote addresses, breakout sessions on corruption challenges in different sectors, and collaborative development of action plans.

Over 400 participants attended, demonstrating strong community support for anti-corruption efforts. The summit resulted in the formation of departmental ethics committees and the commitment to regular integrity forums.`,
    location: "Main Hall, Building A",
    startDate: createEventDate(-120, 9, 0),
    endDate: createEventDate(-120, 17, 0),
    capacity: 400,
    eventType: "CONFERENCE",
    status: "PUBLISHED",
    tags: ["summit", "inaugural", "launch", "commitment"],
    registrationRequired: false,
    contactEmail: "archive@hueacc.edu.et",
    featuredImage: {
      filename: "inaugural-summit.jpg",
      originalName: "https://source.unsplash.com/800x600/?summit,conference",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Whistleblower Protection Legal Workshop",
    description: `Expert-led workshop on legal protections for whistleblowers in Ethiopia, featuring attorneys specializing in employment law and anti-corruption legislation.

Participants learned about their legal rights, reporting channels, protection mechanisms, and potential risks. The workshop included real case examples and practical advice for those considering reporting corruption.

Highly rated by attendees, with many requesting follow-up sessions.`,
    location: "Law School Auditorium",
    startDate: createEventDate(-75, 14, 0),
    endDate: createEventDate(-75, 17, 0),
    capacity: 100,
    eventType: "WORKSHOP",
    status: "PUBLISHED",
    tags: ["whistleblower", "legal", "protection", "workshop"],
    registrationRequired: true,
    contactEmail: "archive@hueacc.edu.et",
    featuredImage: {
      filename: "legal-workshop.jpg",
      originalName: "https://source.unsplash.com/800x600/?legal,workshop",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Community Outreach: High School Ethics Awareness",
    description: `HUEACC members visited three local high schools to conduct ethics awareness sessions with students and teachers.

The outreach program introduced students to concepts of academic integrity, ethical leadership, and corruption prevention. Interactive activities helped students understand the importance of integrity from an early age.

Teachers appreciated the age-appropriate materials and requested ongoing collaboration.`,
    location: "Local High Schools",
    startDate: createEventDate(-45, 8, 0),
    endDate: createEventDate(-45, 16, 0),
    capacity: 300,
    eventType: "OTHER",
    status: "PUBLISHED",
    tags: ["outreach", "high-school", "awareness", "community"],
    registrationRequired: false,
    contactEmail: "archive@hueacc.edu.et",
    featuredImage: {
      filename: "outreach-program.jpg",
      originalName: "https://source.unsplash.com/800x600/?students,school",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Ethics Essay Competition Award Ceremony",
    description: `Celebration honoring winners of the annual Ethics Essay Competition, with awards presented to top three finishers and recognition for all finalists.

Winners received scholarships, certificates, and publication opportunities. The ceremony featured readings from winning essays and remarks from judges.

The event celebrated academic excellence and ethical thinking among students.`,
    location: "Student Center Auditorium",
    startDate: createEventDate(-30, 16, 0),
    endDate: createEventDate(-30, 18, 30),
    capacity: 150,
    eventType: "OTHER",
    status: "PUBLISHED",
    tags: ["competition", "awards", "ceremony", "essays"],
    registrationRequired: false,
    contactEmail: "archive@hueacc.edu.et",
    featuredImage: {
      filename: "award-ceremony.jpg",
      originalName: "https://source.unsplash.com/800x600/?award,ceremony",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
];

/**
 * Seed events
 */
const seedEvents = async () => {
  try {
    console.log("🌱 Starting events seeding...");

    // Check if events already exist
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      console.log(
        `ℹ️  Found ${existingEvents} existing events. Skipping seed to prevent duplicates.`
      );
      console.log("   To reseed, delete existing events first.");
      return;
    }

    // Find or create a default admin for organizer field
    let admin = await Admin.findOne({ role: "SUPER_ADMIN" });

    if (!admin) {
      console.log(
        "⚠️  No admin found. Creating default admin for event organization..."
      );
      admin = await Admin.create({
        name: "HUEACC Events Team",
        email: "events@hueacc.edu.et",
        password: "ChangeThisPassword123!",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      });
      console.log("✅ Created default admin");
    }

    // Prepare events with organizer
    const events = eventsData.map((event) => ({
      ...event,
      organizer: admin._id,
      lastUpdatedBy: admin._id,
    }));

    // Insert events
    const created = await Event.insertMany(events);

    const upcoming = created.filter((e) => e.startDate > new Date()).length;
    const past = created.filter((e) => e.endDate < new Date()).length;

    console.log(`✅ Successfully seeded ${created.length} events`);
    console.log(`   Upcoming: ${upcoming} | Past: ${past}`);

    return created;
  } catch (error) {
    console.error("❌ Error seeding events:", error);
    throw error;
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runSeeder = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("📊 Connected to MongoDB");

      await seedEvents();

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

export default seedEvents;

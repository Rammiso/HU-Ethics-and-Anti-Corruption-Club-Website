import mongoose from "mongoose";
import dotenv from "dotenv";
import News from "../../models/News.js";
import Admin from "../../models/Admin.js";
import logger from "../../utils/logger.js";

dotenv.config();

/**
 * News Seeder - Creates realistic news articles for demo/production
 */

const newsData = [
  {
    title: "University Launches Comprehensive Ethics Training Program",
    content: `Haramaya University Ethics and Anti-Corruption Club (HUEACC) today announced the launch of a comprehensive ethics training program designed to promote integrity and ethical conduct among students, faculty, and staff.

The program, which will run throughout the academic year, covers key topics including academic integrity, professional ethics, conflict of interest management, and corruption prevention. Participants will engage in interactive workshops, case studies, and role-playing exercises to develop practical skills in ethical decision-making.

"This initiative represents our commitment to building a culture of integrity across the university," said the club coordinator. "We believe that ethical education is fundamental to producing graduates who will be responsible leaders in their communities."

The training program is open to all members of the university community and will be conducted in partnership with the National Ethics Bureau and international ethics organizations.`,
    excerpt:
      "HUEACC launches year-long ethics training program to promote integrity across the university community.",
    tags: ["ethics", "training", "education", "integrity"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "ethics-training.jpg",
      originalName: "https://source.unsplash.com/800x600/?education,ethics",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Anti-Corruption Workshop Records Record Attendance",
    content: `Over 300 students and faculty members participated in last week's Anti-Corruption Workshop, making it the most attended event in HUEACC's history.

The two-day workshop featured presentations from leading anti-corruption experts, government officials, and civil society representatives. Topics included corruption detection methods, whistleblower protection, investigative techniques, and legal frameworks for combating corruption.

Participants engaged in group discussions analyzing real-world corruption cases and developing strategies for prevention and response. The workshop also included a simulation exercise where students practiced reporting corruption in a safe, educational environment.

"The overwhelming turnout demonstrates the growing awareness and commitment to fighting corruption among our university community," noted one of the organizers. "Students are increasingly recognizing their role as future leaders in promoting transparency and accountability."

Follow-up sessions are planned for next month to continue the conversation and provide ongoing support to participants.`,
    excerpt:
      "Record 300+ attendees at HUEACC anti-corruption workshop learn detection methods and prevention strategies.",
    tags: ["workshop", "anti-corruption", "students", "education"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "workshop-attendance.jpg",
      originalName: "https://source.unsplash.com/800x600/?workshop,students",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "HUEACC Partners with National Ethics Bureau for Research Project",
    content: `The Haramaya University Ethics and Anti-Corruption Club has entered into a strategic partnership with the National Ethics Bureau to conduct groundbreaking research on corruption patterns in Ethiopian higher education institutions.

The 18-month research project will examine institutional vulnerabilities, ethical challenges, and best practices for promoting integrity in academic settings. The study will involve surveys, interviews, and case studies across multiple universities.

"This partnership brings together academic rigor and policy expertise," said a bureau representative. "The findings will inform national anti-corruption strategies and help universities strengthen their integrity frameworks."

HUEACC will lead the data collection and analysis components, while the Bureau will provide technical support and ensure the research meets international standards. Results are expected to be published in peer-reviewed journals and shared with educational policymakers.

The project is funded through a competitive grant from an international development organization.`,
    excerpt:
      "HUEACC and National Ethics Bureau collaborate on 18-month research project examining corruption in higher education.",
    tags: ["partnership", "research", "ethics-bureau", "higher-education"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "partnership-announcement.jpg",
      originalName:
        "https://source.unsplash.com/800x600/?partnership,handshake",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Student Leaders Sign Integrity Pledge in Landmark Ceremony",
    content: `In a historic ceremony attended by university administrators and community leaders, over 150 student leaders formally signed the Haramaya University Integrity Pledge, committing to uphold the highest standards of ethical conduct.

The pledge, developed collaboratively by HUEACC and student government, outlines specific commitments including rejecting all forms of corruption, promoting transparency in student organizations, and serving as role models for ethical behavior.

"Today marks a turning point in our university's culture," stated the student government president. "By signing this pledge, we're not just making a promise—we're joining a movement of young leaders dedicated to building an Ethiopia free from corruption."

The ceremony featured keynote speeches on the importance of integrity in leadership, musical performances by the university choir, and a panel discussion with alumni who have demonstrated exemplary ethical leadership in their careers.

Signatories will participate in quarterly integrity forums and receive ongoing ethics training throughout their tenure in leadership positions.`,
    excerpt:
      "150+ student leaders commit to ethical conduct by signing Haramaya University Integrity Pledge.",
    tags: ["integrity", "students", "leadership", "pledge"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "integrity-pledge.jpg",
      originalName: "https://source.unsplash.com/800x600/?ceremony,signing",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "New Anonymous Reporting System Empowers Students to Speak Up",
    content: `HUEACC has launched a state-of-the-art anonymous reporting system that allows students, faculty, and staff to report corruption and ethical violations safely and securely.

The digital platform features end-to-end encryption, anonymous tracking capabilities, and multi-language support. Users can submit reports with supporting evidence and track the status of their submissions without revealing their identity.

"Whistleblower protection is essential for effective anti-corruption efforts," explained the system administrator. "Our new platform ensures that anyone can report misconduct without fear of retaliation."

The system includes seven reporting categories covering academic misconduct, financial corruption, nepotism, bribery, fraud, abuse of power, and conflict of interest. Each report is reviewed by trained case managers who follow established protocols for investigation and resolution.

Since its launch three weeks ago, the system has already received and processed 45 reports, demonstrating its value to the university community.`,
    excerpt:
      "HUEACC launches secure anonymous reporting platform with encryption and tracking features.",
    tags: ["reporting", "technology", "whistleblower", "system-launch"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "reporting-system.jpg",
      originalName: "https://source.unsplash.com/800x600/?technology,security",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Ethics Essay Competition Attracts Submissions from 12 Universities",
    content: `The annual HUEACC Ethics Essay Competition has received a record 247 submissions from students across 12 Ethiopian universities, making it the largest academic integrity competition in the country.

This year's theme, "Building Ethical Leadership for Ethiopia's Future," challenged students to explore the role of personal integrity in national development. Essays addressed topics ranging from corruption in public service to ethical challenges in business and technology.

A distinguished panel of judges including university professors, ethics experts, and civil society leaders will review the submissions. Winners will be announced at the National Ethics Conference next month and will receive scholarships, publication opportunities, and internship placements.

"The quality and depth of thinking demonstrated in these essays is truly inspiring," said one of the judges. "These young scholars are not just writing about ethics—they're developing practical frameworks for ethical action."

The top 20 essays will be compiled into an edited volume to be distributed to universities and policymakers nationwide.`,
    excerpt:
      "Record 247 student essays from 12 universities compete on theme of ethical leadership.",
    tags: ["competition", "essays", "students", "scholarship"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "essay-competition.jpg",
      originalName: "https://source.unsplash.com/800x600/?writing,competition",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "HUEACC Hosts International Conference on Academic Integrity",
    content: `Haramaya University will host the East African Conference on Academic Integrity next semester, bringing together scholars, administrators, and students from across the region.

The three-day conference will feature keynote presentations from internationally recognized experts, panel discussions on emerging challenges, and workshops on implementing integrity frameworks. Topics will include plagiarism detection, examination security, research ethics, and creating cultures of academic honesty.

"Academic integrity is the foundation of quality higher education," said the conference organizer. "This event will provide a platform for sharing best practices and developing regional strategies for upholding academic standards."

The conference is expected to attract over 500 participants from universities in Ethiopia, Kenya, Uganda, Tanzania, and Rwanda. It will also include a student symposium where undergraduate and graduate students can present research on integrity-related topics.

Registration is now open for university faculty, administrators, and students interested in advancing academic integrity in their institutions.`,
    excerpt:
      "Haramaya University to host 500+ participants for East African Conference on Academic Integrity.",
    tags: ["conference", "international", "academic-integrity", "east-africa"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "international-conference.jpg",
      originalName:
        "https://source.unsplash.com/800x600/?conference,international",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "Monthly Integrity Forum Discusses Corruption in Public Procurement",
    content: `Last week's Monthly Integrity Forum tackled the complex issue of corruption in public procurement processes, with insights from government auditors, procurement specialists, and anti-corruption activists.

The forum examined common corruption schemes including bid rigging, kickbacks, conflict of interest, and price manipulation. Speakers shared case studies of procurement corruption and discussed technological solutions for increasing transparency.

"Public procurement represents one of the highest-risk areas for corruption," explained a guest speaker from the Auditor General's office. "Understanding these risks is essential for anyone who will work in public sector management."

Students engaged in lively discussion about preventive measures, including e-procurement systems, independent oversight, and whistleblower protections. The forum also addressed the role of civil society in monitoring public spending.

Next month's forum will focus on corruption in healthcare delivery, featuring speakers from the Ministry of Health and medical ethics organizations.`,
    excerpt:
      "Integrity forum explores procurement corruption with government auditors and anti-corruption experts.",
    tags: ["forum", "procurement", "corruption", "discussion"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "procurement-forum.jpg",
      originalName: "https://source.unsplash.com/800x600/?discussion,meeting",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title: "HUEACC Launches Ethics Mentorship Program for First-Year Students",
    content: `HUEACC has launched an innovative peer mentorship program connecting first-year students with upper-class mentors trained in ethical leadership and academic integrity.

The program pairs each first-year student with a mentor who provides guidance on navigating ethical challenges in university life, from maintaining academic honesty to resisting peer pressure and making ethical choices in student organizations.

"The transition to university presents many ethical challenges," noted the program coordinator. "Our mentors help new students develop the skills and confidence to make principled decisions."

Mentors undergo intensive training covering ethical frameworks, active listening, conflict resolution, and referral procedures for serious concerns. They meet with their mentees bi-weekly and are available for consultation throughout the semester.

Initial feedback has been overwhelmingly positive, with 94% of participating first-year students reporting that the mentorship has helped them better understand university expectations for ethical conduct.`,
    excerpt:
      "New peer mentorship program connects first-year students with ethics-trained upper-class mentors.",
    tags: ["mentorship", "students", "first-year", "peer-support"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "mentorship-program.jpg",
      originalName: "https://source.unsplash.com/800x600/?mentorship,students",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
  {
    title:
      'Anti-Corruption Film Series Begins with Screening of "The Whistleblower"',
    content: `HUEACC's new Anti-Corruption Film Series kicked off last night with a screening of "The Whistleblower," followed by a panel discussion on the challenges faced by individuals who expose corruption.

The film series, which will run monthly throughout the semester, uses cinema as a tool for exploring corruption issues and sparking dialogue. Each screening is followed by expert commentary and audience discussion.

"Films provide a powerful way to understand the human dimensions of corruption," explained the series curator. "They help us see beyond statistics and policies to the real people affected by corruption and those bravely fighting against it."

Over 200 students attended the opening screening, and the post-film discussion addressed topics including whistleblower protection laws, psychological costs of exposing corruption, and strategies for supporting whistleblowers.

Next month's screening will feature a documentary on corruption in natural resource extraction, with commentary from environmental activists and governance experts.`,
    excerpt:
      "Anti-Corruption Film Series launches with The Whistleblower screening and expert panel discussion.",
    tags: ["film-series", "whistleblower", "discussion", "awareness"],
    status: "PUBLISHED",
    featuredImage: {
      filename: "film-screening.jpg",
      originalName: "https://source.unsplash.com/800x600/?cinema,screening",
      mimeType: "image/jpeg",
      size: 0,
      uploadedAt: new Date(),
    },
  },
];

/**
 * Generate dates for news articles (mix of recent and older)
 */
const generatePublishDate = (index, total) => {
  const now = new Date();
  const daysAgo = Math.floor((index / total) * 180); // Spread over 6 months
  const publishDate = new Date(now);
  publishDate.setDate(publishDate.getDate() - daysAgo);
  return publishDate;
};

/**
 * Seed news articles
 */
const seedNews = async () => {
  try {
    console.log("🌱 Starting news seeding...");

    // Check if news already exist
    const existingNews = await News.countDocuments();
    if (existingNews > 0) {
      console.log(
        `ℹ️  Found ${existingNews} existing news articles. Skipping seed to prevent duplicates.`
      );
      console.log("   To reseed, delete existing news first.");
      return;
    }

    // Find or create a default admin for author field
    let admin = await Admin.findOne({ role: "SUPER_ADMIN" });

    if (!admin) {
      console.log(
        "⚠️  No admin found. Creating default admin for news authorship..."
      );
      // This is just for seeding - in production, admins should be created separately
      admin = await Admin.create({
        name: "HUEACC Editorial Team",
        email: "editorial@hueacc.edu.et",
        password: "ChangeThisPassword123!", // Should be changed immediately
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      });
      console.log("✅ Created default admin");
    }

    // Prepare news articles with generated dates and author
    const newsArticles = newsData.map((article, index) => ({
      ...article,
      author: admin._id,
      publishDate: generatePublishDate(index, newsData.length),
      lastUpdatedBy: admin._id,
    }));

    // Insert news articles
    const created = await News.insertMany(newsArticles);

    console.log(`✅ Successfully seeded ${created.length} news articles`);
    console.log(
      `   Date range: ${created[
        created.length - 1
      ].publishDate.toDateString()} to ${created[0].publishDate.toDateString()}`
    );

    return created;
  } catch (error) {
    console.error("❌ Error seeding news:", error);
    throw error;
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runSeeder = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("📊 Connected to MongoDB");

      await seedNews();

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

export default seedNews;

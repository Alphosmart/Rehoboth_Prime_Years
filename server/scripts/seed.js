require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const SiteSettings = require("../src/models/SiteSettings");
const HomepageContent = require("../src/models/HomepageContent");
const PageContent = require("../src/models/PageContent");
const BlogPost = require("../src/models/BlogPost");
const GalleryItem = require("../src/models/GalleryItem");
const Event = require("../src/models/Event");
const Testimonial = require("../src/models/Testimonial");
const StaffMember = require("../src/models/StaffMember");
const AcademicProgram = require("../src/models/AcademicProgram");
const AdmissionContent = require("../src/models/AdmissionContent");
const FAQ = require("../src/models/FAQ");

const placeholder = (text, bg = "7EA652", fg = "ffffff") => `https://placehold.co/1200x800/${bg}/${fg}?text=${encodeURIComponent(text)}`;

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    SiteSettings.deleteMany(),
    HomepageContent.deleteMany(),
    PageContent.deleteMany(),
    BlogPost.deleteMany(),
    GalleryItem.deleteMany(),
    Event.deleteMany(),
    Testimonial.deleteMany(),
    StaffMember.deleteMany(),
    AcademicProgram.deleteMany(),
    AdmissionContent.deleteMany(),
    FAQ.deleteMany()
  ]);

  await User.create({
    name: process.env.ADMIN_NAME || "School Admin",
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "ChangeMe123!"
  });

  await SiteSettings.create({
    schoolName: "Rehoboth Prime Years",
    motto: "Growing in wisdom and favour with God and Man",
    logo: "",
    favicon: "",
    primaryColor: "#00843D",
    secondaryColor: "#FFD200",
    email: "rehobothprimeyears@gmail.com",
    phone: "07034558581, 07015945362",
    whatsapp: "0703 455 8581",
    address: "Plot 115, Christine Nwuche Street Golden Spring Estate, Duboyi, FCT Abuja.",
    portalUrl: "https://rehobothprimeyears.dpa.ng/",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    googleMapEmbed: "",
    footerText: "A caring Abuja school where children grow in wisdom and favour with God and Man.",
    seoTitle: "Rehoboth Prime Years",
    seoDescription: "A warm Abuja school for early years, primary, and secondary learners, combining strong foundations, creativity, character, and family partnership."
  });

  await HomepageContent.create({
    heroTitle: "Every child known. Every talent strengthened.",
    heroSubtitle: "To passionately nurture future Christian leaders, equipped with academic excellence, grounded in faith, and committed to making a transformative impact on their communities and beyond",
    heroImage: placeholder("Rehoboth Prime Years"),
    heroSlides: [
      {
        title: "Every child known. Every talent strengthened.",
        subtitle: "Small-school warmth, purposeful teaching, and daily encouragement help learners grow with confidence.",
        image: placeholder("Known and Encouraged"),
        ctaLabel: "Start Admissions",
        ctaLink: "/admissions"
      },
      {
        title: "Foundations that make learning feel possible",
        subtitle: "Numeracy, literacy, science discovery, values, and creative expression are taught with patience and structure.",
        image: placeholder("Foundations"),
        ctaLabel: "Explore Academics",
        ctaLink: "/academics"
      },
      {
        title: "A school day full of discovery and care",
        subtitle: "Learners build friendships, practice responsibility, ask better questions, and celebrate progress in visible ways.",
        image: placeholder("Discovery and Care", "F5E011", "1B1B1B"),
        ctaLabel: "Visit Us",
        ctaLink: "/contact"
      }
    ],
    aboutPreview: "To passionately nurture future Christian leaders, equipped with academic excellence, grounded in faith, and committed to making a transformative impact on their communities and beyond",
    whyChooseUs: [
      { title: "Every learner is noticed", description: "Teachers track progress closely and respond early when a child needs support, stretch, or encouragement." },
      { title: "Strong foundations", description: "Reading, writing, numeracy, science, and values are taught through clear routines and practical activities." },
      { title: "Hands-on discovery", description: "Projects, learning games, presentations, and experiments help children connect lessons to real life." },
      { title: "Character in practice", description: "Learners practice courtesy, honesty, service, resilience, and responsibility in ordinary school moments." },
      { title: "Family partnership", description: "Parents receive practical communication and are invited into the child's growth journey." },
      { title: "Joyful school culture", description: "Celebrations, clubs, sports, reading, arts, and community events make school life memorable." }
    ],
    admissionsCtaTitle: "Come see how your child can grow here",
    admissionsCtaText: "Book a visit, meet the team, and let us help you choose the right entry pathway for your child."
  });

  await PageContent.create([
    {
      slug: "about",
      title: "About Rehoboth Prime Years",
      excerpt: "A nurturing Christian school community where children are known, guided, and encouraged to grow in faith, excellence, and purpose.",
      content: "<p>Rehoboth Prime Years was created for families who want more than routine schooling. We provide a warm, orderly, and purposeful environment where children build strong academic foundations, develop godly character, and discover the confidence to participate fully.</p><p>Our classrooms are intentionally personal. Teachers pay attention to how each learner thinks, communicates, solves problems, and relates with others. The result is a school culture that feels caring without losing structure, faith-filled without losing academic ambition, and purposeful without losing childhood joy.</p><p>These core values form the foundation of Rehoboth Prime Years and guide its approach to education and learners development</p>",
      mission: "We are dedicated to nurturing the spiritual, academic and personal growth of each child through the use of biblical-integrated curriculum, innovative teaching techniques, and cutting edge technology.",
      vision: "To passionately nurture future Christian leaders, equipped with academic excellence, grounded in faith, and committed to making a transformative impact on their communities and beyond",
      coreValues: ["Integrity and Character", "Nurturing Environment", "Academic Excellence", "Faith-Based Education", "Transformative Impact", "Leadership Development", "Community Engagement", "Discipleship"]
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: "We collect only the information needed to respond to enquiries, support admissions, and operate school services responsibly."
    }
  ]);

  await AdmissionContent.create({
    title: "Admissions",
    content: "Choosing a school is personal. Our admissions process is designed to help families understand the Rehoboth Prime Years environment and help the school understand each child's learning needs. Families are welcome to make enquiries, book a school visit, and speak with our admissions team before completing registration.",
    requirements: ["Completed application form", "Birth certificate", "Recent passport photograph", "Previous school records where available", "Parent or guardian contact information"],
    processSteps: [
      { title: "Enquire", description: "Call, message, or complete the contact form so the admissions team can guide you." },
      { title: "Visit", description: "Tour the school, ask questions, and meet members of the team." },
      { title: "Placement Review", description: "We review age, records, and readiness so each child starts in the right class." },
      { title: "Registration", description: "Submit required documents and complete the registration process." },
      { title: "Welcome", description: "New families receive orientation details and settling-in support." }
    ],
    ctaText: "Speak with admissions"
  });

  await AcademicProgram.create([
    { title: "Early Years", level: "Early Years", description: "Playful routines, phonics, number sense, social confidence, and gentle independence for young learners.", image: placeholder("Early Years"), order: 1 },
    { title: "Primary School", level: "Primary", description: "Core literacy, numeracy, science, social studies, values, creative work, and confidence-building presentations.", image: placeholder("Primary School"), order: 2 },
    { title: "Secondary School", level: "Secondary", description: "A structured pathway for independent study, problem-solving, leadership, technology, and future readiness.", image: placeholder("Secondary School"), order: 3 }
  ]);

  await BlogPost.create([
    {
      title: "Mathematics Day Builds Confidence",
      excerpt: "Learners explored numbers through games, puzzles, teamwork, and friendly challenges.",
      content: "<p>Our Mathematics Day helped learners see numeracy as something practical, playful, and useful. Activities included number games, shape work, dice challenges, and peer collaboration.</p>",
      featuredImage: placeholder("Mathematics Day"),
      category: "Campus Life",
      tags: ["mathematics", "learning"],
      author: "School Admin",
      status: "published"
    },
    {
      title: "Building a Steady Reading Culture",
      excerpt: "Short daily reading routines are helping pupils grow vocabulary, expression, and confidence.",
      content: "<p>Reading grows best when it becomes a rhythm. Our teachers use guided reading, vocabulary conversations, and class storytelling to help learners enjoy books and communicate better.</p>",
      featuredImage: placeholder("Reading Culture", "F5E011", "1B1B1B"),
      category: "Academics",
      tags: ["reading", "literacy"],
      author: "School Admin",
      status: "published"
    }
  ]);

  await GalleryItem.create([
    { title: "Mathematics Day", description: "Learning numbers through play and teamwork.", image: placeholder("Mathematics Day"), category: "Learning", featured: true },
    { title: "Reading Time", description: "Children building fluency and expression.", image: placeholder("Reading Time"), category: "Academics", featured: true },
    { title: "Creative Studio", description: "Art, colour, and imagination in action.", image: placeholder("Creative Studio", "F5E011", "1B1B1B"), category: "Creativity", featured: true }
  ]);

  await Event.create([
    { title: "Family Open Morning", date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), time: "10:00 AM", location: "School Campus", description: "Tour the school, meet the team, and ask admissions questions.", image: placeholder("Open Morning") },
    { title: "Young Innovators Showcase", date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40), time: "11:00 AM", location: "Main Hall", description: "Learners present creative projects, science ideas, and practical problem-solving work.", image: placeholder("Young Innovators", "F5E011", "1B1B1B") }
  ]);

  await StaffMember.create([
    { name: "Head of School", role: "Head of School", qualification: "School Leadership", biography: "The Head of School leads teaching quality, learner care, school culture, and partnership with families.", image: placeholder("Head of School"), order: 1 },
    { name: "Learning Lead", role: "Learning Lead", qualification: "Curriculum and Learner Support", biography: "The Learning Lead supports classroom routines, assessment, learner progress, and creative academic programmes.", image: placeholder("Learning Lead"), order: 2 }
  ]);

  await Testimonial.create([
    { name: "Rehoboth Prime Years Parent", role: "Parent", message: "The school feels personal. My child is seen, encouraged, and guided with patience.", image: placeholder("Parent") },
    { name: "Rehoboth Prime Years Learner", role: "Learner", message: "I like that we learn with activities, ask questions, and celebrate when we improve.", image: placeholder("Learner") }
  ]);

  await FAQ.create([
    { question: "How do I apply?", answer: "Contact admissions, book a visit, and complete the application form after speaking with the school team.", category: "Admissions", order: 1 },
    { question: "Can I book a school tour?", answer: "Yes. Families can schedule a visit through the contact form, WhatsApp, or a phone call.", category: "Admissions", order: 2 }
  ]);

  console.log("Seed completed");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

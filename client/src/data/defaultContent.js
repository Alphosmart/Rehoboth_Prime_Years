import mathDayImage from "../pages/public/assets/Images/imgi_8_484631177_18078833383729664_355856379700708766_n.jpg";
import logoAsset from "../pages/public/assets/logo.jpg";
import mainHeroImage from "../pages/public/assets/Images/Main Hero Image.jpeg";
import visionImage from "../pages/public/assets/Images/20260211_073700.jpg";
import missionImage from "../pages/public/assets/Images/IMG_8963.jpg";

const image = (text, bg = "7EA652", fg = "ffffff") => `https://placehold.co/1200x800/${bg}/${fg}?text=${encodeURIComponent(text)}`;
const apiOrigin = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api")).replace(/\/api\/?$/, "");
const upload = (filename) => `${apiOrigin}/uploads/${filename}`;
const logoUrl = logoAsset;

const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

export const defaultSettings = {
  schoolName: "Rehoboth Prime Years",
  motto: "Growing in wisdom and favour with God and Man",
  logo: logoUrl,
  favicon: logoUrl,
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
  footerText: "A caring school in Abuja where children grow in wisdom and favour with God and Man.",
  seoTitle: "Rehoboth Prime Years",
  seoDescription: "A warm Abuja school for early years, primary, and secondary learners, combining strong foundations, creativity, character, and family partnership."
};

export const defaultHomepage = {
  heroTitle: "Rehoboth Prime Years",
  heroSubtitle: "To passionately nurture future Christian leaders, equipped with academic excellence, grounded in faith, and committed to making a transformative impact on their communities and beyond",
  heroImage: mainHeroImage,
  heroMedia: mainHeroImage,
  heroMediaType: "image",
  heroMediaActive: true,
  heroSlides: [
    {
      title: "Rehoboth Prime Years",
      subtitle: "Growing in wisdom and favour with God and Man.",
      media: mainHeroImage,
      mediaType: "image",
      image: mainHeroImage,
      isActive: true,
      ctaLabel: "Start Admissions",
      ctaLink: "/admissions"
    },
    {
      title: "Our Vision",
      subtitle: "To passionately nurture future Christian leaders, equipped with academic excellence, grounded in faith, and committed to making a transformative impact on their communities and beyond.",
      media: visionImage,
      mediaType: "image",
      image: visionImage,
      isActive: true,
      ctaLabel: "About Us",
      ctaLink: "/about"
    },
    {
      title: "Our Mission",
      subtitle: "We are dedicated to nurturing the spiritual, academic and personal growth of each child through the use of biblical-integrated curriculum, innovative teaching techniques, and cutting edge technology.",
      media: missionImage,
      mediaType: "image",
      image: missionImage,
      isActive: true,
      ctaLabel: "Explore Academics",
      ctaLink: "/academics"
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
};

export const defaultAcademics = [
  { _id: "default-academics-early-years", title: "Early Years", level: "Early Years", description: "Playful routines, phonics, number sense, social confidence, and gentle independence for young learners.", image: image("Early Years"), curriculum: ["Playgroup", "Prenursery", "Nursery 1", "Nursery 2"] },
  { _id: "default-academics-primary", title: "Primary School", level: "Primary", description: "Core literacy, numeracy, science, social studies, values, creative work, and confidence-building presentations.", image: image("Primary School"), curriculum: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"] },
  { _id: "default-academics-junior-secondary", title: "Junior Secondary", level: "Junior Secondary", description: "A broad foundation across core subjects that builds study skills, discipline, and confidence through Grades 7 to 9.", image: image("Junior Secondary"), curriculum: ["Grade 7", "Grade 8", "Grade 9"] },
  { _id: "default-academics-senior-secondary", title: "Senior Secondary", level: "Senior Secondary", description: "A focused pathway for specialisation, examinations, leadership, and readiness for higher education through Grades 10 to 12.", image: image("Senior Secondary"), curriculum: ["Grade 10", "Grade 11", "Grade 12"] }
];

export const defaultAdmissions = {
  title: "Admissions",
  content: "<p>Choosing a school is personal. Our admissions process is designed to help families understand the Rehoboth Prime Years environment and help the school understand each child's learning needs.</p><p>Families are welcome to make enquiries, book a school visit, and speak with our admissions team before completing registration.</p>",
  requirements: ["Completed application form", "Birth certificate", "Recent passport photograph", "Previous school records", "Parent or guardian contact information"],
  processSteps: [
    { title: "Enquire", description: "Call, message, or complete the contact form so the admissions team can guide you." },
    { title: "Visit", description: "Tour the school, ask questions, and meet members of the team." },
    { title: "Placement Test and Review", description: "The child sits a placement test which we review alongside age and readiness so each child starts in the right class." },
    { title: "Registration", description: "Submit required documents and complete the registration process." },
    { title: "Welcome", description: "New families receive orientation details and settling-in support." }
  ],
  ctaText: "Speak with admissions"
};

export const defaultPages = {
  about: {
    title: "About Rehoboth Prime Years",
    excerpt: "A nurturing Christian school community where children are known, guided, and encouraged to grow in faith, excellence, and purpose.",
    content: "<p>Rehoboth Prime Years was created for families who want more than routine schooling. We provide a warm, orderly, and purposeful environment where children build strong academic foundations, develop godly character, and discover the confidence to participate fully.</p><p>Our classrooms are intentionally personal. Teachers pay attention to how each learner thinks, communicates, solves problems, and relates with others. The result is a school culture that feels caring without losing structure, faith-filled without losing academic ambition, and purposeful without losing childhood joy.</p><p>These core values form the foundation of Rehoboth Prime Years and guide its approach to education and learners development</p>",
    mission: "We are dedicated to nurturing the spiritual, academic and personal growth of each child through the use of biblical-integrated curriculum, innovative teaching techniques, and cutting edge technology.",
    vision: "To passionately nurture future Christian leaders, equipped with academic excellence, grounded in faith, and committed to making a transformative impact on their communities and beyond",
    coreValues: ["Integrity and Character", "Nurturing Environment", "Academic Excellence", "Faith-Based Education", "Transformative Impact", "Leadership Development", "Community Engagement", "Discipleship"]
  },
  "privacy-policy": {
    title: "Privacy Policy",
    content: "We collect only the information needed to respond to enquiries, support admissions, and operate school services responsibly."
  }
};

export const defaultBlogs = [
  {
    _id: "default-blog-maths-day",
    slug: "mathematics-day-builds-confidence",
    title: "Mathematics Day Builds Confidence",
    excerpt: "Learners explored numbers through games, puzzles, teamwork, and friendly challenges.",
    content: "<p>Our Mathematics Day helped learners see numeracy as something practical, playful, and useful. Activities included number games, shape work, dice challenges, and peer collaboration.</p>",
    featuredImage: mathDayImage,
    category: "Campus Life",
    author: "School Admin",
    status: "published",
    createdAt: new Date().toISOString()
  },
  {
    _id: "default-blog-reading-culture",
    slug: "building-a-steady-reading-culture",
    title: "Building a Steady Reading Culture",
    excerpt: "Short daily reading routines are helping pupils grow vocabulary, expression, and confidence.",
    content: "<p>Reading grows best when it becomes a rhythm. Our teachers use guided reading, vocabulary conversations, and class storytelling to help learners enjoy books and communicate better.</p>",
    featuredImage: image("Reading Culture", "F5E011", "1B1B1B"),
    category: "Academics",
    author: "School Admin",
    status: "published",
    createdAt: new Date().toISOString()
  }
];

export const defaultGallery = [
  { _id: "default-gallery-maths-day", title: "Mathematics Day", description: "Learning numbers through play and teamwork.", image: mathDayImage, category: "Learning", featured: true },
  { _id: "default-gallery-reading", title: "Reading Time", description: "Children building fluency and expression.", image: image("Reading Time"), category: "Academics", featured: true },
  { _id: "default-gallery-creativity", title: "Creative Studio", description: "Art, colour, and imagination in action.", image: image("Creative Studio", "F5E011", "1B1B1B"), category: "Creativity", featured: true }
];

export const defaultEvents = [
  { _id: "default-event-open-morning", slug: "open-morning", title: "Family Open Morning", date: futureDate(14), time: "10:00 AM", location: "School Campus", description: "<p>Tour the school, meet the team, and ask admissions questions.</p>", image: image("Open Morning") },
  { _id: "default-event-young-innovators", slug: "young-innovators-showcase", title: "Young Innovators Showcase", date: futureDate(40), time: "11:00 AM", location: "Main Hall", description: "<p>Learners present creative projects, science ideas, and practical problem-solving work.</p>", image: image("Young Innovators", "F5E011", "1B1B1B") }
];

export const defaultTestimonials = [
  { _id: "default-testimonial-parent", name: "Rehoboth Prime Years Parent", role: "Parent", message: "The school feels personal. My child is seen, encouraged, and guided with patience." },
  { _id: "default-testimonial-student", name: "Rehoboth Prime Years Learner", role: "Learner", message: "I like that we learn with activities, ask questions, and celebrate when we improve." }
];

export const defaultStaff = [
  { _id: "default-staff-head", name: "Head of School", role: "Head of School", qualification: "School Leadership", biography: "The Head of School leads teaching quality, learner care, school culture, and partnership with families.", image: image("Head of School") },
  { _id: "default-staff-learning-lead", name: "Learning Lead", role: "Learning Lead", qualification: "Curriculum and Learner Support", biography: "The Learning Lead supports classroom routines, assessment, learner progress, and creative academic programmes.", image: image("Learning Lead") }
];

export const defaultFaqs = [
  { _id: "default-faq-apply", question: "How do I apply?", answer: "Contact admissions, book a visit, and complete the application form after speaking with the school team.", category: "Admissions" },
  { _id: "default-faq-tour", question: "Can I book a school tour?", answer: "Yes. Families can schedule a visit through the contact form, WhatsApp, or a phone call.", category: "Admissions" }
];

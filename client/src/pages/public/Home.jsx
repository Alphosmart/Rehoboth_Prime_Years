import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  MapPin,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import http from "../../api/http";
import { useApi } from "../../hooks/useApi";
import Loader from "../../components/public/Loader";
import ErrorMessage from "../../components/public/ErrorMessage";
import SectionTitle from "../../components/public/SectionTitle";
import { BlogCard, EventCard, GalleryCard, TestimonialCard } from "../../components/public/Cards";
import ContactForm from "../../components/public/ContactForm";
import MediaPreview from "../../components/MediaPreview";
import { setSeo } from "../../utils/seo";
import { detectMediaType } from "../../utils/media";
import {
  defaultAcademics,
  defaultBlogs,
  defaultEvents,
  defaultGallery,
  defaultHomepage,
  defaultTestimonials
} from "../../data/defaultContent";

const quickLinks = [
  {
    title: "Admissions",
    text: "Visit the school, ask practical questions, and choose the right entry path for your child.",
    to: "/admissions"
  },
  {
    title: "Our Story",
    text: "A caring Abuja school community built around attention, structure, confidence, and family trust.",
    to: "/about"
  },
  {
    title: "Learning Pathways",
    text: "Early years, primary, and secondary programmes shaped around strong foundations and growing independence.",
    to: "/academics"
  },
  {
    title: "Student Life",
    text: "Clubs, creative work, sports, values, presentations, and celebrations make each term feel alive.",
    to: "#student-life"
  }
];

const quickLinkAccents = ["bg-schoolGreen", "bg-schoolBlue", "bg-accent", "bg-schoolRed"];

const values = [
  "Integrity and Character",
  "Nurturing Environment",
  "Academic Excellence",
  "Faith-Based Education",
  "Transformative Impact",
  "Leadership Development",
  "Community Engagement",
  "Discipleship"
];

const visionStatement = "To passionately nurture future Christian leaders, equipped with academic excellence, grounded in faith, and committed to making a transformative impact on their communities and beyond";
const missionStatement = "We are dedicated to nurturing the spiritual, academic and personal growth of each child through the use of biblical-integrated curriculum, innovative teaching techniques, and cutting edge technology.";
const coreValuesIntro = "These core values form the foundation of Rehoboth Prime Years and guide its approach to education and learners development";

const heroStats = [
  { value: "Early Years - Secondary", label: "learning pathway" },
  { value: "Family-first", label: "admissions support" },
  { value: "Hands-on", label: "classroom rhythm" }
];

const learningPillars = [
  {
    icon: BookOpen,
    title: "Foundation before speed",
    text: "Children build fluency in reading, writing, numeracy, and communication before being rushed ahead."
  },
  {
    icon: Lightbulb,
    title: "Discovery in every week",
    text: "Practical tasks, projects, games, and experiments make learning easier to remember and explain."
  },
  {
    icon: HeartHandshake,
    title: "Character in ordinary moments",
    text: "Courtesy, resilience, service, and responsibility are practiced through everyday school routines."
  }
];

const admissionsSteps = [
  "Make an enquiry or book a school visit.",
  "Tour the school and speak with the admissions team.",
  "Share the child's records and basic learning information.",
  "Complete the placement review and registration documents.",
  "Receive orientation details and settling-in support."
];

const subjects = ["Phonics and literacy", "Numeracy", "Science discovery", "Social studies", "Bible and values", "ICT foundations", "Creative arts"];
const activities = ["Creative studio", "Music and movement", "Sports and wellness", "Reading circles", "STEM play", "Class presentations"];
const schoolEvents = ["Mathematics discovery day", "Family open morning", "Book and reading week", "Cultural showcase", "Young innovators fair", "Thanksgiving and awards celebration"];
const IMAGE_SLIDE_MS = 6500;
const VIDEO_FALLBACK_MS = 45000;

function normalizeHeroSlide(slide = {}) {
  const media = slide.media || slide.video || slide.image || "";
  const mediaType = slide.mediaType || (slide.video ? "video" : "image");
  return { ...slide, media, mediaType };
}

export default function Home() {
  const { settings } = useOutletContext();
  const [activeSlide, setActiveSlide] = useState(0);
  const home = useApi(() => http.get("/homepage"), [], { cacheKey: "homepage", fallbackData: defaultHomepage });
  const blogs = useApi(() => http.get("/blogs?status=published"), [], { cacheKey: "blogs-published", fallbackData: defaultBlogs });
  const gallery = useApi(() => http.get("/gallery"), [], { cacheKey: "gallery", fallbackData: defaultGallery });
  const events = useApi(() => http.get("/events"), [], { cacheKey: "events", fallbackData: defaultEvents });
  const testimonials = useApi(() => http.get("/testimonials?active=true"), [], { cacheKey: "testimonials-active", fallbackData: defaultTestimonials });
  const academics = useApi(() => http.get("/academics?active=true"), [], { cacheKey: "academics-active", fallbackData: defaultAcademics });

  const data = home.data || defaultHomepage;
  const heroSlides = useMemo(() => {
    const slides = Array.isArray(data.heroSlides) ? data.heroSlides.map(normalizeHeroSlide).filter((slideItem) => slideItem.isActive !== false && (slideItem.title || slideItem.subtitle || slideItem.media)) : [];
    const primarySlide = normalizeHeroSlide({
      title: data.heroTitle,
      subtitle: data.heroSubtitle,
      media: data.heroMediaActive === false ? "" : data.heroMedia || data.heroVideo || data.heroImage,
      mediaType: data.heroMediaType || (data.heroVideo ? "video" : "image"),
      image: data.heroImage,
      ctaLabel: "Start Admissions",
      ctaLink: "/admissions"
    });
    if (primarySlide.media) {
      const firstSlide = slides[0];
      if (firstSlide && firstSlide.title === primarySlide.title && firstSlide.media === primarySlide.media) return slides;
      return [primarySlide, ...slides];
    }
    if (slides.length > 0) return slides;
    return [primarySlide];
  }, [data]);
  const slide = heroSlides[activeSlide] || heroSlides[0] || {};
  const slideMediaValue = slide.media || slide.image || "https://placehold.co/1600x900";
  const slideMediaType = slide.media ? detectMediaType(slide.media, slide.mediaType) : "image";

  useEffect(() => {
    setActiveSlide(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;
    if (slideMediaType === "video" && slide.media) {
      const timer = window.setTimeout(() => {
        setActiveSlide((current) => (current + 1) % heroSlides.length);
      }, VIDEO_FALLBACK_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, IMAGE_SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [heroSlides.length, slide.media, slideMediaType]);

  function goToSlide(index) {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  }

  setSeo(data.seoTitle || settings?.seoTitle, data.seoDescription || settings?.seoDescription);

  if (home.loading) return <Loader />;
  if (home.error) return <ErrorMessage message={home.error} />;

  return (
    <>
      <section className="relative overflow-hidden bg-[#24391d] text-white">
        <div className="absolute inset-0">
          <MediaPreview
            value={slideMediaValue}
            mediaType={slideMediaType}
            className="h-full w-full object-cover opacity-60 transition-opacity duration-500"
            title={`${slide.title || "Hero"} media`}
            background
            poster={slide.image}
            onEnded={() => {
              if (heroSlides.length > 1) goToSlide(activeSlide + 1);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b1b]/90 via-[#00843d]/75 to-[#ffd200]/25" />
        </div>
        <div className="container-pad relative flex min-h-[680px] items-center py-20">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-accent">
              {settings?.motto || "Growing in wisdom and favour with God and Man"}
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">{slide.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">{slide.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn bg-accent text-[#1B1B1B] hover:bg-[#fff36a]" to={slide.ctaLink || "/admissions"}>
                {slide.ctaLabel || "Start Admissions"} <ArrowRight size={18} />
              </Link>
              <Link className="btn border border-white/50 bg-white/10 text-white hover:bg-white/20" to="/academics">Explore learning</Link>
            </div>
            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur" key={item.value}>
                  <p className="text-base font-black text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          {heroSlides.length > 1 && (
            <>
              <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
                {heroSlides.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.title}-${index}`}
                    className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Show slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="absolute bottom-7 right-4 flex gap-2 sm:right-6 lg:right-8">
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/10 text-white hover:bg-white/20" onClick={() => goToSlide(activeSlide - 1)} aria-label="Previous slide"><ChevronLeft size={20} /></button>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/10 text-white hover:bg-white/20" onClick={() => goToSlide(activeSlide + 1)} aria-label="Next slide"><ChevronRight size={20} /></button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-accent/15 py-12">
        <div className="container-pad grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Our Difference</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Small-school warmth with purposeful direction.</h2>
          </div>
          <p className="text-lg leading-8 text-slate-700">
            Children do better when they are known by name, guided with structure, and invited to think, create, speak, serve, and try again. That is the daily rhythm we are building at Rehoboth Prime Years.
          </p>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionTitle eyebrow="Welcome" title="A more personal kind of school day" text={data.aboutPreview} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item, index) => (
            <Link className="card group p-6 transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-md" to={item.to} key={item.title}>
              <div className={`mb-5 h-1.5 w-12 rounded-full ${quickLinkAccents[index % quickLinkAccents.length]} transition group-hover:w-20`} />
              <h3 className="font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-pad grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-accent/60 bg-accent/20 p-8">
            <div className="flex items-center gap-3"><Sparkles className="text-accent" /><h2 className="text-3xl font-black text-slate-950">OUR VISION</h2></div>
            <p className="mt-4 leading-7 text-slate-700">
              {visionStatement}
            </p>
          </div>
          <div className="rounded-lg bg-brand p-8 text-white">
            <div className="flex items-center gap-3"><ShieldCheck /><h2 className="text-3xl font-black">OUR MISSION</h2></div>
            <p className="mt-4 max-w-3xl leading-7 text-white/90">
              {missionStatement}
            </p>
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionTitle eyebrow="Learning Model" title="Structure, discovery, and character in one rhythm" />
        <div className="grid gap-5 md:grid-cols-3">
          {learningPillars.map((item) => {
            const Icon = item.icon;
            return (
              <div className="card p-6" key={item.title}>
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-schoolLime/25 text-brand"><Icon /></div>
                <h3 className="mt-5 text-lg font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-pad">
          <SectionTitle title="Core Values" text={coreValuesIntro} />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={value}>
                <Compass className="text-schoolBlue" />
                <h3 className="mt-4 text-lg font-bold text-slate-950">{value}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionTitle eyebrow="Admissions" title="A simple, family-friendly process" text="The admissions process helps families understand the school and helps our team understand each child's needs." />
        <div className="grid gap-4 md:grid-cols-5">
          {admissionsSteps.map((step, index) => (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={step}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">{index + 1}</span>
              <p className="mt-4 text-sm leading-6 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Why Families Choose Us" title="A school experience that feels attentive and alive" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.whyChooseUs?.map((item) => (
              <div className="card p-6" key={item.title}>
                <CheckCircle2 className="text-brand" />
                <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionTitle eyebrow="Academics" title="Programmes designed for steady growth" text="Learners move from playful foundations to independent study through a pathway that values mastery, curiosity, and confidence." />
        <div className="grid gap-5 md:grid-cols-3">
          {academics.data?.slice(0, 3).map((p) => (
            <div className="card overflow-hidden" key={p._id}>
              <img src={p.image || "https://placehold.co/800x500"} className="h-44 w-full object-cover" alt="" />
              <div className="p-5">
                <p className="text-sm font-semibold text-accent">{p.level}</p>
                <h3 className="mt-1 font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center gap-3"><BookOpen className="text-brand" /><h3 className="text-xl font-bold">Core Learning Areas</h3></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {subjects.map((subject) => <span className="rounded-md bg-schoolLime/25 px-3 py-2 text-sm font-medium text-brand" key={subject}>{subject}</span>)}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3"><GraduationCap className="text-brand" /><h3 className="text-xl font-bold">Beyond the Classroom</h3></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {activities.map((activity) => <span className="rounded-md bg-accent/20 px-3 py-2 text-sm font-medium text-[#6b5f00]" key={activity}>{activity}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <div className="flex flex-col justify-between gap-6 rounded-lg bg-[#24391d] p-8 text-white md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Admissions</p>
            <h2 className="mt-2 text-3xl font-bold">{data.admissionsCtaTitle}</h2>
            <p className="mt-2 max-w-2xl text-white/85">{data.admissionsCtaText}</p>
          </div>
          <Link className="btn bg-accent text-[#1B1B1B] hover:bg-[#fff36a]" to="/admissions">Apply now <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="bg-white py-16" id="student-life">
        <div className="container-pad grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionTitle eyebrow="Student Life" title="A school week with texture" text="Children need more than lessons on a timetable. They need moments to present, make, move, read, serve, and belong." />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Palette, title: "Creative expression", text: "Art, music, storytelling, and presentations help learners find their voice." },
              { icon: UsersRound, title: "Belonging", text: "Class routines, mentorship, and peer activities build friendship and confidence." },
              { icon: CalendarDays, title: "Memorable events", text: "Termly showcases and celebrations make progress visible to families." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="card p-6" key={item.title}>
                  <Icon className="text-brand" />
                  <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionTitle eyebrow="School Calendar" title="Community life through the year" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {schoolEvents.map((event) => <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700" key={event}>{event}</div>)}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="News" title="Latest updates" />
          <div className="grid gap-5 md:grid-cols-3">{blogs.data?.slice(0, 3).map((post) => <BlogCard key={post._id} post={post} />)}</div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionTitle eyebrow="Gallery" title="Learning moments and campus life" />
        <div className="grid gap-5 md:grid-cols-3">{gallery.data?.filter((g) => g.featured).slice(0, 3).map((item) => <GalleryCard key={item._id} item={item} />)}</div>
      </section>

      <section className="bg-white py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Events" title="Upcoming events" />
          <div className="grid gap-5 md:grid-cols-2">{events.data?.slice(0, 2).map((event) => <EventCard key={event._id} event={event} />)}</div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionTitle eyebrow="Families" title="What our community says" />
        <div className="grid gap-5 md:grid-cols-2">{testimonials.data?.slice(0, 2).map((item) => <TestimonialCard key={item._id} item={item} />)}</div>
      </section>

      <section className="bg-white py-16">
        <div className="container-pad grid gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Contact" title="Talk to the school" text="Send a message and our team will respond promptly." />
            <div className="mt-6 grid gap-4 text-sm text-slate-700">
              {settings?.address && <p className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" />{settings.address}</p>}
              {settings?.phone && <p className="flex gap-3"><Phone className="mt-1 h-5 w-5 shrink-0 text-brand" />{settings.phone}</p>}
              <p className="font-medium text-brand">{settings?.email || "rehobothprimeyears@gmail.com"}</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

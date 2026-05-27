import ResourceManager from "../../components/admin/ResourceManager";

const mediaDescription = "Upload a file, paste a direct image/video link, or paste a YouTube or Vimeo link.";
const seoTitleDescription = "Optional. This is the title Google may show for this page. Keep it clear and under 60 characters.";
const seoDescriptionDescription = "Optional. This is the short sentence Google may show under the title. Aim for 140-160 characters.";
const seoFields = (group = "Search Preview") => [
  { name: "seoTitle", label: "SEO title", description: seoTitleDescription, group },
  { name: "seoDescription", label: "SEO description", type: "textarea", description: seoDescriptionDescription, group }
];

export const settingsFields = [
  { name: "schoolName", label: "School name" }, { name: "motto", label: "Motto" }, { name: "logo", label: "Logo", type: "image" }, { name: "email", label: "Email" }, { name: "phone", label: "Phone" },
  { name: "whatsapp", label: "WhatsApp" }, { name: "address", label: "Address", type: "textarea" }, { name: "portalUrl", label: "Parent/student portal URL" }, { name: "facebookUrl", label: "Facebook URL" },
  { name: "instagramUrl", label: "Instagram URL" }, { name: "youtubeUrl", label: "YouTube URL" },
  { name: "footerText", label: "Footer text", type: "textarea" },
  ...seoFields()
];

export const homepageFields = [
  { name: "heroTitle", label: "Hero title", group: "Main Hero" }, { name: "heroSubtitle", label: "Hero subtitle", type: "textarea", group: "Main Hero" }, { name: "heroMedia", label: "Hero media", type: "media", mediaTypeField: "heroMediaType", description: mediaDescription, group: "Main Hero" }, { name: "heroMediaActive", label: "Show main hero media", type: "checkbox", defaultValue: true, group: "Main Hero" },
  { name: "heroSlides", label: "Hero carousel slides", type: "repeatable", group: "Hero Carousel", fields: [{ name: "isActive", label: "Show slide", type: "checkbox", defaultValue: true }, { name: "title", label: "Title" }, { name: "subtitle", label: "Subtitle", type: "textarea" }, { name: "media", label: "Media", type: "media", mediaTypeField: "mediaType", description: mediaDescription }, { name: "ctaLabel", label: "Button label" }, { name: "ctaLink", label: "Button link" }] },
  { name: "aboutPreview", label: "About preview", type: "textarea", group: "About Preview" },
  { name: "whyChooseUs", label: "Why Choose Us items", type: "repeatable", group: "Why Choose Us", fields: [{ name: "title", label: "Title" }, { name: "description", label: "Description", type: "textarea" }] },
  { name: "admissionsCtaTitle", label: "Admissions CTA title", group: "Admissions CTA" }, { name: "admissionsCtaText", label: "Admissions CTA text", type: "textarea", group: "Admissions CTA" },
  ...seoFields()
];

export const blogFields = [
  { name: "title", label: "Title" }, { name: "excerpt", label: "Short summary", type: "textarea", description: "A brief introduction shown on blog cards and used as a fallback search description." }, { name: "content", label: "Content", type: "richtext" },
  { name: "featuredImage", label: "Featured image", type: "image" }, { name: "category", label: "Category" }, { name: "author", label: "Author" },
  { name: "status", label: "Status", type: "select", options: ["draft", "published"], defaultValue: "draft", description: "Choose draft while working. Choose published when visitors should see it." },
  ...seoFields()
];

export const galleryFields = [{ name: "title", label: "Title", required: true }, { name: "description", label: "Description", type: "textarea" }, { name: "image", label: "Image", type: "image", required: true }, { name: "category", label: "Category" }, { name: "featured", label: "Featured", type: "checkbox" }];
export const eventFields = [{ name: "title", label: "Title", required: true }, { name: "image", label: "Image", type: "image" }, { name: "date", label: "Date", type: "date", required: true }, { name: "time", label: "Time" }, { name: "location", label: "Location" }, { name: "description", label: "Description", type: "richtext" }];
export const academicFields = [{ name: "title", label: "Title", required: true }, { name: "level", label: "Level" }, { name: "description", label: "Description", type: "textarea" }, { name: "image", label: "Image", type: "image" }, { name: "isActive", label: "Show on website", type: "checkbox", defaultValue: true }];
export const staffFields = [{ name: "name", label: "Name", required: true }, { name: "role", label: "Role", required: true }, { name: "biography", label: "Biography", type: "textarea" }, { name: "qualification", label: "Qualification" }, { name: "image", label: "Image", type: "image" }, { name: "email", label: "Email" }, { name: "isActive", label: "Show on website", type: "checkbox", defaultValue: true }];
export const testimonialFields = [{ name: "name", label: "Person name", required: true }, { name: "role", label: "Role" }, { name: "message", label: "Message", type: "textarea", required: true }, { name: "image", label: "Image", type: "image" }, { name: "isActive", label: "Show on website", type: "checkbox", defaultValue: true }];
export const faqFields = [{ name: "question", label: "Question", required: true }, { name: "answer", label: "Answer", type: "textarea", required: true }, { name: "category", label: "Category" }, { name: "isActive", label: "Show on website", type: "checkbox", defaultValue: true }];
export const admissionFields = [{ name: "title", label: "Title" }, { name: "content", label: "Content", type: "richtext" }, { name: "requirements", label: "Requirements (one per line)", type: "textarea" }, { name: "processSteps", label: "Process steps", type: "repeatable", fields: [{ name: "title", label: "Step title" }, { name: "description", label: "Step description", type: "textarea" }] }, { name: "ctaText", label: "Call-to-action text" }, ...seoFields()];
export const pageFields = [{ name: "title", label: "Title" }, { name: "excerpt", label: "Short summary", type: "textarea", description: "A short page summary. This can also be used as a fallback search description." }, { name: "content", label: "Content", type: "richtext" }, { name: "mission", label: "Mission", type: "textarea" }, { name: "vision", label: "Vision", type: "textarea" }, { name: "coreValues", label: "Core values (one per line)", type: "textarea" }, ...seoFields()];

export function SettingsManager() { return <ResourceManager title="Website Settings" endpoint="/settings" fields={settingsFields} singleton />; }
export function HomepageManager() { return <ResourceManager title="Homepage Content" endpoint="/homepage" fields={homepageFields} singleton />; }
export function BlogManager() { return <ResourceManager title="Blog and News" endpoint="/blogs" fields={blogFields} columns={["title", "category", "status"]} />; }
export function GalleryManager() { return <ResourceManager title="Gallery" endpoint="/gallery" fields={galleryFields} columns={["title", "category", "featured"]} />; }
export function EventManager() { return <ResourceManager title="Events" endpoint="/events" fields={eventFields} columns={["title", "date", "location"]} />; }
export function AcademicManager() { return <ResourceManager title="Academics" endpoint="/academics" fields={academicFields} columns={["title", "level", "isActive"]} />; }
export function AdmissionsManager() { return <ResourceManager title="Admissions" endpoint="/admissions" fields={admissionFields} singleton />; }
export function StaffManager() { return <ResourceManager title="Staff" endpoint="/staff" fields={staffFields} columns={["name", "role", "isActive"]} />; }
export function TestimonialManager() { return <ResourceManager title="Testimonials" endpoint="/testimonials" fields={testimonialFields} columns={["name", "role", "isActive"]} />; }
export function FAQManager() { return <ResourceManager title="FAQ" endpoint="/faqs" fields={faqFields} columns={["question", "category", "isActive"]} />; }
export function PageManager() {
  return (
    <div className="grid gap-8">
      <ResourceManager title="About Page" endpoint="/pages/about" fields={pageFields} singleton />
      <ResourceManager title="Privacy Policy" endpoint="/pages/privacy-policy" fields={pageFields.filter((field) => !["mission", "vision", "coreValues"].includes(field.name))} singleton />
    </div>
  );
}

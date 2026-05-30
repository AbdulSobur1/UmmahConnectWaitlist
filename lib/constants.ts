export const GOAL = Number(process.env.NEXT_PUBLIC_WAITLIST_GOAL ?? 40);

export const COLORS = {
  teal: "#1A6B5C",
  gold: "#C9A84C",
  dark: "#0D1B1E",
  dark2: "#132420",
  success: "#5ECDB5",
} as const;

export const CITIES = [
  "Lagos",
  "Abuja",
  "Kano",
  "Kaduna",
  "Port Harcourt",
  "Ibadan",
  "Maiduguri",
  "Sokoto",
  "Zaria",
  "Other",
] as const;

export const INDUSTRIES = [
  "Tech & Software",
  "Halal Finance",
  "Healthcare",
  "Creative Arts",
  "Education",
  "Law & Policy",
  "Entrepreneurship",
  "Architecture",
  "Media & Journalism",
  "NGO & Nonprofit",
  "Other",
] as const;

export const SOCIAL_CITIES = ["Lagos", "Abuja", "Kano", "+7 cities"] as const;

export const MILESTONE_LABELS = {
  10: "25% claimed - spots going fast",
  20: "Halfway there - 20 spots left",
  32: "Almost full - only 8 spots remaining",
} as const;

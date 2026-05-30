export type MemberData = {
  firstName: string;
  lastName: string;
  email: string;
  industry: string;
  city: string;
  memberNumber: number;
  refCode: string;
};

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function generateRefCode(firstName: string, lastName: string): string {
  return `${firstName.trim().slice(0, 5)}${lastName.trim().charAt(0)}`.toUpperCase();
}

export function buildShareText(appUrl: string): string {
  return `I just joined the Ummah Connect waitlist - a career network built for Muslims in Nigeria\n\nOnly 40 founding spots. Join me: ${appUrl}`;
}

export function buildTwitterText(): string {
  return "Just joined the @UmmahConnect waitlist - a career network built for Muslims in Nigeria\n\nOnly 40 founding spots. Find your people. Grow your career. Keep your faith.";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

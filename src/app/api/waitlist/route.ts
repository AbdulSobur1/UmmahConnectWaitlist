import { NextResponse } from "next/server";
import { CITIES, INDUSTRIES } from "@/lib/constants";
import { addToWaitlist, getWaitlistCount, isEmailAlreadyRegistered } from "@/src/lib/airtable";
import { isValidEmail } from "@/lib/utils";

type WaitlistBody = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  city?: unknown;
  industry?: unknown;
};

const allowedCities = new Set<string>(CITIES);
const allowedIndustries = new Set<string>(INDUSTRIES);

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const count = await getWaitlistCount();
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Failed to load waitlist count:", error);
    return jsonError("Unable to load waitlist count.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WaitlistBody;
    const firstName = readString(body.firstName);
    const lastName = readString(body.lastName);
    const email = readString(body.email).toLowerCase();
    const city = readString(body.city);
    const industry = readString(body.industry);

    if (!firstName || !lastName || !email || !city || !industry) {
      return jsonError("All fields are required.", 400);
    }

    if (!isValidEmail(email)) {
      return jsonError("Enter a valid email address.", 400);
    }

    if (!allowedCities.has(city)) {
      return jsonError("Select a valid city.", 400);
    }

    if (!allowedIndustries.has(industry)) {
      return jsonError("Select a valid industry.", 400);
    }

    const alreadyRegistered = await isEmailAlreadyRegistered(email);
    if (alreadyRegistered) {
      return jsonError("This email is already on the waitlist. بارك الله فيك!", 409);
    }

    await addToWaitlist({
      firstName,
      lastName,
      email,
      city,
      industry,
    });

    const count = await getWaitlistCount();

    return NextResponse.json(
      {
        success: true,
        message: "You're on the list! جزاك الله خيراً",
        count,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to join waitlist:", error);
    return jsonError("Unable to join the waitlist right now. Please try again.", 500);
  }
}

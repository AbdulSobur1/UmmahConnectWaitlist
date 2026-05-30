"use client";

import { useEffect, useRef, useState } from "react";
import { CITIES, GOAL, INDUSTRIES, MILESTONE_LABELS, SOCIAL_CITIES } from "@/lib/constants";
import { generateRefCode, isValidEmail, type MemberData } from "@/lib/utils";
import ProgressBar from "./ProgressBar";
import styles from "./Waitlist.module.css";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  industry: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type WaitlistFormProps = {
  currentCount: number;
  isLeaving: boolean;
  onSuccess: (member: MemberData) => void;
  registerFirstField: (field: HTMLInputElement | null) => void;
};

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  city: "",
  industry: "",
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.city) errors.city = "Select your city.";
  if (!values.industry) errors.industry = "Select your field.";

  return errors;
}

export default function WaitlistForm({
  currentCount,
  isLeaving,
  onSuccess,
  registerFirstField,
}: WaitlistFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimer.current) {
        clearTimeout(submitTimer.current);
      }
    };
  }, []);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    submitTimer.current = setTimeout(() => {
      const memberNumber = currentCount + 1;
      onSuccess({
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        memberNumber,
        refCode: generateRefCode(values.firstName, values.lastName),
      });
      setIsLoading(false);
    }, 1200);
  }

  return (
    <div className={`${styles.formView} ${isLeaving ? styles.formLeaving : ""}`}>
      <div className={styles.formGreeting} lang="ar" dir="rtl">
        السَّلَامُ عَلَيْكُمْ
      </div>

      <h1 className={styles.cardTitle}>
        Be among the
        <br />
        <span>founding members</span>
      </h1>
      <p className={styles.cardSub}>
        A career network built for Muslims in Nigeria - launching soon. Join the waitlist and be
        first in.
      </p>

      <ProgressBar current={currentCount} goal={GOAL} milestoneLabels={MILESTONE_LABELS} />

      <form className={styles.form} onSubmit={handleSubmit} aria-label="Join the Ummah Connect waitlist" noValidate>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="firstName">First Name</label>
            <input
              ref={registerFirstField}
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Aisha"
              value={values.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
            {errors.firstName ? <span id="firstName-error" className={styles.error}>{errors.firstName}</span> : null}
          </div>
          <div className={styles.field}>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Bello"
              value={values.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
            />
            {errors.lastName ? <span id="lastName-error" className={styles.error}>{errors.lastName}</span> : null}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="aisha@example.com"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? <span id="email-error" className={styles.error}>{errors.email}</span> : null}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="city">City</label>
            <select
              id="city"
              name="city"
              value={values.city}
              onChange={(event) => updateField("city", event.target.value)}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? "city-error" : undefined}
            >
              <option value="">Select city</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city ? <span id="city-error" className={styles.error}>{errors.city}</span> : null}
          </div>
          <div className={styles.field}>
            <label htmlFor="industry">Industry</label>
            <select
              id="industry"
              name="industry"
              value={values.industry}
              onChange={(event) => updateField("industry", event.target.value)}
              aria-invalid={Boolean(errors.industry)}
              aria-describedby={errors.industry ? "industry-error" : undefined}
            >
              <option value="">Select field</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry ? <span id="industry-error" className={styles.error}>{errors.industry}</span> : null}
          </div>
        </div>

        <button type="submit" className={`${styles.btnSubmit} ${isLoading ? styles.loading : ""}`} disabled={isLoading}>
          {isLoading ? "Joining..." : "Reserve My Spot ->"}
        </button>
      </form>

      <p className={styles.privacy}>No spam. No sharing. Ever. بإذن الله</p>

      <div className={styles.socialStrip} aria-label="Cities represented">
        {SOCIAL_CITIES.map((city) => (
          <div className={styles.spPill} key={city}>
            <span className={styles.dot} />
            {city}
          </div>
        ))}
      </div>
    </div>
  );
}

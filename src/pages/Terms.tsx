import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              TaxandCompliance T&C
            </span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: Jan 01, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using TaxandCompliance T&C, you agree to these Terms and
              Conditions. If you do not agree, do not use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              2. Services
            </h2>
            <p>
              TaxandCompliance T&C provides compliance reminders, guides, and tools
              designed to help Nigerian businesses track filing obligations.
              The service does not replace professional legal, tax, or
              accounting advice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              3. Accounts and Security
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              login details and for all activity on your account. Notify us
              promptly of any unauthorized use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              4. Payments and Subscriptions
            </h2>
            <p>
              Paid plans are billed in advance. Fees are non-refundable unless
              required by law. Pricing may change with notice before renewal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              5. Notifications
            </h2>
            <p>
              Reminder delivery depends on third-party providers (email, SMS,
              and WhatsApp). We do not guarantee delivery times or availability
              of external services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              6. Acceptable Use
            </h2>
            <p>
              You agree not to misuse the service, attempt unauthorized access,
              or interfere with its performance or security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              7. Limitation of Liability
            </h2>
            <p>
              TaxandCompliance T&C is provided on an as-is basis. We are not liable for
              indirect or consequential damages, including penalties or losses
              arising from missed deadlines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              8. Changes to Terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of the
              service after changes means you accept the updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              9. Contact
            </h2>
            <p>
              Questions about these terms? Email{" "}
              <a
                href="mailto:hello@taxandcompliance.ng"
                className="text-foreground underline"
              >
                hello@taxandcompliance.ng
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

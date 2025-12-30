// app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | StrandCraft",
    description: "Privacy Policy for StrandCraft - DIY Strands Puzzle Creator",
};

export default function PrivacyPolicy() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-ctp-text mb-8">Privacy Policy</h1>

            <div className="space-y-6 text-ctp-subtext0">
                <p className="text-sm text-ctp-overlay0">
                    Last updated: December 30, 2025
                </p>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">Introduction</h2>
                    <p>
                        Liscio Apps, LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates StrandCraft.
                        This Privacy Policy explains how we collect, use, and protect your information when you use our service.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">Information We Collect</h2>
                    <p>
                        We only collect data that is necessary to provide our service. This includes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Puzzle content you create (grid letters, words, themes)</li>
                        <li>Basic usage data (puzzle views, likes, completions)</li>
                        <li>Technical data necessary for service operation (browser type, device information)</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">How We Use Your Information</h2>
                    <p>
                        Your information is used solely to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Provide and maintain the StrandCraft service</li>
                        <li>Allow you to create, share, and play puzzles</li>
                        <li>Track puzzle statistics (views, completions, likes)</li>
                        <li>Improve our service and fix issues</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">We Will Never Sell Your Data</h2>
                    <p className="font-medium text-ctp-text">
                        We will never sell, rent, or trade your personal information to third parties. Period.
                    </p>
                    <p>
                        Your data is used exclusively to provide the StrandCraft service and will not be
                        monetized through sale to advertisers, data brokers, or any other third parties.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">Third-Party Services</h2>
                    <p>
                        We use the following third-party services to operate StrandCraft:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                            <strong className="text-ctp-text">Cloudflare</strong> — Content delivery and security services.
                            Cloudflare may process request data to protect our service from attacks and improve performance.
                        </li>
                        <li>
                            <strong className="text-ctp-text">Vercel</strong> — Web hosting and serverless functions.
                            Vercel hosts our application and processes requests to serve you the website.
                        </li>
                        <li>
                            <strong className="text-ctp-text">Neon</strong> — Database hosting.
                            Neon stores puzzle data and related information in a secure PostgreSQL database.
                        </li>
                    </ul>
                    <p>
                        These services are used only to operate and deliver StrandCraft. We do not use
                        any advertising, analytics, or tracking services beyond what is necessary for basic service operation.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">Data Retention</h2>
                    <p>
                        Puzzle data is retained as long as you wish to keep your puzzles available.
                        You can manage your puzzles at any time through the &quot;My Puzzles&quot; section.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">Cookies</h2>
                    <p>
                        We use only essential cookies necessary for the service to function, such as
                        remembering your created puzzles locally in your browser. We do not use
                        tracking cookies or third-party advertising cookies.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">Children&apos;s Privacy</h2>
                    <p>
                        StrandCraft is designed to be family-friendly and does not knowingly collect
                        personal information from children under 13. The service can be used to create
                        and play puzzles without providing any personal information.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of
                        any changes by posting the new Privacy Policy on this page and updating the
                        &quot;Last updated&quot; date.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-ctp-text">Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at
                        support@liscioapps.com.
                    </p>
                </section>
            </div>
        </main>
    );
}

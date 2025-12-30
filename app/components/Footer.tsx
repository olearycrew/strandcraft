// app/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="text-sm text-ctp-overlay0 text-center py-6 space-y-2">
            <p className="flex items-center justify-center gap-6">
                <a
                    href="https://buymeacoffee.com/olearycrew"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-ctp-subtext0 hover:text-ctp-yellow transition-colors"
                >
                    ☕ Buy Me A Coffee
                </a>
                <Link
                    href="/how-to-play"
                    className="text-ctp-subtext0 hover:text-ctp-yellow transition-colors"
                >
                    How To Play
                </Link>
                <Link
                    href="/privacy"
                    className="text-ctp-subtext0 hover:text-ctp-yellow transition-colors"
                >
                    Privacy Policy
                </Link>
            </p>
            <p>
                © 2025 StrandCraft. All rights reserved. StrandCraft is not affiliated in any way with the New York Times.
            </p>
            <p>
                Made with{" "}
                <a
                    href="https://kilo.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                >
                    🖤💛
                </a>
                {" "}in Maryland
            </p>
        </footer>
    );
}

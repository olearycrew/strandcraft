// app/components/Footer.tsx

export default function Footer() {
    return (
        <footer className="text-sm text-gray-500 text-center py-6 space-y-2">
            <p>Inspired by (but not affiliated with) NYT Strands • Made with 🖤💛 in Maryland</p>
            <p>
                <a
                    href="https://buymeacoffee.com/olearycrew"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gray-400 hover:text-yellow-400 transition-colors"
                >
                    ☕ Buy Me a Coffee
                </a>
            </p>
        </footer>
    );
}

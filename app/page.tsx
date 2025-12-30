// app/page.tsx
import Link from 'next/link';
import Footer from './components/Footer';

// Letter tile colors matching the completed puzzle board
const strandColors = [
  'bg-yellow-600', // S
  'bg-blue-600',   // T
  'bg-purple-600', // R
  'bg-pink-600',   // A
  'bg-green-600',  // N
  'bg-orange-600', // D
];

const craftColors = [
  'bg-cyan-600',   // C
  'bg-blue-600',   // R
  'bg-purple-600', // A
  'bg-pink-600',   // F
  'bg-green-600',  // T
];

const strandLetters = 'STRAND'.split('');
const craftLetters = 'CRAFT'.split('');

function LetterTile({ letter, color, index }: { letter: string; color: string; index: number }) {
  return (
    <div
      className={`${color} w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl md:text-2xl shadow-lg border-2 border-white/20 transform transition-transform hover:scale-110`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {letter}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Hero Section with Tile Header */}
        <div className="space-y-6">
          {/* Mobile-friendly tile header - breaks between STRAND and CRAFT on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2">
            {/* STRAND row */}
            <div className="flex gap-1 sm:gap-1.5 md:gap-2">
              {strandLetters.map((letter, index) => (
                <LetterTile
                  key={`strand-${index}`}
                  letter={letter}
                  color={strandColors[index]}
                  index={index}
                />
              ))}
            </div>
            {/* CRAFT row */}
            <div className="flex gap-1 sm:gap-1.5 md:gap-2">
              {craftLetters.map((letter, index) => (
                <LetterTile
                  key={`craft-${index}`}
                  letter={letter}
                  color={craftColors[index]}
                  index={index + 6}
                />
              ))}
            </div>
          </div>
          <p className="text-lg sm:text-xl text-gray-400">
            Create your own word puzzles
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <Link
            href="/create"
            className="group bg-gray-800 hover:bg-gray-700 rounded-2xl p-8 transition-all duration-200 hover:scale-105 border-2 border-gray-700 hover:border-blue-500"
          >
            <div className="space-y-4">
              <div className="text-5xl">➕</div>
              <h2 className="text-2xl font-bold">CREATE A PUZZLE</h2>
              <p className="text-gray-400">
                Design your own word puzzle and share it with friends
              </p>
            </div>
          </Link>

          <Link
            href="/my-puzzles"
            className="group bg-gray-800 hover:bg-gray-700 rounded-2xl p-8 transition-all duration-200 hover:scale-105 border-2 border-gray-700 hover:border-yellow-500"
          >
            <div className="space-y-4">
              <div className="text-5xl">📝</div>
              <h2 className="text-2xl font-bold">MY PUZZLES</h2>
              <p className="text-gray-400">
                View and manage your created puzzles
              </p>
            </div>
          </Link>

          <Link
            href="/community"
            className="group bg-gray-800 hover:bg-gray-700 rounded-2xl p-8 transition-all duration-200 hover:scale-105 border-2 border-gray-700 hover:border-purple-500"
          >
            <div className="space-y-4">
              <div className="text-5xl">🧩</div>
              <h2 className="text-2xl font-bold">COMMUNITY</h2>
              <p className="text-gray-400">
                Play puzzles created by the community
              </p>
            </div>
          </Link>

          <Link
            href="/how-to-play"
            className="group bg-gray-800 hover:bg-gray-700 rounded-2xl p-8 transition-all duration-200 hover:scale-105 border-2 border-gray-700 hover:border-green-500"
          >
            <div className="space-y-4">
              <div className="text-5xl">▶</div>
              <h2 className="text-2xl font-bold">HOW TO PLAY</h2>
              <p className="text-gray-400">
                Learn the rules and start solving puzzles
              </p>
            </div>
          </Link>

        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}

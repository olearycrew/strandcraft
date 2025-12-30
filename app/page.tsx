// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            STRANDCRAFT
          </h1>
          <p className="text-xl text-gray-400">
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
        <div className="text-sm text-gray-500">
          <p>Inspired by (but not affiliated with) NYT Strands • Made with 🖤💛 in Maryland</p>
        </div>
      </div>
    </main>
  );
}

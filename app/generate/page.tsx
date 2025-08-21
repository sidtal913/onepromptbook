import BookGenerator from "@/components/book-generator"

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="container mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Create Your KDP Book</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Generate complete, print-ready children's books with exact page counts, KDP-compliant formatting, and
            professional covers.
          </p>
        </div>
        <BookGenerator />
      </div>
    </div>
  )
}

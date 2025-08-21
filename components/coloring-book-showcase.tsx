import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ColoringBookShowcase() {
  const examples = [
    {
      id: 1,
      title: "Magical Hot Air Balloon Adventure",
      description:
        "A whimsical scene featuring a rainbow hot air balloon surrounded by beautiful birds and intricate floral borders",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Leonardo_Kino_XL_generate_examples_of_paper_book_coloring_book_1.jpg-Iysfl25ziiRTbiKmwGUXbUMtsvNnBs.jpeg",
      ageRange: "5-8 years",
      theme: "Adventure & Nature",
      difficulty: "Medium",
      features: ["Detailed borders", "Multiple animals", "Large central focus"],
    },
    {
      id: 2,
      title: "Mandala Tiger Portrait",
      description:
        "An intricate geometric tiger design perfect for developing fine motor skills and pattern recognition",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Leonardo_Kino_XL_generate_examples_of_paper_book_coloring_book_0.jpg-ieiyCoK4PhznlAL3evmfF7pLr7oY4Q.jpeg",
      ageRange: "8-12 years",
      theme: "Animals & Patterns",
      difficulty: "Advanced",
      features: ["Geometric patterns", "Mandala style", "Detailed artwork"],
    },
  ]

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4">
            ✨ Coloring Book Examples
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the magic of AI-generated coloring books with intricate designs, lovable characters, and engaging
            themes perfect for children of all ages.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {examples.map((example) => (
            <Card
              key={example.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={example.image || "/placeholder.svg"}
                  alt={example.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 text-purple-700 font-medium">
                    {example.difficulty}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {example.ageRange}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {example.theme}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{example.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{example.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {example.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Intricate Designs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Beautiful, detailed artwork that challenges and engages children while developing fine motor skills.
            </p>
          </Card>

          <Card className="text-center p-6 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="text-3xl mb-3">🦋</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Nature & Animals</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Featuring beloved animals, magical creatures, and natural elements that spark imagination.
            </p>
          </Card>

          <Card className="text-center p-6 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Age-Appropriate</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Carefully designed complexity levels suitable for different age groups and skill levels.
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 cursor-pointer">
            <span>Create Your Own Coloring Book</span>
            <span className="text-lg">✨</span>
          </div>
        </div>
      </div>
    </section>
  )
}

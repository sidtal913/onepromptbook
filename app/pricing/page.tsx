import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  Sparkles, 
  BookOpen, 
  Download, 
  Palette,
  Crown,
  Zap,
  Star
} from 'lucide-react'
import { CREDIT_PACKAGES, BOOK_TYPES } from '@/lib/openai'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      credits: 10,
      description: 'Perfect for trying out OnePromptBook',
      features: [
        '10 welcome credits',
        'Create 1-2 short books',
        'All art styles available',
        'PDF export',
        'Basic support'
      ],
      popular: false,
      buttonText: 'Start Free Trial',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Creator Pack',
      price: '$29.99',
      credits: 130,
      description: 'Most popular for regular creators',
      features: [
        '130 credits ($0.23 per credit)',
        'Create 4-6 complete books',
        'All art styles & book types',
        'PDF & EPUB export',
        'Priority support',
        'Commercial license'
      ],
      popular: true,
      buttonText: 'Get Creator Pack',
      buttonVariant: 'gradient' as const
    },
    {
      name: 'Professional Pack',
      price: '$69.99',
      credits: 320,
      description: 'For serious creators and educators',
      features: [
        '320 credits ($0.22 per credit)',
        'Create 10-12 complete books',
        'All premium features',
        'Bulk export options',
        'Custom character creation',
        'Priority support'
      ],
      popular: false,
      buttonText: 'Go Professional',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Publisher Pack',
      price: '$149.99',
      credits: 750,
      description: 'For publishers and high-volume users',
      features: [
        '750 credits ($0.20 per credit)',
        'Create 25+ complete books',
        'All features included',
        'API access (coming soon)',
        'White-label options',
        'Dedicated support'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const
    }
  ]

  const popularBookTypes = Object.entries(BOOK_TYPES)
    .filter(([_, config]) => config.popular)
    .slice(0, 8)

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Advanced AI creates engaging stories and beautiful illustrations'
    },
    {
      icon: Palette,
      title: 'Multiple Art Styles',
      description: 'Choose from Pixar 3D, Storybook, Anime, and more professional styles'
    },
    {
      icon: BookOpen,
      title: 'Complete Books',
      description: 'Get fully formatted books with cover, illustrations, and text'
    },
    {
      icon: Download,
      title: 'Instant Export',
      description: 'Download as PDF or EPUB, ready for publishing on any platform'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Pay only for what you use. No monthly subscriptions, no hidden fees. 
            Create amazing children's books with our credit-based system.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No monthly fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Credits never expire</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Commercial license included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative hover:shadow-xl transition-shadow ${
                  plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.credits > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {plan.credits} credits included
                      </div>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4">
                    <Link href={plan.name === 'Free Trial' ? '/auth' : '/auth'}>
                      <Button 
                        variant={plan.buttonVariant} 
                        size="lg" 
                        className="w-full"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Costs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Credits Work
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, transparent pricing. Each feature costs a specific number of credits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Story Pages</h3>
                <div className="text-2xl font-bold text-purple-600 mb-2">5 credits</div>
                <p className="text-sm text-gray-600">Per illustrated page</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Premium Cover</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">30 credits</div>
                <p className="text-sm text-gray-600">HD cover with text overlay</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Export</h3>
                <div className="text-2xl font-bold text-green-600 mb-2">15 credits</div>
                <p className="text-sm text-gray-600">PDF or EPUB export</p>
              </CardContent>
            </Card>
          </div>

          {/* Example Costs */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-center mb-6">Example Book Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-medium mb-2">Short Story (10 pages)</h4>
                <div className="text-lg text-gray-600">
                  30 (cover) + 50 (pages) + 15 (export) = <span className="font-bold text-purple-600">95 credits</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">≈ $23.75</div>
              </div>
              <div className="text-center">
                <h4 className="font-medium mb-2">Full Book (20 pages)</h4>
                <div className="text-lg text-gray-600">
                  30 (cover) + 100 (pages) + 15 (export) = <span className="font-bold text-purple-600">145 credits</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">≈ $36.25</div>
              </div>
              <div className="text-center">
                <h4 className="font-medium mb-2">Extended Book (32 pages)</h4>
                <div className="text-lg text-gray-600">
                  30 (cover) + 160 (pages) + 15 (export) = <span className="font-bold text-purple-600">205 credits</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">≈ $51.25</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Book Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Book Types
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create any type of children's book with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularBookTypes.map(([key, config]) => (
              <div
                key={key}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 mb-1">{config.description}</h3>
                <p className="text-sm text-gray-600">{config.category}</p>
                <div className="mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full inline-block">
                  {config.credits} credits per book
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-quality features included in every plan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">Do credits expire?</h3>
              <p className="text-gray-600">No, your credits never expire. Use them whenever you're ready to create.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I use the books commercially?</h3>
              <p className="text-gray-600">Yes! All plans include commercial licensing. You can sell your books on Amazon KDP, Etsy, or any other platform.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What file formats do you support?</h3>
              <p className="text-gray-600">We export books as high-quality PDF files optimized for printing, and EPUB files for digital publishing.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I edit the generated content?</h3>
              <p className="text-gray-600">Yes! You can edit the text content and regenerate specific pages or illustrations as needed.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Is there a refund policy?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee if you're not satisfied with your purchase.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Create Your First Book?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Start with 10 free credits and see the magic happen
          </p>
          <Link href="/auth">
            <Button variant="secondary" size="xl" className="text-lg px-8 py-4">
              <Zap className="w-5 h-5 mr-2" />
              Start Creating Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
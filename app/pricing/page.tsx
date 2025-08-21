import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Sparkles, Zap, Crown, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing - StoryForge AI",
  description: "Choose the perfect plan for your children's book creation needs",
}

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for trying out the magic",
    icon: <Users className="h-6 w-6" />,
    color: "from-gray-400 to-gray-600",
    features: [
      "3 magical projects per month",
      "Basic AI story generation",
      "Standard illustration styles",
      "PDF export",
      "Community support",
      "KDP-ready sizes",
    ],
    limitations: ["Limited to 12 pages per book", "Basic templates only", "Standard processing speed"],
    cta: "Start Creating Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    description: "For serious storytellers",
    icon: <Zap className="h-6 w-6" />,
    color: "from-blue-500 to-purple-600",
    features: [
      "300 pages per month",
      "Advanced AI storytelling",
      "Premium illustration styles",
      "Image generation included",
      "Priority processing queue",
      "Commercial publishing license",
      "Advanced customization",
      "Email support",
      "Single-page regeneration",
      "Multiple book formats",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    price: 49,
    description: "For creative teams & educators",
    icon: <Crown className="h-6 w-6" />,
    color: "from-purple-500 to-pink-600",
    features: [
      "1000 pages per month",
      "Everything in Pro",
      "Team collaboration tools",
      "Organization management",
      "Shared asset library",
      "Custom brand styling",
      "Analytics & insights",
      "Dedicated support wizard",
      "Bulk export options",
      "API access (coming soon)",
    ],
    limitations: [],
    cta: "Start Team Plan",
    popular: false,
  },
]

const faqs = [
  {
    question: "What counts as a 'page' in my quota?",
    answer:
      "Each generated page (cover, interior page, coloring page, activity page) counts as one page toward your monthly limit. A typical 24-page children's book would use 24 pages from your quota.",
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer:
      "Yes! You can upgrade your plan immediately and start using the new features right away. Downgrades take effect at the end of your current billing cycle.",
  },
  {
    question: "Are the books I create commercially licensed?",
    answer:
      "Free plan books are for personal use only. Pro and Team plans include commercial publishing rights, so you can sell your books on Amazon KDP, Etsy, or anywhere else.",
  },
  {
    question: "What happens if I exceed my monthly quota?",
    answer:
      "You'll be notified when you're approaching your limit. If you exceed it, you can either upgrade your plan or wait until the next month when your quota resets.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "You can cancel your subscription at any time from your billing dashboard. You'll continue to have access to your plan features until the end of your billing period.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-100 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Pricing</h1>
                <p className="text-gray-300 text-sm">Choose your creative journey</p>
              </div>
            </div>
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Simple,{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Magical</span>{" "}
            Pricing
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto mb-8">
            Start creating amazing children's books for free, then upgrade when you're ready to unlock the full magic of
            AI-powered storytelling.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>30-day money back</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-pink-500 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className={`mx-auto mb-4 p-3 rounded-full bg-gradient-to-r ${plan.color} text-white`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-gray-300 mb-4">{plan.description}</CardDescription>
                <div className="text-center">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-300 text-lg">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="text-white font-semibold mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 font-semibold mb-3 text-sm">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="h-4 w-4 mt-0.5 flex-shrink-0 rounded-full bg-gray-600" />
                          <span className="text-gray-400 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-4">
                  <Link href={plan.id === "free" ? "/auth/signin" : "/auth/signin"}>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/30"
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20 py-16 border-t border-white/10">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Start Creating?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators, parents, and educators who are bringing their stories to life with StoryForge
            AI. Start your free account today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Start Creating Free
              </Button>
            </Link>
            <Link href="/gallery">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                View Examples
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

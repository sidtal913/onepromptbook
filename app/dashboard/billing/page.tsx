"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, CreditCard, Loader2, Zap, Users, Crown } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe"

interface BillingInfo {
  plan: string
  status: string
  currentPeriodEnd?: string
  usageCount: number
  usageLimit: number
}

export default function BillingPage() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingInfo()
  }, [])

  const fetchBillingInfo = async () => {
    try {
      const response = await fetch("/api/billing/info")
      const data = await response.json()
      if (data.billing) {
        setBillingInfo(data.billing)
      }
    } catch (error) {
      console.error("Failed to fetch billing info:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Upgrade error:", error)
    } finally {
      setUpgrading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Portal error:", error)
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Zap className="w-5 h-5" />
      case "team":
        return <Crown className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "pro":
        return "text-blue-600"
      case "team":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>

        {billingInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(billingInfo.plan)}
                Current Plan: {SUBSCRIPTION_PLANS[billingInfo.plan as keyof typeof SUBSCRIPTION_PLANS]?.name}
              </CardTitle>
              <CardDescription>
                {billingInfo.status === "active" && billingInfo.currentPeriodEnd && (
                  <>Renews on {new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}</>
                )}
                {billingInfo.status === "canceled" && <>Your subscription has been canceled</>}
                {billingInfo.status === "free" && <>You're currently on the free plan</>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Usage this month</p>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {billingInfo.usageCount}
                      {billingInfo.usageLimit > 0 && (
                        <span className="text-lg text-muted-foreground">/{billingInfo.usageLimit}</span>
                      )}
                      {billingInfo.usageLimit === -1 && <span className="text-lg text-muted-foreground">/∞</span>}
                    </div>
                    <span className="text-sm text-muted-foreground">projects</span>
                  </div>
                </div>
                {billingInfo.plan !== "free" && (
                  <Button onClick={handleManageBilling} variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => {
            const isCurrentPlan = billingInfo?.plan === planKey
            const isPopular = planKey === "pro"

            return (
              <Card key={planKey} className={`relative ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-2 ${getPlanColor(planKey)}`}>{getPlanIcon(planKey)}</div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator className="mb-6" />
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : planKey === "free" ? (
                    <Button className="w-full bg-transparent" variant="outline" disabled>
                      Downgrade Available
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleUpgrade(planKey)} disabled={upgrading === planKey}>
                      {upgrading === planKey ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Upgrade to {plan.name}</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

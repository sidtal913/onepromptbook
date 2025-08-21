"use client"
import { useEffect, useMemo, useState } from "react"
import { estimateCredits, type ArtStyle, type Quality } from "@/lib/pricing"

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function CostEstimator({
  pages,
  style,
  quality,
  includeCovers = true,
  onAffordableChange,
}: {
  pages: number
  style: ArtStyle
  quality: Quality
  includeCovers?: boolean
  onAffordableChange?: (ok: boolean) => void
}) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const est = useMemo(
    () => estimateCredits({ pages, style, quality, includeCovers }),
    [pages, style, quality, includeCovers],
  )

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const r = await fetch("/api/billing/me", { cache: "no-store" })
        const j = await r.json()
        if (!mounted) return
        setBalance(Number(j?.credits ?? 0))
      } catch {
        if (mounted) setBalance(0)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const affordable = balance !== null ? balance >= est.totalCredits * 100 : false
  useEffect(() => {
    onAffordableChange?.(affordable)
  }, [affordable, onAffordableChange])

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Estimated cost</span>
        <span className="text-purple-300">{fmt(est.totalCredits)} credits</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-200 mb-3">
        <div>Images ({est.images})</div>
        <div className="text-right">{fmt(est.imageCredits)} cr</div>
        <div>Text (in)</div>
        <div className="text-right">{fmt(est.textInCredits)} cr</div>
        <div>Text (out)</div>
        <div className="text-right">{fmt(est.textOutCredits)} cr</div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-2">
        <div className="opacity-80">
          Balance:{" "}
          {loading ? <span className="opacity-70">loading…</span> : <span>{(balance ?? 0) / 100} credits</span>}
        </div>
        {!affordable && (
          <a
            href="/pricing"
            className="inline-flex items-center rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-semibold hover:bg-pink-700"
          >
            Buy credits
          </a>
        )}
      </div>
    </div>
  )
}

export interface MorningBriefUser {
  email: string
  credits_remaining: number
  is_active: boolean
  member_since: string
}

export interface MorningBriefStats {
  formulations: number
  recent_formulations_7d: number
  credits_remaining: number
  regulatory_alerts: number
  critical_alerts: number
  material_alerts: number
  markets_monitored: number
}

export interface MorningBriefRegulatoryAlert {
  id: number
  market: string
  change_type: string
  severity: "critical" | "material" | "watch" | "info"
  title: string
  summary: string
  affected_inci: string[]
  authority: string
  created_at: string
}

export interface MorningBriefAlertCounts {
  critical: number
  material: number
  watch: number
  info: number
}

export interface MorningBriefSourceHealth {
  total: number
  healthy: number
  failing: number
  disabled: number
}

export interface MorningBriefFailingSource {
  authority: string
  market: string
  consecutive_failures: number
}

export interface MorningBriefRecentActivity {
  type: string
  credits: number
  description: string
  created_at: string
}

export interface IntelligenceItem {
  id: number
  category: "regulatory" | "ingredient" | "market" | "science" | "industry" | "supply_chain"
  source: string
  title: string
  summary: string
  relevance_score: number
  affected_inci: string[]
  affected_markets: string[]
  tags: string[]
  source_url: string | null
  published_at: string | null
}

export interface IntelligenceStats {
  total_items: number
  items_today: number
  items_this_week: number
  unique_sources: number
}

export interface MorningBriefData {
  greeting_time: "morning" | "afternoon" | "evening"
  date: string
  user: MorningBriefUser
  stats: MorningBriefStats
  regulatory_alerts: MorningBriefRegulatoryAlert[]
  alert_counts: MorningBriefAlertCounts
  source_health: MorningBriefSourceHealth
  failing_sources: MorningBriefFailingSource[]
  markets_monitored: string[]
  recent_activity: MorningBriefRecentActivity[]
  intelligence_items?: IntelligenceItem[]
  intelligence_category_counts?: Record<string, number>
  intelligence_stats?: IntelligenceStats
}

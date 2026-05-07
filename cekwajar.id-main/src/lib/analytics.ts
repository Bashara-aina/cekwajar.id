/**
 * cekwajar.id — Analytics Telemetry
 *
 * All 13 Wajar Slip events are routed through here.
 * Swap the body of `track()` for PostHog / Mixpanel / Amplitude.
 */

export type SlipEvent =
  | { name: 'slip_landed';             props: { referrer: string; viewport_width: number } }
  | { name: 'slip_upload_start';        props: { file_type: string; file_size_kb: number } }
  | { name: 'slip_upload_progress';    props: { pct: number } }
  | { name: 'slip_ocr_engine';         props: { engine: string; confidence: number } }
  | { name: 'slip_confirm_override';    props: { field: string; was_value: number; new_value: number } }
  | { name: 'slip_confirm_accept';      props: { n_overrides: number; total_time_ms: number } }
  | { name: 'slip_calc_complete';      props: { verdict: string; n_violations: number; shortfall_idr_bucket: string } }
  | { name: 'slip_gate_view';          props: { shortfall_idr_bucket: string; n_violations: number } }
  | { name: 'slip_gate_cta_click';     props: { shortfall_idr_bucket: string } }
  | { name: 'slip_paid';              props: { shortfall_idr: number; plan: string } }
  | { name: 'slip_share_card_built';   props: Record<string, never> }
  | { name: 'slip_error';              props: { code: string; retry: boolean; time_in_state_ms: number } }
  | { name: 'slip_abandon';           props: { last_state: string; time_total_ms: number } }

/**
 * Stub: logs to console in development, silently no-ops in production.
 * Accepts any event name and props — all Wajar tools route through here.
 */
export function track(event: string, props: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[telemetry] ${event}`, props)
  }
  void event
  void props
}

/** Capture abandon event on page unload */
export function trackAbandon(lastState: string, timeTotalMs: number): void {
  track('slip_abandon', { last_state: lastState, time_total_ms: timeTotalMs })
}

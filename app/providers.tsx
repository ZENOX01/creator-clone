'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import PostHogPageView from './components/posthog-pageview'
import { Suspense } from 'react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false // Disable automatic pageview capture, as we capture manually
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}

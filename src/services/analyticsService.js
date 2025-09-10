// Analytics service for production
import config from '../config/environment'

class AnalyticsService {
  constructor() {
    this.isEnabled = config.FEATURES.ANALYTICS && config.NODE_ENV === 'production'
    this.events = []
    this.maxEvents = 100
  }

  // Track user events
  track(eventName, properties = {}) {
    if (!this.isEnabled) return

    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      }
    }

    this.events.push(event)

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Send to analytics service (implement based on your analytics provider)
    this.sendToAnalytics(event)
  }

  // Track page views
  trackPageView(pageName, properties = {}) {
    this.track('page_view', {
      page_name: pageName,
      ...properties
    })
  }

  // Track user actions
  trackUserAction(action, properties = {}) {
    this.track('user_action', {
      action,
      ...properties
    })
  }

  // Track errors
  trackError(error, properties = {}) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...properties
    })
  }

  // Track performance metrics
  trackPerformance(metricName, value, properties = {}) {
    this.track('performance', {
      metric_name: metricName,
      value,
      ...properties
    })
  }

  // Send events to analytics service
  sendToAnalytics(event) {
    // Implement based on your analytics provider (Google Analytics, Mixpanel, etc.)
    // Example for Google Analytics 4:
    if (typeof gtag !== 'undefined') {
      gtag('event', event.name, event.properties)
    }

    // Example for custom analytics endpoint:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event)
    // }).catch(error => {
    //   console.error('Analytics error:', error)
    // })
  }

  // Get analytics data
  getAnalyticsData() {
    return {
      events: this.events,
      totalEvents: this.events.length,
      isEnabled: this.isEnabled
    }
  }

  // Clear analytics data
  clearAnalyticsData() {
    this.events = []
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService()

export default analyticsService

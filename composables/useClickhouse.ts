import { createClient } from '@clickhouse/client-web'
import { useRuntimeConfig, useSupabaseUser } from '#imports'

// Add return type for better type safety
interface ClickHouseUtils {
  insertEvent: (
    action: string,
    metric?: number,
    additionalData?: Record<string, any>
  ) => Promise<void>
}

export const useClickHouse = (
  servicePrefix: string = 'issuebuilder'
): ClickHouseUtils => {
  const config = useRuntimeConfig()
  const user = useSupabaseUser()

  // Skip ClickHouse entirely if no credentials configured
  if (!config.public.CLICKHOUSE_HOST || !config.public.CLICKHOUSE_PASSWORD) {
    console.warn('ClickHouse not configured, analytics disabled')
    return {
      insertEvent: async () => {
        // No-op when ClickHouse is not configured
      }
    }
  }

  const clickhouseClient = createClient({
    url: config.public.CLICKHOUSE_HOST,
    username: config.public.CLICKHOUSE_USER,
    password: config.public.CLICKHOUSE_PASSWORD,
    application: `${servicePrefix}-web`,
    request_timeout: 5000, // 5 second timeout
    connect_timeout: 3000  // 3 second connection timeout
  })

  const insertEvent = async (
    action: string,
    metric: number = 1,
    additionalData: Record<string, any> = {}
  ): Promise<void> => {
    try {
      const prefixedAction = `${servicePrefix}-${action}`

      await clickhouseClient.insert({
        table: 'events',
        values: [
          {
            user: user.value?.id || null,
            date: new Date().toISOString(),
            action: prefixedAction,
            metric,
            ...additionalData
          }
        ],
        format: 'JSONEachRow'
      })
    } catch (error) {
      console.error('Error inserting event into ClickHouse:', error)
    }
  }

  return {
    insertEvent
  }
}

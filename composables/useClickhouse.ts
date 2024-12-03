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

  const clickhouseClient = createClient({
    url: config.public.CLICKHOUSE_HOST,
    username: config.public.CLICKHOUSE_USER,
    password: config.public.CLICKHOUSE_PASSWORD,
    application: `${servicePrefix}-web`
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

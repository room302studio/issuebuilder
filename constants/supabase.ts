export const TABLES = {
  PROJECTS: 'projects'
} as const

export const SCHEMAS = {
  PUBLIC: 'public'
} as const

// Combine schema and table for full table names
export const TABLE_NAMES = {
  PROJECTS: `${SCHEMAS.PUBLIC}.${TABLES.PROJECTS}`
} as const

// RLS Policies
export const RLS_POLICIES = {
  PROJECTS: {
    CREATE: 'Users can create their own projects',
    READ: 'Users can view their own projects',
    UPDATE: 'Users can update their own projects',
    DELETE: 'Users can delete their own projects'
  }
} as const

// Column Names
export const COLUMNS = {
  PROJECTS: {
    ID: 'id',
    NAME: 'name',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    ISSUES: 'issues',
    DOCUMENT_TEXT: 'document_text',
    REPOSITORY: 'repository',
    MODEL: 'model',
    USER_ID: 'user_id'
  }
} as const

// Constraints
export const CONSTRAINTS = {
  PROJECTS: {
    NAME_LENGTH: {
      MIN: 1,
      MAX: 100
    }
  }
} as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { code } = body

  if (!code) {
    throw createError({
      statusCode: 400,
      message: 'Authorization code is required'
    })
  }

  try {
    // Debug log the credentials (remove in production!)
    console.log('Debug credentials:', {
      clientId: config.public.githubClientId,
      hasSecret: !!config.githubClientSecret,
      callbackUrl: config.public.supabaseUrl + '/auth/v1/callback'
    })

    const tokenResponse = await $fetch<{ 
      access_token?: string,
      error?: string,
      error_description?: string 
    }>(
      'https://github.com/login/oauth/access_token', 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          client_id: config.public.githubClientId,
          client_secret: config.githubClientSecret,
          code,
          redirect_uri: config.public.supabaseUrl + '/auth/v1/callback'
        }
      }
    )

    if (tokenResponse.error) {
      throw createError({
        statusCode: 400,
        message: tokenResponse.error_description || tokenResponse.error
      })
    }

    if (!tokenResponse.access_token) {
      throw createError({
        statusCode: 400,
        message: 'No access token in response'
      })
    }

    return { access_token: tokenResponse.access_token }
  } catch (error: any) {
    console.error('GitHub OAuth error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to exchange code for token'
    })
  }
}) 
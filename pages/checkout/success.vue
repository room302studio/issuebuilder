<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Success animation container -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
          <Icon name="heroicons:check" class="w-8 h-8 text-green-500 dark:text-green-300" />
        </div>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Thank You!
      </h1>

      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Your payment was successful. You now have full access to Issue Builder.
      </p>

      <div class="space-y-4">
        <UButton to="/" color="gray" variant="outline" block>
          Return to Issue Builder
        </UButton>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          Need help? <a href="mailto:support@room302.studio" class="text-blue-500 hover:text-blue-600">Contact
            support</a>
        </p>
      </div>
    </div>
  </div>
</template>
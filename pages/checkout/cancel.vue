<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Cancel icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <Icon name="heroicons:x-mark" class="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Payment Cancelled
      </h1>

      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
        No worries! Your payment was cancelled and you haven't been charged.
      </p>

      <div class="space-y-4">
        <UButton to="/checkout" color="primary" block>
          Try Again
        </UButton>

        <UButton to="/" color="gray" variant="outline" block>
          Return to Issue Builder
        </UButton>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          Have questions? <a href="mailto:support@room302.studio" class="text-blue-500 hover:text-blue-600">Contact
            us</a>
        </p>
      </div>
    </div>
  </div>
</template>
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Icon name="heroicons:check-circle" class="h-16 w-16 text-green-500 mx-auto" />
      <h1 class="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white">
        Thank you for your purchase!
      </h1>
      <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">
        Your lifetime access has been activated.
      </p>
      <NuxtLink to="/"
        class="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
        Return to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>
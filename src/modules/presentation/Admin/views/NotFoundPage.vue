<template>
  <div class="container mx-auto px-4 py-16 text-center">
    <div class="max-w-md mx-auto">
      <h1 class="text-9xl font-extrabold text-gray-900">404</h1>
      <p class="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</p>
      <p class="text-gray-500 mt-4">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>

      <div class="mt-10">
        <router-link
          to="/login"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<template>
  <div>
    <!-- Landing Page for Unauthenticated Users -->
    <div v-if="!user" class="min-h-screen bg-white dark:bg-zinc-950 font-mono">
      <!-- Hero Section -->
      <div class="max-w-5xl mx-auto px-4 md:px-12 pt-16 md:pt-28 pb-20">
        <div class="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div class="w-full md:w-1/2">
            <img src="https://room302.studio/room302-logo.svg" alt="Room 302 Studio"
              class="w-full max-w-[300px] mx-auto md:mx-0 filter grayscale dark:invert opacity-90 dark:opacity-80" />
          </div>
          <div class="w-full md:w-1/2">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-800 dark:text-white mb-3 md:mb-4">
              IssueBuilder
            </h1>
            <p class="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mb-6 md:mb-8 font-krypton">
              Convert any document or chat into GitHub issues using our advanced AI. From SOWs to meeting notes to
              requirements docs, turn your text into actionable tasks in seconds.
            </p>
            <div>
              <UButton color="primary" size="xl" @click="signIn"
                class="flex items-center justify-center gap-2 px-8 py-3 font-medium">
                <Icon name="simple-icons:github" class="w-5 h-5 flex-shrink-0" />
                <span class="whitespace-nowrap overflow-hidden text-ellipsis">Sign into GitHub to start</span>
              </UButton>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-5 gap-10 mb-16">
          <div class="md:col-span-3">
            <!-- Empty space for better layout balance -->
          </div>

        </div>
      </div>

      <!-- Mockup UI in Feltron style -->
      <div class="relative border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <!-- Data-centric mockup with minimalist style -->
        <div class="relative aspect-video overflow-hidden bg-white dark:bg-zinc-900">
          <div class="absolute inset-0 grid grid-cols-12 gap-1 p-4">
            <!-- Left sidebar - minimal -->
            <div class="col-span-3 flex flex-col gap-2">
              <div class="bg-zinc-100 dark:bg-zinc-800 h-6 w-2/3"></div>
              <div class="bg-zinc-100 dark:bg-zinc-800 h-4 w-1/2"></div>
              <div class="bg-zinc-100 dark:bg-zinc-800 h-4 w-3/4"></div>
              <div class="bg-zinc-100 dark:bg-zinc-800 h-4 w-full"></div>
              <div class="bg-zinc-100 dark:bg-zinc-800 h-4 w-3/5"></div>
            </div>

            <!-- Main content area - text representation -->
            <div class="col-span-6 flex flex-col">
              <div class="bg-zinc-100 dark:bg-zinc-800 h-8 w-full mb-3"></div>
              <div class="space-y-1">
                <div class="bg-zinc-100 dark:bg-zinc-800 h-3 w-full"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-3 w-11/12"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-3 w-full"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-3 w-4/5"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-3 w-full"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-3 w-3/4"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-3 w-11/12"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-3 w-full"></div>
              </div>

              <!-- Data visualization bars -->
              <div
                class="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 grid grid-cols-10 gap-1 items-end h-32">
                <div class="bg-zinc-300 dark:bg-zinc-700 h-1/3 w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-3/4 w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-1/2 w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-2/3 w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-5/6 w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-full w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-3/5 w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-1/6 w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-2/5 w-full"></div>
                <div class="bg-zinc-300 dark:bg-zinc-700 h-4/5 w-full"></div>
              </div>

              <div class="mt-2 flex justify-between">
                <div class="bg-zinc-100 dark:bg-zinc-800 h-2 w-10"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-2 w-10"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-2 w-10"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-2 w-10"></div>
                <div class="bg-zinc-100 dark:bg-zinc-800 h-2 w-10"></div>
              </div>
            </div>

            <!-- Right sidebar - issues -->
            <div class="col-span-3 flex flex-col gap-3">
              <div class="bg-zinc-300 dark:bg-zinc-700 h-6 w-full"></div>
              <div class="bg-zinc-100 dark:bg-zinc-800 h-16 w-full"></div>
              <div class="bg-zinc-100 dark:bg-zinc-800 h-16 w-full"></div>
              <div class="bg-zinc-100 dark:bg-zinc-800 h-16 w-full"></div>
              <div class="bg-zinc-100 dark:bg-zinc-800 h-8 w-full mt-2"></div>
            </div>
          </div>
        </div>

        <!-- Bottom label -->
        <div
          class="absolute bottom-0 left-0 w-full bg-zinc-100 dark:bg-zinc-800 px-3 py-2 flex justify-between text-xs font-mono">
          <div class="text-zinc-600 dark:text-zinc-400">IssueBuilder v1.0</div>
          <div class="text-zinc-600 dark:text-zinc-400">room302.studio</div>
        </div>
      </div>

      <!-- Process Flow - Feltron style -->
      <div class="border-t border-zinc-200 dark:border-zinc-800 py-16">
        <div class="max-w-5xl mx-auto px-4 md:px-12">
          <div class="flex items-start mb-12">
            <div
              class="w-16 h-16 flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 text-xl font-bold">
              01
            </div>
            <div class="ml-6 pt-3">
              <h3 class="text-xl font-bold mb-2 text-zinc-800 dark:text-white">From Document to Issues in Minutes</h3>
              <p class="text-zinc-600 dark:text-zinc-300 max-w-2xl font-krypton">
                IssueBuilder uses AI to parse your documents, meeting notes, and specifications into structured GitHub
                issues automatically.
              </p>
            </div>
          </div>

          <!-- Process steps -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-16">
            <div class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 min-h-[7.5rem]">
              <div class="absolute top-0 left-0 w-1 h-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-4 pl-6">
                <div
                  class="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 font-krypton">
                  Step 01
                </div>
                <h4 class="font-bold mb-1 text-zinc-800 dark:text-white text-sm">Connect GitHub</h4>
                <p class="text-xs text-zinc-600 dark:text-zinc-300 font-krypton">Link your GitHub account with one
                  click.</p>
              </div>
            </div>

            <div class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 min-h-[7.5rem]">
              <div class="absolute top-0 left-0 w-1 h-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-4 pl-6">
                <div
                  class="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 font-krypton">
                  Step 02
                </div>
                <h4 class="font-bold mb-1 text-zinc-800 dark:text-white text-sm">Select Repository</h4>
                <p class="text-xs text-zinc-600 dark:text-zinc-300 font-krypton">Choose where to create the issues.</p>
              </div>
            </div>

            <div class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 min-h-[7.5rem]">
              <div class="absolute top-0 left-0 w-1 h-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-4 pl-6">
                <div
                  class="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 font-krypton">
                  Step 03
                </div>
                <h4 class="font-bold mb-1 text-zinc-800 dark:text-white text-sm">Paste Document</h4>
                <p class="text-xs text-zinc-600 dark:text-zinc-300 font-krypton">Add your text requirements or notes.
                </p>
              </div>
            </div>

            <div class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 min-h-[7.5rem]">
              <div class="absolute top-0 left-0 w-1 h-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-4 pl-6">
                <div
                  class="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 font-krypton">
                  Step 04
                </div>
                <h4 class="font-bold mb-1 text-zinc-800 dark:text-white text-sm">Generate Issues</h4>
                <p class="text-xs text-zinc-600 dark:text-zinc-300 font-krypton">AI creates structured issues instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Room 302 Suite CTA -->
      <div class="bg-zinc-50 dark:bg-zinc-900 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div class="max-w-5xl mx-auto px-4 md:px-12">
          <div class="mb-12">
            <div class="h-10 w-1 bg-zinc-300 dark:bg-zinc-700 mb-4"></div>
            <h2 class="text-3xl font-bold text-zinc-800 dark:text-white">BUILDING TOOLS</h2>
            <p class="text-zinc-600 dark:text-zinc-300 mt-4 font-krypton">
              We craft digital instruments that make complex systems tangible.
            </p>
          </div>

          <!-- Tools Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div
              class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 group hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div class="absolute top-0 left-0 w-1 h-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-6 pl-8">
                <div class="flex items-center mb-3">
                  <div
                    class="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-sm mr-3 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors">
                  </div>
                  <div class="text-zinc-800 dark:text-white font-medium">Context Alchemy</div>
                </div>
                <p class="text-sm text-zinc-600 dark:text-zinc-300 font-krypton">Your AI's mixing board. See and shape
                  what your AI knows.</p>
              </div>
            </div>

            <div
              class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 group hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div class="absolute top-0 left-0 w-1 h-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-6 pl-8">
                <div class="flex items-center mb-3">
                  <div
                    class="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-sm mr-3 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors">
                  </div>
                  <div class="text-zinc-800 dark:text-white font-medium">Connectology</div>
                </div>
                <p class="text-sm text-zinc-600 dark:text-zinc-300 font-krypton">Touch and explore network relationships
                  through intuitive visualization.</p>
              </div>
            </div>

            <div
              class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 group hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div class="absolute top-0 left-0 w-1 h-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-6 pl-8">
                <div class="flex items-center mb-3">
                  <div
                    class="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-sm mr-3 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors">
                  </div>
                  <div class="text-zinc-800 dark:text-white font-bold">IssueBuilder</div>
                </div>
                <p class="text-sm text-zinc-600 dark:text-zinc-300 font-krypton">Transform abstract plans into
                  structured GitHub issues.</p>
              </div>
            </div>

            <div
              class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 group hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div class="absolute top-0 left-0 w-1 h-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-6 pl-8">
                <div class="flex items-center mb-3">
                  <div
                    class="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-sm mr-3 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors">
                  </div>
                  <div class="text-zinc-800 dark:text-white font-medium">Electology</div>
                </div>
                <p class="text-sm text-zinc-600 dark:text-zinc-300 font-krypton">Make election data flow visible. From
                  broadcast studios to Twitch streams.</p>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-12 border-t border-zinc-200 dark:border-zinc-700 pt-16">
            <div>
              <h3 class="text-xl font-bold mb-6 text-zinc-800 dark:text-white">These tools emerge from our own needs in
                the lab.</h3>
              <p class="text-zinc-600 dark:text-zinc-300 mb-6 font-krypton">
                Each one shares our DNA: thoughtful visualization, clean interaction, and respect for complexity.
                They're not isolated products - they're different views into the same problems we're obsessed with.
              </p>
              <ul class="space-y-3 font-krypton mb-8">
                <li class="flex items-start">
                  <div class="h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 mr-2">
                    <Icon name="heroicons:check" class="w-5 h-5" />
                  </div>
                  <span class="text-zinc-600 dark:text-zinc-300">Connectology's visualization engine powers Electology's
                    data flows</span>
                </li>
                <li class="flex items-start">
                  <div class="h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 mr-2">
                    <Icon name="heroicons:check" class="w-5 h-5" />
                  </div>
                  <span class="text-zinc-600 dark:text-zinc-300">Context Alchemy uses Connectology to map AI
                    memories</span>
                </li>
                <li class="flex items-start">
                  <div class="h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 mr-2">
                    <Icon name="heroicons:check" class="w-5 h-5" />
                  </div>
                  <span class="text-zinc-600 dark:text-zinc-300">IssueBuilder feeds project data that shapes our other
                    tools</span>
                </li>
              </ul>

              <div class="text-sm text-zinc-500 dark:text-zinc-400 font-krypton">
                All our tools share code, ideas, and purpose. When we improve one tool, they all get better.
              </div>
            </div>

            <div class="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
              <div class="absolute top-0 left-0 w-full h-1 bg-zinc-300 dark:bg-zinc-700"></div>
              <div class="p-6 pt-8">
                <h3 class="text-xl font-bold mb-4 text-zinc-800 dark:text-white">ROOM 302 STUDIO MEMBERSHIP</h3>
                <div class="flex items-baseline mb-8">
                  <span class="text-4xl font-bold text-zinc-800 dark:text-zinc-200">$199</span>
                  <span class="text-zinc-500 dark:text-zinc-400 ml-2 font-krypton">/month</span>
                </div>

                <ul class="space-y-3 font-krypton mb-8">
                  <li class="flex items-start">
                    <div class="h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 mr-2">
                      <Icon name="heroicons:check" class="w-5 h-5" />
                    </div>
                    <span class="text-zinc-600 dark:text-zinc-300">Access all tools in our suite</span>
                  </li>
                  <li class="flex items-start">
                    <div class="h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 mr-2">
                      <Icon name="heroicons:check" class="w-5 h-5" />
                    </div>
                    <span class="text-zinc-600 dark:text-zinc-300">Join our private Discord community</span>
                  </li>
                  <li class="flex items-start">
                    <div class="h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 mr-2">
                      <Icon name="heroicons:check" class="w-5 h-5" />
                    </div>
                    <span class="text-zinc-600 dark:text-zinc-300">Shape future development</span>
                  </li>
                  <li class="flex items-start">
                    <div class="h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 mr-2">
                      <Icon name="heroicons:check" class="w-5 h-5" />
                    </div>
                    <span class="text-zinc-600 dark:text-zinc-300">Commercial license for all open source tools</span>
                  </li>
                </ul>

                <div class="mb-8">
                  <div
                    class="font-mono text-xs font-krypton text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                    Small by design</div>
                  <p class="text-sm text-zinc-600 dark:text-zinc-300 font-krypton">We're not chasing exponential growth
                    or venture funding. We're building sustainable tools that work well because we use them every day.
                  </p>
                </div>

                <UButton color="primary" size="lg" class="w-full justify-center" href="https://room302.studio/join">
                  Join Room 302 Studio
                </UButton>

                <div class="flex items-center justify-center mt-4">
                  <a href="https://room302.studio" target="_blank"
                    class="text-xs text-zinc-600 dark:text-zinc-400 hover:underline font-krypton">Learn more about
                    studio membership</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Single unified footer -->
      <footer class="border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div class="max-w-5xl mx-auto px-4 md:px-12">
          <div class="mb-12 flex items-center justify-center">
            <!-- Room 302 Studio Logo -->
            <a href="https://room302.studio"
              class="block transform hover:scale-105 transition-all duration-300 hover:opacity-95">
              <img src="https://room302.studio/room302-logo.svg" alt="Room 302 Studio"
                class="h-24 sm:h-32 md:h-40 w-auto mx-auto filter grayscale dark:invert opacity-90 dark:opacity-80" />
            </a>
          </div>
        </div>
      </footer>
    </div>

    <!-- Original Content for Authenticated Users -->
    <div v-else
      class="relative grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6 max-w-6xl mx-auto p-4 md:p-12 pt-[10vh] dark:bg-zinc-900">
      <div class="max-w-2xl">
        <!-- Header Section -->
        <div class="mb-8 space-y-4">
          <h1 class="text-2xl font-bold flex items-center gap-2 dark:text-white">
            <Icon name="heroicons:document-text" class="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
            IssueBuilder
          </h1>
          <p class="text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Transform your development documents, plans, and written text into atomic, actionable GitHub issues.
            IssueBuilder uses AI to analyze your text and create well-structured issues in the repository of your
            choice.
          </p>
        </div>

        <!-- Repository Selection - Highlighted as first step -->
        <div class="mb-8">
          <div class="rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
            <div class="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <h2 class="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                Step 1: Choose where to create your issues
              </h2>
            </div>
            <div class="px-5 py-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:repository" class="w-5 h-5 text-zinc-500" />
                  <span class="font-medium">Select a GitHub repository</span>
                </div>
                <UButton v-if="!selectedRepo" color="primary" size="md" @click="selectRepository">
                  <Icon name="heroicons:folder-open" class="w-4 h-4 mr-1" />
                  Choose Repository
                </UButton>
                <div v-else class="flex items-center gap-3">
                  <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">{{ selectedRepo.full_name }}</span>
                  <UButton color="gray" variant="soft" size="sm" icon="i-heroicons-pencil-square"
                    @click="selectRepository" />
                </div>
              </div>
              <div v-if="!selectedRepo"
                class="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4 flex items-start gap-3">
                <Icon name="heroicons:information-circle" class="w-6 h-6 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                    We need to know which GitHub repository to create your issues in.
                  </p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    Don't have a suitable repository yet?
                    <a href="https://github.com/new" target="_blank"
                      class="text-zinc-700 dark:text-zinc-300 hover:underline font-medium">
                      Create one on GitHub
                    </a>
                    first, then come back here to select it.
                  </p>
                </div>
              </div>
              <div v-else
                class="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                <span class="text-sm">Ready to generate issues for <span class="font-medium">{{ selectedRepo.full_name
                    }}</span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Panel - Step 2 -->
        <div class="mb-8">
          <div class="rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
            <div class="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <h2 class="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                Step 2: Configure your AI settings
              </h2>
            </div>
            <div class="px-5 py-4">
              <ConfigurationPanel :is-processing="isProcessing" @update:api-key="updateApiKey"
                @update:model="updateModel" />
            </div>
          </div>
        </div>

        <!-- Document Input - Step 3 -->
        <div class="mb-8">
          <div class="rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
            <div class="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <h2 class="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                Step 3: Paste your requirements document
              </h2>
            </div>

            <!-- Metadata bar -->
            <div
              class="px-4 py-2 flex items-center gap-8 text-xs text-zinc-500 dark:text-zinc-400 border-b dark:border-zinc-700">
              <div class="flex items-center gap-2">
                <Icon name="heroicons:document-text" class="w-4 h-4" />
                <span>{{ documentStats.words }} words</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="heroicons:chart-bar" class="w-4 h-4" />
                <span>{{ documentStats.characters }} characters</span>
              </div>
            </div>

            <textarea v-model="documentText"
              class="w-full min-h-[200px] max-h-[80vh] p-6 bg-transparent border-none outline-none resize-none text-zinc-800 dark:text-zinc-200 leading-relaxed text-[15px]"
              :disabled="isProcessing"
              placeholder="Paste your planning document, requirements, or any text you'd like to convert into GitHub issues..."
              @input="autoGrow" ref="textareaRef" style="font-family: 'Inter', system-ui, -apple-system, sans-serif;" />

            <div
              class="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-700 text-xs text-zinc-500 italic">
              Examples: Product requirements, meeting notes, spec documents, Slack conversations, etc.
            </div>
          </div>
        </div>

        <!-- Process Button - Step 4 -->
        <div class="mb-8">
          <div class="rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
            <div class="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <h2 class="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                Step 4: Generate your GitHub issues
              </h2>
            </div>
            <div class="px-5 py-4 space-y-3">
              <div v-if="!canGenerate"
                class="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium mb-1">Unable to generate issues yet</p>
                  <p>{{ generateButtonTooltip }}</p>
                </div>
              </div>

              <UButton v-if="!isProcessing" @click="processDocument" :disabled="!canGenerate" color="primary" size="xl"
                block class="flex items-center justify-center gap-2 h-14">
                <Icon name="heroicons:sparkles" class="w-6 h-6" />
                Generate GitHub Issues
              </UButton>
              <UButton v-else @click="cancelGeneration" color="red" size="xl" block
                class="flex items-center justify-center gap-2 h-14">
                <Icon name="heroicons:stop-circle" class="w-6 h-6" />
                Cancel Generation
              </UButton>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error"
          class="mb-8 p-6 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-start gap-3">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{{ error.message }}</div>
        </div>

        <!-- Issues Display Component -->
        <ClientOnly>
          <IssuesDisplay v-if="showIssuesDisplay" :is-processing="isProcessing" :loading-skeletons="loadingSkeletons"
            @generate-more="generateMore" />
        </ClientOnly>
      </div>

      <!-- Table of Contents -->
      <ClientOnly>
        <TableOfContents v-if="hasIssues" :issues="store.itemList?.value || []" />
      </ClientOnly>

      <!-- Command Palette -->
      <CommandPalette ref="commandPalette" @generate="processDocument" @generate-more="generateMore"
        @custom-prompt="showCustomPrompt = true" @clear="clearAllIssues" @toggle-theme="toggleTheme"
        @clear-and-paste="handleClearAndPaste" />

      <!-- Repository Selection Modal -->
      <RepoSelectionModal v-model="isRepoModalOpen" @select="handleRepoSelection" />
    </div>

    <!-- Footer for authenticated users -->
    <footer v-if="user" class="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-16">
      <div class="max-w-6xl mx-auto px-4 md:px-12">
        <div class="mb-8 flex items-center justify-center">
          <!-- Room 302 Studio Logo -->
          <a href="https://room302.studio"
            class="block transform hover:scale-105 transition-all duration-300 hover:opacity-95">
            <img src="https://room302.studio/room302-logo.svg" alt="Room 302 Studio"
              class="h-16 sm:h-20 md:h-24 w-auto mx-auto filter grayscale dark:invert opacity-90 dark:opacity-80" />
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { Issue } from '~/types'
import { format } from 'd3-format'
import { h } from 'vue'
import usePrompts from '~/composables/usePrompts'

const store = useAppStore()
const { streamIssues, isProcessing, error, cancelGeneration } = useLLMToIssues()
const documentText = useLocalStorage('document-text', '')
const apiKey = useLocalStorage('openrouter-api-key', '')
const selectedModel = useLocalStorage('selected-model', 'anthropic/claude-3.5-sonnet:beta')
const clickhouse = useClickHouse()
const colorMode = useColorMode()
const commandPalette = ref()
const textareaRef = ref<HTMLTextAreaElement>()
const user = useSupabaseUser()
const prompts = usePrompts()

// State
const loadingSkeletons = ref<number[]>([])
const showCustomPrompt = ref(false)
const isRepoModalOpen = ref(false)
const repoSearchQuery = ref('')
const selectedOrg = ref<string | null>(null)

// Add formatters
const numberFormat = format(',')

// Update repository references to use store
const selectedRepo = computed(() => store.selectedRepository.value)

// Compute list of unique organizations from repositories
const organizations = computed(() => {
  const orgs = new Set<string>()
  store.repositories.value.forEach(repo => {
    const orgName = repo.full_name.split('/')[0]
    orgs.add(orgName)
  })
  return Array.from(orgs)
})

// Filter repositories based on search query and selected organization
const filteredRepositories = computed(() => {
  let repos = store.repositories.value

  // Filter by organization if selected
  if (selectedOrg.value) {
    repos = repos.filter(repo => repo.full_name.startsWith(`${selectedOrg.value}/`))
  }

  // Filter by search query if provided
  if (repoSearchQuery.value.trim()) {
    const query = repoSearchQuery.value.toLowerCase()
    repos = repos.filter(repo => {
      // Search in repo name
      if (repo.full_name.toLowerCase().includes(query)) return true
      // Search in description
      if (repo.description && repo.description.toLowerCase().includes(query)) return true
      return false
    })
  }

  return repos
})

// Initialize store.itemList if needed
onMounted(() => {
  if (!store.itemList.value) {
    store.itemList.value = []
  }
  nextTick(() => {
    autoGrow()
  })
})

// Add this after other onMounted hooks
onMounted(async () => {
  // If user is logged in but we don't have repos, fetch them
  if (user.value && !store.repositories.value.length) {
    try {
      await store.fetchRepositories()
    } catch (error) {
      console.error('Failed to fetch repositories:', error)
    }
  }
})

// Landing page methods
function signIn() {
  // Use Supabase auth directly
  const supabase = useSupabaseClient()
  supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'repo read:user user:email',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
}

function scrollToDemo() {
  const demoElement = document.getElementById('demo')
  if (demoElement) {
    demoElement.scrollIntoView({ behavior: 'smooth' })
  }
}

// Update canGenerate to use store
const canGenerate = computed(() => {
  return Boolean(
    documentText.value?.trim() &&
    apiKey.value?.trim() &&
    !isProcessing.value &&
    selectedModel.value &&
    store.selectedRepository.value
  )
})

const hasIssues = computed(() => {
  return store.itemList.value?.length > 0
})

const showIssuesDisplay = computed(() => {
  return hasIssues.value || loadingSkeletons.value.length > 0
})

const documentStats = computed(() => {
  const text = documentText.value?.trim() || ''
  const words = text ? text.split(/\s+/).length : 0
  const characters = text.length

  return {
    words: numberFormat(words),
    characters: numberFormat(characters)
  }
})

const generateButtonTooltip = computed(() => {
  const missing = []

  if (!selectedRepo.value) {
    missing.push('select a GitHub repository (Step 1)')
  }
  if (!apiKey.value?.trim()) {
    missing.push('enter your OpenRouter API key (Step 2)')
  }
  if (!selectedModel.value) {
    missing.push('choose a language model (Step 2)')
  }
  if (!documentText.value?.trim()) {
    missing.push('paste your document text (Step 3)')
  }

  if (missing.length === 0) return ''

  if (missing.length === 1) {
    return `Please ${missing[0]} to continue.`
  }

  return `Please complete the following steps to continue: ${missing.join(', ')}.`
})

// Function to handle repository selection from the modal
function handleRepoSelection(repo: any) {
  // The repository is already selected in the store by the modal component
  isRepoModalOpen.value = false
}

// Add missing functions to fix linter errors
function selectRepository() {
  if (!user.value) {
    signIn()
    return
  }

  if (store.repositories.value.length === 0) {
    // Show loading toast
    const toast = useToast()
    const loadingToastId = 'loading-repos'

    toast.add({
      id: loadingToastId,
      title: 'Loading repositories',
      description: 'Fetching your GitHub repositories...',
      timeout: 0,
      color: 'primary'
    })

    store.fetchRepositories().then(() => {
      toast.remove(loadingToastId)
      isRepoModalOpen.value = true
    }).catch(err => {
      toast.remove(loadingToastId)
      toast.add({
        title: 'Error',
        description: 'Failed to fetch repositories: ' + err.message,
        timeout: 5000,
        color: 'red'
      })
    })
  } else {
    isRepoModalOpen.value = true
  }
}

function updateApiKey(key: string) {
  apiKey.value = key
}

function updateModel(model: string) {
  selectedModel.value = model
}

function autoGrow() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
}

function processDocument() {
  if (!canGenerate.value) return

  loadingSkeletons.value = Array.from({ length: 5 }, (_, i) => i)

  const messages = generatePrompt(documentText.value, false)
  streamIssues(
    apiKey.value,
    messages,
    true,
    selectedModel.value
  )
}

function generateMore() {
  if (!canGenerate.value) return

  loadingSkeletons.value = Array.from({ length: 3 }, (_, i) => i)

  const messages = generatePrompt(documentText.value, true)
  streamIssues(
    apiKey.value,
    messages,
    false,
    selectedModel.value
  )
}

function clearAllIssues() {
  store.itemList.value = []
}

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

function handleClearAndPaste() {
  clearAllIssues()
  nextTick(() => {
    navigator.clipboard.readText().then(text => {
      documentText.value = text
      nextTick(() => {
        autoGrow()
      })
    }).catch(err => {
      console.error('Failed to read clipboard:', err)
    })
  })
}

// Function to generate prompts for the LLM
function generatePrompt(document: string, isGenerateMore = false) {
  const store = useAppStore()
  if (isGenerateMore) {
    return prompts.generateMorePrompt(document, store.itemList.value || [])
  } else {
    return prompts.docToIssuesPrompt(document)
  }
}
</script>
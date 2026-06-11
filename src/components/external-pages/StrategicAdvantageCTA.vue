<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="app-container px-4 py-12 sm:px-6 lg:py-24">
    <div
      class="bg-brand-850 relative mx-auto w-full overflow-hidden rounded-2xl px-6 py-12 sm:rounded-3xl sm:px-8 sm:py-16 lg:px-12 lg:py-24"
    >
      <svg
        width="360"
        height="437"
        viewBox="0 0 360 437"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="pointer-events-none absolute -bottom-40 left-0 w-32 opacity-50 sm:w-40 md:-bottom-28 md:w-48 lg:-bottom-12 lg:w-64"
      >
        <g clip-path="url(#clip0_7067_79614)">
          <path
            d="M-195.769 288.152L-74.5885 129.379L121.8 107.34L174.373 199.676C223.856 286.547 231.717 368.951 196.543 431.743L147.492 519.297L47.147 516.841C46.6668 516.828 46.1807 516.818 45.6902 516.787L53.5295 485.603L129.35 487.447L169.728 415.395C209.636 344.137 173.218 259.089 147.949 214.728L105.891 140.852L-57.6681 159.218L-158.76 291.681L-116.712 365.539C-90.1637 412.147 -56.9657 446.69 -20.8854 466.451L-3.64715 397.878C-19.4011 390.679 -33.2599 378.453 -42.6286 362.005C-65.6072 321.665 -52.8618 270.964 -14.2072 248.946C24.4301 226.937 74.5409 241.834 97.5194 282.175C120.488 322.497 107.742 373.198 69.105 395.206C56.6674 402.291 43.0305 405.57 29.5073 405.393L10.8306 479.688L11.1611 479.787L3.57649 509.958C3.45713 509.923 3.36534 509.895 3.24598 509.86C-7.56726 506.675 -18.2097 502.438 -28.6113 497.165C-72.337 475.081 -112.094 435.089 -143.154 380.561L-195.769 288.152ZM53.3935 367.623C77.4569 353.917 85.3999 322.339 71.0918 297.22C56.7734 272.083 25.5667 262.806 1.49752 276.516C-22.5889 290.236 -30.5262 321.81 -16.2078 346.947C-1.89968 372.066 29.3071 381.343 53.3935 367.623Z"
            fill="#654321"
          />
        </g>
        <defs>
          <clipPath id="clip0_7067_79614">
            <rect
              width="443.996"
              height="517.995"
              fill="white"
              transform="matrix(-0.868921 0.494951 0.494951 0.868921 102.797 0)"
            />
          </clipPath>
        </defs>
      </svg>

      <svg
        width="369"
        height="477"
        viewBox="0 0 369 477"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="pointer-events-none absolute right-0 -bottom-40 w-32 opacity-50 sm:w-40 md:-bottom-28 md:w-48 lg:-bottom-16 lg:w-64"
      >
        <g clip-path="url(#clip0_7067_79613)">
          <path
            d="M554.947 288.152L433.767 129.379L237.379 107.34L184.805 199.676C135.322 286.547 127.462 368.951 162.636 431.743L211.687 519.297L312.032 516.841C312.512 516.828 312.998 516.818 313.488 516.787L305.649 485.603L229.829 487.447L189.451 415.395C149.543 344.137 185.961 259.089 211.229 214.728L253.288 140.852L416.847 159.218L517.939 291.681L475.891 365.539C449.342 412.147 416.144 446.69 380.064 466.451L362.826 397.878C378.58 390.679 392.439 378.453 401.807 362.005C424.786 321.665 412.04 270.964 373.386 248.946C334.749 226.937 284.638 241.834 261.659 282.175C238.691 322.497 251.436 373.198 290.074 395.206C302.511 402.291 316.148 405.57 329.671 405.393L348.348 479.688L348.018 479.787L355.602 509.958C355.722 509.923 355.813 509.895 355.933 509.86C366.746 506.675 377.388 502.438 387.79 497.165C431.516 475.081 471.272 435.089 502.333 380.561L554.947 288.152ZM305.785 367.623C281.722 353.917 273.779 322.339 288.087 297.22C302.405 272.083 333.612 262.806 357.681 276.516C381.768 290.236 389.705 321.81 375.387 346.947C361.078 372.066 329.872 381.343 305.785 367.623Z"
            fill="#654321"
          />
        </g>
        <defs>
          <clipPath id="clip0_7067_79613">
            <rect
              width="443.996"
              height="517.995"
              fill="white"
              transform="translate(256.382) rotate(29.6665)"
            />
          </clipPath>
        </defs>
      </svg>

      <div
        class="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center sm:gap-8"
      >
        <h2 class="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Gain your Strategic Advantage
        </h2>
        <p class="text-base leading-relaxed text-white sm:text-lg">
          Stop worrying about regulatory blindsides. Start tracking changes with precision and
          confidence today.
        </p>
        <RouterLink to="/signup" class="btn--contrast btn--lg"> Start monitoring now </RouterLink>
      </div>
    </div>
  </section>
</template>

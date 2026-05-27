<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios, { AxiosError } from "axios";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

type ViewState = "loading" | "success" | "error";

const state = ref<ViewState>("loading");
const errorMessage = ref<string>("");
const workflowName = ref<string>("");
const redirectCountdown = ref<number>(5);

const REDIRECT_DELAY_SECONDS = 5;
const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

let countdownTimer: ReturnType<typeof setInterval> | null = null;
let redirectTimer: ReturnType<typeof setTimeout> | null = null;

const clearTimers = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
};

const goToLogin = () => {
  clearTimers();
  router.push({ name: "login" });
};

const startRedirectCountdown = () => {
  redirectCountdown.value = REDIRECT_DELAY_SECONDS;
  countdownTimer = setInterval(() => {
    redirectCountdown.value -= 1;
    if (redirectCountdown.value <= 0) {
      clearTimers();
    }
  }, 1000);
  redirectTimer = setTimeout(goToLogin, REDIRECT_DELAY_SECONDS * 1000);
};

const approve = async () => {
  const token = (route.query.token ?? "") as string;
  const idStr = (route.query.approval_workflow_id ?? "") as string;
  const workflowId = Number(idStr);

  if (!token || !idStr || Number.isNaN(workflowId)) {
    state.value = "error";
    errorMessage.value = t("approve_by_token.error.invalid_link");
    return;
  }

  try {
    const { data } = await axios.post(
      `${BASE_API_URL}/approval-workflows/approve-by-token`,
      { token, approval_workflow_id: workflowId },
      { headers: { "Content-Type": "application/json" } }
    );
    workflowName.value = data?.data?.name ?? "";
    state.value = "success";
    startRedirectCountdown();
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    const status = axiosErr.response?.status;
    const serverMessage = axiosErr.response?.data?.message;

    if (status === 401) {
      errorMessage.value = t("approve_by_token.error.expired");
    } else if (status === 409) {
      errorMessage.value = t("approve_by_token.error.already_approved");
    } else if (status === 403) {
      errorMessage.value = t("approve_by_token.error.forbidden");
    } else if (status === 404) {
      errorMessage.value = t("approve_by_token.error.not_found");
    } else if (status === 400) {
      errorMessage.value = t("approve_by_token.error.bad_request");
    } else {
      errorMessage.value = serverMessage || t("approve_by_token.error.unknown");
    }
    state.value = "error";
  }
};

onMounted(() => {
  approve();
});

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<template>
  <div class="approve-page">
    <div class="approve-card">
      <div v-if="state === 'loading'" class="state-block">
        <a-spin size="large" />
        <p class="state-title">{{ t("approve_by_token.loading.title") }}</p>
        <p class="state-desc">{{ t("approve_by_token.loading.desc") }}</p>
      </div>

      <div v-else-if="state === 'success'" class="state-block success-enter">
        <div class="success-burst">
          <span class="ring ring-1"></span>
          <span class="ring ring-2"></span>
          <span class="ring ring-3"></span>
          <span v-for="n in 8" :key="n" class="confetti" :class="`confetti-${n}`"></span>
          <div class="check-circle">
            <svg viewBox="0 0 52 52" class="check-svg">
              <circle class="check-circle-path" cx="26" cy="26" r="24" fill="none" />
              <path class="check-mark" fill="none" d="M14 27 l8 8 l16 -18" />
            </svg>
          </div>
        </div>
        <p class="state-title success-title">{{ t("approve_by_token.success.title") }}</p>
        <p class="state-desc">
          {{ t("approve_by_token.success.desc") }}
          <span v-if="workflowName" class="font-semibold">"{{ workflowName }}"</span>
        </p>
        <p class="redirect-hint">
          {{ t("approve_by_token.success.redirect", { seconds: redirectCountdown }) }}
        </p>
        <button class="login-btn" @click="goToLogin">
          {{ t("approve_by_token.success.go_login") }}
        </button>
      </div>

      <div v-else class="state-block">
        <div class="icon-circle error">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </div>
        <p class="state-title">{{ t("approve_by_token.error.title") }}</p>
        <p class="state-desc text-red-600">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap");

.approve-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fb 0%, #e9eef9 100%);
  padding: 1.5rem;
  font-family: "Noto Sans Lao", sans-serif;
}

.approve-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 3rem 2rem;
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.state-desc {
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle.success {
  background: #d1fae5;
  color: #059669;
}

.icon-circle.error {
  background: #fee2e2;
  color: #dc2626;
}

/* ===== Success animation ===== */
.success-burst {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #34d399 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(5, 150, 105, 0.35);
  animation: pop-in 0.45s cubic-bezier(0.18, 1.25, 0.6, 1) both;
}

.check-svg {
  width: 64px;
  height: 64px;
}

.check-circle-path {
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: draw-circle 0.55s 0.1s ease-out forwards;
}

.check-mark {
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: draw-check 0.35s 0.55s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.ring {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #34d399;
  opacity: 0;
  animation: ring-pulse 1.4s ease-out forwards;
}

.ring-1 { animation-delay: 0.5s; }
.ring-2 { animation-delay: 0.75s; }
.ring-3 { animation-delay: 1s; }

.confetti {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  opacity: 0;
  transform-origin: center;
  animation: confetti-pop 0.9s 0.55s cubic-bezier(0.18, 1, 0.4, 1) forwards;
}

.confetti-1 { background: #34d399; --tx:  60px; --ty: -50px; --rot: 120deg; }
.confetti-2 { background: #fbbf24; --tx: -55px; --ty: -55px; --rot: -110deg; }
.confetti-3 { background: #60a5fa; --tx:  70px; --ty:  20px; --rot: 200deg; }
.confetti-4 { background: #f472b6; --tx: -65px; --ty:  35px; --rot: -180deg; }
.confetti-5 { background: #a78bfa; --tx:   0px; --ty: -75px; --rot: 90deg;  }
.confetti-6 { background: #facc15; --tx:  40px; --ty:  60px; --rot: 220deg; }
.confetti-7 { background: #22d3ee; --tx: -45px; --ty:   5px; --rot: -90deg; }
.confetti-8 { background: #fb7185; --tx:  20px; --ty: -65px; --rot: 160deg; }

.success-title {
  color: #047857;
  animation: fade-up 0.4s 0.7s both;
}

.state-block.success-enter .state-desc,
.state-block.success-enter .redirect-hint,
.state-block.success-enter .login-btn {
  animation: fade-up 0.4s 0.85s both;
}

.redirect-hint {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.login-btn {
  margin-top: 0.5rem;
  padding: 0.65rem 1.6rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(5, 150, 105, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

@keyframes pop-in {
  0%   { transform: scale(0);   opacity: 0; }
  60%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
}

@keyframes draw-circle {
  to { stroke-dashoffset: 0; }
}

@keyframes draw-check {
  to { stroke-dashoffset: 0; }
}

@keyframes ring-pulse {
  0%   { transform: scale(0.9); opacity: 0.6; }
  100% { transform: scale(2);   opacity: 0;   }
}

@keyframes confetti-pop {
  0%   { transform: translate(-50%, -50%) scale(0.4) rotate(0deg); opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(var(--rot));
    opacity: 0;
  }
}

@keyframes fade-up {
  0%   { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>

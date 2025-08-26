<template>
  <div class="auth-layout">
    <div class="auth-wrapper">
      <div class="auth-header">
        <h1>Hotel Dashboard</h1>
      </div>
      <div class="auth-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background-color: var(--p-surface-100);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-wrapper {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-header {
  margin-bottom: 2rem;
  text-align: center;
}

.auth-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--p-primary-600);
}

.auth-content {
  width: 100%;
}
</style>
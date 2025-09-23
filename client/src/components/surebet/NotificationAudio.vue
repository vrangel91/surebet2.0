<template>
  <audio ref="notificationSound" preload="auto">
    <source src="/sounds/notification.mp3" type="audio/mpeg" />
    <source src="/sounds/notification.wav" type="audio/wav" />
  </audio>
</template>

<script>
export default {
  name: "NotificationAudio",
  methods: {
    playNotification() {
      if (this.$refs.notificationSound) {
        this.$refs.notificationSound.play().catch((error) => {
          console.warn("Erro ao reproduzir áudio de notificação:", error);
        });
      }
    },
  },
};
</script>


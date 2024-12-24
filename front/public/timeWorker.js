let intervalId;

self.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case "START_TIMER":
            // Start a timer with a specified duration
            if (intervalId) break;
            self.postMessage({
                type: "TIMER_STARTED"
            });
            startTimer(payload.id, payload.remainingTime);
            break;

        case "STOP_TIMER":
            // Stop the timer
            stopTimer();
            break;

        default:
            console.error("Unknown message type:", type);
    }
}

function startTimer(id, remainingTime) {
    if (intervalId) {
        stopTimer();
    }
    intervalId = setInterval(() => {
        remainingTime -= 1;
        if (remainingTime < 0) {
            clearInterval(intervalId);
            self.postMessage({
                type: "TIMER_COMPLETED",
                id
            });
        } else {
            self.postMessage({
                type: "TIMER_UPDATE",
                id,
                remainingTime
            })
        }

    }, 1000);
}

function stopTimer() {
    clearInterval(intervalId);
    intervalId = null;
}
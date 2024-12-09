let intervalId;

self.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case "START_TIMER":
            // Start a timer with a specified duration
            startTimer(payload.id, payload.remainingTime);
            break;

        case "STOP_TIMER":
            // Stop the timer
            clearInterval(intervalId);
            break;

        default:
            console.error("Unknown message type:", type);
    }
}

function startTimer(id, remainingTime) {
    if (intervalId) clearInterval(intervalId);
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
    console.log('timer stopped');
}
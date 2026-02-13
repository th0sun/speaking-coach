// Helper: Convert Blob to Base64
window.convertBlobToBase64 = async function (blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Helper: Calculate Streak
window.calculateStreak = function (sessions) {
    if (!sessions || sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    for (let i = sessions.length - 1; i >= 0; i--) {
        const sessionDate = new Date(sessions[i].date);
        sessionDate.setHours(0, 0, 0, 0);

        if (sessionDate.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (sessionDate.getTime() < checkDate.getTime()) {
            break;
        }
    }

    return streak;
};

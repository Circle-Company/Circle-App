export const timeDifference = (current: number, previous: number) => {
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerMonth = msPerDay * 30
    const msPerYear = msPerDay * 365

    const elapsed = current - previous

    if (elapsed < msPerMinute) {
        return "now"
    } else if (elapsed < msPerHour) {
        if (Math.round(elapsed / msPerMinute) > 1) {
            return Math.round(elapsed / msPerMinute) + " mins ago"
        } else {
            return Math.round(elapsed / msPerMinute) + " min ago"
        }
    } else if (elapsed < msPerDay) {
        if (Math.round(elapsed / msPerHour) > 1) {
            return Math.round(elapsed / msPerHour) + " hours ago"
        } else {
            return Math.round(elapsed / msPerHour) + " hour ago"
        }
    } else if (elapsed < msPerMonth) {
        if (Math.round(elapsed / msPerDay) > 1) {
            return Math.round(elapsed / msPerDay) + " days ago"
        } else {
            return Math.round(elapsed / msPerDay) + " day ago"
        }
    } else if (elapsed < msPerYear) {
        if (Math.round(elapsed / msPerMonth) > 1) {
            return Math.round(elapsed / msPerMonth) + " months ago"
        } else {
            return Math.round(elapsed / msPerMonth) + " month ago"
        }
    } else {
        if (Math.round(elapsed / msPerYear) > 1) {
            return Math.round(elapsed / msPerYear) + " years ago"
        } else {
            return Math.round(elapsed / msPerYear) + " year ago"
        }
    }
}

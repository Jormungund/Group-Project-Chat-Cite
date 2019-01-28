const getDate = timestamp => {
    const date = Number(timestamp)
    const displayDate = new Date(date)
    const now = Number(new Date())

    const older = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const thisWeek = {
        weekday: 'long',
        hour: 'numeric'
    };
    const today = {
        hour: 'numeric'
    };
    const old = displayDate.toLocaleString("en-US", older)
    const insideWeek = displayDate.toLocaleString("en-US", thisWeek)
    const thisDay = "Today @ " + displayDate.toLocaleString("en-US", today)

    if (date + (1000 * 60 * 60 * 24) > now) {
        return thisDay
    }
    else if (date + (1000 * 60 * 60 * 24 * 7) > now) {
        return insideWeek
    }
    else {
        return old
    }
}

export default getDate;
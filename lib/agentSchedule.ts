import { fromZonedTime, toZonedTime } from "date-fns-tz"

function parseTimeString(timeStr: string): { hour: number; minute: number } {
    const trimmed = (timeStr || "").trim()
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*([aApP][mM]))?$/)
    if (!match) {
        return { hour: 9, minute: 0 }
    }
    let hour = parseInt(match[1], 10)
    const minute = parseInt(match[2], 10)
    const meridiem = match[3]?.toUpperCase()

    if (meridiem === "PM" && hour < 12) {
        hour += 12
    } else if (meridiem === "AM" && hour === 12) {
        hour = 0
    }

    return { hour, minute }
}

export interface CalculateNextRunOptions {
    time: string
    timezone?: string
    after?: Date
}

export function calculateNextRun(
    timeOrOptions: string | CalculateNextRunOptions,
    timezoneArg?: string,
    afterArg?: Date
): Date {
    let time: string
    let timezone: string
    let after: Date

    if (typeof timeOrOptions === "object" && timeOrOptions !== null) {
        time = timeOrOptions.time
        timezone = timeOrOptions.timezone || "UTC"
        after = timeOrOptions.after || new Date()
    } else {
        time = timeOrOptions
        timezone = timezoneArg || "UTC"
        after = afterArg || new Date()
    }

    const { hour, minute } = parseTimeString(time)

    try {
        let localCandidate = toZonedTime(after, timezone)
        if (isNaN(localCandidate.getTime())) {
            timezone = "UTC"
            localCandidate = toZonedTime(after, timezone)
        }

        localCandidate.setHours(hour, minute, 0, 0)
        let candidateUTC = fromZonedTime(localCandidate, timezone)

        if (isNaN(candidateUTC.getTime()) || candidateUTC <= after) {
            localCandidate.setDate(localCandidate.getDate() + 1)
            candidateUTC = fromZonedTime(localCandidate, timezone)
        }

        if (!isNaN(candidateUTC.getTime())) {
            return candidateUTC
        }
    } catch {
        // Fallback to UTC
    }

    const fallback = new Date(after)
    fallback.setUTCHours(hour, minute, 0, 0)
    if (fallback <= after) {
        fallback.setUTCDate(fallback.getUTCDate() + 1)
    }
    return fallback
}

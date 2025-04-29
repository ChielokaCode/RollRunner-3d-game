/**
 * Converts a time string to seconds
 * Supported formats:
 * - "MM:SS" (e.g., "01:30" -> 90 seconds)
 * - "HH:MM:SS" (e.g., "01:30:45" -> 5445 seconds)
 * - Number as string (e.g., "90" -> 90 seconds)
 */
export const convertTimeToSeconds = (timeString) => {
  // Handle empty input
  if (!timeString || timeString.trim() === "") {
    return null;
  }

  // If the string is just a number, parse it as seconds
  if (/^\d+$/.test(timeString)) {
    return parseInt(timeString, 10);
  }

  // Handle MM:SS format
  const mmssRegex = /^(\d+):(\d{1,2})$/;
  if (mmssRegex.test(timeString)) {
    const [_, minutes, seconds] = timeString.match(mmssRegex) || [];
    return parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
  }

  // Handle HH:MM:SS format
  const hhmmssRegex = /^(\d+):(\d{1,2}):(\d{1,2})$/;
  if (hhmmssRegex.test(timeString)) {
    const [_, hours, minutes, seconds] = timeString.match(hhmmssRegex) || [];
    return (
      parseInt(hours, 10) * 3600 +
      parseInt(minutes, 10) * 60 +
      parseInt(seconds, 10)
    );
  }

  // If the format doesn't match any of the above, return null
  return null;
};

/**
 * Formats seconds as a time string in HH:MM:SS format
 */
export const formatSecondsToTime = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "--:--:--";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};

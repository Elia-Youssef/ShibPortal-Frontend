function parseSeconds(seconds: number) : string {
  let time = ""
  const addZero = (num: number) => {
    return (num < 10 ? "0" : "") + num
  }
  
  let hours = Math.floor(seconds / 3600);
  if (hours > 0) time += `${hours}:`
  
  let minutesLeft = seconds % 3600;
  let minutes = Math.floor(minutesLeft / 60);
  time += `${addZero(minutes)}:`
  
  let secondsLeft = seconds % 60;
  time += `${addZero(secondsLeft)}`
  
  return time;
}

export { parseSeconds };

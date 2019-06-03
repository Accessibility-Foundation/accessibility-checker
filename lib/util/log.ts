export default function log(message) {
  const prefix = `[a11y-check]:`;
  const messageStr = message.toString();

  console.log(`${prefix} ${messageStr}`);
}

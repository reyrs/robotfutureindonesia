// Bodoni's hairline 1 reads as an I ("DI Pro"), so model numbers in names are set in the grotesk.
export default function ModelName({ text }) {
  return text.split(/(\d+)/).map((part, i) => (i % 2 ? <span key={i} className="model-num">{part}</span> : part));
}

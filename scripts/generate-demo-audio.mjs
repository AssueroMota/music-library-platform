/** Original deterministic demos. No samples or commercial recordings. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const directory = fileURLToPath(new URL('../public/audio/', import.meta.url))
mkdirSync(directory, { recursive: true })
const sampleRate = 22050
const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12)
const pieces = [
  {
    slug: 'primeira-luz',
    bpm: 80,
    notes: [0, 2, 4, 7, 5, 4, 2, 0, 2, 4, 5, 9, 7, 5, 4, 0],
    chords: [
      [48, 52, 55],
      [45, 48, 52],
      [41, 45, 48],
      [43, 47, 50],
    ],
  },
  {
    slug: 'passo-sereno',
    bpm: 96,
    notes: [9, 7, 5, 4, 2, 4, 5, 7, 9, 7, 5, 4, 2, 4, 7, 9],
    chords: [
      [45, 48, 52],
      [50, 53, 57],
      [40, 43, 47],
      [45, 48, 52],
    ],
  },
]

function addTone(buffer, midi, start, duration, amplitude, pluck = false) {
  const first = Math.round(start * sampleRate)
  const total = Math.round(duration * sampleRate)
  const freq = frequency(midi)
  for (let i = 0; i < total && first + i < buffer.length; i++) {
    const t = i / sampleRate
    const attack = Math.min(1, t / (pluck ? 0.008 : 0.055))
    const release = Math.min(1, (duration - t) / (pluck ? 0.1 : 0.12))
    const envelope = attack * release * (pluck ? Math.exp(-t * 4) : 0.85)
    const phase = 2 * Math.PI * freq * t + (pluck ? 0 : 0.025 * Math.sin(2 * Math.PI * 5 * t))
    const tone = Math.sin(phase) + 0.2 * Math.sin(phase * 2) + 0.07 * Math.sin(phase * 3)
    buffer[first + i] += tone * envelope * amplitude
  }
}

function writeWav(name, samples) {
  const output = Buffer.alloc(44 + samples.length * 2)
  output.write('RIFF', 0)
  output.writeUInt32LE(output.length - 8, 4)
  output.write('WAVEfmt ', 8)
  output.writeUInt32LE(16, 16)
  output.writeUInt16LE(1, 20)
  output.writeUInt16LE(1, 22)
  output.writeUInt32LE(sampleRate, 24)
  output.writeUInt32LE(sampleRate * 2, 28)
  output.writeUInt16LE(2, 32)
  output.writeUInt16LE(16, 34)
  output.write('data', 36)
  output.writeUInt32LE(samples.length * 2, 40)
  samples.forEach((value, i) =>
    output.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), 44 + i * 2),
  )
  writeFileSync(`${directory}/${name}.wav`, output)
  console.log(`${name}.wav · ${(samples.length / sampleRate).toFixed(2)}s`)
}

for (const piece of pieces) {
  const beat = 60 / piece.bpm
  const count = Math.ceil((16 * beat + 0.2) * sampleRate)
  const backing = new Float32Array(count)
  piece.chords.forEach((chord, bar) => {
    chord.forEach((note) => addTone(backing, note - 12, bar * 4 * beat, 4 * beat, 0.037))
    for (let step = 0; step < 8; step++)
      addTone(
        backing,
        chord[[0, 1, 2, 1][step % 4]],
        (bar * 4 + step / 2) * beat,
        beat * 0.9,
        0.13,
        true,
      )
  })
  const lead = new Float32Array(backing)
  piece.notes.forEach((note, index) => addTone(lead, 60 + note, index * beat, beat * 0.94, 0.22))
  writeWav(`${piece.slug}-backing`, backing)
  writeWav(`${piece.slug}-lead`, lead)
}

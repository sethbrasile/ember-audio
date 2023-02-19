import ContextMock from './context-mock';
import { Note } from 'ember-audio/classes';

export default function noteFactory(letter, accidental, octave) {
  return Note.create({
    letter,
    accidental,
    octave,
    audioContext: ContextMock.create(),
  });
}

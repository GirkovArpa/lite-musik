import * as sys from '@sys';
import { read_pipe } from 'this://app/js/read_pipe.js';

export default async function spawn_ahk() {
  const ahk = sys.spawn([sys.cwd() + '/ahk/hotkeys.exe'], { stdout: 'pipe', stdin: 'pipe' });
  for await (const line of read_pipe(ahk.stdout)) {
    console.log(`“${line}”`);
    handle_message(line);
  }
}

function handle_message(line) {
  const [_, title, body] = line.match(/\[(.+)\] ?(.+)?/);
  if (title === 'ABOUT') {
    Window.this.modal({
      url: 'about/about.html'
    });
  } else {
    console.log(`Unknown command: “${line}”`);
  }
}


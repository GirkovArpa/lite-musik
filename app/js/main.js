import { $, $$ } from '@sciter';
import { movableView } from 'this://app/js/moveable_view.js';
import { DropZone } from 'this://app/js/drop_zone.js';

main();

async function main() {
  const global_state = {
    playing: false,
    files: [],
    file: null,
    audio: null,
    duration: null
  };
  adjust_window();
  movableView('#container');
  drop_zone(global_state);
  add_event_listeners(global_state);
  setInterval(() => update_progress(global_state), 10);
}


function adjust_window() {
  const [_, w] = document.state.contentWidths();
  const h = document.state.contentHeight(w);
  const [sw, sh] = Window.this.screenBox('frame', 'dimension');
  Window.this.move((sw - w) / 2, (sh - h) / 2, w, h, true);
}

function drop_zone(global_state) {
  const G = global_state;
  DropZone({
    container: $('#container'),
    accept: '*.mp3',
    ondrop: async function (files) {
      G.files = Array.isArray(files) ? files : [files];
      G.file = G.files[0];
      await load_song(G);
      enable_buttons(true);
    }
  });
}

function add_event_listeners(global_state) {
  $('#about').onclick = function() {
    Window.this.modal({
      url: 'about/about.html'
    });
  }

  $('#close').onclick = function() {
    Window.this.close();
  }

  $('#next').onclick = async function () {
    const G = global_state;
    G.file = next_element(G.files, G.file);
    await load_song(G);
    G.playing && play_song(G);
  }

  $('#previous').onclick = async function () {
    const G = global_state;
    G.file = previous_element(G.files, G.file);
    await load_song(G);
    G.playing && play_song(G);
  }

  /*$('#forward').onclick = function () {
    const { audio } = global_state;
    audio.progress += 0.1;
    console.log(audio.progress);
  }*/

  $('#play-pause').onclick = function () {
    const { audio, playing } = global_state;
    if (playing) {
      global_state.playing = false;
      audio.pause();
      $('#play-pause').style.backgroundImage = "url('this://app/img/png/play.png')";
    } else {
      global_state.playing = true;
      console.log('progress', audio.progress);
      if (audio.progress === undefined) {
        audio.play();
        console.log('playing');
      } else {
        audio.resume();
        console.log('resuming');
      }
      $('#play-pause').style.backgroundImage = "url('this://app/img/png/pause.png')";
    }
  }
}

function enable_buttons(enable) {
  $('.button#previous').state.disabled = !enable;
  $('.button#play-pause').state.disabled = !enable;
  $('.button#next').state.disabled = !enable;
}

async function update_progress(global_state) {
  const progress = global_state.audio?.progress ?? 0;
  const pc = progress * 100;
  const mmss = format_seconds(progress * global_state.duration);
  $('#progress').textContent = mmss;
  $('#progress').style.background = `linear-gradient(left, var(emoji-blue, red) ${pc}%, var(emoji-blue, red) ${pc}%, white ${pc}%)`;
}

function get_mp3_duration(filename) {
  return new Promise((resolve) => {
    Window.this.xcall('get_mp3_duration', filename, resolve);
  });
}

function format_seconds(seconds) {
  seconds = Number(seconds.toFixed(0));
  const mm = String(~~(seconds / 60));
  const ss = String(seconds - mm * 60);
  return mm.padStart(2, '0') + ':' + ss.padStart(2, '0');
}

async function load_song(global_state) {
  const G = global_state;
  G.audio !== null && G.audio.pause();
  G.audio = await Audio.load(G.file);
  G.playing = false;
  $('#play-pause').style.backgroundImage = "url('this://app/img/png/play.png')";
  $('#title').textContent = decodeURI(G.file.replace(/^.*[\\\/]/, ''));
  G.duration = await get_mp3_duration(decodeURI(G.file).replace('file://', ''));
}

async function play_song(global_state) {
  const G = global_state;
  G.audio.play().then(async () => {
    G.file = next_element(G.files, G.file);
    await load_song(G);
    play_song(G);
    $('#play-pause').style.backgroundImage = " url('this://app/img/png/pause.png')";
  });
}

function next_element(array, element) {
  const [A, E] = [array, element];
  return A[(A.indexOf(E) + 1) % A.length];
}


function previous_element(array, element) {
  const [A, E] = [array, element];
  const I = A.indexOf(E) - 1;
  return A[I === -1 ? A.length - 1 : I];
}
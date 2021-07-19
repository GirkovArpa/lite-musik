import { $, $$ } from '@sciter';
import { launch } from '@env';
import { cwd } from '@sys';

$('#sciter').on('click', () => {
  launch('https://sciter.com');
});

$('#terra-informatica').on('click', () => {
  launch('https://terrainformatica.com');
});

$('button').on('click', () => Window.this.close());

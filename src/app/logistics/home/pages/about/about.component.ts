import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  template: `<p>about works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent { }

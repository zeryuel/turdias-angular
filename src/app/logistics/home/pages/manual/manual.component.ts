import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-manual',
  standalone: true,
  imports: [],
  template: `<p>manual works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualComponent { }

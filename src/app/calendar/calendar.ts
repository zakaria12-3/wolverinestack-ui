import {Component, model, signal} from '@angular/core';
import {BrnSelectImports} from '@spartan-ng/brain/select';
import {FormsModule} from '@angular/forms';
import {HlmCalendar} from '@spartan-ng/helm/calendar';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-calendar',
  imports: [HlmCalendar, BrnSelectImports, HlmSelectImports, FormsModule],
  host: {
    class: 'flex flex-col gap-4',
  },
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  protected readonly _captionLayout = model<'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years'>('dropdown');
  today = new Date();

}

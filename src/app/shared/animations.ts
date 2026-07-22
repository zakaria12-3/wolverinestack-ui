import {
  animate,
  animateChild,
  group,
  query,
  style,
  transition,
  trigger
} from '@angular/animations';

/**
 * Route transition animation: fade + slide up for entering routes,
 * fade + slide up for leaving routes. Used as the single animation
 * trigger on the router outlet wrapper in app.html.
 *
 * Every route that should animate must have `data: { animation: 'FadeSlidePage' }`
 * in the route config. Routes without animation data are skipped.
 */
export const routeAnimations = trigger('routeAnimations', [
  transition('FadeSlidePage <=> FadeSlidePage', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({ position: 'absolute', width: '100%', top: 0, left: 0 })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true })
    ]),
    query(':enter', animateChild(), { optional: true })
  ]),

  // Fallback: any other direction (e.g. from * to FadeSlidePage)
  transition('* => FadeSlidePage', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true }),
    query(':enter', animateChild(), { optional: true })
  ])
]);

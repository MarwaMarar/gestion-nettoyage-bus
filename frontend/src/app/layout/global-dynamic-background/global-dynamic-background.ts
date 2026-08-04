import { ChangeDetectionStrategy, Component } from '@angular/core';

interface SoapBubble {
  id: number;
  left: string;
  size: string;
  duration: string;
  delay: string;
  drift: string;
  opacity: number;
}

@Component({
  selector: 'app-global-dynamic-background',
  standalone: true,
  templateUrl: './global-dynamic-background.html',
  styleUrl: './global-dynamic-background.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalDynamicBackgroundComponent {
  readonly bubbles: readonly SoapBubble[] = [
    { id: 1, left: '4%', size: '38px', duration: '24s', delay: '-7s', drift: '28px', opacity: 0.42 },
    { id: 2, left: '14%', size: '72px', duration: '31s', delay: '-24s', drift: '-42px', opacity: 0.35 },
    { id: 3, left: '27%', size: '26px', duration: '19s', delay: '-13s', drift: '22px', opacity: 0.48 },
    { id: 4, left: '38%', size: '96px', duration: '35s', delay: '-5s', drift: '55px', opacity: 0.30 },
    { id: 5, left: '49%', size: '48px', duration: '27s', delay: '-21s', drift: '-30px', opacity: 0.40 },
    { id: 6, left: '59%', size: '110px', duration: '33s', delay: '-29s', drift: '-58px', opacity: 0.27 },
    { id: 7, left: '69%', size: '32px', duration: '22s', delay: '-16s', drift: '36px', opacity: 0.46 },
    { id: 8, left: '78%', size: '64px', duration: '29s', delay: '-10s', drift: '-25px', opacity: 0.36 },
    { id: 9, left: '88%', size: '44px', duration: '25s', delay: '-20s', drift: '45px', opacity: 0.42 },
    { id: 10, left: '95%', size: '82px', duration: '32s', delay: '-3s', drift: '-36px', opacity: 0.32 }
  ];
}

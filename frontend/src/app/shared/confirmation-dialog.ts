import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <dialog #dialog class="confirmation-modal" (click)="clicDialogue($event)" (cancel)="annulationNavigateur($event)">
        <div class="confirmation-icon"><i class="fa-solid" [ngClass]="icone"></i></div>
        <h2>{{ titre }}</h2>
        <p>{{ message }}</p>
        <div class="confirmation-actions">
          <button type="button" class="cancel-button" [disabled]="chargement" (click)="annuler.emit()">Annuler</button>
          <button type="button" class="confirm-button" [disabled]="chargement" (click)="confirmer.emit()">
            <i class="fa-solid" [class.fa-spinner]="chargement" [class.fa-spin]="chargement" [ngClass]="chargement ? '' : icone"></i>
            {{ chargement ? 'Traitement…' : libelleConfirmation }}
          </button>
        </div>
    </dialog>
  `,
  styleUrl: './confirmation-dialog.css'
})
export class ConfirmationDialog implements AfterViewInit {
  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  @Input() titre = 'Confirmer cette action ?';
  @Input() message = '';
  @Input() libelleConfirmation = 'Confirmer';
  @Input() icone = 'fa-check';
  @Input() chargement = false;
  @Output() confirmer = new EventEmitter<void>();
  @Output() annuler = new EventEmitter<void>();

  ngAfterViewInit(): void { this.dialog.nativeElement.showModal(); }
  clicDialogue(event: MouseEvent): void {
    if (event.target === this.dialog.nativeElement && !this.chargement) this.annuler.emit();
  }
  annulationNavigateur(event: Event): void {
    event.preventDefault();
    if (!this.chargement) this.annuler.emit();
  }
}

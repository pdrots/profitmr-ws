import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Copy, Language, Region, RegionId, Theme } from '../../utils/rewards-calculator.models';

@Component({
  selector: 'app-calculator-header',
  standalone: true,
  templateUrl: './calculator-header.component.html',
  styleUrl: './calculator-header.component.css',
})
export class CalculatorHeaderComponent {
  @Input({ required: true }) copy!: Copy;
  @Input({ required: true }) region!: Region;
  @Input({ required: true }) regionId!: RegionId;
  @Input({ required: true }) regionOptions!: Region[];
  @Input({ required: true }) language!: Language;
  @Input({ required: true }) theme!: Theme;

  @Output() regionChange = new EventEmitter<RegionId>();
  @Output() languageChange = new EventEmitter<Language>();
  @Output() themeToggle = new EventEmitter<void>();

  readonly languageOptions = [
    { value: 'pt-BR' as const, label: 'Portugu\u00eas' },
    { value: 'en-US' as const, label: 'English' },
    { value: 'es' as const, label: 'Espa\u00f1ol' },
  ];

  get themeButtonLabel(): string {
    return this.theme === 'light' ? this.copy.switchToDark : this.copy.switchToLight;
  }

  toggleTheme(): void {
    this.themeToggle.emit();
  }

  selectRegion(value: RegionId, menu: HTMLDetailsElement): void {
    this.regionChange.emit(value);
    menu.open = false;
  }

  selectLanguage(value: Language, menu: HTMLDetailsElement): void {
    this.languageChange.emit(value);
    menu.open = false;
  }

  closeOtherMenu(menu: HTMLDetailsElement, otherMenu: HTMLDetailsElement): void {
    if (menu.open && otherMenu.open) {
      otherMenu.open = false;
    }
  }
}

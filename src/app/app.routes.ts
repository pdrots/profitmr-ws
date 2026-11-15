import { Routes } from '@angular/router';
import { FluxoComponent } from './pages/fluxo/fluxo.component';
import { RewardsCalculatorComponent } from './pages/rewards-calculator/rewards-calculator.component';

export const routes: Routes = [
  { path: '', redirectTo: 'rewards', pathMatch: 'full' },
  { path: 'fluxo', component: FluxoComponent },
  { path: 'rewards', component: RewardsCalculatorComponent },
  { path: '**', redirectTo: 'rewards' },
];

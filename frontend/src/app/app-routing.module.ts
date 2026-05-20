import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeneficiaryComponent } from './beneficiary/beneficiary.component';
import { ManagerComponent } from './manager/manager.component';

const routes: Routes = [
  { path: 'beneficiary', component: BeneficiaryComponent },
  { path: 'manager', component: ManagerComponent },
  { path: '', redirectTo: '/beneficiary', pathMatch: 'full' },
  { path: '**', redirectTo: '/beneficiary' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

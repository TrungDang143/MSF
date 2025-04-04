import { Routes } from '@angular/router';
import { LoginComponent } from './page/login/login.compoment';
import { SignUpComponent } from './page/sign-up/sign-up.compoment';
import { HomeComponent } from './page/home/home.compoment';
import { ForgotComponent } from './page/forgot/forgot.compoment';
import { ValidateCodeComponent } from './page/forgot/validate-code.compoment';
import { NewPasswordComponent } from './page/forgot/new-password.compoment';
import { AuthGuard } from './shared/auth.guard';
import { AccountComponent } from './page/home/account/account.component';
import { DashboardComponent } from './page/home/dashboard/dashboard.component';
import { SettingComponent } from './page/home/setting/setting.component';
import { LogComponent } from './page/home/log/log.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'forgot', component: ForgotComponent },
  { path: 'validate-code', component: ValidateCodeComponent },
  { path: 'new-password', component: NewPasswordComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'account', component: AccountComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'setting', component: SettingComponent },
      { path: 'log', component: LogComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

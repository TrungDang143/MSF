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
import { ListAccountsComponent } from './page/home/account/list-accounts/list-accounts.component';
import { MyAccountComponent } from './page/home/account/my-account/my-account.component';
import { Page404Component } from './page/page-404/page-404.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'page-404', component: Page404Component },
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
      { path: 'list-accounts', component: ListAccountsComponent },
      { path: 'my-account', component: MyAccountComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/page-404' },
];

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HowItWorksComponent } from "./how-it-works/how-it-works.component";
import { UserListComponent } from "./user-list/user-list.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
const routes: Routes = [
  { path: "", component: DashboardComponent },
  { path: "how-it-works", component: HowItWorksComponent },
  { path: "user-list", component: UserListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

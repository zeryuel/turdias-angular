import { Routes } from '@angular/router';
import { LoginComponent } from './security/login/login.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ServiceRequirementComponent } from './maintenance/service-requirement/service-requirement.component';
import { MaintenancePlanComponent } from './maintenance/maintenance-plan/maintenance-plan.component';
import { MechanicComponent } from './maintenance/mechanic/mechanic.component';
import { VehicleComponent } from './maintenance/vehicle/vehicle.component';
import { WorkComponent } from './maintenance/work/work.component';
import { WorkOrderComponent } from './maintenance/work-order/work-order.component';
import { HomeComponent } from './maintenance/home/home.component';
import { VehicleModelComponent } from './maintenance/vehicle/pages/vehicle-model/vehicle-model.component';
import { VehicleBrandComponent } from './maintenance/vehicle/pages/vehicle-brand/vehicle-brand.component';
import { AboutComponent } from './maintenance/home/pages/about/about.component';
import { ManualComponent } from './maintenance/home/pages/manual/manual.component';
import { ReportIncidenceComponent } from './maintenance/reports/pages/report-incidence/report-incidence.component';
import { ReportWorkOrderComponent } from './maintenance/reports/pages/report-work-order/report-work-order.component';
import { ReportMaintenancePlanComponent } from './maintenance/reports/pages/report-maintenance-plan/report-maintenance-plan.component';
import { ReportMechanicComponent } from './maintenance/reports/pages/report-mechanic/report-mechanic.component';
import { ReportVehicleComponent } from './maintenance/reports/pages/report-vehicle/report-vehicle.component';
import { ReportWorkComponent } from './maintenance/reports/pages/report-work/report-work.component';
import { ApplicationBoardComponent } from './security/application-board/application-board.component';

import { SupplierComponent } from './logistics/supplier/supplier.component';
import { LogisticsComponent } from './logistics/logistics.component';
import { RequestOrderComponent } from './logistics/request-order/request-order.component';
import { ProductComponent } from './logistics/product/product.component';
import { AuthorizerComponent } from './logistics/authorizer/authorizer.component';
import { CostCenterComponent } from './logistics/cost-center/cost-center.component';
import { PeriodComponent } from './logistics/period/period.component';
import { ProofPaymentComponent } from './logistics/proof-payment/proof-payment.component';
import { PurchaseOrderComponent } from './logistics/purchase-order/purchase-order.component';
import { EntryOrderComponent } from './logistics/entry-order/entry-order.component';
import { AuthorizePurchaseComponent } from './logistics/authorize-purchase/authorize-purchase.component';
import { InventoryAdjustmentComponent } from './logistics/inventory-adjustment/inventory-adjustment.component';
import { DepartureOrderComponent } from './logistics/departure-order/departure-order.component';
import { InventoryComponent } from './logistics/inventory/inventory.component';
import { KardexComponent } from './logistics/kardex/kardex.component';
import { ServiceOrderComponent } from './logistics/service-order/service-order.component';
import { SecurityComponent } from './security/security.component';
import { UserComponent } from './security/user/user.component';
import { RoleComponent } from './security/role/role.component';
import { ScaleComponent } from './scale/scale.component';
import { AreaComponent } from './scale/area/area.component';
import { PersonalComponent } from './scale/personal/personal.component';
import { ReportPurchaseComponent } from './logistics/reports/pages/report-purchase/report-purchase.component';
import { ReportProductsComponent } from './logistics/reports/pages/report-products/report-products.component';
import { ReportInventoryComponent } from './logistics/reports/pages/report-inventory/report-inventory.component';
import { ReportProofComponent } from './logistics/reports/pages/report-proof/report-proof.component';
import { ReportEntryComponent } from './logistics/reports/pages/report-entry/report-entry.component';
import { ReportDepartureComponent } from './logistics/reports/pages/report-departure/report-departure.component';
import { BrandComponent } from './logistics/product/pages/brand/brand.component';
import { UnitMeasureComponent } from './logistics/product/pages/unit-measure/unit-measure.component';
import { EconomicActivityComponent } from './logistics/supplier/pages/supplier-activity/economic-activity.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'application-board', component: ApplicationBoardComponent },
  {
    path: 'maintenance',
    component: MaintenanceComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'service-requirement', component: ServiceRequirementComponent },
      { path: 'maintenance-plan', component: MaintenancePlanComponent },
      { path: 'mechanic', component: MechanicComponent },
      { path: 'vehicle', component: VehicleComponent },
      { path: 'vehicle-model', component: VehicleModelComponent },
      { path: 'vehicle-brand', component: VehicleBrandComponent },
      { path: 'work', component: WorkComponent },
      { path: 'work-order', component: WorkOrderComponent },
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'manual', component: ManualComponent },
      { path: 'report-incidence', component: ReportIncidenceComponent },
      { path: 'report-work-order', component: ReportWorkOrderComponent },
      { path: 'report-maintenance-plan', component: ReportMaintenancePlanComponent },
      { path: 'report-mechanic', component: ReportMechanicComponent },
      { path: 'report-work', component: ReportWorkComponent },
      { path: 'report-vehicle', component: ReportVehicleComponent }
    ]
  },
  {
    path: 'logistics',
    component: LogisticsComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'brand', component: BrandComponent },
      { path: 'unit-measure', component: UnitMeasureComponent },
      { path: 'product', component: ProductComponent },
      { path: 'economic-activity', component: EconomicActivityComponent },
      { path: 'supplier', component: SupplierComponent },
      { path: 'authorizer', component: AuthorizerComponent },
      { path: 'cost-center', component: CostCenterComponent },
      { path: 'period', component: PeriodComponent },
      { path: 'request-order', component: RequestOrderComponent },
      { path: 'proof-payment', component: ProofPaymentComponent },
      { path: 'purchase-order', component: PurchaseOrderComponent },
      { path: 'service-order', component: ServiceOrderComponent },
      { path: 'authorize-purchase', component: AuthorizePurchaseComponent },
      { path: 'inventory-adjustment', component: InventoryAdjustmentComponent },
      { path: 'entry-order', component: EntryOrderComponent },
      { path: 'departure-order', component: DepartureOrderComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'kardex', component: KardexComponent },
      { path: 'report-purchase', component: ReportPurchaseComponent },
      { path: 'report-products', component: ReportProductsComponent },
      { path: 'report-inventory', component: ReportInventoryComponent },
      { path: 'report-proof', component: ReportProofComponent },
      { path: 'report-entry', component: ReportEntryComponent },
      { path: 'report-departure', component: ReportDepartureComponent },
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent }
    ]
  },
  {
    path: 'security',
    component: SecurityComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'user', component: UserComponent },
      { path: 'role', component: RoleComponent },
      { path: 'home', component: HomeComponent }
    ]
  },
  {
    path: 'scale',
    component: ScaleComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'area', component: AreaComponent },
      { path: 'personal', component: PersonalComponent },
      { path: 'home', component: HomeComponent }
    ]
  }
];

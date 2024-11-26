import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

import { ReportsService } from '../../services/reports.service';
import { Parameter } from '../../../shared/interfaces/parameter.interface';
import { environment } from '../../../../../environments/environment';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { Filter } from '../../../../shared/interfaces/filter.interface';
import { ModalCostCenterComponent } from '../../../shared/components/modal-cost-center/modal-cost-center.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CostCenter } from '../../../cost-center/interfaces/cost-center.interface';

@Component({
  selector: 'app-report-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './report-inventory.component.html'
})
export class ReportInventoryComponent implements OnInit {

  public bsModalRef: BsModalRef = new BsModalRef()
  public model: FormGroup = new FormGroup({})

  constructor(
    private spinner: NgxSpinnerService
    , private bsModalService: BsModalService
    , private formBuilder: FormBuilder
    , private service: ReportsService
  ) { }

  ngOnInit(): void {
    this.model = this.formBuilder.group({
      id_cost_center: ['', Validators.required],
      cost_center_name: ''
    });
  }

  public generateReport() {
    if (this.model.valid) {

      let lstParameter: Array<Parameter> = [
        { name: 'p_id_almacen', value: this.model.get('id_cost_center')?.value }
      ]

      this.spinner.show()
      this.service.inventoryByWarehouse(lstParameter).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {
            this.generateExcel(response.value);
            this.spinner.hide()
          } else
            this.errorHandler(response.message);
        },
        error: (err) => { this.exceptionHandler(err) }
      })

    } else {
      this.model.markAllAsTouched()
      let initialState = { tipo: 3, opcion: 10 }
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    }
  }

  private generateExcel(objeto: any ) {
    let Heading = [
      ['', ''],
      ['', 'FORMATO', '"REPORTE DE STOCK DE INVENTARIO DE ALMACEN"'],
      ['', ''],
      ['', 'ALMACEN :', this.model.get('id_cost_center')?.value + ' - ' + this.model.get('cost_center_name')?.value],
      ['', 'FECHA :', moment().format('DD/MM/YYYY')],
      ['', 'RUC :', environment.company.ruc],
      ['', 'RAZON SOCIAL :', environment.company.reasonSocial],
      ['', 'MONEDA :', 'SOLES (S/.)']
    ];

    let arr: any = [
      { col1: { v: "CODIGO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col2: { v: "PRODUCTO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "left" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col3: { v: "COD. ALTERNAT.", t: "s", s: { font: { bold: true }, alignment: { horizontal: "left" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col4: { v: "MARCA", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col5: { v: "UND. MEDIDA", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col6: { v: "POSICION", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col7: { v: "STOCK", t: "s", s: { font: { bold: true }, alignment: { horizontal: "right" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col8: { v: "VALOR UNT.", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "right" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } }
      }
    ];

    for (let item of objeto) {
      arr.push(
        {
          col1: { v: item.item.id , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col2: { v: item.item.name, t: "s", s: { alignment: { horizontal: "left" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col3: { v: item.item.alternativeCode, t: "s", s: { alignment: { horizontal: "left" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col4: { v: item.item.itemBrand.name, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col5: { v: item.item.itemUnitMeasure.name, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col6: { v: item.position , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col7: { v: item.stock , t: "s", s: { alignment: { horizontal: "right" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col8: { v: item.unitValue , t: "s", s: { alignment: { horizontal: "right" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }}
        }
      );
     }

    const workbook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    worksheet["!cols"] = [ { wch: 10 }, { wch: 16 }, { wch: 60 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 20 } ];

    XLSX.utils.sheet_add_aoa(worksheet, Heading);
    XLSX.utils.sheet_add_json(worksheet, arr, { origin: 'B9', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');

    XLSX.writeFile(workbook, 'Reporte_inventario' + '_' + new  Date().getTime() + '.xlsx');
  }

  public cleanCostCenter() {
    this.model.get('id_cost_center')?.setValue('');
    this.model.get('cost_center_name')?.setValue('');
  }

  public searchCostCenter() {
    let lstFilter: Filter[] =  [
      { object: 'costCenterType', column: 'id', value: '1', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalCostCenterComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        this.model.get('id_cost_center')?.setValue(response.id)
        this.model.get('cost_center_name')?.setValue(response.name)
      }
    })
  }

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  private errorHandler(error: string) {
    this.spinner.hide();
    let initialState: any = { tipo: 3, textoPredeterminado: error };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, class: 'modal-dialog-custom' });
  }

  private exceptionHandler(exception: any) {
    this.spinner.hide();
    let message: string = '¡Existe un problema al acceder al servidor, contactese con soporte!';

    if (exception.status == '401')
      message = '¡No tiene permisos suficientes para utilizar este modulo, inicie sesión nuevamente!';

    let initialState: any = { tipo: 2, textoPredeterminado: message };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, class: 'modal-dialog-custom' });
  }
}

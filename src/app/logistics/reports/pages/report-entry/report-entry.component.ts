import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

import { ReportsService } from '../../services/reports.service';
import { Parameter } from '../../../shared/interfaces/parameter.interface';
import { environment } from '../../../../../environments/environment';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { ModalSupplierComponent } from '../../../shared/components/modal-supplier/modal-supplier.component';
import { Supplier } from '../../../supplier/interfaces/supplier.interface';
import { Paged } from '../../../../shared/interfaces/paged.interface';
import { Filter } from '../../../../shared/interfaces/filter.interface';
import { ModalCostCenterComponent } from '../../../shared/components/modal-cost-center/modal-cost-center.component';
import { CostCenter } from '../../../cost-center/interfaces/cost-center.interface';

@Component({
  selector: 'app-report-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './report-entry.component.html'
})
export class ReportEntryComponent {
  public model: FormGroup;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: ReportsService
  ) {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      costCenter: this.formBuilder.group({ id: '', name: '' }),
      startDate: [moment().add(-30, 'days').format('DD/MM/YYYY'), Validators.required],
      endDate: [moment().format('DD/MM/YYYY'), Validators.required]
    })
  }

  ngOnInit(): void { }

  public generateReport() {
    if (this.model.valid) {
      let startDate: any = this.model.get('startDate')?.value;
      let endDate: any = this.model.get('endDate')?.value;

      if (startDate instanceof Date) startDate = moment(startDate).format('DD/MM/YYYY');
      if (endDate instanceof Date) endDate = moment(endDate).format('DD/MM/YYYY');

      let paged: Paged = {
        pageSize: 0,
        pageNumber: 0,
        orderColumn: '',
        order: '',
        lstFilter: [
          {
            object: 'costCenter',
            column: 'id',
            value: this.model.get('costCenter')?.get('id')?.value,
            operator: 'equal'
          },
          {
            object: 'entryOrder',
            column: 'date',
            value: startDate + '-' + endDate,
            operator: 'rangeDate'
          }
        ]
      };

      this.spinner.show()
      this.service.entry(paged).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {
            this.generateExcel(response.value.content);
            this.spinner.hide();
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
      ['', 'FORMATO', '"REPORTE DE ENTRADAS"'],
      ['', ''],
      ['', 'FECHA :', moment().format('DD/MM/YYYY')],
      ['', 'RUC :', environment.company.ruc],
      ['', 'RAZON SOCIAL :', environment.company.reasonSocial]
    ];

    let arr: any = [
      { col1: { v: "CODIGO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col2: { v: "COD. ALTERNATIVO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col3: { v: "PRODUCTO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col4: { v: "MARCA", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col5: { v: "UND. MEDIDA", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col6: { v: "FECHA", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col7: { v: "ALMACEN", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col8: { v: "CANTIDAD", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col9: { v: "VALOR UNT.", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } }
      }
    ];

    for (let item of objeto) {
      arr.push(
        {
          col1: { v: item.value_1 , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col2: { v: item.value_2, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col3: { v: item.value_3, t: "s", s: { alignment: { horizontal: "left" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col4: { v: item.value_4, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col5: { v: item.value_5, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col6: { v: item.value_6, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col7: { v: item.value_7, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col8: { v: item.value_8, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col9: { v: item.value_9, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }}
        }
      );
     }

    const workbook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    worksheet["!cols"] = [ { wch: 10 }, { wch: 16 }, { wch: 20 }, { wch: 60 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 40 }, { wch: 15 }, { wch: 15 } ];

    XLSX.utils.sheet_add_aoa(worksheet, Heading);
    XLSX.utils.sheet_add_json(worksheet, arr, { origin: 'B8', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');

    XLSX.writeFile(workbook, 'Reporte_entradas' + '_' + new  Date().getTime() + '.xlsx');
  }

  public searchCostCenter() {
    let lstFilter: Filter[] =  [
      { object: 'costCenterType', column: 'id', value: '1', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalCostCenterComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        this.model.get('costCenter')?.get('id')?.setValue(response.id);
        this.model.get('costCenter')?.get('name')?.setValue(response.name);
      }
    });
  }

  public cleanCostCenter() {
    this.model.get('costCenter')?.get('id')?.setValue('');
    this.model.get('costCenter')?.get('name')?.setValue('');
  }

  public onChangeInvalidDate(event: any) {
    let mensaje = event.target.value;

    if (mensaje == 'Invalid date') {
      event.target.value = 'fecha invalida'
    }
  }

  public onKeyPressDate(event: any) {
    let pattern = /^([0-9,/])*$/
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

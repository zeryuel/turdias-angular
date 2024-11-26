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

@Component({
  selector: 'app-report-purchase',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './report-purchase.component.html'
})
export class ReportPurchaseComponent {
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
      supplier: this.formBuilder.group({ id: '', ruc:'', reasonSocial: '' }),
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
            object: 'supplier',
            column: 'id',
            value: this.model.get('supplier')?.get('id')?.value,
            operator: 'equal'
          },
          {
            object: 'purchaseOrder',
            column: 'purchase_date',
            value: startDate + '-' + endDate,
            operator: 'rangeDate'
          }
        ]
      };

      this.spinner.show()
      this.service.purchase(paged).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {
            console.log(response)
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
      ['', 'FORMATO', '"REPORTE DE COMPRAS"'],
      ['', ''],
      ['', 'FECHA :', moment().format('DD/MM/YYYY')],
      ['', 'RUC :', environment.company.ruc],
      ['', 'RAZON SOCIAL :', environment.company.reasonSocial]
    ];

    let arr: any = [
      { col1: { v: "RUC", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col2: { v: "PROVEEDOR", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col3: { v: "FECHA", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col4: { v: "ESTADO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col5: { v: "MONEDA", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col6: { v: "PRECIO VENTA", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } }
      }
    ];

    for (let item of objeto) {
      arr.push(
        {
          col1: { v: item.value_1 , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col2: { v: item.value_2, t: "s", s: { alignment: { horizontal: "left" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col3: { v: item.value_3, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col4: { v: item.value_4 , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col5: { v: item.value_5 , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col6: { v: item.value_6 , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }}
        }
      );
     }

    const workbook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    worksheet["!cols"] = [ { wch: 10 }, { wch: 16 }, { wch: 60 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ];

    XLSX.utils.sheet_add_aoa(worksheet, Heading);
    XLSX.utils.sheet_add_json(worksheet, arr, { origin: 'B8', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');

    XLSX.writeFile(workbook, 'Reporte_compras' + '_' + new  Date().getTime() + '.xlsx');
  }

  public searchSupplier() {
    this.bsModalRef = this.bsModalService.show(ModalSupplierComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRef.content.response.subscribe((response: Supplier) => {
      if (response != null) {
        this.model.get('supplier')?.get('id')?.setValue(response.id);
        this.model.get('supplier')?.get('ruc')?.setValue(response.ruc);
        this.model.get('supplier')?.get('reasonSocial')?.setValue(response.reasonSocial);
      }
    });
  }

  public cleanSupplier() {
    this.model.get('supplier')?.get('id')?.setValue('');
    this.model.get('supplier')?.get('ruc')?.setValue('');
    this.model.get('supplier')?.get('reasonSocial')?.setValue('');
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

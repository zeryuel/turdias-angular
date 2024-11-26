import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

import { ReportsService } from '../../services/reports.service';
import { Parameter } from '../../../shared/interfaces/parameter.interface';
import { environment } from '../../../../../environments/environment';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';

@Component({
  selector: 'app-report-products',
  standalone: true,
  imports: [],
  templateUrl: './report-products.component.html'
})
export class ReportProductsComponent implements OnInit {

  public bsModalRef: BsModalRef = new BsModalRef()
  public model: FormGroup = new FormGroup({})
  public config: any = []

  constructor(
    private spinner: NgxSpinnerService
    , private bsModalService: BsModalService
    , private formBuilder: FormBuilder
    , private service: ReportsService
  ) { }

  ngOnInit(): void {
  }

  public generateReport() {
    this.spinner.show()
    this.service.products().subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.generateExcel(response.value);
          this.spinner.hide()
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
  }

  private generateExcel(objeto: any ) {
    let Heading = [
      ['', ''],
      ['', 'FORMATO', '"REPORTE DE PRODUCTOS"'],
      ['', ''],
      ['', 'FECHA :', moment().format('DD/MM/YYYY')],
      ['', 'RUC :', environment.company.ruc],
      ['', 'RAZON SOCIAL :', environment.company.reasonSocial]
    ];

    let arr: any = [
      { col1: { v: "CODIGO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col2: { v: "PRODUCTO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col3: { v: "COD. ALTERNATIVO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col4: { v: "MARCA", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col5: { v: "UND. MEDIDA", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } }
      }
    ];

    for (let item of objeto) {
      arr.push(
        {
          col1: { v: item.id , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col2: { v: item.name, t: "s", s: { alignment: { horizontal: "left" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col3: { v: item.alternativeCode, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col4: { v: item.itemBrand.name , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col5: { v: item.itemUnitMeasure.name , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }}
        }
      );
     }

    const workbook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    worksheet["!cols"] = [ { wch: 10 }, { wch: 16 }, { wch: 60 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ];

    XLSX.utils.sheet_add_aoa(worksheet, Heading);
    XLSX.utils.sheet_add_json(worksheet, arr, { origin: 'B8', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');

    XLSX.writeFile(workbook, 'Reporte_productos' + '_' + new  Date().getTime() + '.xlsx');
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

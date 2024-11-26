import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { Parameter } from '../../interfaces/parameter.interface';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-work-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule],
  templateUrl: './report-work-order.component.html'
})
export class ReportWorkOrderComponent {

  public bsModalRef: BsModalRef = new BsModalRef();
    public model: FormGroup = new FormGroup({});

  constructor(
    private bsModalService: BsModalService
    , private bsLocaleService: BsLocaleService
    , private spinner: NgxSpinnerService
    , private formBuilder: FormBuilder
    , private service: ReportService
  ) { }

  ngOnInit(): void {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      startDate: [moment().add(-30, 'days').format('DD/MM/YYYY'), Validators.required],
      endDate: [moment().format('DD/MM/YYYY'), Validators.required]
    });
  }

  public reportGeneration() {
    if (this.model.valid) {
       //Cuando las fechas se cambia en el control, el valor del objeto hay que formatearlo con moment
       let startDate: any = this.model.get('fecha_inicio')?.value;
       let endDate: any = this.model.get('fecha_fin')?.value;
       if (startDate instanceof Date) startDate = moment(startDate).format('DD/MM/YYYY');
       if (endDate instanceof Date) endDate = moment(endDate).format('DD/MM/YYYY');

      let lstParameter: Array<Parameter> = [
        { name: 'startDate', value: startDate },
        { name: 'endDate', value: endDate }
      ];

      this.spinner.show();
      this.service.reportWorkOrder(lstParameter).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {
            this.excelGeneration(response.value);;
            this.spinner.hide();
          } else
            this.errorHandler(response.message);
        },
        error: (err) => { this.exceptionHandler(err) }
      });

    } else {
      this.model.markAllAsTouched();
      let initialState = { tipo: 3, opcion: 10 };
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    }
  }

  private excelGeneration(objeto: any ) {
     //Cuando las fechas se cambia en el control, el valor del objeto hay que formatearlo con moment
     let startDate: any = this.model.get('startDate')?.value;
     let endDate: any = this.model.get('endDate')?.value;
     if (startDate instanceof Date) startDate = moment(startDate).format('DD/MM/YYYY');
     if (endDate instanceof Date) endDate = moment(endDate).format('DD/MM/YYYY');

    let Heading = [
      ['', ''],
      ['', 'FORMATO', '"REPORTE DE COMPRAS TOTALIZADAS"'],
      ['', ''],
      ['', 'RANGO FECHAS :', startDate + ' - '+ endDate]
    ];

    let arr: any = [
      { col1: { v: "CODIGO", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col2: { v: "EXISTENCIA", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col3: { v: "UND. MEDIDA", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col4: { v: "CANTIDAD", t: "s", s: { font: { bold: true }, alignment: { wrapText: true, horizontal: "right" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } },
        col5: { v: "TOTAL", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } }  } }
      }
    ];

    for (let item of objeto) {
      arr.push(
        {
          col1: { v: item.id_existencia , t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col2: { v: item.existencia_nombre, t: "s", s: { alignment: { horizontal: "left" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col3: { v: item.unidad_medida_nombre, t: "s", s: { alignment: { horizontal: "center" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col4: { v: item.cantidad , t: "s", s: { alignment: { horizontal: "right" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }},
          col5: { v: item.total , t: "s", s: { alignment: { horizontal: "right" }, border: { top: { style: "thin", color: {rgb: "000000"} }, bottom: { style: "thin", color: {rgb: "000000"} }, left: { style: "thin", color: {rgb: "000000"} }, right: { style: "thin", color: {rgb: "000000"} } } }}
        }
      );
     }

    const workbook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    worksheet["!cols"] = [ { wch: 10 }, { wch: 16 }, { wch: 60 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ];

    XLSX.utils.sheet_add_aoa(worksheet, Heading);
    XLSX.utils.sheet_add_json(worksheet, arr, { origin: 'B8', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');

    XLSX.writeFile(workbook, 'Reporte_compras' + '_' + new  Date().getTime() + '.xlsx');
  }

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
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

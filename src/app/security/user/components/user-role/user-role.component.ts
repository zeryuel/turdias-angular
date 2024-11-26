import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserApplicationRole } from '../../interfaces/user-application-role.interface';
import { Table } from '../../../../shared/interfaces/table.interface';
import { UserApplication } from '../../interfaces/user-application.interface';
import { ModalRoleComponent } from '../../../shared/components/modal-role/modal-role.component';
import { Filter } from '../../../../shared/interfaces/filter.interface';
import { Role } from '../../../role/interfaces/role.interface';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
declare var $: any;

@Component({
  selector: 'app-user-role',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './user-role.component.html'
})
export class UserRoleComponent {
  public object: UserApplication | undefined;
  public model: FormGroup;
  public table: Table;
  public spinnerName: string;
  public setting: { recordId: number };

  @Output() response = new EventEmitter();

  constructor(
    private bsModalService: BsModalService,
    public bsModalRef: BsModalRef,
    public bsModalRefRole: BsModalRef,
    private formBuilder: FormBuilder
  ) {
    this.model = this.formBuilder.group({
      idUser: '',
      idApplication: '',
      userName: '',
      applicationName: '',
      lstUserApplicationRole: Array<UserApplicationRole>
    });
    this.model.get('lstUserApplicationRole')?.setValue([]);

    this.table = {
      pageNumber: 1,
      pageSize: 10,
      orderColumn: -1,
      hight: 372,
      totalPages: 1,
      totalElements: 0,
      startElement: 0,
      endElement : 0,
      content: [],
      lstColumn: [
        { name: 'N°', width: '5%', style: 'text-center' },
        { name: 'CODIGO', width: '15%', style: 'text-center' },
        { name: 'NOMBRE', width: '80%', style: 'text-left' }
      ],
      lstPageSize: [
        { id: 10, name: '10' },
        { id: 30, name: '30' },
        { id: 50, name: '50' }
      ],
      lstPageNumber:[
        { value: 'Anterior', style: 'page-item disabled' },
        { value: 'Siguiente', style: 'page-item disabled' }
      ]
    };

    this.spinnerName = 'spinner';
    this.setting = { recordId: 0 };
  }

  ngOnInit(): void {
    $(document).ready(function () {
      let modalContent: any = $('.modal-content');
      modalContent.draggable({
        handle: '.modal-header'
      });
    });

    if (this.object != undefined) {
      this.model.get('idUser')?.setValue(this.object.idUser);
      this.model.get('idApplication')?.setValue(this.object.idApplication);
      this.model.get('userName')?.setValue(this.object.userName);
      this.model.get('applicationName')?.setValue(this.object.applicationName);
      this.model.get('lstUserApplicationRole')?.setValue(this.object.lstUserApplicationRole);
      this.tableMapper(this.model.get('lstUserApplicationRole')?.value, this.table);
    }
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
    // this.value.id = record.id;
    // this.value.name = record.name;
  }

  public addRole() {
    let lstFilter: Filter[] = [
      { object: 'application', column: 'id', value: this.model.get('idApplication')?.value, operator: 'equal' }
    ];
    let initialState = { lstFilter: lstFilter };

    this.bsModalRefRole = this.bsModalService.show(ModalRoleComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRefRole.content.response.subscribe((response: Role) => {
      if (response != null) {
        let array: Array<UserApplicationRole> = this.model.get('lstUserApplicationRole')?.value;
        let exist: UserApplicationRole = array.find(x => x.idRole == response.id)!;

        if (exist == undefined) {
          let object: UserApplicationRole = {
            idUser: this.model.get('idUser')?.value,
            idApplication: this.model.get('idApplication')?.value,
            idRole: response.id,
            access: 1,
            userName: this.model.get('userName')?.value,
            applicationName: this.model.get('applicationName')?.value,
            roleName: response.name
          };

          array.push(object);
          this.tableMapper(this.model.get('lstUserApplicationRole')?.value, this.table);
        }
        else {
          let initialState = { tipo: 4, opcion: 6 }
          this.bsModalRefRole = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
        }
      }
    });
  }

  public removeRole(){
    let array: Array<UserApplicationRole> = this.model.get('lstUserApplicationRole')?.value;
    let index: number = array.findIndex(x => x.idRole == this.setting.recordId);
    array.splice(index, 1);

    this.tableMapper(this.model.get('lstUserApplicationRole')?.value, this.table);
    this.setting.recordId = 0;
  }

  public confirm(): void {
    if (this.model.valid) {
      let response: UserApplication = {
        idUser: this.model.get('idUser')?.value,
        idApplication: this.model.get('idApplication')?.value,
        access: 1,
        userName: this.model.get('userName')?.value,
        applicationName: this.model.get('applicationName')?.value,
        lstUserApplicationRole: this.model.get('lstUserApplicationRole')?.value
      };

      this.response.emit(response);
      this.bsModalRef.hide();

    } else {
      this.model.markAllAsTouched();
    };
  }

  public cancel(): void {
    this.response.emit(null);
    this.bsModalRef.hide();
  }

  public tableMapper(array: any[], table: Table) {
    table.totalElements = array.length;
    table.content = array;
  }

  private pad(n: any, width: number, z: any) {
    z = z || '0';
    n = n + '';

    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
}

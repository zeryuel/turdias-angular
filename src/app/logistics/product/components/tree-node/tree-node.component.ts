import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { CategoryService } from '../../services/category.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
declare var $: any

@Component({
  selector: 'tree-node',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <li id="li{{id}}">

    <div (click)="onClickNodo()" id="txt{{id}}">
      @if(nodoPadre){
        <input type="checkbox" />
      }

      <label id={{id}} for="txt{{id}}">
        <i class="fa-solid fa-folder" style="font-size: 1rem; color: #5CA8F0; margin-left: 1rem;" ></i> {{nombre}}
      </label>
    </div>

    <ul>
      @for (item of lista; track item.id) {
        <tree-node  id={{item.id}} nombre={{item.name}} esPadre={{item.is_parent}} cargado={{item.cargado}} expandido={{item.expandido}}> </tree-node>
      }
    </ul>

  </li>
  `
})
export class TreeNodeComponent implements OnInit {

  public bsModalRef: BsModalRef = new BsModalRef()
  public lista: any = []
  public nodoPadre: boolean = false

  @Input() id: any
  @Input() nombre: any
  @Input() esPadre: any
  @Input() cargado: any
  @Input() expandido: any

  constructor(
    private spinner: NgxSpinnerService
    , private bsModalService: BsModalService
    , private service: CategoryService
  ) { }

  ngOnInit(): void {
    if (this.esPadre == '1')
      this.nodoPadre = true
    else
      this.nodoPadre = false
  }

  public onClickNodo() {
    $(".css-treeview").find('div').removeClass("seleccionado");
    $('#txt'+this.id).addClass('seleccionado')

    if ( this.esPadre == '0' ) return

    if( this.expandido == '1' ){
      $('#li'+this.id).children('ul').toggle()
      this.expandido = '0'
    }
    else {
      $('#li'+this.id).children('ul').show()
      this.expandido = '1'
    }

    if ( this.cargado == '1' ) return

    let objeto: any = { idParent : this.id}

    this.spinner.show()
    this.service.findByIdParent(objeto).subscribe({
      next: (response) => {
        if (response.status == 'ok') {
          this.cargado = '1'
          this.expandido = '1'
          this.lista = response.value
          this.spinner.hide()
        } else
        this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
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

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
declare var $: any;

@Component({
  selector: 'app-modal-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-message.component.html'
})
export class ModalMessageComponent {
  @Output() response = new EventEmitter()
  public tipo: number = 0
  public opcion: number = 0

  public titulo: string = ''
  public texto: string = ''
  public textoBoton: string = ''
  public textoPredeterminado: string = ''
  public icono: string = ''
  public boton: string = ''
  public message: string = ''
  public soloBotonOk: boolean = true

  constructor(
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit(): void {
    $(document).ready(function () {
      let modalContent: any = $('.modal-content')
      modalContent.draggable({
        handle: '.modal-header'
      })
    })

    /***** tipo: 1-SUCCES, 2-ERROR, 3-WARNING, 4-INFO *****/
    switch (this.tipo) {

      case 1: /**** SUCCES ****/
        this.soloBotonOk = true
        this.icono = 'fas fa-check-circle fa-3x text-success'
        this.boton = 'btn btn-sm btn-outline-success'
        this.textoBoton = '\u00a0 Aceptar \u00a0'

        switch (this.opcion) {

          case 1://INSERTAR
            this.titulo = '¡REGISTRO EXITOSO!'
            this.texto = '\u00a0 Se realizó la operación de forma correcta.'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          case 2://MODIFICAR
            this.titulo = '¡ACTUALIZACIÓN EXITOSA!'
            this.texto = '\u00a0 Se actualizó el registro de forma correcta.'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          default:
            this.titulo = '¡OPERACIÓN EXITOSA!'
            this.texto = '\u00a0 ' + this.textoPredeterminado
            this.texto += '<br /> Presione aceptar para continuar.'
            break
        }
        break


      case 2:/**** ERROR *****/
        this.soloBotonOk = true
        this.icono = 'fas fa-times-circle fa-3x text-danger'
        this.titulo = 'ERROR EN EL SISTEMA'
        this.boton = 'btn btn-sm btn-outline-danger'
        this.textoBoton = '\u00a0 Aceptar \u00a0'

        switch (this.opcion) {
          case 1:
            this.texto = '\u00a0 ¡No se pudo realizar esta operación!'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          case 2:
            this.texto = '\u00a0 El registro se encuentra duplicado. <br/> ¡No se pudo realizar esta operación!'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          default:
            this.texto = '\u00a0 ' + this.textoPredeterminado
            this.texto += '<br /> Presione aceptar para continuar.'
            break
        }
        break


      case 3:/**** WARNING ****/
        this.soloBotonOk = false
        this.icono = 'fas fa-exclamation-triangle fa-3x text-warning'
        this.titulo = 'ADVERTENCIA'
        this.boton = 'btn btn-sm btn-outline-warning'
        this.textoBoton = '\u00a0 Aceptar \u00a0'

        switch (this.opcion) {
          case 1:
            this.texto = '\u00a0 ¡No podrás recuperar este registro nuevamente!'
            this.textoBoton = 'Sí, elimínalo!'
            break

          case 2:
            this.texto = '\u00a0 ¡No podrás volver al estado anterior de este registro!'
            this.textoBoton = 'Sí, anúlalo!'
            break

          case 3:
            this.texto = '\u00a0 ¡No podrás volver al estado anterior de este registro!'
            this.textoBoton = 'Sí, aperturalo!'
            break

          case 4:
            this.texto = '\u00a0 ¡No podrás volver al estado anterior de este registro!'
            this.textoBoton = 'Sí, ciérralo!'
            break

          case 5:
            this.texto = '\u00a0 ¡No podrás volver al estado anterior de este registro!'
            this.textoBoton = 'Sí, envíalo!'
            break

          case 6:
            this.texto = '\u00a0 ¡No podrás volver al estado anterior de este registro!'
            this.textoBoton = 'Sí, procésalo!'
            break

          case 9:
            this.texto = '\u00a0 ¡No podrás seguir utilizando en el sistema!'
            this.textoBoton = 'Sí, salir del sistema!'
            break

          case 10:
            this.soloBotonOk = true
            this.texto = '\u00a0 Existen campos llenados incorrectamente. <br/> ¡No se pudo realizar esta operación!'
            this.textoBoton = 'Aceptar'
            break

          case 11:
            this.soloBotonOk = true
            this.texto = '\u00a0 Las credenciales ingresadas son incorrectas. <br/> ¡Por favor verificar sus datos!'
            this.textoBoton = 'Aceptar'
            break

          case 12:
            this.soloBotonOk = true
            this.texto = '\u00a0 No existen elementos en el detalle del documento. <br/> ¡Por favor verificar sus datos!'
            this.textoBoton = 'Aceptar'
            break

          case 13:
            this.texto = '\u00a0 ¡No podrás volver al estado anterior de este registro!'
            this.textoBoton = 'Sí, a pendiente!'
            break

          case 14:
            this.texto = '\u00a0 ¡No podrás volver al estado anterior de este registro!'
            this.textoBoton = 'Sí, apruébalo!'
            break

          case 15:
            this.texto = '\u00a0 ¡No podrás volver al estado anterior de este registro!'
            this.textoBoton = 'Sí, recházalo!'
            break

          case 16:
            this.soloBotonOk = true
            this.texto = '\u00a0 ¡No existen sistemas asignados para este usuario! <br/> Presione aceptar para continuar.'
            this.textoBoton = 'Aceptar'
            break

          case 17:
            this.soloBotonOk = true
            this.texto = '\u00a0 ¡No tiene permisos para acceder a este sistemas! <br/> Presione aceptar para continuar.'
            this.textoBoton = 'Aceptar'
            break

          case 18:
            this.soloBotonOk = true
            this.texto = '\u00a0 ¡No tiene roles asociados para acceder a este sistema! <br/> Presione aceptar para continuar.'
            this.textoBoton = 'Aceptar'
            break

          case 19:
            this.soloBotonOk = true
            this.texto = '\u00a0 No existen elementos seleccionados para realizar la operación. <br/> ¡Por favor verificar sus datos!'
            this.textoBoton = 'Aceptar'
            break

          default:
            this.soloBotonOk = true
            this.texto = '\u00a0 ' + this.textoPredeterminado
            this.texto += '<br /> Presione aceptar para continuar.'
            break
        }
        break


      case 4:/**** Info ****/
        this.soloBotonOk = true
        this.icono = 'fas fa-info-circle fa-3x text-primary'
        this.titulo = 'INFORMACIÓN'
        this.boton = 'btn btn-sm btn-outline-primary'
        this.textoBoton = '\u00a0 Aceptar \u00a0'

        switch (this.opcion) {
          case 1: //Estandar
            this.texto = '\u00a0 ¡Se realizó la operación de manera satisfactoria!'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          case 2: //Imprimir
            this.texto = '\u00a0 ¡Se realizó la impresión de manera satisfactoria!'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          case 3: //Seleccionar elemento
            this.texto = '\u00a0 ¡Seleccione un elemento válido para realizar la operación!'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          case 4: //No existen elementos del detalle
            this.texto = '\u00a0 ¡No existen elementos en el detalle del documento!'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          case 5: //No existen registros seleccionados
            this.texto = '\u00a0 ¡No existen registros seleccionados para realizar la operación!'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          case 6: //EL elemento ya se encuentra en el arreglo
            this.texto = '\u00a0 ¡El elemento a ingresar ya se encuentra agregado!'
            this.texto += '<br /> Presione aceptar para continuar.'
            break

          default:
            this.texto = '\u00a0 ' + this.textoPredeterminado
            this.texto += '<br /> Presione aceptar para continuar.'
            break
        }
        break


      default:
        console.log('Default')
        break
    }
  }

  public confirm(): void {
    this.message = 'ok'
    this.response.emit(this.message)
    this.bsModalRef.hide()
  }

  public decline(): void {
    this.response.emit(this.message)
    this.bsModalRef.hide()
  }

}

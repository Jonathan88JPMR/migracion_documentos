import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Wrapper de SweetAlert2, mismo patrón que alquiler_maquinaria:
 * centraliza el estilo de las alertas para no repetir configuración.
 */
@Injectable({
  providedIn: 'root'
})
export class AlertService {

  showAlertAcept(title: string, message: string, icon: SweetAlertIcon) {
    Swal.fire({
      title: title,
      html: message,
      icon: icon,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    });
  }

  showAlertError(title: string, message: string) {
    Swal.fire({
      title: title,
      html: message,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    });
  }

  showAlert(title: string, message: string, icon: SweetAlertIcon) {
    Swal.fire({
      title: title,
      html: message,
      icon: icon,
      timer: 2000,
      showConfirmButton: false
    });
  }

  mostrarInfo(mensaje: string) {
    Swal.fire({
      title: 'Información',
      text: mensaje,
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
  }

  mostrarModalCarga() {
    Swal.fire({
      title: 'Espere, por favor...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });
  }

  cerrarModalCarga() {
    Swal.close();
  }

  showConfirm(title: string, message: string, icon: SweetAlertIcon): Promise<boolean> {
    return Swal.fire({
      title: title,
      html: message,
      icon: icon,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    }).then((result) => result.isConfirmed);
  }

  showPrompt(title: string, message: string): Promise<string | null> {
    return Swal.fire({
      title: title,
      html: message,
      input: 'text',
      inputPlaceholder: 'Escriba aquí...',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      inputValidator: (value) => !value ? 'Debe ingresar un valor.' : null
    }).then((result) => {
      if (!result.isConfirmed) return null;
      return (result.value ?? '').toString();
    });
  }
}

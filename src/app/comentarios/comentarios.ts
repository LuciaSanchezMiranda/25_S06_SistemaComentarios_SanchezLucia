import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, Comentario } from '../services/api';

@Component({
  selector: 'app-comentarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.html',
  styleUrl: './comentarios.css',
})
export class Comentarios implements OnInit {
  comentarios: Comentario[] = [];
  nuevoComentario: Comentario = { name: '', body: '', email: '' };
  fechaActual: Date = new Date();
  cargando: boolean = false;
  mensaje: string = '';
  mostrarMensaje: boolean = false;

  constructor(private apiService: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarComentarios();
  }

  // Cargar lista de comentarios
  cargarComentarios(): void {
    this.cargando = true;
    console.log('Iniciando carga de comentarios...');
    this.apiService.getComentarios().subscribe({
      next: (data) => {
        console.log('Comentarios cargados exitosamente:', data.length);
        this.comentarios = data; // Mostrar todos los 500 comentarios
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        console.log('Array comentarios actualizado, length:', this.comentarios.length);
      },
      error: (error) => {
        console.error('Error completo al cargar comentarios:', error);
        this.cargando = false;
        this.mostrarNotificacion('Error al cargar comentarios: ' + error.message, 'error');
      },
    });
  }

  // Enviar nuevo comentario
  enviarComentario(): void {
    if (!this.nuevoComentario.name.trim() || !this.nuevoComentario.body.trim() || !this.nuevoComentario.email?.trim()) {
      this.mostrarNotificacion('Por favor completa nombre, email y comentario', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.nuevoComentario.email)) {
      this.mostrarNotificacion('Por favor ingresa un email válido', 'error');
      return;
    }

    this.cargando = true;
    console.log('Iniciando envío de comentario...');
    
    const comentarioParaEnviar: Comentario = {
      postId: 1,
      name: this.nuevoComentario.name,
      email: this.nuevoComentario.email,
      body: this.nuevoComentario.body,
    };

    this.apiService.postComentario(comentarioParaEnviar).subscribe({
      next: (respuesta) => {
        console.log('Respuesta del servidor:', respuesta);
        
        // Usar el ID de la respuesta del servidor o generar uno único
        const nuevoComentarioLocal: Comentario = {
          id: respuesta.id || (this.comentarios.length + 1),
          postId: respuesta.postId || 1,
          name: respuesta.name,
          email: respuesta.email || this.nuevoComentario.email,
          body: respuesta.body,
          fechaCreacion: new Date(), // Agregar fecha y hora de creación
        };
        
        this.comentarios.unshift(nuevoComentarioLocal);
        this.limpiarFormulario();
        this.mostrarNotificacion('✅ Comentario enviado exitosamente', 'exito');
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.cargando = false;
        this.mostrarNotificacion(`❌ Error: ${error.message || 'No se pudo enviar el comentario'}`, 'error');
      },
    });
  }

  // Eliminar comentario
  eliminarComentario(id: number | undefined, index: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      return;
    }

    console.log('Eliminando comentario con ID:', id);
    this.apiService.deleteComentario(id).subscribe({
      next: () => {
        this.comentarios.splice(index, 1);
        this.mostrarNotificacion('✅ Comentario eliminado exitosamente', 'exito');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
      },
    });
  }

  // Limpiar formulario
  limpiarFormulario(): void {
    this.nuevoComentario = { name: '', body: '', email: '' };
  }

  // Mostrar notificación
  mostrarNotificacion(msg: string, tipo: string): void {
    this.mensaje = msg;
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }

  // Obtener contador de comentarios
  get totalComentarios(): number {
    return this.comentarios.length;
  }
}

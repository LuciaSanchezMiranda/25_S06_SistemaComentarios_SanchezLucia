import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Comentario {
  postId?: number;
  id?: number;
  name: string;
  email?: string;
  body: string;
  fechaCreacion?: Date | string; // Nueva propiedad para la fecha de creación
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/comments';
  private readonly postUrl = 'https://jsonplaceholder.typicode.com/comments'; // Usar el mismo endpoint

  constructor(private http: HttpClient) {}

  // Obtener lista de comentarios (GET)
  getComentarios(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(this.apiUrl).pipe(
      timeout(10000), // 10 segundos de timeout
      tap((data) => console.log('✅ GET exitoso, comentarios recibidos:', data.length)),
      catchError((error) => this.manejarError(error))
    );
  }

  // Registrar nuevo comentario (POST)
  postComentario(comentario: Comentario): Observable<Comentario> {
    console.log('📤 Enviando POST:', comentario);
    return this.http.post<Comentario>(this.postUrl, comentario, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      timeout(10000), // 10 segundos de timeout
      tap((respuesta) => console.log('✅ POST exitoso, respuesta:', respuesta)),
      catchError((error) => this.manejarError(error))
    );
  }

  // Eliminar comentario (DELETE) - simulado localmente
  deleteComentario(id: number | undefined): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID de comentario no válido'));
    }
    console.log('🗑️ Eliminando comentario con ID:', id);
    return new Observable(observer => {
      // Simulamos eliminación exitosa
      setTimeout(() => {
        console.log('✅ Comentario eliminado exitosamente');
        observer.next();
        observer.complete();
      }, 300);
    });
  }

  // Manejo centralizado de errores
  private manejarError(error: HttpErrorResponse) {
    let mensajeError = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      mensajeError = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      mensajeError = `Código ${error.status}: ${error.statusText || 'Error del servidor'}`;
    }
    
    console.error('❌ Error HTTP:', mensajeError, error);
    return throwError(() => new Error(mensajeError));
  }
}
